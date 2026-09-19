#!/usr/bin/env python3
"""Prepara las fotos de perfil de los 2 testimonios de #lam-05 (Beneficios).

Recorte cuadrado centrado en la cara (a 56px la cara tiene que llenar el
círculo, así que se recorta cerrado, no cabeza+hombros completos), 200x200
.webp. Las fotos originales (Gemini, 1024x1024) no se guardan en el repo.
Uso: python3 scripts/preparar-fotos-testimonios.py <mr.jpg> <js.jpg>
"""
import sys
from PIL import Image

# (centro x, centro y, lado del recorte) sobre la imagen original 1024x1024
RECORTES = {
    'mr': (510, 410, 450),
    'js': (515, 405, 500),
}
TAM = 200

def preparar(ruta, clave):
    cx, cy, lado = RECORTES[clave]
    im = Image.open(ruta).convert('RGB')
    box = (cx - lado // 2, cy - lado // 2, cx + lado // 2, cy + lado // 2)
    im = im.crop(box).resize((TAM, TAM), Image.LANCZOS)
    dest = f'img/testimonios/{clave}.webp'
    im.save(dest, 'WEBP', quality=90, method=6)
    print(dest)

if __name__ == '__main__':
    preparar(sys.argv[1], 'mr')
    preparar(sys.argv[2], 'js')
