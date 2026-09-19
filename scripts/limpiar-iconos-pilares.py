#!/usr/bin/env python3
"""Limpia el halo/fondo original de las 4 esferas de img/Iconos/icon-*.webp
usadas en Pilares (#lam-04).

Los .webp venían con un borde "sucio" (píxeles semitransparentes grises,
resto del fondo original). La esfera en sí es un disco sólido, así que:
  1. máscara = píxeles totalmente opacos, componente más grande, sin huecos;
  2. se erosiona 2px y se extiende el color de adentro hacia afuera (para que
     ningún píxel del borde mezcle color del fondo viejo);
  3. se ajusta un círculo a esa máscara y se usa como alfa final, con
     antialias por supersampling (bordes limpios y redondos).
Uso: python3 scripts/limpiar-iconos-pilares.py  (sobrescribe los 4 .webp)
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import cv2

NOMBRES = ['omega3', 'antioxidantes', 'complejo-b', 'hidratacion']
SS = 4  # factor de supersampling para el alfa

def limpiar(ruta):
    im = Image.open(ruta).convert('RGBA')
    a = np.array(im)
    h, w = a.shape[:2]
    # La esfera es de color saturado; el borde sucio es un tablero de ajedrez
    # gris horneado (R≈G≈B) que quedó como opaco/semitransparente. Se separa
    # por croma (max-min de canales), no solo por alfa.
    rgb0 = a[..., :3].astype(int)
    croma = rgb0.max(2) - rgb0.min(2)
    m = (a[..., 3] >= 250) & (croma > 28)
    m = ndi.binary_opening(m, structure=np.ones((3, 3)))
    lab, n = ndi.label(m)
    sizes = ndi.sum(m, lab, range(1, n + 1))
    m = lab == (1 + int(np.argmax(sizes)))
    m = ndi.binary_fill_holes(m)
    # círculo por RANSAC sobre el contorno: la sombra/checker de abajo entra
    # en la máscara opaca y sesga un ajuste por mínimos cuadrados normal,
    # así que se busca el círculo con más puntos del contorno a <=1.2px.
    cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    pts = max(cnts, key=len)[:, 0, :].astype(float)
    rng = np.random.default_rng(0)
    mejor, mejor_n = None, -1
    for _ in range(4000):
        p1, p2, p3 = pts[rng.choice(len(pts), 3, replace=False)]
        A = np.array([[p2[0]-p1[0], p2[1]-p1[1]], [p3[0]-p1[0], p3[1]-p1[1]]]) * 2
        if abs(np.linalg.det(A)) < 1e-6:
            continue
        b = np.array([(p2**2).sum()-(p1**2).sum(), (p3**2).sum()-(p1**2).sum()])
        c0 = np.linalg.solve(A, b)
        r0 = np.hypot(*(p1 - c0))
        if not (100 < r0 < 128):
            continue
        n_in = (np.abs(np.hypot(pts[:, 0]-c0[0], pts[:, 1]-c0[1]) - r0) <= 1.2).sum()
        if n_in > mejor_n:
            mejor, mejor_n = (c0[0], c0[1], r0), n_in
    cx, cy, r = mejor
    # refinar con los inliers
    d = np.hypot(pts[:, 0]-cx, pts[:, 1]-cy)
    q = pts[np.abs(d - r) <= 1.5]
    A = np.c_[2*q[:, 0], 2*q[:, 1], np.ones(len(q))]
    cx, cy, c = np.linalg.lstsq(A, (q**2).sum(1), rcond=None)[0]
    r = np.sqrt(c + cx**2 + cy**2)
    print(f'   inliers {mejor_n}/{len(pts)}')
    # color: erosionar y propagar hacia afuera desde el interior seguro
    core = ndi.binary_erosion(m, iterations=3)
    idx = ndi.distance_transform_edt(~core, return_distances=False, return_indices=True)
    rgb = a[..., :3][idx[0], idx[1]]
    # alfa: disco ajustado, supersampleado (radio -2.5px: se come el último aro gris que el croma no separa del todo)
    yy, xx = np.mgrid[0:h * SS, 0:w * SS]
    d = np.hypot((xx + .5) / SS - .5 - cx, (yy + .5) / SS - .5 - cy)
    disco = (d <= r - 2.5).astype(np.float32)
    alfa = disco.reshape(h, SS, w, SS).mean((1, 3))
    # dentro del disco usar siempre el píxel original, fuera el propagado
    out = np.dstack([rgb, (alfa * 255).round().astype(np.uint8)])
    Image.fromarray(out, 'RGBA').save(ruta, 'WEBP', quality=95, method=6)
    return cx, cy, r

if __name__ == '__main__':
    for n in NOMBRES:
        ruta = f'img/Iconos/icon-{n}.webp'
        cx, cy, r = limpiar(ruta)
        print(f'{n}: centro=({cx:.1f},{cy:.1f}) r={r:.1f}')
