# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha (todas las sesiones de rediseño,
> wizard de nutrición, "Mi plan", backend, ilustraciones, etc.) quedó
> archivado completo en `historico/changelog-2026-09-14.md`.

## 2026-09-14 — Visión: agrandar el fondo ilustrado y transparentar todas las tarjetas

Ajuste pedido por el usuario tras ver el resultado del patch anterior: la
imagen de fondo se veía chica y solo la tarjeta "86B" dejaba notar el arte
detrás.

- `img/decoraciones-neurona/fondo-vision-red.webp` pasa de
  `clamp(520px,50vw,860px)` a `clamp(680px,64vw,1150px)`, y el bleed hacia
  el borde derecho real de pantalla se acorta (`+20px` en vez de `+90px`)
  para que ocupe casi toda la mitad derecha de la sección.
- Las 4 `.stat-box` de `#lam-02` (incluida `.is-featured`, antes sólida)
  pasan todas al mismo tratamiento translúcido: `rgba(255,255,255,.4)` /
  `rgba(75,46,69,.6)` con `backdrop-filter:blur(2px)` (antes `.55`/`.82`
  opacos y `blur(3px)`, mucho más tapado).
- Verificado de nuevo con Playwright en 1024/1400px: texto de las 4
  tarjetas sigue legible sobre el arte.



A pedido del usuario (venía de una imagen generada con Gemini, primero con
texto horneado en el JPG —descartada por no ser accesible/editable— y
después una versión limpia solo con el arte), se agregó como fondo
decorativo del `stat-grid` de la sección Visión (`lam-02`):

- Imagen nueva: `img/decoraciones-neurona/fondo-vision-red.webp` (convertida
  desde el JPG subido, ~72 KB). Posicionada con el mismo patrón de bleed a
  borde real de pantalla que ya usan las neuronas de Método
  (`calc(50% - (var(--vw100, 100vw)/2))`), ancho `clamp(520px,50vw,860px)`
  para que no invada la columna de texto en pantallas medianas (~1024px),
  oculta en mobile (`<900px`).
- `#lam-02 .stat-box` pasa a fondo `rgba(255,255,255,.55)` +
  `backdrop-filter:blur(3px)` (la tarjeta destacada
  `rgba(75,46,69,.82)`) para dejar ver el arte detrás sin perder
  legibilidad. Cambio acotado a `#lam-02`: no afecta `.stat-box` en
  `#miPlan` ni en otra parte.
- Se sacaron las decoraciones viejas que quedaban en esa misma esquina
  (`deco-circles-vision.svg`, `huevo.webp`, `aceite-oliva.webp`, la espiga
  superior) porque competían visualmente con el arte nuevo. Se dejaron las
  bayas y la espiga inferior, que están del lado del texto.
- Verificado con Playwright (instalado en este entorno, a diferencia de
  sesiones anteriores documentadas en el histórico) en 1024/1280/1400px:
  sin invadir el texto, sin cortes feos del lado derecho, tarjetas
  legibles.



Se movieron los archivos `memoria.md` (2238 líneas) y `changelog.md`
(1960 líneas) a `historico/memoria-2026-09-14.md` y
`historico/changelog-2026-09-14.md` respectivamente, sin editar su
contenido. Se crearon versiones nuevas de ambos archivos en la raíz:

- `memoria.md` nuevo: mantiene íntegras las reglas de proceso (ramas,
  autoría, flujo de patches, reglas de esta memoria) y agrega una sección
  "Estado actual del diseño" condensada (paleta, tipografía, componentes
  principales, backend) con referencias puntuales al histórico para el
  detalle completo de cada decisión.
- `changelog.md` nuevo: arranca vacío salvo esta misma entrada, apuntando
  al histórico para todo lo anterior.

Motivo: ambos archivos habían crecido lo suficiente como para ser
costosos de leer completos al inicio de cada sesión nueva, sin que la
mayor parte de ese detalle (ajustes finos de posición/color en secciones
puntuales) fuera necesaria para retomar trabajo en otra parte del sitio.
