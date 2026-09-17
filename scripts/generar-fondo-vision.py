#!/usr/bin/env python3
"""
generar-fondo-vision.py
========================

Arma los 2 lienzos candidatos para reemplazar `fondo-vision-red.webp`
(el fondo de la sección Visión, `#lam-02`) a partir de los 5 elementos
sueltos generados con IA en `img/decoraciones-neurona/vision-elementos/`.

Contexto completo del porqué de este script: ver `memoria.md` → "Estado
actual del diseño" → Visión, y `changelog.md`, tandas trigésima cuarta y
trigésima quinta (2026-09-17).

Qué hace, en dos pasos:

  1. RECORTE (`extraer_elemento`): a cada elemento (imagen generada por
     Gemini sobre fondo blanco) le quita el fondo y lo recorta ajustado
     al contenido real, para poder ubicarlo con precisión en el lienzo
     final.
  2. COMPOSICIÓN (`construir_lienzo`): arma un lienzo nuevo con los 4
     elementos elegidos (cerebro, red neuronal, reloj de arena, cintas
     azules) bien separados entre sí y de los bordes, más los listones
     conectores de fondo dibujados por código (no por IA) para poder
     controlar el espaciado con precisión — que es el problema que tenía
     el fondo anterior (las 4 anotaciones `.stat-annot` no tenían ningún
     punto real al que apuntar).

Como no está decidido si usar la red neuronal "redonda" o la de "corazón"
(ver memoria.md), el script genera los 2 lienzos completos, idénticos
salvo por ese elemento.

Requisitos: Pillow, numpy, scipy (`pip install pillow numpy scipy`).

Uso (desde la raíz del repo):

    python3 scripts/generar-fondo-vision.py

Lee de  : img/decoraciones-neurona/vision-elementos/elemento-*.webp
Escribe : img/decoraciones-neurona/vision-elementos/fondo-vision-nuevo-redonda.webp
          img/decoraciones-neurona/vision-elementos/fondo-vision-nuevo-corazon.webp

No toca ningún otro archivo del repo (ni HTML, ni CSS, ni los elementos
sueltos de origen). No hace falta volver a generar nada con IA para
correr este script: los 5 `elemento-*.webp` ya tienen que existir.
"""

import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.interpolate import CubicSpline

# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
ELEMENTOS_DIR = REPO_ROOT / "img" / "decoraciones-neurona" / "vision-elementos"

# ---------------------------------------------------------------------------
# Paso 1 — recorte de cada elemento (quitar fondo blanco + autocrop)
# ---------------------------------------------------------------------------

# Umbral de luminosidad para convertir el fondo blanco en transparente.
# Es un degradado suave (no un corte duro) entre estos dos valores para no
# perder los bordes con resplandor/glow que tienen varias de las
# ilustraciones (el cerebro, la red neuronal, las cintas azules):
#   - luminosidad <= UMBRAL_BLANCO_BAJO  -> pixel 100% opaco
#   - luminosidad >= UMBRAL_BLANCO_ALTO  -> pixel 100% transparente
#   - valores intermedios               -> alpha interpolado linealmente
UMBRAL_BLANCO_BAJO = 225
UMBRAL_BLANCO_ALTO = 248

# Margen (en píxeles, sobre la imagen original de 1024x1024) que se deja
# alrededor del contenido real al recortar cada elemento.
AUTOCROP_PADDING = 15


def quitar_fondo_blanco(im: Image.Image) -> Image.Image:
    """Convierte el fondo blanco de `im` en transparencia real (canal alfa),
    con degradado suave entre UMBRAL_BLANCO_BAJO y UMBRAL_BLANCO_ALTO."""
    im = im.convert("RGB")
    arr = np.array(im).astype(np.float32)
    luminosidad = arr.mean(axis=2)
    alpha = np.clip(
        (UMBRAL_BLANCO_ALTO - luminosidad)
        / (UMBRAL_BLANCO_ALTO - UMBRAL_BLANCO_BAJO),
        0,
        1,
    ) * 255
    rgba = np.dstack([arr.astype(np.uint8), alpha.astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def autocrop(im: Image.Image, pad: int = AUTOCROP_PADDING) -> Image.Image:
    """Recorta `im` (RGBA) al bounding box del contenido no transparente,
    dejando `pad` píxeles de margen."""
    arr = np.array(im)
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 10)
    if len(xs) == 0:
        return im
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, im.width)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, im.height)
    return im.crop((x0, y0, x1, y1))


def extraer_elemento(nombre: str) -> Image.Image:
    """Carga `elemento-{nombre}.webp`, le quita el fondo blanco y lo
    recorta ajustado al contenido. Devuelve una imagen RGBA lista para
    pegar en el lienzo final."""
    origen = ELEMENTOS_DIR / f"{nombre}.webp"
    im = Image.open(origen)
    im = quitar_fondo_blanco(im)
    im = autocrop(im)
    return im


# ---------------------------------------------------------------------------
# Paso 2 — composición del lienzo final
# ---------------------------------------------------------------------------

# Tamaño del lienzo final. Bastante más grande que el fondo-vision-red.webp
# original (1478x720) a propósito: el margen extra es el requisito central
# de este cambio (poder anclar las 4 .stat-annot a un punto real).
CANVAS_W, CANVAS_H = 1700, 1040

# Resolución de supersampleo para dibujar los listones con antialiasing:
# Pillow no antialiasea líneas nativamente, así que se dibujan a 2x tamaño
# y se reescalan hacia abajo con Image.LANCZOS al final.
SUPERSAMPLE_SCALE = 2

# --- Ubicación de los 4 elementos dentro del lienzo 1700x1040 ---
#
# Cada tupla es: (nombre_del_elemento, centro_x, centro_y, ancho_max, alto_max)
# El elemento se reescala (conservando proporción) para entrar dentro de
# ancho_max x alto_max, y se centra en (centro_x, centro_y).
#
# Layout en grid 2x2: cerebro arriba-izq., red neuronal arriba-der.,
# reloj de arena abajo-izq., cintas azules abajo-der. — con ~180px de
# margen contra los bordes laterales y sin overlap entre elementos
# (ver memoria.md para el detalle de por qué se eligió este layout).
ELEMENTO_CEREBRO = ("elemento-energia-cerebral", 400, 200, 400, 340)
ELEMENTO_RELOJ_ARENA = ("elemento-semanas-progreso", 400, 840, 260, 460)
ELEMENTO_CINTAS_AZULES = ("elemento-acompanamiento-1a1", 1300, 840, 380, 380)
# La red neuronal es el único elemento con 2 variantes posibles (ver más
# abajo, VARIANTES_RED_NEURONAL) — comparte la misma posición/tamaño en
# ambos lienzos, solo cambia qué imagen se usa.
RED_NEURONAL_CENTRO = (1300, 200)
RED_NEURONAL_MAX = (440, 440)

ELEMENTOS_FIJOS = [ELEMENTO_CEREBRO, ELEMENTO_RELOJ_ARENA, ELEMENTO_CINTAS_AZULES]

# (nombre_de_archivo_de_salida, nombre_del_elemento_de_red_neuronal_a_usar)
VARIANTES_RED_NEURONAL = [
    ("fondo-vision-nuevo-redonda.webp", "elemento-red-neuronal"),
    ("fondo-vision-nuevo-corazon.webp", "elemento-red-neuronal-alt-corazon"),
]

# --- Estilo de los listones/cintas de fondo ---
#
# Mismo lenguaje visual que fondo-vision-red.webp (curvas finas onduladas
# en tono malva/morado translúcido), pero dibujadas por código en vez de
# pedírselas a la IA, para controlar el espaciado con precisión.
RIBBON_COLOR = (130, 95, 115)  # rgb, mauve/morado apagado
RIBBON_LINES_PER_BUNDLE = 7  # líneas finas por cada curva/haz
RIBBON_BASE_ALPHA = 48  # alpha base (0-255); cada línea varía sobre este valor
RIBBON_LINE_WIDTH = 2  # ancho de línea, en píxeles del lienzo 2x (supersampleado)

# Puntos de control (x, y) de cada curva-guía, en coordenadas del lienzo
# final (1700x1040) ANTES del supersampleo. CubicSpline interpola una curva
# suave a través de estos puntos; después, por cada curva-guía se dibuja un
# "haz" de RIBBON_LINES_PER_BUNDLE líneas con jitter aleatorio (ver
# `dibujar_haz_de_listones`) para que no se vean perfectamente paralelas,
# imitando el aspecto de las cintas del fondo original.
LISTONES_PUNTOS_DE_CONTROL = [
    [(-60, 180), (280, 110), (600, 230), (950, 140), (1300, 270), (1780, 180)],
    [(-60, 330), (320, 410), (650, 300), (980, 420), (1350, 320), (1780, 440)],
    [(-60, 520), (300, 460), (620, 580), (980, 490), (1350, 610), (1780, 530)],
    [(-60, 700), (340, 760), (670, 660), (1020, 770), (1380, 690), (1780, 790)],
    [(-60, 880), (320, 830), (660, 910), (1020, 840), (1400, 930), (1780, 860)],
    [(-60, 240), (400, 300), (820, 200), (1250, 300), (1780, 220)],
]

# Semilla base para el generador aleatorio del jitter de cada haz (una
# semilla distinta por curva-guía = RIBBON_SEED_BASE + índice de la curva),
# para que el resultado sea reproducible entre corridas del script.
RIBBON_SEED_BASE = 100


def dibujar_haz_de_listones(draw: ImageDraw.ImageDraw, puntos_control, seed: int):
    """Dibuja un haz de RIBBON_LINES_PER_BUNDLE líneas finas siguiendo una
    curva suave (CubicSpline) por `puntos_control`, con jitter aleatorio
    (offset, amplitud, fase y alpha) por línea para que el haz no se vea
    perfectamente parejo. `seed` fija la semilla para que sea reproducible."""
    rnd = random.Random(seed)
    xs = np.array([p[0] for p in puntos_control])
    ys = np.array([p[1] for p in puntos_control])
    curva = CubicSpline(xs, ys)
    xs_densos = np.linspace(xs.min(), xs.max(), 400)
    ys_base = curva(xs_densos)

    for i in range(RIBBON_LINES_PER_BUNDLE):
        offset = (i - RIBBON_LINES_PER_BUNDLE / 2) * rnd.uniform(6, 11)
        amplitud_jitter = rnd.uniform(0.85, 1.15)
        fase = rnd.uniform(0, 10)
        # Ondulación adicional e independiente por línea, para que no
        # queden perfectamente paralelas entre sí.
        ondulacion = np.sin(xs_densos / 180 + fase) * rnd.uniform(3, 8)
        ys_linea = (
            (ys_base - ys_base.mean()) * amplitud_jitter
            + ys_base.mean()
            + offset
            + ondulacion
        )
        puntos = list(zip(xs_densos * SUPERSAMPLE_SCALE, ys_linea * SUPERSAMPLE_SCALE))
        alpha = int(RIBBON_BASE_ALPHA * rnd.uniform(0.55, 1.0))
        draw.line(puntos, fill=RIBBON_COLOR + (alpha,), width=RIBBON_LINE_WIDTH, joint="curve")


def construir_capa_de_listones() -> Image.Image:
    """Arma la capa de fondo con todos los haces de listones, ya reescalada
    al tamaño final del lienzo (sin supersampleo)."""
    canvas = Image.new(
        "RGBA", (CANVAS_W * SUPERSAMPLE_SCALE, CANVAS_H * SUPERSAMPLE_SCALE), (255, 255, 255, 0)
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    for i, puntos_control in enumerate(LISTONES_PUNTOS_DE_CONTROL):
        dibujar_haz_de_listones(draw, puntos_control, seed=RIBBON_SEED_BASE + i)
    return canvas.resize((CANVAS_W, CANVAS_H), Image.LANCZOS)


def ajustar_a_caja(im: Image.Image, ancho_max: int, alto_max: int) -> Image.Image:
    """Reescala `im` (conservando proporción) para que entre dentro de
    ancho_max x alto_max."""
    w, h = im.size
    escala = min(ancho_max / w, alto_max / h)
    return im.resize((int(w * escala), int(h * escala)), Image.LANCZOS)


def pegar_centrado(canvas: Image.Image, im: Image.Image, centro_x: int, centro_y: int):
    """Pega `im` (RGBA) en `canvas`, centrada en (centro_x, centro_y)."""
    w, h = im.size
    x = int(centro_x - w / 2)
    y = int(centro_y - h / 2)
    canvas.alpha_composite(im, (x, y))


def construir_lienzo(nombre_elemento_red_neuronal: str) -> Image.Image:
    """Arma un lienzo completo: listones de fondo + los 4 elementos
    (usando `nombre_elemento_red_neuronal` para la red neuronal)."""
    canvas = construir_capa_de_listones()

    for nombre, cx, cy, ancho_max, alto_max in ELEMENTOS_FIJOS:
        elemento = ajustar_a_caja(extraer_elemento(nombre), ancho_max, alto_max)
        pegar_centrado(canvas, elemento, cx, cy)

    elemento_red = ajustar_a_caja(
        extraer_elemento(nombre_elemento_red_neuronal), *RED_NEURONAL_MAX
    )
    pegar_centrado(canvas, elemento_red, *RED_NEURONAL_CENTRO)

    return canvas


def main():
    for nombre_archivo_salida, nombre_elemento_red in VARIANTES_RED_NEURONAL:
        lienzo = construir_lienzo(nombre_elemento_red)
        salida = ELEMENTOS_DIR / nombre_archivo_salida
        lienzo.save(salida, "WEBP", quality=92)
        print(f"{salida}  ({lienzo.size[0]}x{lienzo.size[1]})")


if __name__ == "__main__":
    main()