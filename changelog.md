# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha quedó archivado completo en
> `historico/changelog-2026-09-14.md` (hasta el 14/09/2026) y
> `historico/changelog-2026-09-17.md` (14/09/2026 al 17/09/2026 —
> incluye toda la etapa de login/registro propios de "Mi plan", el
> rediseño del dashboard, la animación de los anillos de Método, y el
> proceso completo de Visión).

## 2026-09-17 (tercera tanda) — Pilares: recortar más la granada del cluster junto al título

Commit: ver hash en el archivo `.patch` generado para esta tanda.

El usuario pidió, sobre el cluster agregado en la tanda anterior, correr
las 3 decoraciones (granada, hoja, naranja) más hacia la derecha para
que la granada se vea "menos de la mitad" en vez de casi completa.

- Se restó 80px al `right` de los 3 elementos del cluster en `#lam-04`
  (granada `-30px→-110px`, hoja `150px→70px`, naranja `30px→-50px`),
  moviendo el grupo entero hacia el borde derecho sin cambiar tamaños,
  opacidades ni el orden vertical entre ellos.
- Con `width:180px` y `right:-110px`, la granada queda con ~70px
  visibles dentro de `.wrap` (≈39%), cumple el pedido de "menos de la
  mitad".
- Verificado con Playwright real, desktop 1440px: la granada se ve
  claramente recortada, la naranja también queda parcialmente cortada
  por el mismo corrimiento (antes estaba completa) — no reportado como
  problema, mismo criterio de "bleed" que el resto del sitio, revisar si
  el usuario lo nota. Mobile no se vuelve a verificar (esta sección se
  sigue ocultando entera por la regla general de `.deco-fruit` en
  `<720px`, sin cambios ahí).
- Sin cambios de CSS/JS, solo los 3 atributos `style` de `index.html`.
- Actualizados `memoria.md` y este archivo.

## 2026-09-17 (segunda tanda) — Pilares: frutas/alimentos grandes difuminados de fondo + cluster con naranja junto al título

Commit: ver hash en el archivo `.patch` generado para esta tanda.

A pedido del usuario ("difuminar frutas grandes de fondo" en `#lam-04`,
que solo tenía 1 `.deco-fruit` suelto):

- Se agregaron 4 `.deco-fruit` grandes (150–230px) en las 4 esquinas del
  `<section>`, con opacidad baja (.4–.5) para que se lean como fondo
  difuminado: aguacate (ya existía, se le bajó la opacidad y se agrandó
  un poco), granada, huevo y té — estos 3 últimos son fotos reales de
  `img/generadas-cutout/` ya usadas en otras secciones (Beneficios,
  Contacto), mismo criterio visual.
- El usuario pidió, con una imagen de referencia, que la parte derecha
  del título tuviera además un cluster de elementos más nítidos
  (opacidad .6–.9, no difuminados) terminando en una naranja. Se agregó
  una hoja fina (`svg/deco-leaf-beneficios.svg`) y una naranja
  (`svg/deco-blob-orange.svg`, ya traía su propio halo suave detrás —
  mismo efecto que la referencia sin CSS nuevo) junto a la granada de la
  esquina superior derecha.
- Verificado con Playwright real (Chromium sí pudo levantar en esta
  sesión) en desktop 1440px: las 6 decoraciones se ven en su lugar, sin
  tapar el título/texto/tarjetas (`z-index:0` de `.deco` vs. `z-index:1`
  de `.wrap`), y en mobile 390px se ocultan todas por la regla general
  `@media(max-width:720px){.deco-fruit{display:none}}`, sin romper el
  layout apilado de las 4 tarjetas. Capturas mostradas al usuario y
  confirmadas antes de generar el patch.
- No se tocó CSS ni JS, solo los 6 `<img class="deco deco-fruit">` de
  `index.html` dentro de `#lam-04`.
- Actualizados `memoria.md` y este archivo.

## 2026-09-17 — re-archivado de memoria.md y changelog.md

Commit: ver hash en el archivo `.patch` generado para esta tanda.

`memoria.md` había vuelto a crecer a ~2060 líneas y `changelog.md` a
~3400 (el umbral que motivó el archivado anterior del 14/09 había sido
~2200/~1960). Se repitió el mismo patrón:

- Copia completa de `memoria.md` → `historico/memoria-2026-09-17.md`.
- Copia completa de `changelog.md` → `historico/changelog-2026-09-17.md`.
- `memoria.md` reescrito condensado: mismas secciones fijas (Ramas,
  Autoría, Flujo de trabajo, Reglas, Producto, Estructura de archivos,
  Tests) sin cambios de fondo, y "Estado actual del diseño" +
  "Pendientes conocidos" resumidos a los hechos vigentes (sin la
  historia de qué se probó/descartó en cada tanda, que queda en el
  histórico).
- `changelog.md` reiniciado con esta única entrada.
- Sección "Histórico" de `memoria.md` actualizada para apuntar también a
  los archivos del 17/09.

No se tocó ningún archivo de producto (`index.html`, `css/styles.css`,
`js/*`, `netlify/*`) en este patch.
