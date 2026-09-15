# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha (todas las sesiones de rediseño,
> wizard de nutrición, "Mi plan", backend, ilustraciones, etc.) quedó
> archivado completo en `historico/changelog-2026-09-14.md`.

## 2026-09-14 — "Mi plan" sin sesión: volver al título largo (3 líneas) + arreglar franja blanca

El ajuste de altura de la sesión anterior había achicado el título de la
tarjeta a 2 líneas para ganar espacio; el usuario prefería la tarjeta
"larguita" original (título en 3 líneas, forma angosta), solo que sin
llegar a la altura total original. Además, al bajar la altura total, en
viewports altos quedaba una franja blanca del `body` visible por debajo
del footer, porque `#miPlan` (fondo `--panel`) terminaba antes que la
ventana.

- `css/styles.css`: se sacó la regla `.miplan-locked-card .lam-title{font-size:...}`
  agregada en la sesión anterior — el título vuelve a heredar el tamaño de
  `.lam-title` (`clamp(40px,6vw,68px)`), lo que le devuelve el wrap a 3
  líneas y la forma angosta/alta de la tarjeta. El resto de los recortes
  de esa sesión (paddings de `#miPlan`, `.miplan-locked`, la tarjeta, el
  margen del footer) se mantienen.
- `#miPlan` pasa a `min-height:100vh` (con `box-sizing:border-box`) para
  que el fondo `--panel` llene toda la ventana cuando el contenido es más
  bajo que el viewport, en vez de dejar ver el blanco del `body` por
  debajo del footer.
- Ese `min-height:100vh` por sí solo generaba ~24px de scroll de más en
  viewports altos: alguna de las decoraciones absolutas (fruta/cerebro)
  bleedea un poco por debajo del borde inferior de la sección, y sin
  ningún `overflow` en la cadena eso empuja el `scrollHeight` del `body`
  más allá del viewport (mismo mecanismo que describe la nota de
  `overflow-x` más abajo en este archivo, pero en vertical). Se agregó
  `overflow:hidden` a `#miPlan` — clip acotado a esta sección (no toca
  `html`/`body`, no pisa la regla de `overflow-x` documentada), no recorta
  ningún bleed horizontal porque la sección ocupa el ancho completo del
  viewport; solo contiene lo que se pasaba de su borde inferior/superior.
  Verificado que `#miPlanConSesion` (dashboard con sesión) no queda
  recortado por este cambio (se probó forzando ese estado con JS, sin
  login real).
- Resultado (medido con Playwright, 1440px de ancho): entra sin scroll
  hasta ~825px de alto de viewport (antes ~720px con el título chico,
  ~937px con el diseño original); por debajo de eso pide scroll normal,
  sin franja blanca en ningún caso.

## 2026-09-14 — "Mi plan" sin sesión: bajar la altura para que entre sin scroll

Pedido del usuario tras la sesión anterior (cerebro ilustrado real): en
laptops con poca altura de viewport, la pantalla `#miPlanSinSesion`
necesitaba scroll vertical para ver el footer. Se achicó la altura total
de ~937px a ~720px (medido con Playwright a 1440px de ancho), sin tocar
`#miPlanConSesion`.

- `css/styles.css`:
  - `#miPlan{padding:104px 0 56px}` → `88px 0 40px` y
    `#miPlan footer{margin-top:48px}` → `28px` (afecta a ambos estados de
    "Mi plan", pero el dashboard con sesión tiene contenido propio de sobra
    como para no notarse; si algún día se ve muy pegado ahí, ajustar aparte
    con un selector más específico).
  - `.miplan-locked{min-height:clamp(460px,58vh,600px)}` →
    `clamp(380px,48vh,460px)`, `padding:28px 0` → `20px 0`.
  - `.miplan-locked-card{padding:44px 46px 40px}` → `36px 40px 32px`.
  - Nueva regla `.miplan-locked-card .lam-title{font-size:clamp(30px,4vw,44px);margin:14px 0 14px}`
    (el título manuscrito por defecto es `clamp(40px,6vw,68px)`, pensado
    para títulos de sección hero — acá con 3 líneas de ese tamaño era el
    mayor contribuyente a la altura total).
  - `mi-plan.html`: `.btn-row` de esta tarjeta, margin-top inline
    `26px` → `20px`.
- Verificado con Playwright: `document.body.scrollHeight` pasa de 937px a
  720px (ancho 1440px); entra sin scroll hasta viewports de ~720px de
  alto. Capturas a 900px/800px/mobile (390px) revisadas, no se ve
  apretado.

## 2026-09-14 — "Mi plan" sin sesión: cerebro ilustrado real reemplaza la maraña SVG

Pedido del usuario con una imagen de referencia (screenshot de un mockup) y
el asset final (`Gemini_Generated_Image_lhlw1blhlw1blhlw.jpg`, ilustración
de un cerebro con dendritas, línea fina terracota/dorada sobre fondo muy
claro). Reemplaza la maraña de líneas SVG dibujada a mano de la sesión
anterior (`svg.miplan-locked-web` / `.bw-*`) dentro de `#miPlanSinSesion`.
Alcance igual de acotado que la sesión anterior: solo esta pantalla, no se
tocó `#miPlanConSesion`.

- Imagen del usuario convertida a `img/decoraciones-neurona/cerebro-mi-plan.webp`
  (mismo folder/criterio que `fondo-vision-red.webp` / `neurona-*.webp` de
  Visión/Método). Fondo de la imagen (~`#F6F0F4`) ya es casi idéntico a
  `--panel` de esta sección, así que no hizo falta `mix-blend-mode`: mismo
  criterio que `#lam-02 .vision-brain-bg` (solo `opacity`, sin filtros).
- `mi-plan.html`: se borró todo el `<svg class="miplan-locked-web">`
  (grupos `bw-outline-g`/`bw-scribble-g`/`bw-dendrite-g`) y se agregaron 2
  `<img class="deco miplan-locked-brain is-left|is-right">` con el mismo
  asset reusado a distinta escala (mismo criterio de reuso que
  `svg/deco-blob-*.svg` para las frutas).
- `css/styles.css`: se borraron `.miplan-locked-web`/`.bw-outline`/
  `.bw-scribble`/`.bw-dendrite`/`.bw-node`. Reglas nuevas
  `.miplan-locked-brain` (position:absolute, z-index:0, pointer-events:none,
  opacity:.92) + `.is-left` (chica, `left:15%;top:2%;width:clamp(140px,16vw,190px)`,
  arriba a la par del aguacate) + `.is-right` (grande,
  `right:-60px;top:-30px;width:clamp(420px,48vw,560px)`, sangra sobre el
  borde derecho con las dendritas bajando hacia esa esquina, igual criterio
  de bleed que `neurona-derecha`/`vision-brain-bg`). Mismo breakpoint
  `<900px` que el resto de los `.deco` grandes para ocultarlas en mobile.
- Verificado con Playwright en este entorno (sí había acceso a
  Chromium/Playwright esta sesión, a diferencia de la anterior): capturas a
  1280px/1440px calzan contra la referencia del usuario, mobile (390px)
  oculta ambos cerebros correctamente, y se confirmó `window.scrollX===0`
  tras forzar scroll horizontal con el bleed de `.is-right` — no rompe el
  criterio de `overflow-x` documentado en `memoria.md`.

## 2026-09-14 — "Mi plan": rediseño visual del estado sin sesión (`#miPlanSinSesion`)

Pedido del usuario con 2 referencias (mockups generados con IA): variante A
(tarjeta crema con candado ilustrado + fruta) y variante B (maraña de
líneas tipo red neuronal/cerebro con tarjeta chica superpuesta). Se pidió
combinar elementos de ambas, usando solo la paleta/tipografía ya definidas
en `css/styles.css` y los assets ya existentes en `svg/` para las frutas.
Alcance acotado: **solo** `#miPlanSinSesion` (el bloque "Iniciá sesión para
ver tu plan"); `#miPlanConSesion` (el dashboard con datos) queda para otra
sesión con otra referencia, no se tocó.

- `mi-plan.html`: `#miPlanSinSesion` pasa de ser texto+botones sueltos en
  el `.wrap` a una estructura `.miplan-locked` (flex centrado, 3 capas):
  1. `svg.miplan-locked-web` — maraña de líneas tipo red neuronal/cerebro,
     SVG inline dibujado a mano con curvas Catmull-Rom (no existe un asset
     así en `svg/`): contorno orgánico + 4 trazos internos tipo "tangle" +
     2 clusters de dendritas con nodos en las puntas. Mismo criterio de
     trazo fino sin relleno que `deco-circles-vision.svg`, paleta
     `--gold` (contorno/dendritas) + `--purple` (interior), sin colores
     nuevos.
  2. 3 `<img class="deco deco-fruit miplan-locked-fruit is-*">`
     reutilizando `deco-blob-avocado.svg`, `deco-blob-kiwi.svg` y
     `deco-blob-almonds.svg` (assets ya existentes, animación float ya
     definida por `.deco-fruit`).
  3. `.miplan-locked-card` — tarjeta blanca (`--paper`) redondeada con
     sombra, candado SVG inline a mano (`.miplan-locked-lock`, trazo
     `--purple`) arriba del eyebrow/título/texto/botones **sin cambiar su
     contenido, id ni clases** (`#btnLoginMiPlan` y el link "Volver al
     sitio" siguen funcionando igual, `js/mi-plan.js` no se tocó); solo
     pasaron de estar alineados a la izquierda y sueltos en el `.wrap` a
     quedar centrados dentro de la tarjeta nueva.
- `css/styles.css`: todo el CSS nuevo bajo selectores propios
  (`.miplan-locked*`, `.bw-*`, `.lock-*`), agregado después del bloque de
  layout del dashboard (`.miplan-grid`/`.miplan-detalle-grid`) — no se
  modificó ninguna regla existente que afecte `#miPlanConSesion` ni el
  resto del sitio. El SVG de la maraña se oculta en mobile (`<900px`,
  mismo criterio que `#lam-02 .vision-brain-bg`); las frutas heredan el
  ocultamiento `<720px` ya existente de `.deco-fruit`.
- Verificación en este entorno (sin acceso a Playwright/Chromium):
  balance de tags HTML y llaves CSS OK, validez XML del SVG generado OK,
  render aislado de la maraña de líneas con cairosvg (se ve como un
  contorno orgánico con tangle interior y dendritas, tal como se buscaba),
  y un preview de layout de caja con WeasyPrint (tarjeta/texto/botones/
  frutas quedan bien centrados y espaciados — limitación conocida: el
  motor SVG de WeasyPrint no aplica CSS por clase a elementos `<svg>`
  inline, así que en ese preview puntual el candado se vio como un bloque
  sólido en vez de trazo fino; es una limitación del motor de preview, no
  del código, que sí sigue el patrón estándar de CSS cascadeando a SVG
  inline que soportan todos los navegadores reales). Sin verificación
  visual real en navegador — si en una sesión nueva hay acceso a
  Playwright/Chromium, vale la pena revisar esta pantalla contra lo
  documentado acá antes de asumir que está 100% pulida.

## 2026-09-14 — Revertido: el scrollbar gris no era un bug de overflow, era el propio `overflow-x:hidden` de `html`

El usuario reportó (con captura) el scrollbar gris feo tipo Windows
clásico y pidió **quitarlo**, no decorarlo — la entrada anterior de este
changelog ("Scrollbar de marca") diagnosticó mal el problema y lo tapó
con un scrollbar morado en vez de arreglar la causa. Se investigó de
nuevo con Playwright (no solo mirando la captura):

- Se armó un worktree por commit (`5ceea72` confirmado bueno por el
  usuario, `a76214f` bleed de Visión, `1117e49` fix de overflow-x en
  html, `59ff47e` mi scrollbar decorado) y se midió en cada uno
  `document.documentElement.scrollWidth`/`clientWidth` **y**, más
  importante, se forzó scroll horizontal real con `page.mouse.wheel` y
  se leyó `window.scrollX` después.
- Resultado: `window.scrollX` se queda en `0` en **las 4 versiones**,
  con y sin el bleed grande de `vision-brain-bg` (`-160px`) — nunca hubo
  scroll horizontal real. `body{overflow-x:hidden}` (que ya existía
  desde antes de todo esto) siempre fue suficiente para contener el
  desborde de las decoraciones `position:absolute`. El `scrollWidth` del
  documento sí queda en ~2130px (vs 1920 de viewport) en todas las
  versiones — pero eso no indica scroll real, `scrollWidth` no cambia
  aunque el contenido esté correctamente clippeado por overflow.
- Es decir: el commit `1117e49` ("Fix: overflow-x:hidden en html")
  solucionaba un problema que no existía. Y sí tuvo un efecto secundario
  real: al fijar `overflow-x` en `html` sin fijar `overflow-y`, la spec
  de CSS fuerza el `overflow-y` computado de `visible` a `auto` en el
  elemento raíz. En Chrome/Windows, en cuanto `<html>` tiene **cualquier**
  `overflow` explícito, dejar de usar el scrollbar nativo "moderno" de la
  ventana y pasa a renderizar `<html>` como una caja de scroll CSS normal
  con el scrollbar clásico (gris sólido, con flechas arriba/abajo) — el
  que el usuario reportó como "doble scroll"/"se ve gris".
- **Revertido en este commit**: `html` vuelve a `scroll-behavior:smooth`
  a secas (sin `overflow-x`); se quita por completo el scrollbar
  decorado (`::-webkit-scrollbar*`) de la entrada anterior. `body`
  sigue con `overflow-x:hidden` sin cambios (nunca fue el problema).
- El "desorden de pantalla" que el usuario vio justo después de aplicar
  el bleed de Visión (`a76214f`) probablemente fue el efecto visual del
  bleed más grande/sin blur en sí (una imagen de fondo mucho más grande
  y nítida en esa sección), no un bug de scroll — si after de este
  revert todavía se ve raro visualmente en Visión, es un tema de diseño
  de esa sección puntual, no de overflow/scroll.

## 2026-09-14 — Scrollbar de marca (reemplaza el gris nativo del SO) — DIAGNÓSTICO INCORRECTO, ver entrada de arriba

Pedido del usuario con captura: en Windows/Chrome se veía una franja gris
sólida pegada al borde derecho de toda la página, que interpretó como
"doble scroll". Se verificó pixel a pixel la captura: es una única franja
continua (`rgb(139,139,139)`, ~11px) de arriba a abajo — el scrollbar
nativo clásico de Windows (track + thumb + flechas arriba/abajo), no un
bug de overflow del sitio ni dos scrollbars superpuestos (ya se había
descartado overflow horizontal real: `html`/`body` ya tenían
`overflow-x:hidden`, y no hay ningún contenedor con `overflow-y` propio
que genere scroll anidado).

- `css/styles.css`, justo después del reset `*{...}`/`html`/`body`: se
  agrega scrollbar personalizado en vez de dejar el del SO por defecto —
  `scrollbar-width:thin` + `scrollbar-color` (Firefox) y
  `::-webkit-scrollbar*` (Chrome/Edge/Safari) con pista `var(--panel)` y
  thumb `var(--purple)` (`var(--purple-dark)` en hover), 10px de ancho,
  sin flechas. Esto resuelve la queja visual ("se ve gris") aunque no
  había un bug de doble-scroll real de por medio.

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
- **Bug real encontrado y corregido** (reportado por el usuario: "se
  movió toda la web"): el bleed de `-160px` hizo que el `scrollWidth`
  del documento superara al `clientWidth` (confirmado con Playwright:
  2120px vs 1920px en desktop), es decir apareció scroll horizontal real
  en toda la página, no solo en la sección. La causa: `overflow-x:hidden`
  estaba puesto solo en `body`, no en `html`, y con este bleed más grande
  eso dejó de ser suficiente para contener el desborde. Fix: se agrega
  `overflow-x:hidden` también a `html` (`html{scroll-behavior:smooth;
  overflow-x:hidden}`). Verificado con Playwright en 1024/1366/1920px:
  `scrollWidth === clientWidth` en los tres, sin scroll horizontal.

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
