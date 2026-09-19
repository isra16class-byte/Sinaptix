#!/usr/bin/env python3
"""Recorta (chroma key verde) los 4 íconos 3D de "Para quién es" (#lam-05,
`.ben-audience-icon`) generados con Gemini sobre fondo verde plano.

Pasos: alfa por dominancia de verde (g - max(r,b)), despill del verde en los
bordes, se descartan motas sueltas (destellos chicos que a 48px son ruido),
recorte al contenido con margen, cuadrado, 256x256 .webp con transparencia.
Uso: python3 scripts/recortar-iconos-audiencia.py <carpeta-con-los-jpg>
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# archivo original de Gemini -> ícono final
MAPA = {
    'Gemini_Generated_Image_alvz4halvz4halvz.jpg': 'icon-maletin',
    'Gemini_Generated_Image_i4v3m3i4v3m3i4v3.jpg': 'icon-graduacion',
    'Gemini_Generated_Image_swob3cswob3cswob.jpg': 'icon-equipo',
    'Gemini_Generated_Image_w9fixqw9fixqw9fi.jpg': 'icon-reloj-fatiga',
}
SALIDA = 'img/Iconos'
TAM = 256
MIN_AREA = 2500   # px² (sobre 1024²) mínimo para conservar un componente

def procesar(ruta, nombre):
    a = np.asarray(Image.open(ruta).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    dom = g - np.maximum(r, b)              # ~200 en el fondo, <=0 en objetos
    alfa = 1 - np.clip((dom - 40) / (150 - 40), 0, 1)
    # despill: el verde nunca puede pasar del mayor de r/b
    g2 = np.minimum(g, np.maximum(r, b))
    rgb = np.dstack([r, g2, b])
    # componentes: sacar motas chicas (destellos)
    sol = alfa > 0.5
    lab, n = ndi.label(sol)
    areas = ndi.sum(sol, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool)
    for i, ar in enumerate(areas, 1):
        keep[i] = ar >= MIN_AREA
    mask = keep[lab]
    mask = ndi.binary_dilation(mask, iterations=4)   # conservar borde suave
    alfa = alfa * mask
    # comer 1px de borde para no dejar aro verdoso
    alfa = np.minimum(alfa, ndi.grey_erosion(alfa, size=(3, 3)) * 1.0 + 0.0)
    out = np.dstack([rgb, alfa * 255]).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb)
    lado = int(max(im.size) * 1.06)
    lienzo = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    lienzo.alpha_composite(im, ((lado - im.width) // 2, (lado - im.height) // 2))
    lienzo = lienzo.resize((TAM, TAM), Image.LANCZOS)
    dest = os.path.join(SALIDA, nombre + '.webp')
    lienzo.save(dest, 'WEBP', quality=94, method=6)
    print(nombre, 'componentes:', n, 'conservados:', int(keep.sum()), '->', dest)

if __name__ == '__main__':
    carpeta = sys.argv[1]
    for f, nombre in MAPA.items():
        procesar(os.path.join(carpeta, f), nombre)
