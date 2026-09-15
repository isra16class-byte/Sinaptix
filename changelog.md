# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha (todas las sesiones de rediseño,
> wizard de nutrición, "Mi plan", backend, ilustraciones, etc.) quedó
> archivado completo en `historico/changelog-2026-09-14.md`.

## 2026-09-14 — Visión: fondo ilustrado más suave (blanquecino/difuminado)

Pedido del usuario con captura: el fondo de cerebro/red neuronal se veía
demasiado marcado/saturado detrás de las tarjetas ya en tono morado.

- `#lam-02 .vision-brain-bg`: `opacity:.95` -> `.55`, y se agrega
  `filter:blur(2px) brightness(1.35) saturate(.75)` (difumina bordes,
  aclara y baja saturación para que quede más de fondo/lavado en vez de
  competir visualmente con las tarjetas y el texto).
- Ajuste fino (mismo pedido, el usuario lo vio y quedó demasiado tenue):
  `opacity:.55` -> `.8`, `filter:blur(2px) brightness(1.35) saturate(.75)`
  -> `blur(1px) brightness(1.12) saturate(.88)` (mucho más leve, el arte
  se sigue viendo con claridad pero un poco más suave que el original).
- Nuevo pedido del usuario: correr el fondo más a la izquierda (que se
  meta más hacia el contenido, sensación de que "sale" más de la
  pantalla en vez de quedar pegado en la esquina) y bajarle un poco la
  opacidad de nuevo para que el resto del sitio se siga viendo bien.
  Se agrega `transform:translateX(-110px)` (desplaza todo el fondo, sin
  tocar el `right`/bleed original contra el borde real que ya estaba
  bien) y `opacity` baja de `.8` a `.62`.
- El usuario se equivocó de dirección: en realidad quería que bleedeara
  más hacia la **derecha** (como las neuronas de Método,
  `neurona-derecha` con `right:calc(...-200px)` y `opacity:.95` sin
  blur/filtros) y que la imagen se viera **más nítida**, no difuminada.
  Se revierte todo lo anterior: se quita el `transform:translateX` y los
  `filter` (blur/brightness/saturate); el bleed del `right` en el
  `<img>` (index.html) pasa de `-40px` a `-160px` (mismo criterio que
  `neurona-derecha`, bleed más pronunciado hacia el borde real derecho);
  `opacity` sube a `.92` (nítida, sin filtros que la empañen).

## 2026-09-14 — Visión: las 4 tarjetas del stat-grid en tono morado

Pedido del usuario con captura: las 3 tarjetas claras del `stat-grid` de
Visión (`lam-02`) contrastaban demasiado contra la destacada, que ya
tenía fondo morado oscuro. Se unificó el tono de las 4.

- `#lam-02 .stat-box`: fondo `rgba(255,255,255,.4)` ->
  `rgba(75,46,69,.6)` (mismo morado que la destacada, translúcido con
  blur para seguir dejando ver el arte de fondo).
- `#lam-02 .stat-box .num`: color pasa a blanco, y el glow (`text-shadow`)
  que antes era blanco (para legibilidad sobre fondo claro) ahora usa el
  mismo morado oscuro que ya tenía la destacada, consistente con el fondo
  nuevo.
- `#lam-02 .stat-box .lab`: pasa a blanco (antes heredaba el color oscuro
  por defecto de `.stat-box`).
- `#lam-02 .stat-box.is-featured`: se sube levemente la opacidad a `.75`
  (antes `.6`, igual que las demás ahora) para conservar una jerarquía
  sutil con el dato principal, sin volver a contrastar en blanco vs.
  morado.

## 2026-09-14 — Visión: agrandar más el fondo, subirlo, y glow en los números

Ajuste pedido por el usuario: más grande todavía y un poco más arriba. Al
agrandarlo/subirlo el cerebro del arte quedó justo encima del número
"86B", comprometiendo la legibilidad — se resolvió con un glow en el
texto en vez de volver atrás el tamaño/posición pedidos.

- `vision-brain-bg`: ancho `clamp(780px,74vw,1320px)` ->
  `clamp(880px,84vw,1480px)`; `top` `320px` -> `230px`.
- Nuevo: `#lam-02 .stat-box .num` lleva `text-shadow` tipo glow (blanco
  para las tarjetas normales, morado oscuro para `.is-featured`) para que
  el número se siga leyendo bien aunque el arte de fondo (cerebro, en el
  caso de la tarjeta 86B) caiga justo encima.
- Verificado con Playwright en 1024/1400px.



Ajuste pedido por el usuario: quería el fondo más grande todavía y que
pareciera que "sale" del costado derecho de la pantalla.

- `vision-brain-bg`: ancho `clamp(680px,64vw,1150px)` ->
  `clamp(780px,74vw,1320px)`.
- Bleed hacia el borde derecho real: `+20px` -> `-40px` (ahora se corta
  un poco contra el borde real de la pantalla a propósito, en vez de
  quedar con margen).
- Verificado con Playwright en 1024/1280/1400px: la red neuronal se corta
  contra el borde derecho (efecto buscado) sin invadir la columna de
  texto ni siquiera en 1024px.



Ajuste pedido por el usuario (con una captura marcando dónde quería que
llegara el fondo): tanto el fondo como las tarjetas estaban pegados al
borde superior de la sección, dejando un hueco vacío grande abajo (la
columna de texto de Visión es más alta que el `stat-grid`).

- `<div class="reveal d2">` que envuelve el `stat-grid` de Visión gana
  `margin-top:90px` inline (cambio puntual solo en esta instancia, no
  toca `.reveal.d2` en general, que se reusa en Método/Pilares/etc).
- `vision-brain-bg`: `top` pasa de `20px` a `320px`, para que el arte se
  reparta a lo largo de todo el alto de las tarjetas y siga bajando hacia
  el hueco que quedaba vacío, en vez de quedar solo arriba.
- Verificado con Playwright en 1024/1400px.



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
