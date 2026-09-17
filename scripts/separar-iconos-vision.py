#!/usr/bin/env python3
"""
separar-iconos-vision.py
=========================

Separa los 4 íconos que hoy viven quemados dentro de un único archivo,
`img/decoraciones-neurona/fondo-vision-red.webp`, en 4 archivos
independientes con transparencia real, más una versión del fondo sin
esos íconos (solo los listones conectores).

Contexto: `fondo-vision-red.webp` ya es RGBA con canal alfa real (no
tiene fondo blanco que quitar, a diferencia de los `elemento-*.webp`
originales en `vision-elementos/` que usa `generar-fondo-vision.py`).
Por eso este script recorta directo por transparencia en vez de
reprocesar blancos.

Qué hace:
  1. Para cada ícono, busca su bounding box real (píxeles con alfa >
     UMBRAL_ALFA_ICONO) dentro de una ventana de búsqueda generosa
     (evita confundirse con los listones de fondo, que tienen alfa
     bajo, o con el ícono vecino).
  2. Recorta ese bounding box con un margen (`MARGEN_PX`) y lo guarda
     como archivo individual en `vision-iconos/`.
  3. Genera además `fondo-vision-red-sin-iconos.webp`: una copia del
     fondo original con esas 4 zonas (bounding box + margen extra)
     vueltas transparentes, dejando solo los listones de fondo.

Requisitos: Pillow, numpy (`pip install pillow numpy`).

Uso (desde la raíz del repo):

    python3 scripts/separar-iconos-vision.py

Lee   : img/decoraciones-neurona/fondo-vision-red.webp
Escribe:
    img/decoraciones-neurona/vision-iconos/icon-cerebro.webp
    img/decoraciones-neurona/vision-iconos/icon-red-neuronal.webp
    img/decoraciones-neurona/vision-iconos/icon-reloj-arena.webp
    img/decoraciones-neurona/vision-iconos/icon-cintas-azules.webp
    img/decoraciones-neurona/fondo-vision-red-sin-iconos.webp

No toca el archivo original (`fondo-vision-red.webp` queda intacto, por
si se quiere volver atrás).
"""

from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
DECOR_DIR = REPO_ROOT / "img" / "decoraciones-neurona"
FONDO_ORIGEN = DECOR_DIR / "fondo-vision-red.webp"
ICONOS_DIR = DECOR_DIR / "vision-iconos"

# Alfa por encima del cual un píxel se considera parte de un ícono (los
# listones de fondo tienen alfa bajo, <~50, así que 150 los descarta con
# margen de sobra).
UMBRAL_ALFA_ICONO = 150

# Margen (px, sobre el lienzo real de 1700x1040) que se deja alrededor del
# bounding box detectado al recortar cada ícono individual.
MARGEN_PX = 20

# Margen extra al despejar la zona del ícono en la versión "sin íconos" del
# fondo (más grande que MARGEN_PX para no dejar un borde con resto de
# resplandor/antialiasing del ícono viejo).
MARGEN_BORRADO_PX = 35

# (nombre_de_salida, x0%, x1%, y0%, y1%) — ventana de búsqueda de cada
# ícono dentro del lienzo completo, en fracción de ancho/alto. Un poco más
# generosa que el bounding box real (ver memoria.md, sección "Íconos de
# Visión agrandados...") para tolerar que el ícono no esté exactamente en
# el mismo lugar si se vuelve a agrandar el fondo en el futuro.
ICONOS = [
    ("icon-cerebro", 0.05, 0.42, 0.00, 0.34),
    ("icon-red-neuronal", 0.58, 1.00, 0.00, 0.37),
    ("icon-reloj-arena", 0.10, 0.37, 0.58, 1.00),
    ("icon-cintas-azules", 0.59, 0.96, 0.61, 1.00),
]


def encontrar_bbox(alpha: np.ndarray, x0f, x1f, y0f, y1f, w, h):
    """Bounding box (en px, coords del lienzo completo) del contenido con
    alfa > UMBRAL_ALFA_ICONO dentro de la ventana de búsqueda dada."""
    x0, x1 = int(x0f * w), int(x1f * w)
    y0, y1 = int(y0f * h), int(y1f * h)
    sub = alpha[y0:y1, x0:x1]
    ys, xs = np.where(sub > UMBRAL_ALFA_ICONO)
    if len(xs) == 0:
        raise RuntimeError(f"No se encontró contenido en la ventana ({x0f},{x1f},{y0f},{y1f})")
    return xs.min() + x0, xs.max() + x0, ys.min() + y0, ys.max() + y0


def main():
    ICONOS_DIR.mkdir(parents=True, exist_ok=True)
    fondo = Image.open(FONDO_ORIGEN).convert("RGBA")
    w, h = fondo.size
    arr = np.array(fondo)
    alpha = arr[:, :, 3]

    fondo_sin_iconos = fondo.copy()
    arr_sin_iconos = np.array(fondo_sin_iconos)

    for nombre, x0f, x1f, y0f, y1f in ICONOS:
        bx0, bx1, by0, by1 = encontrar_bbox(alpha, x0f, x1f, y0f, y1f, w, h)

        # Recorte individual, con margen chico (deja algo de aire/glow
        # alrededor del ícono).
        cx0 = max(bx0 - MARGEN_PX, 0)
        cx1 = min(bx1 + MARGEN_PX, w)
        cy0 = max(by0 - MARGEN_PX, 0)
        cy1 = min(by1 + MARGEN_PX, h)
        icono = fondo.crop((cx0, cy0, cx1, cy1))
        salida = ICONOS_DIR / f"{nombre}.webp"
        icono.save(salida, "WEBP", quality=95)
        print(f"{salida}  ({icono.size[0]}x{icono.size[1]})")

        # Zona a despejar en el fondo "sin íconos" — margen más grande.
        dx0 = max(bx0 - MARGEN_BORRADO_PX, 0)
        dx1 = min(bx1 + MARGEN_BORRADO_PX, w)
        dy0 = max(by0 - MARGEN_BORRADO_PX, 0)
        dy1 = min(by1 + MARGEN_BORRADO_PX, h)
        arr_sin_iconos[dy0:dy1, dx0:dx1, 3] = 0

    salida_fondo = DECOR_DIR / "fondo-vision-red-sin-iconos.webp"
    Image.fromarray(arr_sin_iconos, "RGBA").save(salida_fondo, "WEBP", quality=92)
    print(f"{salida_fondo}  ({w}x{h})")


if __name__ == "__main__":
    main()
