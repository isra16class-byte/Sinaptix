# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha (todas las sesiones de rediseño,
> wizard de nutrición, "Mi plan", backend, ilustraciones, etc.) quedó
> archivado completo en `historico/changelog-2026-09-14.md`.

## 2026-09-16 (décimocuarta tanda) — "SINAPTIX" encerrado en el título de "Mi plan"

Commit: ver hash en el archivo `.patch` generado para esta tanda.

El usuario trajo una referencia visual (una palabra manuscrita rodeada
por un círculo dibujado a mano en turquesa, tipo resaltador) y pidió
aplicar ese tratamiento solo a la palabra "SINAPTIX" dentro del título
"Tu progreso con SINAPTIX" (`mi-plan.html`), en el morado de marca que
ya se usa en el resto del sitio.

- `mi-plan.html`: "SINAPTIX" queda envuelto en
  `<span class="miplan-brand-circled">` dentro del `<h2 class="lam-title
  title-hand">` — el resto del título ("Tu progreso con") no cambia.
- `svg/deco-circle-brand.svg` (nuevo): un círculo/óvalo dibujado a mano
  (un solo `<path>` con stroke, mismo lenguaje visual que los demás decos
  del sitio) en turquesa `#0FD8C4` — color tomado de la referencia del
  usuario, no es un color de marca existente, por eso vive fijo en el SVG
  y no como variable de `:root`. Tiene `preserveAspectRatio="none"` (a
  diferencia de los otros decos) para poder estirarse libremente y
  calzar con el ancho real de la palabra.
- `css/styles.css`: `.miplan-brand-circled` pone el texto en
  `var(--purple-dark)` (el mismo morado que usa "SINAPTIX" en el logo de
  la nav, `.nav .mark`) y agrega el círculo como `::after` con
  `background-image` (mismo mecanismo que ya usa `.title-mark` en otras
  secciones), recortado solo a esta palabra.
- Offsets del círculo (`left:-7%;right:-15%;top:-24%;bottom:-30%`,
  relativos al propio `<span>`) ajustados a ojo probando con la tipografía
  real (`Caveat` 700) para que no pise la palabra "con" de al lado ni
  quede desproporcionado — no son valores redondos "de manual", si el
  texto de esta palabra cambiara algún día conviene volver a mirarlos.
- Verificado con Playwright, desktop (1600px) y mobile (390px), sin
  overflow horizontal. Para esta verificación se instaló temporalmente
  el paquete npm `typeface-caveat` (fuente real, self-hosted solo para la
  captura) porque `fonts.googleapis.com` no es alcanzable desde este
  entorno — el archivo de fuente y el paquete se borraron al terminar, no
  quedaron en el repo. 54/54 tests ok (sin relación con este cambio, solo
  CSS/HTML/SVG).

## 2026-09-16 (décimotercera tanda) — Fix: texto largo sin espacios rompía la grilla de "Mi plan"

Commit: ver hash en el archivo `.patch` generado para esta tanda.

Bug reportado por el usuario con captura, apenas aplicado el patch de la
tanda anterior (tarjeta propia para "Ajustado a tu caso"): al escribir un
texto largo sin espacios en el campo "disgustos" de la encuesta, la
columna izquierda de "Detalle del plan" (Plan / Prioridades y
Moderación) quedaba comprimida a una tira vertical angosta, con el texto
partido letra por letra, mientras la tarjeta "Ajustado a tu caso"
desbordaba hacia la derecha, fuera del viewport.

Causa: al mover ese bloque a tarjeta propia (`.miplan-ajustes`, ver
tanda anterior) se perdió el `overflow-wrap:anywhere;word-break:break-word`
que `.nutri-side-box` ya traía puesto exactamente para este caso (texto
libre sin espacios). Sin esa propiedad, una palabra/token larguísimo no
rompe línea; en un grid con columnas `fr`, un hijo no se achica por
debajo de su min-content por default, así que ese token "empuja" la
columna angosta mucho más allá de su `1fr` asignado y se come el espacio
de la ancha.

Fix, en `css/styles.css`:
- `.miplan-ajustes{overflow-wrap:anywhere;word-break:break-word}` — el
  arreglo puntual del caso reportado.
- `.miplan-detalle-grid > *{min-width:0}` y
  `#miPlan .nutri-plan-block > *{min-width:0}` — red de seguridad a nivel
  de grid en las 2 grillas de esta pantalla (la de "Ajustado a tu
  caso"/"Cierre" y la interna de cada `.nutri-plan-block`), para que
  cualquier otro contenido futuro que tampoco rompa línea no pueda volver
  a "explotar" una columna.

Verificado con Playwright (mock de `netlifyIdentity`, sin red real),
reproduciendo el mismo texto largo sin espacios del reporte: sin overflow
horizontal del documento, ancho de la grilla igual al del contenedor, en
desktop (1600px) y mobile (390px, apilado en 1 columna). Suite de unit
tests sin cambios: 54/54 ok.

## 2026-09-16 (décimosegunda tanda) — "Ajustado a tu caso" pasa a tarjeta propia en "Mi plan"

Commit: ver hash en el archivo `.patch` generado para esta tanda.

El usuario reportó que la tarjeta "Prioridades y Moderación" quedaba fea
cuando el bloque "Ajustado a tu caso" (dentro de `.nutri-plan-side`) tenía
varios ítems: la tarjeta se alargaba mucho más que el plan de al lado.
Pidió sacarlo a una tarjeta aparte, en la posición donde hoy vive
"Cierre" (columna derecha de `.miplan-detalle-grid`, ver `mi-plan.html`).

- `js/nutricion-planes.js`: `nutriBuildResumenHTML(d, opts)` ahora acepta
  un segundo parámetro opcional; `opts.incluirAjustesEnSide` (default
  `true`) decide si el bloque se embebe en `.nutri-plan-side` como antes.
  El wizard de `index.html` (paso 8, `js/nutricion-wizard.js`) sigue
  llamando sin ese parámetro — comportamiento sin cambios ahí. La lista de
  datos (`nutriConstruirAjustes(d)`) no cambió.
- `mi-plan.html`: se agregó un wrapper `.miplan-detalle-side` en la
  columna derecha de `.miplan-detalle-grid`, con 2 tarjetas apiladas:
  `#miPlanAjustes` (nueva, título "Ajustado a tu caso" + lista) arriba, y
  `.miplan-cierre` (sin cambios de contenido) debajo.
- `js/mi-plan.js` (`pintarMiPlan()`): llama a `nutriBuildResumenHTML` con
  `{incluirAjustesEnSide:false}` y pinta `#miPlanAjustesList` aparte con
  `nutriConstruirAjustes(o.encuesta)`; oculta `#miPlanAjustes` si no hay
  ajustes o si no hay objetivo guardado (mismo criterio que ya usaban
  `miPlanDetalleEl`/`miPlanBarrasEl`).
- `css/styles.css`: `.miplan-ajustes` es una tarjeta propia con el mismo
  tratamiento visual (fondo dorado, texto blanco) que ya tenía
  `.nutri-side-box--ajustes` dentro del side — no es un componente nuevo
  a nivel visual, solo cambia el contenedor.
- Suite de unit tests sin cambios de comportamiento por defecto: 54/54 ok
  (verificado con Node evaluando el nuevo parámetro opcional a mano, ver
  sesión). No se pudo correr Playwright en esta sesión (sin acceso de red
  al dominio de descarga del browser desde este entorno) — falta
  verificación visual en un navegador real.

## 2026-09-16 (décimoprimera tanda) — Medidor de IMC ("Mi plan"): degradado continuo + barrido de la aguja

Commit: ver hash en el archivo `.patch` generado para esta tanda.

El usuario pidió mejorar el medidor de IMC tipo velocímetro (`.imc-gauge`,
compartido entre "Mi plan" y el switch "Mi IMC" de Método): hasta ahora
era un SVG con 4 arcos de color sólido y una aguja que aparecía directo
en su posición final, sin animación ni marcador de valor. Se combinaron
dos mejoras, ambas construidas sobre funciones nuevas en
`js/nutricion-planes.js` (no en `js/mi-plan.js`, para no duplicar
lógica ni tener que repetirla en `js/script.js`, que arma el mismo
componente para Método):

1. **Degradado continuo del arco** en vez de 4 franjas sólidas. Los 4
   `<path>` del arco siguen dibujando exactamente los mismos umbrales
   (18.5/25/30, sin cambios) pero ahora comparten un único
   `<linearGradient id="imcGaugeGradient">` en vez de tener cada uno su
   propio `stroke` fijo. Los 3 colores de anclaje (dorado/verde/rojo)
   son **exactamente** los que ya devuelve `gaugeColorForPercent` —
   `imcGaugeGradientStops()` los pide llamando a esa misma función
   (`gaugeColorForPercent(50)`/`(100)`/`(0)`) en vez de escribir los hex
   de nuevo, así el criterio de color queda compartido de verdad con los
   anillos de "Método", no solo "parecido". Cada ancla se ubica en el
   **centro** de su zona de IMC (no en el umbral exacto), para que la
   transición de color ocurra alrededor del umbral real en vez de que el
   degradado arranque recién ahí (se vería casi tan cortado como antes).
   `imcGaugeGradientDefsHtml(id)` arma el `<defs>` completo como string,
   usado por `renderMethodImc` (`js/script.js`, que ya arma todo el SVG
   como template string). `mi-plan.html` es HTML estático — su `<defs>`
   equivalente está escrito a mano con los mismos offsets/colores
   (7%/27%/50%/80%, vía clases `.imc-stop-gold/-green/-red` que apuntan
   a `var(--gold)/--green/--red`, los mismos hex), con un comentario que
   avisa mantenerlo sincronizado si esos centros cambiaran algún día en
   `nutricion-planes.js`. `gradientUnits="userSpaceOnUse"` con
   `x1`/`x2` en las coordenadas reales del arco (25/195) — con el
   default (`objectBoundingBox`) cada uno de los 4 `<path>` tiene su
   propio bounding box angosto y el degradado se habría visto
   cortado/repetido en cada segmento en vez de continuo.
2. **Animación de barrido de la aguja al cargar** (`pintarMiPlan`,
   `js/mi-plan.js`): la aguja arranca en `imcGaugeAgujaDegInicial()`
   (extremo mínimo del arco, `IMC_GAUGE_MIN`) y recién en el frame
   siguiente se le asigna la rotación final (`imcGaugeAgujaDeg(imc)`) —
   mismo truco de "doble `requestAnimationFrame`" que ya usa
   `gaugeAnimateArcs` (`js/script.js`) para los anillos de Método, para
   que el navegador alcance a pintar el estado inicial antes de animar
   al final. La duración/easing viven en CSS
   (`.imc-aguja{transition:transform .7s cubic-bezier(.16,.84,.44,1)}`,
   mismo cubic-bezier que ya usan los anillos). `imcGaugeAgujaDeg`
   también reemplaza la fórmula `90 - imcGaugeAngulo(imc)` que antes
   estaba duplicada tal cual en `js/mi-plan.js` **y** `js/script.js`.
   Además, un **marcador fijo** (`.imc-gauge-marker`, círculo blanco con
   contorno oscuro) se agregó sobre el arco en el valor exacto,
   independiente de la aguja — usa `imcGaugeMarkerPos(imc)` (mismo
   centro/radio que el arco, recortado al mismo rango `[15,40]` que la
   aguja) y se actualiza siempre a su posición final, sin animar, así
   sigue siendo útil incluso durante el barrido o si
   `prefers-reduced-motion: reduce` está activo. Ese caso se cubre en
   dos capas: JS (`pintarMiPlan` detecta `matchMedia` y salta directo a
   `imcGaugeAgujaDeg(imc)` sin la secuencia de rAF) y CSS
   (`@media(prefers-reduced-motion:reduce){.imc-aguja{transition:none}}`
   como red adicional).

`renderMethodImc` (`js/script.js`, el switch "Mi IMC" de Método) también
se actualizó para usar `imcGaugeGradientDefsHtml`/`imcGaugeAgujaDeg`/
`imcGaugeMarkerPos` — mismo degradado y mismo marcador ahí, sin barrido
(esa pestaña ya renderizaba todo de una sola vez, sin animación previa,
y el pedido de barrido era específico de `pintarMiPlan`). No se tocó el
estado "sin datos" (el gauge sigue con `class="hidden"` hasta que existe
`sinaptix_antropometria`) ni el número mostrado al lado del gauge (sigue
siendo el IMC real sin recortar — solo la posición de la aguja/marcador
se recorta a [15,40], igual que antes).

Sin dependencias nuevas (SVG + CSS + JS vanilla, sin build step).

**Tests**: se agregaron 8 tests nuevos en `tests/nutricion-planes.test.js`
para las funciones nuevas (`imcGaugeAgujaDeg`, `imcGaugeAgujaDegInicial`,
`imcGaugeMarkerPos`, `imcGaugeGradientStops`, `imcGaugeGradientDefsHtml`).
Suite completa: 54/54 ok (46 preexistentes + 8 nuevos).

**Verificado con Playwright** (sí hubo acceso a Chromium en esta sesión,
a diferencia de la tanda anterior de anillos de Método): las 4 zonas de
IMC de prueba (16.8 bajo peso, 22.1 saludable, 27.4 sobrepeso, 33.9 a
vigilar) — degradado continuo visible en el arco, aguja capturada a
mitad de barrido (~100ms) en una posición distinta a la final,
confirmando que no aparece ya ubicada, y en su posición final correcta
a los ~900ms; marcador siempre en la posición exacta del IMC en las 4
capturas. Estado sin datos: `#miPlanImcGauge` sigue con
`class="imc-gauge hidden"`. `prefers-reduced-motion: reduce` (con
`reducedMotion:'reduce'` en el context de Playwright): la aguja ya está
en su posición final a los 50ms (sin esperar el barrido) y
`getComputedStyle(...).transitionDuration` da `0s`. Switch "Mi IMC" de
Método (`index.html`): mismo degradado (`<linearGradient>` presente) y
mismo marcador, sin romper nada del resto de la tarjeta. Script de
verificación ad hoc, no vive en el repo (mismo criterio que otras
verificaciones visuales del proyecto).

## 2026-09-16 (décima tanda) — Anillos de Método: animación de llenado + marcador de "antes"

El usuario pidió mejorar los anillos de progreso de la tarjeta "Método"
(`#methodGauges`, `.gauge-grid`): hasta ahora cada anillo aparecía
directo en su posición final sin animación, y el "antes" solo se veía
como badge de texto. Se combinaron dos mejoras, sin tocar el criterio ya
vigente de "un solo anillo, no doble concéntrico" (ver
`historico/memoria-2026-09-14.md`, esa opción quedó descartada por
verse como un glitch a este tamaño de tarjeta):

1. **Animación de llenado** (`gaugeArc`/`gaugeAnimateArcs`,
   `js/script.js`): cada anillo se llena desde 0% hasta su porcentaje
   real con `stroke-dashoffset` animado por CSS (`.gauge-arc-value`,
   `css/styles.css`), ~0.7s ease-out. Se cambió la técnica de dibujo:
   `stroke-dasharray` ahora es fijo a la circunferencia completa (antes
   era `"largo circunferencia"`, que dibujaba el arco ya resuelto y no
   se podía animar sin recalcularlo cada frame) y lo que varía es el
   offset. El destacado arranca en 0ms, los 3 chicos ~90ms después
   (con 30ms extra de diferencia entre ellos) para que no se sientan
   como 4 anillos disparando a la vez. `prefers-reduced-motion: reduce`
   lo desactiva del todo (arranca directo en el valor final, sin
   transición ni JS de más — doble red: `gaugeArc` no pone `transition`
   inline en ese caso, y hay una regla CSS de refuerzo). Confirmado por
   código que `renderMethodGauges` solo se llama al cargar la página y
   tras guardar diagnóstico/reevaluación (no hay listener de scroll que
   la dispare), así que no se reinicia sola al hacer scroll.
2. **Marcador de "antes" sobre el propio anillo** (`gaugeArcMarker`,
   `js/script.js`; `.gauge-arc-marker`, `css/styles.css`): un punto
   chico blanco con contorno gris (no un segundo anillo) en el ángulo
   correspondiente a `area.antesPct`, solo cuando hay reevaluación
   guardada (`area.despuesPct != null`, mismo criterio que ya usaba el
   badge de delta). Color deliberadamente neutro para no confundirse
   con el extremo actual del arco, que usa la paleta
   `METHOD_GAUGE_LOW/MID/HIGH`. El badge de texto (`methodDeltaBadge`)
   y la línea "Antes: X%" no se tocaron.

Sin dependencias nuevas (SVG + CSS + JS vanilla, sin build step). Los
`aria-label` de cada anillo siguen reflejando el valor final real, no
un valor intermedio de la animación. No se tocaron
`gaugeColorForPercent`/`GAUGE_LOW/MID/HIGH` de `js/nutricion-planes.js`
(compartidas con el gráfico de barras de "Mi plan") ni la lógica de los
3 estados de la tarjeta ni el interruptor "Mi progreso"/"Mi IMC".

Suite de tests sin cambios (46/46 ok — este patch no toca lógica de
cálculo, solo SVG/CSS/animación). No se pudo verificar con Playwright
en esta sesión: la descarga del browser (`cdn.playwright.dev`) no está
en la allowlist de red de este entorno, mismo problema documentado en
sesiones anteriores. Queda pendiente en `memoria.md` → "Pendientes
conocidos".

## 2026-09-16 (novena tanda) — Ícono de las tarjetas de Visión a la esquina superior derecha

El usuario pidió que el ícono de las 4 tarjetas de estadísticas
(`#lam-02 .stat-box`) se pusiera en el borde derecho, bien ajustado y
"obvio".

`.stat-icon` pasó de estar en flujo normal arriba a la izquierda
(empujando el número hacia abajo) a `position:absolute` en la esquina
superior derecha de la tarjeta (`top:22px;right:22px`), quedando como
un sello/badge fijo. `#lam-02 .stat-box` necesitó `position:relative`
para que el absolute se ancle a la tarjeta y no a un ancestro más
arriba. Se agregó `padding-right:50px` a `.num`/`.lab` (solo en
`#lam-02`) para que el texto nunca quede debajo del ícono.

Cambio scopeado 100% a `#lam-02` — no afecta `.stat-icon`/`.stat-box`
en otras secciones. Solo `css/styles.css`. Verificado con Playwright,
desktop 1440px y mobile 390px.

## 2026-09-16 (octava tanda) — Subtítulos de Visión en morado + más contraste en las 4 tarjetas

El usuario pidió dos cosas en la sección Visión (`#lam-02`, "El cerebro
también se alimenta"):

1. Los 3 subtítulos en negrita de los bullets ("Atención
   individualizada.", "No más dietas genéricas.", "Rendimiento
   cognitivo.") pasaron de `var(--ink)` (casi negro) a `var(--purple)`,
   el mismo morado que ya tenía la palabra "alimenta" del título.
2. El texto de las 4 tarjetas de estadísticas (`#lam-02 .stat-box`) —
   número y descripción — casi no se veía/no resaltaba: pasó de
   `var(--purple)` a `var(--purple-dark)` (más oscuro, más contraste
   contra el fondo translúcido blanco de las tarjetas), y el label subió
   de `opacity:.82` a `.85`.

Cambio en `css/styles.css`, 2 reglas (`.vision-bullets strong`,
`#lam-02 .stat-box .num`/`.lab`). Sin cambios en HTML ni JS. Verificado
con Playwright, desktop 1440px y mobile 390px.

## 2026-09-16 (séptima tanda) — Ajuste: morado más oscuro + sacar rayas duplicadas en Beneficios/Contacto

El usuario probó el patch anterior (rayas de naranja/dorado a morado) y
pidió dos ajustes:

1. El morado (`--purple` #714B67) quedaba muy claro/poco contraste →
   se cambió el `stroke` de `svg/deco-scribble-purple.svg` a
   `--purple-dark` (#4B2E45), más oscuro. Como es un asset único
   compartido, el cambio aplica a todas las secciones que lo usan.
2. En Beneficios (`#lam-05`, "carga alta") y Contacto (`#lam-06`,
   "asesoría") había dos rayas apiladas: el subrayado de `.title-mark`
   pegado a la palabra + una curva `.title-scribble` suelta justo debajo,
   sin relación con ninguna palabra puntual — se veía redundante ahora
   que ambas son del mismo color. Se sacó el `<img class="title-scribble">`
   de esas 2 secciones (queda solo el subrayado). Método y Pilares no se
   tocaron: ahí la curva queda centrada bajo todo el título (título
   centrado, no alineado a la izquierda) y no se ve duplicada.

Cambio en `svg/deco-scribble-purple.svg` (1 línea), `index.html` (se
sacan 2 `<img class="title-scribble">`) y `css/styles.css` (se saca la
regla de margin que ya no aplicaba a nada). Verificado con Playwright,
desktop 1440px.

## 2026-09-16 (sexta tanda) — Rayas bajo los títulos de naranja/dorado a morado en todo el sitio

El usuario pidió que las rayas naranjas que acompañan los títulos de
cada sección (el subrayado detrás de la palabra remarcada y la línea
curva debajo del `<h2>`) fueran del mismo morado que la propia palabra.

Nuevo asset `svg/deco-scribble-purple.svg` (mismo trazo, `stroke`
morado `#714B67`) reemplaza a `deco-scribble.svg` (naranja `#EDA23A`) y
`deco-scribble-gold.svg` (dorado `#C1703B`, usado solo en Método) en
las 5 secciones que usan este lenguaje visual: Método (`#lam-03`),
Pilares (`#lam-04`, incluye también el trazo suelto extra de
`.lam-title-frame`), Beneficios (`#lam-05`) y Contacto (`#lam-06`). El
default de `.title-mark` en `css/styles.css` ahora usa el asset morado
directamente, así que se sacó el override que hacía dorado el de
Método. Visión (`#lam-02`) no tenía esta raya y sigue sin ella. Los
`deco-espiga.svg` (motivo de espigas, sin relación) no se tocaron.

Cambio en `css/styles.css` (2 reglas) + `index.html` (5 atributos
`src`) + el nuevo `svg/deco-scribble-purple.svg`. Sin cambios en JS.
Verificado con Playwright, desktop 1440px, las 5 secciones.

## 2026-09-16 (quinta tanda) — Rediseño estético de los círculos numerados del timeline de Método

El usuario pidió mejorar estéticamente los números 1-2-3-4 del lado
izquierdo de la sección "Método" (`#lam-03`). Se propusieron 3
direcciones (círculos con degradado y sombra / línea curva tipo trazo a
mano / números tipográficos grandes sin círculo) y el usuario eligió la
primera.

Cambio en `css/styles.css`, solo `.tl-num` y `.tl-line`: los círculos
pasan de blanco liso + borde fino a relleno en degradado
`var(--purple)` → `var(--purple-dark)` con número en blanco, sombra
difusa y un anillo del color de fondo de la sección para separarlos de
la línea vertical (que ahora también es un degradado en vez de color
plano). Sin cambios en HTML ni JS. Verificado con Playwright (desktop
1440px, mobile 390px).

## 2026-09-16 (cuarta tanda) — Fix: texto libre sin espacios desbordaba todo el modal del wizard

El usuario, probando el patch anterior, pegó una cadena larga sin
espacios (200 "c" seguidas) en "Alimentos que no te gustan" (paso 7)
para ver si rompía algo — y rompía: aparecían scroll horizontal y
vertical en todo el modal (`#modalNutricion .modal-card`), no solo el
texto desbordado. Confirmado con Playwright que el bug **ya existía
antes del patch de la tanda anterior** (mismo `scrollWidth` en el
commit previo) — no lo introdujo ese cambio, ya estaba.

- **Causa**: `.nutri-summary`, `.nutri-side-box` y `.nutri-note`
  (`css/styles.css`) — los 3 contenedores donde `js/nutricion-planes.js`
  (`nutriBuildResumenHTML`/`nutriConstruirAjustes`) insertan el texto
  libre de `disgustos`/`alergiaOtra` vía `innerHTML` — no tenían
  `overflow-wrap`/`word-break`. Una cadena sin espacios no tiene dónde
  cortar y estira la caja; como esas cajas viven dentro de
  `.modal-card` (`overflow:auto`), el navegador ensancha el contenedor
  entero en vez de solo desbordar el texto.
- **Fix**: `overflow-wrap:anywhere;word-break:break-word` agregado a
  las 3 clases. Mismas clases se reusan en `#miPlan` (`mi-plan.html`),
  así que el fix cubre ambos lugares sin tocar nada más.
- Verificado con Playwright: antes del fix, `modal-card.scrollWidth`
  1456 vs `clientWidth` 560 con la cadena de prueba; después, iguales
  (560 = 560). Captura visual confirma que el texto ahora se corta en
  varias líneas dentro del ancho normal de la caja "Ajustado a tu
  caso".
- Suite de unit tests sin cambios (46/46 ok) — fix puro de CSS, no toca
  JS.

## 2026-09-16 (tercera tanda) — Nombre/correo del wizard: ocultar/prellenar con sesión + precargar login

A partir de una consulta del usuario por chat sobre para qué se usan
`nutriNombre`/`nutriEmail` (paso 1 del wizard) si no alimentan nada del
plan — se confirmó que hoy no se usan aguas abajo, más allá de quedar
guardados en `sinaptix_objetivo`. El usuario pidió: (1) dejarlos pero
ocultos/prellenados si ya hay sesión iniciada, y (2) usar esos dos datos
para precargar la pantalla de login/registro de "Mi plan" cuando alguien
guarda sin sesión, para que solo tenga que escribir la contraseña.

- **`index.html` / `mi-plan.html`**: el `.modal-row` de nombre/correo
  (paso 1 del wizard) ahora tiene `id="nutriContactoInputs"`; se agrega
  debajo un bloque `#nutriContactoResumen` (reutiliza las clases
  `.nutri-antro-resumen`/`.nutri-antro-texto` ya usadas por peso/talla,
  sin CSS nuevo) con `#nutriContactoResumenTexto` y el botón
  `#btnNutriContactoEditar` ("Usar otro nombre o correo").
- **`js/nutricion-wizard.js`** (`resetNutriWizard()`): si
  `netlifyIdentity.currentUser()` devuelve un usuario con `email` y
  `user_metadata.full_name`, prellena `nutriNombre`/`nutriEmail` y
  oculta `#nutriContactoInputs` mostrando el resumen ("Vas a guardar el
  plan con los datos de tu cuenta — Nombre (email)."); si solo hay
  `email` (cuentas viejas sin `full_name`), prellena pero deja los
  inputs visibles, para no ocultar un campo `required` vacío. Nuevo
  listener en `#btnNutriContactoEditar` (mismo patrón que
  `btnNutriAntroEditar`) para volver a mostrar los inputs sin perder el
  valor ya cargado.
- **`js/mi-plan.js`**: nueva `prefillAuthDesdeEncuesta()`, llamada desde
  la rama sin sesión de `netlifyIdentity.on('init', …)` (no en el flujo
  de recuperación de contraseña). Lee `sinaptix_objetivo` de
  localStorage (ya traía `email` y `encuesta.nombre` desde antes de este
  patch) y completa `#loginEmailMiPlan`/`#registroEmailMiPlan` con el
  email y `#registroNombreMiPlan` con el nombre, sin pisar nada que la
  persona ya haya escrito. Si completó el email, pone el foco en
  `#loginPassMiPlan` (asume cuenta existente, pestaña de login activa
  por defecto).
- Verificado con Playwright (mock de `netlifyIdentity`; el script real
  de `identity.netlify.com` no es alcanzable desde este entorno, mismo
  criterio que otras sesiones): los 3 casos del paso 1 (sin sesión, con
  sesión completa, con sesión solo-email) y el prellenado de "Mi plan"
  con y sin `sinaptix_objetivo` guardado, más el caso de no pisar un
  valor ya tipeado. Ver detalle en `memoria.md`.
- Suite de unit tests sin cambios (46/46 ok) — este patch no toca
  `js/nutricion-planes.js`.

## 2026-09-16 (segunda tanda) — Validación de respuestas irracionales en la encuesta de nutrición

A pedido del usuario ("que no se puedan poder respuestas irracionales"),
después de acordar el plan (`plan-validacion-encuesta-nutricion.md`,
entregado al usuario) y el rango de edad (14–120, ajustado tras el
comentario del usuario de que hay gente real con más de 110 años — el
primer borrador tenía tope 90).

- **`js/nutricion-planes.js`**: nuevo bloque `NUTRI_RANGOS` (edad
  14–120, peso 30–250 kg, talla 100–230 cm, pantallas 0–18 h) +
  `nutriValidarRango(campo, valor)`, `nutriValidarNombre(valor)` y
  `nutriEscaparHTML(texto)`. Se aplica el escape a `alergiaOtra` y
  `disgustos` dentro de `nutriConstruirAjustes` (ver más abajo, punto de
  seguridad). Las 4 funciones/constante nuevas se agregan al
  `module.exports` para tests.
- **Hallazgo al implementar**: `js/script.js` (`#formAntro`) y
  `nutriGuardarAntropometriaSiFalta` (`js/nutricion-planes.js`) **ya**
  tenían su propia validación de peso/talla/edad, pero con números
  distintos y más laxos que los que se estaban por agregar al wizard
  (peso hasta 400, talla hasta 250, edad sin mínimo) — es decir, antes
  de este patch ya existía una inconsistencia entre "cuánta gente
  irracional" dejaba pasar cada formulario. Los tres puntos ahora usan
  `nutriValidarRango` como única fuente de rangos.
- **`index.html` / `mi-plan.html`** (idéntico en ambos, tienen su propia
  copia del wizard): `min`/`max` en los 4 `<input type="number">`
  libres del wizard (`nutriEdad`, `nutriPeso`, `nutriTalla`,
  `nutriPantallas`); `minlength="2" maxlength="60"
  pattern=".*[A-Za-zÀ-ÿ].*"` en `nutriNombre`; `maxlength="80"`/`"200"`
  en `nutriAlergiaOtra`/`nutriDisgustos`.
- **`index.html`** además: `min`/`max` en `antroPeso`/`antroTalla`/`antroEdad`
  (modal de antropometría, no existe en `mi-plan.html`).
- **`js/nutricion-wizard.js`**: `nutriValidateStep()` ahora distingue,
  vía `invalid.validity` (`rangeUnderflow`/`rangeOverflow`/
  `patternMismatch`/`tooShort`), el mensaje de "valor fuera de rango" o
  "nombre inválido" del genérico "completá los campos obligatorios" que
  usaba para cualquier `:invalid` — no hizo falta agregar la validación
  en sí ahí, los atributos HTML5 nuevos ya la disparan a través del
  mismo `:invalid` que ya usaba esta función para `required`. También
  se agregó el listener de "Prefiero no decir" (grupo `nutriCondicion`,
  paso 5): tildar esa opción destilda las demás y viceversa.
- **`js/script.js`**: `#formAntro` pasa de tener sus 3 chequeos de rango
  hardcodeados a llamar `nutriValidarRango('peso'|'talla'|'edad', …)`.
- **Seguridad, no solo "irracional"**: `nutriAlergiaOtra` y
  `nutriDisgustos` se concatenaban sin escapar en
  `nutriConstruirAjustes`, y esas strings terminan con `innerHTML` en
  `nutriBuildResumenHTML` (wizard paso 8 y "Mi plan") — alguien podía
  escribir una etiqueta con un atributo de evento ahí y que se
  ejecutara. Fix: `nutriEscaparHTML` aplicado en el único punto donde
  ese texto entra al HTML del resumen.
- **`tests/nutricion-planes.test.js`**: 16 casos nuevos (rangos
  válidos/inválidos con límites inclusive, vacío-no-es-irracional,
  no-numérico, campo sin rango definido, nombre válido/vacío/corto/
  solo-números, escape de `<img onerror>` y de `<script>`, y que
  `nutriConstruirAjustes` efectivamente escape antes de concatenar).
  Suite completa: 46/46 ok (`npm test`).
- Verificado a mano (sin Playwright, mismo motivo que el patch
  anterior): revisión de código, `node --check` en los 3 archivos JS
  tocados, y `npm test` en verde.
- **Fuera de esta pasada** (ver el plan entregado, sección 5): el
  formulario de contacto (mismo problema, no tocado) y validación
  cruzada de IMC imposible con peso/talla individualmente válidos (no
  se bloquea, para no rechazar casos reales atípicos).

## 2026-09-16 — Wizard de nutrición: auto-scroll al mensaje final + botón "Iniciar sesión"

A pedido del usuario: ya con el patch del botón real de "Iniciar sesión"
aplicado y verificado que el botón funciona, seguía sin verlo al usar el
sitio — el modal quedaba scrolleado y el mensaje + el botón quedaban por
debajo de lo visible, sin ninguna pista de que había que bajar.

- **Causa**: `.modal-card` es su propio contenedor con scroll
  (`max-height:88vh;overflow:auto` en `css/styles.css`); con todos los
  avisos nutricionales del último paso del wizard, `#nutriResultado` +
  `#nutriLoginBtn` quedan fuera del viewport inicial del modal.
- **`js/script.js`** (handler de submit, rama sin sesión iniciada):
  después de mostrar el botón (`loginBtn.classList.remove('hidden')`),
  se agrega `modalCard.scrollTo({top: modalCard.scrollHeight, behavior:
  'smooth'})` dentro de un `requestAnimationFrame`, sobre
  `document.querySelector('#modalNutricion .modal-card')`. El
  `requestAnimationFrame` espera a que el botón ya esté pintado como
  visible antes de medir `scrollHeight`, para que el scroll llegue
  hasta el fondo real (con el botón ya contando en la altura).
- No se tocó la rama con sesión iniciada (redirige sola a "Mi plan" a
  los 900ms, no hace falta scrollear).
- Sin cambios en `index.html` ni `css/styles.css`.
- **No verificado con Playwright en esta sesión**: no hay acceso de red
  a los dominios de descarga del browser de Playwright desde este
  entorno de trabajo. Se revisó a mano (lectura de la lógica) y con
  `node --check js/script.js` (sintaxis). Falta confirmación visual del
  scroll real — anotado en "Pendientes conocidos" de `memoria.md`.

## 2026-09-15 (veintiseisava tanda) — Botón "Iniciar sesión" del wizard: de btn-solid estirado a btn-ghost de tamaño natural

A pedido del usuario, con captura mostrando el botón agregado en la
tanda anterior estirado a todo el ancho del modal, en el mismo morado
sólido que "Guardar mi plan" — "se ve feo".

- **Causa**: `#nutriLoginBtn` cuelga directo de `.modal-form`
  (`display:flex;flex-direction:column`, sin `align-items` propio →
  default `stretch`). "Atrás"/"Guardar mi plan" no sufren esto porque
  viven dentro de `.nutri-nav` (fila flex aparte, con
  `.btn{flex:none}`); `#nutriLoginBtn` es hijo directo del form y
  heredaba el stretch del eje cruzado (ancho).
- **`css/styles.css`**: nueva clase `.nutri-login-btn{align-self:flex-start;
  margin-top:10px;padding:11px 24px;font-size:13.5px}`, agregada junto a
  `.modal-result`.
- **`index.html`**: `#nutriLoginBtn` pasa de `btn btn-solid` a `btn
  btn-ghost nutri-login-btn` (se saca también el `style="margin-top:10px"`
  inline, ahora lo da la clase).
- Sin cambios en `js/script.js` ni `js/nutricion-wizard.js` — el
  toggle de `hidden` sigue igual, solo cambió el estilo.
- Verificado con Playwright: botón de tamaño natural, alineado a la
  izquierda, estilo outline (ghost), desktop 1440px y mobile 390px.
- **Actualiza `memoria.md`**: se reescribió la entrada del botón de login
  del wizard (agregada en la tanda anterior) para reflejar el diseño
  final — no se agregó una entrada nueva separada porque es el mismo
  punto de "estado actual", solo corregido antes de llegar a producción.

## 2026-09-15 (veinticincoava tanda) — Wizard de nutrición: botón real de "Iniciar sesión" en vez del widget nativo automático

A pedido del usuario, con captura del deploy real (`index.html`, último
paso del wizard "Creamos tu plan de neuroalimentación"): sin sesión
iniciada, el mensaje final invitaba a iniciar sesión pero no había
ningún botón visible para hacerlo.

- **Causa**: el handler de submit del wizard (`js/script.js`) confiaba
  en `setTimeout(() => netlifyIdentity.open('login'), 900)` — abre el
  **widget nativo** de Netlify Identity automáticamente. Esto quedó
  desactualizado frente al resto del sitio, que ya reemplazó ese widget
  por pantallas propias de login/registro (`mi-plan.html`,
  `.miplan-locked-card`) — el header (`#btnLogin`/`#btnAcceder`) ya
  apunta ahí, no al widget. En el deploy real tampoco se veía ningún
  botón en este paso.
- **`index.html`**: se agregó `<a href="mi-plan.html" class="btn
  btn-solid hidden" id="nutriLoginBtn">Iniciar sesión</a>` debajo de
  `#nutriResultado` (mismo destino que el resto de los accesos de login
  del sitio).
- **`js/script.js`**: en la rama "sin sesión" del submit del wizard, se
  sacó el `setTimeout`/`netlifyIdentity.open('login')` y se reemplazó por
  `nutriLoginBtn.classList.remove('hidden')` — el botón queda visible en
  vez de depender de un popup automático. La rama "con sesión" no
  cambió.
- **`js/nutricion-wizard.js`** (`resetNutriWizard()`): se agregó
  `nutriLoginBtn.classList.add('hidden')`, junto al reseteo existente de
  `#nutriResultado`, para que el botón no quede visible de una vuelta
  anterior del wizard al volver a abrirlo.
- Verificado con Playwright (mock del DOM del último paso, sin depender
  del widget real de Netlify Identity — no alcanzable desde este
  entorno): botón visible con el estilo `.btn-solid` esperado, desktop
  1440px y mobile 390px.
- **Actualiza `memoria.md`**: entrada agregada a continuación del punto
  del placeholder de Antropometría en "Estado actual del diseño".

## 2026-09-15 (veinticuatroava tanda) — Antropometría: "—" placeholder igualado al de Objetivo cognitivo

A pedido del usuario, con captura del dashboard "Mi plan" en estado sin
datos: la tarjeta verde de Antropometría se veía "despareja" contra la
dorada de Objetivo cognitivo — el "—" y el texto de abajo quedaban en
distinta posición vertical.

- **Causa**: `.stat-box .num` (36px) es el tamaño por defecto, pensado
  para el IMC real de Antropometría (un número corto); Objetivo
  cognitivo lo overridea a 22px inline porque necesita lugar para un
  objetivo largo sin desbordar (`css/styles.css`/`mi-plan.html`, ya
  documentado). Antes de cargar cualquier dato, ambas tarjetas muestran
  el mismo placeholder "—" — pero seguía saliendo a 36px en Antropometría
  y 22px en Objetivo cognitivo, así que el placeholder en sí se veía más
  grande y corría el resto del contenido hacia abajo en la tarjeta verde.
- **`mi-plan.html`**: `<div class="num" id="miPlanImc">—</div>` pasa a
  `<div class="num is-placeholder" id="miPlanImc">—</div>`.
- **`css/styles.css`**: nueva regla `.stat-box.miplan-card
  .num.is-placeholder{font-size:22px}`, junto al resto de las reglas de
  `.miplan-card`/`.miplan-grid`, con comentario explicando por qué el
  placeholder se iguala pero el valor real no.
- **`js/mi-plan.js`** (`pintarMiPlan()`): al pintar el IMC real se agrega
  `imcEl.classList.remove('is-placeholder')`, así el número real vuelve
  a 36px (protagonismo, como antes) — solo el placeholder se iguala a
  22px, no cualquier valor.
- Verificado con Playwright (servidor estático local, sin credenciales
  de Netlify — mismo enfoque de sesiones anteriores): estado sin datos
  en desktop 1440px y mobile 390px (ambos "—" al mismo tamaño y altura,
  botones siguen anclados al fondo, sin romper lo del punto anterior) y
  estado con IMC cargado, simulando el DOM ya pintado, para confirmar
  que el número real vuelve a 36px y que Objetivo cognitivo no cambió.
- **Actualiza `memoria.md`**: entrada agregada a continuación del punto
  "Botón de 'Datos clave' desnivelado..." en "Estado actual del diseño".

## 2026-09-15 (veintitresava tanda) — Tests unitarios para netlify/functions/plan.mjs (Prioridad 2 de plan-tests-sinaptix.md)

A pedido del usuario ("continuemos con la prioridad 2"): segunda tanda
de tests, siguiendo `plan-tests-sinaptix.md` (Prioridad 2, opcional).
`plan.mjs` no se testea completo (depende de `getUser()`/`getDatabase()`,
solo verificables contra un deploy real), pero la validación del campo
`tipo` era una función pura aislable.

- **`netlify/functions/plan-validacion.mjs`** (archivo nuevo): se movió
  acá `TIPOS_VALIDOS` (antes declarada inline en `plan.mjs`) y se agregó
  `esTipoValido(tipo)` (`TIPOS_VALIDOS.includes(tipo)` envuelto en
  función, ambos exportados). Sin ningún import de `@netlify/identity` ni
  `@netlify/database` a propósito: esos paquetes están en
  `package.json` para que Netlify los instale en el deploy, pero no hay
  `node_modules` en este entorno de trabajo, así que si el test
  importara `plan.mjs` directo (que sí los importa a nivel de módulo)
  fallaría con `ERR_MODULE_NOT_FOUND` aunque lo único que quisiera
  testear fuera la validación — separarla en su propio módulo sin esas
  dependencias evita el problema.
- **`netlify/functions/plan.mjs`**: reemplaza la declaración inline de
  `TIPOS_VALIDOS` por `import { TIPOS_VALIDOS, esTipoValido } from
  './plan-validacion.mjs'`, y el check del POST pasa de
  `TIPOS_VALIDOS.includes(tipo)` a `esTipoValido(tipo)`. Sin cambios de
  comportamiento: mismo mensaje de error, mismo status 400, GET/POST y
  el resto del handler intactos.
- **`tests/plan-validacion.test.mjs`** (archivo nuevo): 5 tests con
  `node --test`, en formato ESM (`.mjs`, con `import`/`export` —
  a diferencia de `tests/nutricion-planes.test.js` que es CommonJS,
  porque `plan-validacion.mjs` sí usa `export`). Cubre: los 3 valores de
  `TIPOS_VALIDOS` dan `true`; un string inválido (incluida una variante
  con mayúscula, para confirmar que no matchea case-insensitive), vacío,
  `undefined` y `null` dan `false`. No requiere ningún mock. Se corrió
  junto con la suite completa (`npm test`) para confirmar que los 30
  tests de la tanda anterior siguen pasando: **35/35 OK**.
- **Actualiza `memoria.md`**: sección "Tests" — se agregó el bloque
  "Prioridad 2" (qué se extrajo, por qué en un módulo aparte, qué cubre
  el test) y se sacó la nota de "Prioridad 2 todavía no implementada".
  No se archivó nada (la sección sigue corta).
- No se generó Patch para `plan-tests-sinaptix.md` en sí — es un
  documento de planificación entregado aparte, no vive en el repo (así
  lo pide el propio plan, sección "Cómo se entrega").

## 2026-09-15 (veintidosava tanda) — Tests unitarios para js/nutricion-planes.js (Prioridad 1 de plan-tests-sinaptix.md)

A pedido del usuario ("oye para este tipo de web se necesita test?" →
"arma el plan para los test" → "arranca con la prioridad 1"): primera
tanda de tests automatizados del repo. Se armó primero un documento de
plan (`plan-tests-sinaptix.md`, entregado como archivo aparte al
usuario, no vive en el repo) priorizando `js/nutricion-planes.js` (cálculo
puro, alto impacto si falla, barato de testear) por sobre
`netlify/functions/plan.mjs` (depende de servicios externos, más caro de
mockear) y por sobre el diseño/layout (cambia cada sesión, se sigue
verificando con Playwright ad hoc, no con una suite fija). Esta tanda
implementa la Prioridad 1 completa del plan.

- **`js/nutricion-planes.js`**: se agregó al final un bloque
  `if(typeof module !== 'undefined' && module.exports){ module.exports =
  {...} }` que exporta 9 funciones de cálculo puro
  (`nutriResolverObjetivo`, `nutriConstruirAjustes`,
  `nutriConstruirAvisos`, `nutriGuardarAntropometriaSiFalta`,
  `imcCategoria`, `imcGaugeAngulo`, `gaugeComputeAreas`,
  `gaugeColorForPercent`, `gaugeDeltaHtml`). No exporta `NUTRI_PLANES` ni
  las funciones que arman HTML (`nutriBuildResumenHTML`,
  `nutriBuildBarChartHTML`) — quedan fuera de esta tanda a propósito, ver
  plan. El bloque es un no-op en el navegador: `index.html`/`mi-plan.html`
  cargan este archivo como `<script>` plano, donde `module` no existe.
- **`tests/nutricion-planes.test.js`** (archivo nuevo): 30 tests con
  `node --test` (nativo de Node desde la v18, estable desde la v20 — el
  repo ya fija `NODE_VERSION = "20"` en `netlify.toml`, así que no hace
  falta ninguna dependencia nueva). Cubre, por función: valores límite de
  cada rango de IMC (`imcCategoria`: 18.49/18.5, 24.99/25, 29.99/30),
  mínimo/máximo/recorte del medidor (`imcGaugeAngulo`), resolución de
  objetivo por escala más alta y el caso de empate entre 2 escalas
  (`nutriResolverObjetivo`), cada rama de ajuste individual y su
  combinación (`nutriConstruirAjustes`), cada aviso individual **y** los
  2 avisos combinados que solo disparan con 2 condiciones a la vez —
  sueño malo + estrés alto, estrés + fatiga altos — verificando también
  que NO disparen con una sola de las dos (`nutriConstruirAvisos`),
  inversión de escala y default sin datos (`gaugeComputeAreas`), los 3
  colores exactos de la interpolación y el recorte fuera de 0-100
  (`gaugeColorForPercent`), los 3 casos de delta — positivo/negativo/cero
  — más el caso sin "después" (`gaugeDeltaHtml`), y los 3 casos de
  `nutriGuardarAntropometriaSiFalta` (no pisa dato existente, rechaza
  datos fuera de rango, guarda y calcula bien el IMC con datos válidos).
  `localStorage` se mockea con un objeto in-memory simple
  (`crearLocalStorageMock()`) asignado a `global.localStorage` antes de
  requerir el módulo bajo test, porque `nutriGuardarAntropometriaSiFalta`
  lo usa como variable global (pensado para el navegador).
- **`package.json`**: se agregó `"scripts": {"test": "node --test"}`. Se
  probó primero con `"node --test tests/"` (con la ruta como argumento) y
  falló con `MODULE_NOT_FOUND` — Node intenta *requerir* `tests/` como si
  fuera un módulo en vez de explorarlo como carpeta cuando se le pasa un
  path posicional. Sin argumentos, `node --test` descubre solo los
  archivos `*.test.js` bajo `tests/` (comportamiento default del test
  runner desde Node 18.9), así que quedó `"node --test"` a secas.
- **Actualiza `memoria.md`**: sección "Tests" nueva (después de
  "Estructura de archivos"), documentando qué cubre, cómo correrlos, por
  qué no rompe el navegador, y qué queda deliberadamente afuera
  (`plan.mjs`, diseño/layout).

Verificado corriendo `npm test` localmente: 30/30 tests pasan, exit code
0. No se tocó ningún archivo del sitio en sí (`index.html`, `css/`,
`js/script.js`, etc.) — este patch es 100% infraestructura de testing,
sin cambios de comportamiento visible para quien visita el sitio.

## 2026-09-15 (veintiunava tanda) — Método (lam-03): interruptor "Mi progreso"/"Mi IMC" al lado del botón de acción, y botón "Actualizar" sin texto largo

A pedido del usuario: "el interruptor lo podemos poner alado del boton de
actualizar mi estado otra vez?" + "el boton solo ponle actualizar". El
interruptor (`.gauges-switch`, tabs "Mi progreso"/"Mi IMC") vivía arriba de
todo en `.method-gauges`, como una fila propia antes del contenido de cada
pestaña. Se movió a un footer nuevo al final de la tarjeta, en la misma
fila que el botón de acción de la pestaña activa:

- **`index.html`**: dentro de `<aside id="methodGauges">`, el orden pasa a
  ser: `#methodGaugesProgreso`, `#methodGaugesImc` (los 2 paneles, igual
  que antes) y después un `<div class="gauges-footer">` nuevo que agrupa
  `#gaugesSwitch` (mismo markup de siempre, solo que ahora al final) más 2
  `<span class="gauges-footer-cta">` vacíos: `#gaugesFooterCtaProgreso` y
  `#gaugesFooterCtaImc` (este último arranca con `.hidden`, igual que su
  panel).
- **`css/styles.css`**: `.gauges-switch` pierde el `margin-bottom:18px`
  que tenía para separarse del contenido de abajo (ya no le hace falta,
  ahora es el último elemento de la tarjeta salvo el CTA). Regla nueva
  `.gauges-footer{display:flex;align-items:center;flex-wrap:wrap;
  gap:10px;margin-top:18px}` y `.gauges-footer-cta{display:contents}` —
  el `display:contents` hace que el `<button>` que cada slot recibe por
  `innerHTML` se comporte como un ítem flex más del footer (no como un
  hijo de un contenedor aparte), así queda realmente al lado del
  interruptor y no en una fila propia. `.hidden{display:none!important}`
  (regla global ya existente) alcanza para ocultar el slot que no
  corresponde a la pestaña activa, sin regla adicional.
- **`js/script.js`**:
  - `renderMethodGauges()`: el botón ("Generar mi diagnóstico" en el
    estado sin diagnóstico, o el de reevaluación en el estado con datos)
    deja de ir dentro del `innerHTML` de `#methodGaugesProgreso` y pasa a
    `document.getElementById('gaugesFooterCtaProgreso').innerHTML`. El
    texto del botón de reevaluación (`id="btnReevaluar"`) se simplificó:
    antes alternaba entre "Actualizar mi estado" (primera vez) y
    "Actualizar mi estado otra vez" (si ya había una reevaluación previa
    guardada); ahora dice siempre **"Actualizar"** en los dos casos, a
    pedido del usuario.
  - `renderMethodImc()`: mismo patrón — el botón "Registrar datos
    antropométricos" (estado sin datos de peso/talla) pasa a
    `#gaugesFooterCtaImc`; en el estado con datos no hay botón, así que
    ese slot queda vacío (`ctaImcEl.innerHTML = ''`).
  - `setGaugesView(view)`: además de togglear `.hidden` en los 2 paneles
    y `.is-active`/`aria-selected` en los 2 tabs (sin cambios ahí), ahora
    también togglea `.hidden` en `#gaugesFooterCtaProgreso`/
    `#gaugesFooterCtaImc` en el mismo `if`, para que el slot de CTA se
    esconda/muestre junto con su panel.
  - Los 3 listeners de click sobre botones generados dinámicamente
    (`#btnGaugeDiagnostico`, `#btnReevaluar`, `#btnGaugeAntro`) vivían
    repartidos en 2 delegaciones distintas: una sobre `#methodGauges`
    (los primeros 2) y otra sobre `#methodGaugesImc` (el tercero, porque
    antes vivía dentro de ese panel). Como los 3 botones ahora salen de
    los mismos 2 contenedores fijos del footer (que son hijos de
    `#methodGauges`), la delegación se unificó en una sola, sobre
    `#methodGauges` — se borró el listener separado sobre
    `#methodGaugesImc`.

Verificado con Playwright (mock de `localStorage`, sin backend real): los
4 cruces de estado — sin datos/con datos × pestaña Mi progreso/Mi IMC — en
desktop 1440px y mobile 390px. En los 3 casos donde hay botón (sin
diagnóstico, con diagnóstico+reevaluación, sin datos antropométricos)
queda al lado del interruptor en la misma fila (en mobile 390px no entran
juntos y el `flex-wrap` los pasa a 2 líneas, sin romper nada). En el único
caso sin botón (Mi IMC con datos ya cargados) el interruptor queda solo,
sin hueco vacío al lado. No se tocó `mi-plan.html` ni ninguna otra
sección: `.gauges-switch`/`.gauges-footer`/`#methodGauges` son exclusivos
de `#lam-03` en `index.html`.

## 2026-09-15 (veinteava tanda) — Método (lam-03): pestaña "Mi IMC" con la misma jerarquía que "Mi progreso"

A pedido del usuario: "esta parte de imc se ve como simple, no resalta,
puede mejorarla asi como hiciste con otro grafico de anillos?" — refiriéndose
al rediseño de "Mi progreso" de la dieciochoava tanda. `renderMethodImc()`
(`js/script.js`) suma 3 piezas nuevas, mismo lenguaje visual que
`renderMethodGauges()`:

- **Frase de insight** (`methodImcInsightHtml(zona)`, función nueva):
  mensaje fijo por zona de IMC, mismo `.gauge-insight` (ícono lightbulb +
  texto) que ya existía. No hay comparación antes/después para IMC (a
  diferencia de foco/memoria/energía/calma), así que el texto es estático
  por zona, no calculado:
  - bajo: "Tu IMC está en zona de bajo peso — sumar calorías de calidad
    puede ayudar a sostener tu energía mental durante el día."
  - saludable: "Tu IMC está en rango saludable — buen punto de partida
    para sostener tu rendimiento cognitivo."
  - sobrepeso: "Tu IMC está en sobrepeso — un plan de neuroalimentación
    puede ayudarte a acercarlo al rango saludable."
  - vigilar: "Tu IMC está en un rango a vigilar — vale la pena
    acompañarlo con seguimiento profesional además del plan de
    nutrición."
- **Zona destacada con borde propio** (`.method-imc-featured`, clase
  nueva en `css/styles.css`, escopada bajo `#methodGaugesImc` para no
  afectar `mi-plan.html`): agrupa medidor + número + label + categoría en
  una tarjeta con `border:1.5px solid var(--purple-dark);border-
  radius:12px;padding:20px 16px 18px`, mismo tratamiento visual que
  `.gauge-item.is-featured` de la pestaña de al lado. La categoría deja
  de ser texto plano (`.imc-cat`, que se sigue usando tal cual en
  `mi-plan.html`) y pasa a un badge: `<span class="gauge-tier-badge
  imc-tier-{zona}">` — reusa `.gauge-tier-badge` de "Mi progreso" y suma
  4 modificadores de color nuevos (`.imc-tier-bajo`/`.imc-tier-sobrepeso`
  dorado, `.imc-tier-saludable` verde, `.imc-tier-vigilar` rojo — mismos
  `var(--gold)`/`var(--green)`/`var(--red)` que ya coloreaban las zonas
  del arco).
- **Rango de peso saludable** (`.method-imc-range`, párrafo nuevo debajo
  de la tarjeta destacada): "Peso saludable estimado para tu talla:
  **X–Y kg**", calculado en `renderMethodImc()` con IMC 18.5 y 24.9 sobre
  `antro.tallaCm` (`min = 18.5 * talla²`, `max = 24.9 * talla²`, talla en
  metros) — dato derivado del mismo registro de antropometría, no pide
  nada nuevo a la persona. Solo se muestra si `antro.tallaCm` existe.
- **Bug menor corregido de paso**: el `eyebrow` de esta pestaña decía "Tu
  progreso" (copiado del header de la otra pestaña al escribir la
  primera versión) — ahora dice "Antropometría".

**Alcance verificado explícitamente para no afectar `mi-plan.html`**: la
tarjeta "Antropometría" de "Mi plan" reusa `.imc-gauge`/`.imc-cat`/
`.imc-legend` con su propio layout (`.stat-box`) — esas reglas de base no
se tocaron. Las clases nuevas de esta tanda (`.method-imc-featured`,
`.method-imc-range`) están escopadas con el selector `#methodGaugesImc`, y
`.imc-tier-*` son clases que no existen en el markup de `mi-plan.html`
(su badge sigue siendo `.imc-cat`, sin cambios), así que no hay overlap
posible.

Verificado con Playwright, 4 capturas (una por zona, calculando el peso
para mantener la misma talla de 172cm): bajo peso (IMC 16.9), saludable
(22.0), sobrepeso (26.4, el mismo caso de la captura que mandó el
usuario), a vigilar (32.1) — badge, insight y rango coinciden con la zona
en los 4 casos. También el estado vacío (sin `sinaptix_antropometria` en
`localStorage`) sigue mostrando el mismo texto/botón de antes, sin
cambios.

## 2026-09-15 (diecinoveava tanda) — Método (lam-03): botones pegados al final del timeline, no a la fila completa

A pedido del usuario, que mandó una captura del deploy real mostrando el
problema: los botones "Generar nutrición especializada"/"Registrar datos
antropométricos" (`.method-cta`) se ubicaban debajo de toda la fila de
`.method-body` (la grilla de 2 columnas timeline/`.method-gauges`), a la
altura de la columna más alta. Con la tarjeta "Tu progreso" ya crecida
(diagnóstico + reevaluación, los 4 anillos + insight + leyenda — el caso
real de la captura), el timeline quedaba mucho más corto que la tarjeta y
dejaba un hueco vacío entre el paso 04 ("Reevaluación de resultados") y
los botones.

- **`index.html`**: nuevo `<div class="method-left">` envuelve `.timeline`
  y `.method-cta` (antes `.method-cta` era hermano de `.method-body`,
  fuera de la grilla). `.method-left` pasa a ser el primer hijo/columna de
  `.method-body`, `.method-gauges` sigue siendo el segundo. Ningún `id` se
  tocó.
- **`css/styles.css`**: `.method-left{display:flex;flex-direction:column}`
  (nueva regla) — con eso los botones se apilan justo debajo del timeline
  por flujo normal, en vez de depender de cómo el grid reparte la altura
  entre columnas. `.method-body` y `.timeline` sin cambios de layout más
  allá de que ahora `.timeline` no es hijo directo de `.method-body` sino
  de `.method-left` (su regla `position:relative` sigue igual). `.method-
  cta` y `.method-gauges` sin cambios de CSS.
- No se tocó `js/script.js`: los listeners de `#btnNutricion` y
  `#btnAntropometria` usan `getElementById`, no dependen de la jerarquía
  del DOM.

Verificado con Playwright, reproduciendo el mismo estado de la captura del
usuario (`sinaptix_objetivo` + `sinaptix_reevaluacion` seedeados en
`localStorage` para que la tarjeta muestre los 4 anillos con datos, no el
estado vacío "Generar mi diagnóstico"): desktop 1600px (botones pegados al
timeline, tarjeta de la derecha crece libre sin dejar hueco a la
izquierda) y mobile 390px (orden visual timeline → botones → tarjeta de
progreso, sin cambios respecto a antes del fix).

## 2026-09-15 (dieciochoava tanda) — Método (lam-03): rediseño de la tarjeta "Tu progreso" con jerarquía

A pedido del usuario, que mostró capturas de la tarjeta real (`.method-
gauges`, "Foco, memoria, energía y calma") y dijo que "no resalta, no
convence": los 4 anillos idénticos sin jerarquía se reemplazan por una
tarjeta con lectura guiada. Cambios en `js/script.js` (todo dentro de la
sección "Anillos de progreso (Método)", no toca `nutricion-planes.js` ni
el gráfico de barras de "Mi plan", que siguen usando `gaugeColorForPercent`
/`GAUGE_LOW`/`MID`/`HIGH`/`gaugeDeltaHtml` sin cambios):

- **Frase de insight arriba** (`methodInsightHtml`): con reevaluación,
  celebra el área de mayor avance ("Tu mayor avance: memoria pasó de 60%
  a 100% (+40 pts)") y señala la que sigue floja; sin reevaluación
  (primera visita), señala directamente el área con más margen de mejora.
- **Área destacada** (`gaugeBuildItem(area, featured=true)`): la de peor
  valor actual (`despuesPct` si existe, si no `antesPct`) se muestra
  aparte, en fila, anillo más grande, con borde propio (`.is-featured`,
  `border:1.5px solid var(--purple-dark)`) y un badge de nivel
  (`methodTierLabel`: "Necesita atención" / "En progreso" / "Sólido").
  Las otras 3 quedan en una grilla de 3 columnas (antes eran 4 en 2x2).
- **Ícono lineal por área** (`methodGaugeIcon`: diana=Foco, pulso=Memoria,
  rayo=Energía, luna=Calma) — mismo estilo que el resto del sitio
  (`viewBox 24`, `stroke currentColor` 1.5, sin relleno).
- **Delta como badge con flecha** (`methodDeltaBadge`) en vez del texto
  gris 11px de antes: flecha arriba/verde si mejoró, abajo/rojo si
  empeoró, "sin cambios" en gris si igual.
- **Paleta propia de esta tarjeta** (`methodGaugeColorForPercent`,
  `METHOD_GAUGE_LOW/MID/HIGH` = morado oscuro `#4B2E45` → dorado
  `#C1703B` → verde salvia apagado `#6B8F71`) en vez del semáforo rojo/
  dorado/verde genérico (`GAUGE_LOW/MID/HIGH` de `nutricion-planes.js`,
  que se dejó intacto porque lo sigue usando "Mi plan").
- CSS nuevo en `css/styles.css`: `.gauge-insight`, `.gauge-item.is-
  featured`, `.gauge-item-meta`, `.gauge-item-label`, `.gauge-icon`,
  `.gauge-tier-badge`, `.gauge-item-antes`, `.gauge-delta-badge` (+
  variantes `.is-up`/`.is-down`/`.is-flat`), `.gauge-grid` pasó de
  `repeat(2,1fr)` a `repeat(3,1fr)` (2 columnas debajo de 480px).
- Bug encontrado y corregido durante la verificación: `.gauge-item svg`
  (regla vieja, pensada solo para el anillo) le ganaba por especificidad
  a `.gauge-icon` y estiraba los íconos nuevos a ~90px. Se renombró a
  `.gauge-ring svg`, scopeado al wrapper del anillo únicamente.
- Verificado con Playwright inyectando `sinaptix_objetivo`/
  `sinaptix_reevaluacion` en `localStorage`: estado con reevaluación,
  estado sin reevaluación (primera visita, sin deltas), mobile 390px
  (cae a grilla de 2 columnas y la destacada se apila en columna), y que
  la pestaña "Mi IMC" sigue intacta (no se tocó `renderMethodImc`).

## 2026-09-15 (diecisieteava tanda) — Método (lam-03): frutas pequeñas + rayas del título en dorado

A pedido del usuario: (1) se agregaron 3 `<img class="deco deco-fruit">`
pequeñas (`fruta-fresa.webp` 48px arriba a la derecha, `fruta-arandanos.webp`
54px a la izquierda entre los ítems 02/03 de la línea de tiempo, y
`fruta-cereza.webp` 42px abajo a la izquierda, debajo del ítem 04) usando
los assets ya existentes en `img/imagenes-frutas/` — mismo patrón que las
decos existentes de la sección (`.deco`, z-index 0, detrás del contenido,
animación `float` heredada de `.deco-fruit`, oculto en mobile por la regla
general `@media(max-width:720px){.deco-fruit{display:none}}`). (2) Se
recolorearon las 2 rayas naranjas del título ("Un método en cuatro fases,
no una dieta **genérica**") de `#EDA23A` a `--gold` (`#C1703B`) para que
combinen con la paleta morado/dorado del sitio en vez del naranja genérico
del asset compartido: se creó `svg/deco-scribble-gold.svg` (copia de
`deco-scribble.svg` con el `stroke` cambiado) y se referenció solo desde
`#lam-03` — el `<img class="title-scribble">` del `<h2>` apunta directo al
nuevo archivo, y el subrayado de "genérica" (`.title-mark`, que es
`background-image` en el `<span>`) se sobreescribe con una regla
`#lam-03 .title-mark{background-image:url(...)}` agregada después del
bloque compartido `#lam-03 .title-mark, #lam-04 .title-mark{...}` (mismo
peso de especificidad, gana por orden de declaración). Cambio scopeado
100% a `#lam-03`: se verificó con Playwright que Pilares (`#lam-04`), que
reutiliza el mismo asset `deco-scribble.svg` para sus propios 3 trazos,
sigue con el naranja original sin cambios. El usuario había mencionado
"3 rayas" pero en el código actual de `#lam-03` solo existen 2 (el
subrayado y la línea curva bajo el título); se le mostró una captura y
confirmó que eran esas 2 las que quería recolorear.

## 2026-09-15 (dieciseisava tanda) — Método (lam-03): vuelta al morado estándar del sitio

A pedido del usuario ("el fondo de la sección 3 hace que sea color
morado, el que ya manejamos... ya déjalo igual al difuminado que ya
tiene"): se descartó la paleta café/crema propia de `#lam-03` (mockup de
referencia que se había usado en una sesión anterior) y la sección vuelve
a usar el morado/lila estándar del sitio (`--panel`, `--purple`, etc.
definidos en `:root`), el mismo que ya usan Beneficios y Contacto. Se
logró simplemente borrando las custom properties que `#lam-03`
sobreescribía (`--panel`, `--panel-line`, `--panel-text`, `--purple`,
`--purple-dark`, `--purple-soft`, `--gauge-card`, `--shadow`): al no
redefinirlas ahí, todo lo que dependía de ellas (fondo, texto,
línea/números de la línea de tiempo, tarjeta "Mi progreso"/"Mi IMC",
botones `.btn-solid`/`.btn-ghost` de la sección) cae solo al valor de
`:root`, sin tocar ninguna otra regla. El difuminado de fondo (gradiente
que arranca en `--paper` blanco, funde a `--panel` a los ~200px y vuelve
a fundir a `--paper` en los últimos ~200px, para no cortar en seco contra
el blanco de lam-02/lam-04) se mantuvo intacto tal cual pidió el usuario
— solo cambia el color al que funde, de crema a morado/lila. Los colores
semánticos de los medidores (gauge rojo/dorado/verde) no se tocaron.
Verificado con Playwright (`file://` local, el servidor HTTP interno no
es alcanzable desde el navegador en este entorno): desktop 1440px, la
sección Método se ve con el mismo tono lila que Beneficios/Contacto y el
difuminado sigue sin costura visible contra las secciones blancas
vecinas.

## 2026-09-15 (quinceava tanda) — Método (lam-03): nueva ilustración de neurona en los 2 decorativos laterales

A pedido del usuario, que subió una imagen (neurona completa vista de
frente, generada con IA, fondo blanco): se reemplazó el contenido de
`img/decoraciones-neurona/neurona-izquierda.webp` y
`neurona-derecha.webp` (mismos nombres de archivo, no se tocó
`index.html` ni el `style` inline de posición/tamaño de los `<img
class="deco deco-fruit">` que los usan en `#lam-03`). Los assets
anteriores eran medias neuronas recortadas (pensadas para sangrar en el
borde); la imagen nueva es la neurona completa, así que ahora se ve
entera en la esquina en vez de solo la mitad — el usuario pidió
explícitamente mantener la misma posición, no recortarla de nuevo. Se le
quitó el fondo blanco (blanco puro → alpha 0, gradual según cercanía al
blanco para conservar el degradé del resplandor central) para que siga
flotando sobre el crema de la sección, y se reexportó a `.webp` (~640px
de ancho, calidad 82, ambos archivos con el mismo contenido, sin
espejar). Verificado con Playwright: desktop 1440px (la neurona nueva se
ve completa en las 2 esquinas, mismo lugar que antes) y mobile 390px
(sigue oculta, sin cambios en esa regla).

## 2026-09-15 (catorceava tanda) — Visión (lam-02): borde morado fino en las 4 tarjetas y párrafo más grande

A pedido del usuario (mandó captura de la sección Visión): las 4
tarjetas del `stat-grid` (`#lam-02 .stat-box`, incluida la destacada
`.is-featured`) tenían `border-color` en blanco translúcido
(`rgba(255,255,255,.7)`), casi invisible sobre el fondo claro de la
sección — solo se notaba en la tarjeta "1:1" porque ahí había ilustración
oscura detrás. Se cambió a `border:1px solid var(--purple)` para que las
4 queden delimitadas siempre, tengan o no arte detrás. Además, el párrafo
debajo del número (`#lam-02 .stat-box .lab`) pasó de `font-size:13px` a
`15px` para que se lea con más facilidad; no se tocó el tamaño del número
(`.num`, sigue en `36px`). Cambio scopeado a `#lam-02` (no afecta las
`.stat-box` de Manifiesto ni de `#miPlan`, que tienen sus propias reglas).

Verificado con Playwright: desktop 1440px y mobile 390px, las 4 tarjetas
con borde morado visible y texto legible, sin desbordes.

## 2026-09-15 (treceava tanda) — Visión (lam-02): título deformado corregido, sin raya naranja, tarjetas a blanco transparente

El usuario mandó captura del deploy real mostrando el título de "Nuestra
visión" roto (el texto envolvía letra por letra en vez de fluir normal,
y "alimenta" quedaba suelto con su raya naranja lejos del resto) y pidió
además que las 4 tarjetas de stats pasaran de fondo morado oscuro con
letras blancas a fondo blanco transparente con letras del morado del
sitio.

**Título roto**: el `<h2 class="lam-title">` tenía
`style="display:flex;align-items:center;gap:14px"` inline para alinear el
ícono decorativo de puntitos al lado de "alimenta". Eso convertía el
texto del título (nodo de texto + el `<span class="title-mark">` +
el `<svg>`) en 3 flex-items en una sola fila sin wrap: el texto se
achicaba mucho para hacerle lugar al resto, y como la tipografía
manuscrita es grande, terminaba envolviendo cada palabra en su propia
línea — exactamente lo que se ve en la captura. Fix: se saca el
`display:flex` del `<h2>` (vuelve a ser texto normal, fluye y envuelve
como cualquier título) y el `<svg>` de puntitos pasa a
`display:inline-block;vertical-align:middle;margin-left:10px` (clase
nueva `.lam-title-deco` en `css/styles.css`) para seguir viéndose pegado
a "alimenta" sin flexbox.

**Raya naranja**: `.title-mark` (compartida por lam-02/03/04/05/06) trae
el subrayado tipo marcador vía `background-image:url(deco-scribble.svg)`.
Se sacó **solo en lam-02** con `#lam-02 .title-mark{background-image:none;
padding-bottom:0}` — el resto de los títulos con `.title-mark` (lam-03 a
lam-06) no se tocaron, siguen con su trazo. El color morado de "alimenta"
se mantiene (viene de `.title-mark{color:var(--purple)}`, no del
background que se sacó).

**Tarjetas de stats (`#lam-02 .stat-box`)**: pasaron de
`background:rgba(75,46,69,.6)` (morado oscuro translúcido) con texto
blanco (`#fff` + `text-shadow` para legibilidad sobre el arte de fondo) a
`background:rgba(255,255,255,.55)` (blanco translúcido) con texto
`var(--purple)` (sin `text-shadow`, ya no hace falta con fondo claro). Se
unificó también `.stat-box.is-featured` (la tarjeta "20%", que antes
quedaba más oscura que las otras 3) a la misma familia blanca
(`rgba(255,255,255,.7)`), así las 4 tarjetas quedan iguales entre sí como
pidió el usuario. El `.lab` usa el mismo morado con `opacity:.82` para
mantener la jerarquía número/descripción sin volver a un gris distinto.
No se tocó el resto del sitio: estos 3 selectores están todos scopeados
con `#lam-02`, así que `.stat-box` fuera de esta sección (resto del
sitio, "Mi plan") sigue con sus reglas propias de siempre.

Verificado con Playwright (forzando `.reveal.in` para saltear la
animación de scroll): desktop 1440px y mobile 390px — título fluye
normal en varias líneas según el ancho disponible, sin raya naranja, y
las 4 tarjetas quedan blancas/transparentes con texto morado, dejando ver
el arte de fondo (cerebro + red neuronal) a través del blur.

## 2026-09-15 (doceava tanda) — Títulos de sección: mismo color combinado que el Hero

El usuario pidió que los títulos de cada sección tuvieran "el color
combinado así como la sección de inicio", dejando el criterio libre. En
el Hero, `.hero h1 em{color:var(--purple)}` combina el `--ink` del resto
del título con `--purple` en la palabra "claridad". El resto de los
`<h2 class="lam-title">` no tenía esa combinación: eran 100% `--ink`,
aunque 4 de los 5 ya usaban `.title-mark` (el span con el subrayado tipo
marcador de `svg/deco-scribble.svg`) sobre una palabra clave.

Cambio: `.title-mark{color:var(--purple)}` en `css/styles.css`. Con una
sola línea, la palabra ya remarcada de cada título (`genérica` en
`#lam-03`, `trabajo` en `#lam-04`, `carga alta` en `#lam-05`, `asesoría`
en `#lam-06`) pasa a combinar tinta oscura + púrpura, igual que el Hero,
sin tocar el marcador dorado (`#EDA23A`) que ya traía cada una — quedan
las dos cosas juntas (color + subrayado), no una en lugar de la otra.

`#lam-02` ("El cerebro también se alimenta") era el único título del
sitio sin ninguna palabra remarcada (tiene un ícono svg inline en vez de
`.title-mark`/`.title-scribble`). Para que las 6 secciones (Hero incluido)
compartan el mismo lenguaje, se envolvió "alimenta" en
`<span class="title-mark">` en `index.html` — hereda el color y el
marcador sin CSS nuevo.

No se tocó `mi-plan.html`: sus 3 `<h2 class="lam-title">` no usan
`.title-mark`, así que no se vieron afectados por el cambio (quedan
100% `--ink`, consistente con cómo estaban).

Verificado con Playwright (servidor estático local, sin backend
involucrado): las 6 secciones (`#lam-01` a `#lam-06`), desktop 1440px y
mobile 390px. Se esperó a que terminara la animación `.reveal` antes de
capturar (los títulos de `#lam-04`/`#lam-05`/`#lam-06` usan
`reveal`/`reveal in` con transición de opacidad al entrar en viewport).

## 2026-09-15 (onceava tanda) — Beneficios y Contacto: se les suma acento visual a los títulos que no tenían nada

El usuario pidió darles impacto a "los títulos que no tienen nada" sin
tocar la tipografía. Se identificaron `#lam-05` ("Pensado para mentes
con carga alta") y `#lam-06` ("Empecemos tu asesoría") como los únicos
`<h2 class="lam-title">` del sitio sin ningún acento (a diferencia de
`#lam-02`, que ya tiene un ícono svg inline, y `#lam-03`/`#lam-04`, que
tienen `.title-mark` + `.title-scribble` centrados).

Se les sumó el mismo lenguaje visual que ya usa el sitio, pero alineado
a la izquierda (no centrado, porque estos títulos no van en
`.sec-head-center`):
- `.title-mark` (subrayado tipo marcador, `background-image` con
  `svg/deco-scribble.svg`) sobre "carga alta" (`lam-05`) y "asesoría"
  (`lam-06`).
- `<img class="title-scribble">` suelto después de cada `<h2>`, mismo
  asset que Método/Pilares. Como la regla base lo centra
  (`margin:6px auto 0`), se agregó override
  `#lam-05 .title-scribble,#lam-06 .title-scribble{margin:6px 0 0}` para
  que quede pegado al borde izquierdo del título en vez de centrado.
- 1-2 `<span class="brain-spark">` por título (mismo asset/keyframe que
  las chispas del Hero), como chispita sutil de "impacto" extra — el
  `<h2>` pasó a `position:relative` para poder posicionarlas, y se
  redujo su tamaño a 7px (`#lam-05 .lam-title .brain-spark,#lam-06
  .lam-title .brain-spark{width:7px;height:7px}`) para que no compitan
  con el texto.

No se tocó `--font-hand`/Caveat ni ningún otro `.lam-title` del sitio.
`.title-scribble` se sigue ocultando en mobile (`<720px`) por la regla
general que ya existía. Verificado con Playwright (servidor estático
local, `python3 -m http.server`) en desktop 1440px y mobile 390px:
marcador y scribble visibles y alineados a la izquierda, sin romper
`.ben-grid` ni `.contact-wrap`, ni el `max-width:14ch` de los títulos.

## 2026-09-15 (décima tanda) — Pilares: se sacan 6 de los 7 trazos "marcador" sueltos del título

El usuario marcó con círculos rojos, sobre una captura del deploy real,
qué trazos naranjas quería sacar de la zona del título "Cuatro frentes
de trabajo" (sección Pilares, `#lam-04`): 3 en un grupo arriba a la
derecha, 1 solo a la izquierda, 2 en un grupo abajo a la derecha — 6 en
total — y pidió dejar los 3 que quedan pegados al título.

Identificación de cuál trazo es cuál (la captura no trae nombres de
clase, así que hubo que mapear geometría): se clonó el repo, se sirvió
`index.html` localmente y se renderizó con Playwright a 1920×1000,
forzando las clases `reveal` visibles y con scroll al inicio de
`#lam-04`. Se detectaron por color (`#EDA23A`, componentes conexos)
los 9 trazos naranjas visibles en esa zona de la captura del usuario y
se ajustó una regresión lineal x/y entre las posiciones de los 7
`<img class="deco-scribble">` del render propio y esos 9 componentes,
usando como anclas los 4 trazos de match inequívoco (los 3 del grupo
superior derecho + el de la izquierda). Eso reveló que los "9 trazos"
no son 7 `<img>` + 1: son 7 `<img class="deco-scribble">` sueltos +
el `<img class="title-scribble">` (bloque centrado debajo de todo el
`<h2>`, ya existía, no está en el array de 7) + el subrayado de la
palabra "trabajo" en sí (`.title-mark`, `background-image` en el
`<span>`, no es una imagen suelta). Con esos dos elementos fijos
identificados aparte, el resto cuadró 1 a 1 sin ambigüedad.

Resultado del mapeo, `index.html` dentro de `.lam-title-frame`
(`#lam-04`):
- Grupo circulado arriba a la derecha (3): los 3 `<img>` con
  `style="right:40px;top:-24px..."`,
  `style="right:calc(50% - ...);top:-42px..."` y
  `style="right:calc(50% - ...);top:-6px..."` — **eliminados**.
- Circulado a la izquierda (1): el `<img>` con
  `style="left:calc(50% - ...);bottom:-6px;width:170px..."` —
  **eliminado**.
- Grupo circulado abajo a la derecha (2): los `<img>` con
  `style="right:-10px;bottom:-16px;width:100px..."` y
  `style="right:calc(50% - ...);bottom:6px;width:190px..."` —
  **eliminados**.
- Los 3 que quedan pegados al título (sin circular, se mantienen sin
  tocar): el `<img>` con
  `style="right:110px;bottom:14px;width:320px..."` (el único
  `deco-scribble` suelto que sobrevive), el `<img class="title-scribble">`
  (línea aparte, ya existía, centrada debajo del `<h2>`) y el
  subrayado de "trabajo" vía `.title-mark` (CSS, sin cambios).

Cambio en el código: de los 7 `<img class="deco deco-scribble">` que
había al principio de `.lam-title-frame` en `#lam-04`, se borraron 6 y
quedó solo uno (el de `right:110px;bottom:14px;width:320px`). No se
tocó `#lam-03` (Método) ni ninguna otra sección — usan el mismo patrón
de trazos pero no fueron parte de este pedido.

Verificado sirviendo el sitio localmente + Playwright: la captura de
`#lam-04` después del cambio muestra únicamente las 2 líneas pegadas
al título (el `deco-scribble` sobreviviente + `title-scribble`) más el
subrayado de "trabajo", sin ninguno de los 6 trazos circulados.
Pendiente (igual que el resto del sitio, ver "Pendientes conocidos"):
confirmarlo también contra el deploy real de Netlify.

## 2026-09-15 (novena tanda) — Botón de "Datos clave" desnivelado: anclado al fondo de la tarjeta

El usuario probó el cambio anterior (octava tanda) en el deploy real y
mandó una captura: los botones "Cargar datos antropométricos" y
"Establecer objetivo" quedaban a distinta altura entre las 2 tarjetas,
se veía "imparejo".

Causa: `.num` usa `font-size:36px` en Antropometría pero `22px` en
Objetivo cognitivo (a propósito, para que un objetivo largo no
desborde) — esa diferencia de alto entre los bloques de arriba corría
el botón hacia abajo en la tarjeta verde. Igualar las fuentes no era
opción (rompería el ajuste del objetivo largo), así que se ancló el
botón siempre al borde inferior de la tarjeta en vez de dejarlo flotar
según el contenido de arriba.

Cambios, `css/styles.css`:
- `.stat-box.miplan-card` (clase que comparten las 2 tarjetas):
  `display:flex;flex-direction:column` (sin fijar `align-items`, para
  no romper el centrado de `.imc-gauge` en Antropometría ni el fix ya
  aplicado de `.miplan-objetivo` en Objetivo cognitivo).
- `.miplan-card-cta`: `margin-top:14px` → `margin-top:auto` (empuja al
  fondo) + `align-self:flex-start` (evita que se estire a todo el
  ancho, efecto por default del flex-column recién agregado).

Verificado con Playwright: estado sin datos (botones ya alineados,
desktop 1440px y mobile 390px) y con plan generado (sin cambios, el
botón se oculta en ese estado). Ver detalle en `memoria.md` → "Estado
actual del diseño".

## 2026-09-15 (octava tanda) — Objetivo cognitivo: orden de texto + anillo a la derecha; "Tu estado actual" pasa a dorado

El usuario mandó una captura señalando 3 ajustes en el dashboard de "Mi
plan":

1. En la tarjeta "Objetivo cognitivo", el texto "Objetivo cognitivo
   principal" (itálica) aparecía **arriba** de la raya/valor (`—` o el
   objetivo resuelto); en Antropometría es al revés (valor arriba, label
   abajo) y el usuario quería que Objetivo cognitivo siguiera el mismo
   orden.
2. El anillo de progreso de "Objetivo cognitivo" quedaba pegado al
   ícono del cerebro, no pegado al borde derecho de la tarjeta como el
   de Antropometría.
3. La tarjeta "Tu estado actual" (gráfico de barras foco/memoria/
   energía/calma) debía pasar a compartir el color dorado de "Objetivo
   cognitivo", en vez de su blanco genérico.

Cambios:

- `mi-plan.html`: se invirtió el orden de los `<div class="num">` y
  `<div class="lab">` dentro de `.miplan-objetivo` (mismos `id`/clases,
  sin tocar JS).
- `css/styles.css`:
  - `.miplan-card-head` suma `width:100%`. Causa del punto 2: dentro de
    `.miplan-objetivo` (`flex-direction:column;align-items:flex-start`)
    un hijo block se achica a su contenido en vez de ocupar el ancho
    completo, así que `justify-content:space-between` no tenía espacio
    para empujar el anillo al borde. Antropometría no tenía el problema
    porque `.stat-box` no es flex.
  - `#miPlan .bar-chart-card`: `background:var(--paper)` →
    `background:var(--miplan-card-dorado)`.

Verificado con Playwright (mock de `netlifyIdentity`, sin red real):
estado sin datos y con plan generado, desktop 1440px y mobile 390px.
Ver detalle completo en `memoria.md` → "Estado actual del diseño".

## 2026-09-15 (séptima tanda) — Antropometría y Objetivo cognitivo: mismo alto en desktop

El usuario probó el cambio anterior en el deploy real y mandó una
captura: las tarjetas "Antropometría" y "Objetivo cognitivo" se veían
con distinta altura (la de Antropometría más alta), aunque comparten el
mismo `.miplan-grid`.

Causa: `.miplan-grid{align-items:start}` hace que cada columna del grid
tome la altura de su propio contenido en vez de la altura de la fila
completa — con `align-items:stretch` ambas columnas toman la altura de
la fila (la más alta de las 2), pero eso solo estira el ítem del grid en
sí. Antropometría es un ítem directo del grid (una `.stat-box`), así que
estirarla ya alcanza. Objetivo cognitivo vive un nivel más adentro
(`.miplan-col` → `.stat-box.miplan-objetivo`): estirar `.miplan-col`
(el wrapper, sin fondo propio) no estira la tarjeta de color que está
adentro, así que hacía falta además `flex:1` en `.miplan-objetivo` para
que la tarjeta en sí crezca y llene ese alto.

Cambios, `css/styles.css`:
- `.miplan-grid`: `align-items:start` → `align-items:stretch`.
- `.miplan-objetivo`: se agregó `flex:1` (mantiene el resto de sus
  reglas: `display:flex;flex-direction:column;align-items:flex-start`).

No se tocó `mi-plan.html` ni JS — cambio puramente de CSS.

**Verificado con Playwright**: se midió `getBoundingClientRect().height`
de ambas tarjetas en desktop (1440px) en 2 estados — sin datos (266.4px
las 2) y con datos seedeados (403.2px las 2) — quedan exactamente
iguales en ambos casos. Se revisó mobile (390px, donde el grid pasa a 1
columna) para confirmar que el cambio no afecta el apilado — cada
tarjeta mantiene su alto natural, que es lo esperable ahí. Se
re-confirmó `window.scrollX===0` tras forzar scroll horizontal y que
`index.html` sigue cargando normalmente.

## 2026-09-15 (sexta tanda) — Las 3 tarjetas del dashboard pasan a fondo de color + ilustración propia

El usuario mostró una referencia nueva (mockup con 3 tarjetas de fondo de
color — verde, dorado, lila — cada una con su propia ilustración
temática) y pidió ir hacia ese estilo, reemplazando la unificación de
cabecera hecha en la tanda anterior (quinta). Adjuntó 3 imágenes
generadas con Gemini: silueta de cuerpo verde (Antropometría), cerebro de
línea fina (Objetivo cognitivo — el usuario lo describió como "tonos
dorados, low-poly" pero la imagen real es morado/berenjena, se usó tal
cual se recibió) y una tira de 5 íconos con recuadro (plato, cubiertos,
cerebro con pin, bowl, hueso) para "Cierre".

Antes de tocar HTML/CSS se le mostraron 2 opciones de layout al usuario
en el visualizador (fondo sólido vs. fondo blanco con acento) y se
confirmaron 4 decisiones por separado: fondo sólido de color (no blanco
con acento), el ícono de línea morado de la cabecera se **reemplaza**
(no convive) por la ilustración, el anillo de progreso se mantiene igual
arriba a la derecha, y la tira de 5 íconos **reemplaza** (no convive) a
la fila de íconos redondos que ya existía en "Cierre".

Cambios:
- **Assets**: las 3 imágenes recibidas no tenían transparencia real pese
  a pedirse "fondo transparente" — eran JPEG con un patrón de cuadros
  gris/blanco dibujado como píxeles reales. Se procesaron con Pillow
  (máscara por saturación/valor para generar alpha real, recorte al
  bounding box) y se guardaron como PNG en `img/ilustraciones-mi-plan/`
  (`antropometria-cuerpo.png`, `objetivo-cerebro.png`,
  `cierre-iconos-plan.png`) — no quedaron sueltas en
  `/mnt/user-data/uploads`.
- **Fondos de color** (`css/styles.css`, bloque `:root`): 3 variables
  nuevas `--miplan-card-verde`/`--miplan-card-dorado`/`--miplan-card-lila`
  (tintes opacos). Aplicadas con selectores con más especificidad que la
  regla general `#miPlan .stat-box,.bar-chart-card{background:var(--paper)}`
  que ya existía: `#miPlan .miplan-grid > .stat-box` (Antropometría),
  `#miPlan .stat-box.miplan-objetivo` (dorado), `#miPlan .miplan-cierre`
  (lila).
- **Cabeceras** (`mi-plan.html`): el `<svg class="miplan-card-icon">` de
  Antropometría y Objetivo cognitivo se reemplazó por
  `<img class="miplan-card-illustration">` con las imágenes nuevas
  (`.is-wide` para el cerebro, más ancho que alto). "Cierre" conserva su
  ícono (clipboard con check) — ninguna de las 3 imágenes era para ese
  lugar. El `.miplan-ring` no se tocó (misma posición/tamaño/lógica).
- **Tira de íconos de "Cierre"**: `.miplan-cierre-icons` pasó de 5
  `<img>` sueltos (`img/Iconos/icon-*.webp`, sin relación temática) a un
  único `<img class="miplan-cierre-icons-strip">` con la pieza nueva ya
  diseñada como tira — mismo criterio de visibilidad que antes
  (`#miPlanCta.hidden + .miplan-cierre-icons{display:none}`, CSS puro).

No se tocó `js/mi-plan.js`, `js/nutricion-planes.js` ni la encuesta de
nutrición — todos los datos siguen pintándose con la misma lógica de
siempre, solo cambió el fondo/ilustraciones alrededor.

**Verificado con Playwright**: dashboard sin datos (CTA + tira de íconos
visibles, 3 tarjetas con su color propio), con datos seedeados (gauge de
IMC, objetivo y anillos completos conviven con el fondo de color sin
romper el layout) y mobile 390px (tarjetas apiladas, ilustraciones
escalan bien). `window.scrollX===0` tras forzar scroll horizontal — sin
romper el criterio de `overflow-x` documentado en `memoria.md`. Se
confirmó que `index.html` sigue cargando normalmente (cambios acotados a
`mi-plan.html`/`css/styles.css`).

## 2026-09-15 (quinta tanda) — Las 3 tarjetas del dashboard ("Mi plan" con sesión) ahora se ven como una familia

El usuario mostró una captura del sitio real al lado del mockup de
referencia original: en el mockup las 3 tarjetas ("Datos clave -
Antropometría", "Datos clave - Meta cerebral", "Detalle del plan") tienen
la misma cabecera con ícono, mientras que en el sitio "Cierre" se veía
como un componente distinto (sin ícono, título más grande y de otro
color, inline con el avatar en vez de arriba). Pidió unificar las 3.

Fondo, padding y `border-radius` de las 3 tarjetas ya eran idénticos
desde antes (`#miPlan .stat-box, .bar-chart-card, .miplan-cierre{padding:
20px 20px}`, sin cambios acá) — la diferencia real estaba en la
cabecera. Cambios, todos en `.miplan-cierre`:
- Se agregó un ícono nuevo a `.miplan-cierre-head` (clipboard con check,
  dibujado con `<path>` para heredar el mismo trazo `stroke:currentColor`
  que ya usan los íconos de Antropometría/Objetivo cognitivo — un `<rect>`
  no hereda esa regla, por eso el diseño se armó solo con `path`), en el
  mismo lugar donde las otras 2 tarjetas tienen su ícono propio.
- El avatar+nombre (`#miPlanCierreUser`) se mantuvo del lado derecho de
  esa misma fila — es la misma posición donde las otras 2 tienen el
  anillo de progreso, aunque acá no es un anillo real (esta tarjeta no
  tiene un dato de "progreso", es la identidad de la cuenta).
- El título "Cierre" pasó de tener su propia clase (`.miplan-cierre-title`,
  18px, `--purple-dark`, **ahora eliminada del CSS**) a usar directamente
  `.miplan-card-title` — la misma clase que ya usan "Antropometría" y
  "Objetivo cognitivo" — para que las 3 tarjetas queden con la tipografía
  exactamente igual, no solo parecida. Se agregó
  `.miplan-cierre .miplan-card-title{margin-bottom:0}` porque esa clase
  trae `margin-bottom:12px` pensado para bloques sueltos, y acá el padre
  (`.miplan-cierre`) ya es `flex column` con `gap:14px` — sin cancelarlo
  el espacio después del título quedaba más grande que el del resto de
  los elementos de la tarjeta.

Archivos tocados: `mi-plan.html` (reordenó el head de `.miplan-cierre` y
sumó el ícono), `css/styles.css` (ícono nuevo cubierto por reglas ya
existentes, quitó `.miplan-cierre-title`, agregó el override de margen).
No se tocó `js/mi-plan.js`: `pintarMiPlan()` sigue completando
`#miPlanAvatar`/`#miPlanUserName` igual que antes, mismos ids.

**Verificado con Playwright**: dashboard sin datos (capturas a 1200px),
con datos seedeados (IMC, objetivo y barras de estado ya pintados no
rompen el layout nuevo) y mobile 390px — las 3 tarjetas se ven
consistentes en los 3 casos. Se confirmó por `getComputedStyle` que
`.miplan-grid .stat-box` y `.miplan-cierre` comparten tipografía del
título, fondo, padding y `border-radius`. Se re-verificó que el estado
sin sesión y los formularios de login/registro/recuperación de las 2
tandas anteriores siguen intactos (no se tocó nada de `#miPlanSinSesion`
en esta sesión).

## 2026-09-15 (cuarta tanda) — Recuperación de contraseña propia (cierra el último hueco del widget)

El usuario confirmó que el login/registro propios de la tanda anterior
funcionan en el deploy real, y pidió cerrar lo único que el widget
nativo todavía hacía mejor: el "Forgot password?". Con esto ya no queda
ningún flujo que dependa del recuadro de Netlify.

Son 2 paneles nuevos dentro del mismo `.miplan-auth`, sin pestaña propia
(se llega desde un link debajo del login, o desde el correo):
`#formRecuperarMiPlan` (pide el correo) y `#formNuevaPassMiPlan`
(contraseña nueva + repetirla). Cuando alguno está visible se oculta la
fila de pestañas y la tarjeta toma `.is-recuperando`, que esconde el
párrafo "Iniciá sesión (o creá una cuenta) para verlo acá" — ahí ya no
describe lo que la persona está haciendo. El título grande se mantiene.

**La parte con más filo fue el token del correo.** El enlace de
recuperación de Netlify vuelve al sitio con `#recovery_token=…` sobre la
**raíz** del sitio, no sobre `mi-plan.html`. Y el widget de Identity, al
inicializarse, mira ese fragmento y abre su modal nativo de "nueva
contraseña" — exactamente lo que este trabajo viene sacando. Solución:
scripts inline en el `<head>` de las dos páginas, ubicados **antes** del
`<script>` de `identity.netlify.com` para ganarle:
- `index.html` detecta el fragmento y hace `location.replace` a
  `mi-plan.html#recovery_token=…`.
- `mi-plan.html` lo guarda en `window.SINAPTIX_RECOVERY_TOKEN` y limpia
  el hash con `history.replaceState`, así el widget no lo ve nunca.

Si ese orden se rompe (por ejemplo moviendo el `<script>` del widget más
arriba), vuelve a aparecer el modal nativo: está anotado en `memoria.md`.

Flujo y decisiones:
- `gotrue.requestPasswordRecovery(email)` manda el correo. **La respuesta
  al usuario es la misma exista o no la cuenta** ("si ese correo tiene
  una cuenta, te llega un enlace…"): responder distinto dejaría averiguar
  qué correos están registrados en el sitio.
- `gotrue.recover(token, true)` canjea el token por una **sesión real**,
  así que a partir de ahí la persona ya está logueada aunque todavía no
  eligió contraseña — el paso final es un `user.update({password})`
  normal, sin volver a loguear. Es lo mismo que hacía el widget.
- `recover()` se llama **al cargar**, no al enviar el formulario: si el
  token venció o ya se usó, se vuelve al panel de pedir el enlace con el
  aviso, en vez de dejarla escribir una contraseña que no se iba a poder
  guardar.
- Si ya había sesión abierta en ese navegador, **el flujo de recuperación
  manda igual**: la persona llegó desde el correo justamente a cambiar la
  contraseña.
- El correo escrito en el login se precarga en el panel de recuperación,
  para no hacerlo tipear dos veces.

Archivos tocados: `mi-plan.html`, `index.html` (solo el script inline del
`<head>`; el nav y `js/script.js` siguen sin cambios), `css/styles.css`,
`js/mi-plan.js`, `memoria.md`, `changelog.md`.

**Verificado con Playwright** (`netlifyIdentity` mockeado): link con el
correo precargado, pedido del enlace con mensaje neutro en verde, vuelta
desde el correo con el hash capturado y limpiado, contraseñas que no
coinciden, `update({password})` → dashboard con el nombre pintado, token
vencido, prioridad sobre una sesión previa, y el reenvío de `index.html`
a `mi-plan.html`. Se re-corrió además la verificación completa de la
tanda anterior: sin regresiones.

**Lo que NO se pudo probar** (mismo límite de siempre: no hay
credenciales ni acceso de red a `netlify.com`): que la plantilla del
correo de recuperación apunte efectivamente a
`{{ .SiteURL }}/#recovery_token={{ .Token }}`. Si el usuario le cambió el
destino desde el panel, hay que ajustar el intercepto del `<head>`.

Efecto en la altura: la sección pasa de ~986px a ~1024px de alto mínimo
sin scroll, por el link "¿Olvidaste tu contraseña?" que suma una línea al
panel de login. Los paneles de recuperación, en cambio, son más bajos que
el de login porque ocultan el párrafo.

## 2026-09-15 (tercera tanda) — Login y registro propios en "Mi plan" (adiós al widget nativo de Netlify Identity)

Implementación del plan que quedó documentado como "a futuro" en la
sesión anterior (ver "Pendientes conocidos" de `memoria.md` en su
versión previa). Los 2 botones de `#miPlanSinSesion` que abrían el
recuadro nativo de Netlify (`#btnLoginMiPlan` →
`netlifyIdentity.open('login')` y `#btnRegistrarseMiPlan` →
`open('signup')`) ya no existen: en su lugar hay formularios propios
dentro de la misma tarjeta. Con esto entrar y loguearse pasa de 3
acciones a 2 (nav de `index.html` → completar el form ahí mismo), sin
tocar `index.html` ni `js/script.js`, tal como anticipaba el plan.

**Investigación previa de la API de GoTrue** (punto 1 del plan; se hizo
leyendo el fuente real de `gotrue-js` y del widget bajados de npm, no de
memoria):
- `POST /.netlify/identity/signup` → JSON `{email, password, data}`,
  donde `data` es lo que el servidor guarda como `user_metadata`. Por eso
  el nombre viaja como `{full_name: …}`: es la misma clave que
  `pintarMiPlan()` ya leía.
- `POST /.netlify/identity/token` → **no es JSON**:
  `application/x-www-form-urlencoded` con
  `grant_type=password&username=…&password=…`.
- Los errores llegan en `err.message`, en inglés.

**Decisiones confirmadas con el usuario antes de escribir código:**
1. *Layout*: "variante A" — 2 pestañas y un formulario visible por vez
   (se le mostró una maqueta con A y B lado a lado; B ponía los dos
   formularios en 2 columnas y ensanchaba la tarjeta, con riesgo de
   pisar el cerebro de la derecha).
2. *Confirmación por correo*: se **desactiva** desde el panel de Netlify
   (Identity → plantilla de confirmación → "Allow users to sign up
   without verifying their email address"). Así el signup entra directo
   al dashboard. Igual se dejó fallback por si se reactiva.
3. *Estrategia*: **híbrida**, no 100% fetch contra la API. Se sigue
   usando el cliente GoTrue que el widget expone
   (`netlifyIdentity.gotrue`) y solo se reemplaza la parte visual.

El motivo de la estrategia híbrida es concreto y salió de leer el fuente
del widget: `netlifyIdentity.currentUser()` no devuelve un estado
interno suyo, sino `gotrue.currentUser()`, que lee la sesión de
`localStorage`. Logueando por esa vía, `js/plan-sync.js` (que arma el
header `Authorization` con `currentUser()`) sigue funcionando **sin
tocarlo y sin recargar la página**. Con un `fetch` a mano habría habido
que reimplementar la persistencia de la sesión y probablemente parchear
`plan-sync.js`.

Eso sí, saltear el widget tiene dos efectos secundarios que hubo que
resolver a mano y conviene no olvidar:
- El evento `netlifyIdentity.on('login')` **no se dispara**, así que
  `mostrarEstadoConSesion(user)` se llama desde el `.then()`.
- `netlifyIdentity.logout()` **no cierra la sesión** cuando esta se creó
  por esta vía en la misma carga de página (su implementación no hace
  nada si su estado interno está vacío; la persona seguiría logueada).
  `doLogout()` pasó a usar `netlifyIdentity.currentUser().logout()` —el
  `User` de gotrue-js, que sí hace `POST /logout` y limpia
  `localStorage`— y a redirigir explícitamente, porque tampoco se
  dispara el evento `logout`.

Cambios:
- `mi-plan.html`: `.miplan-auth` con pestañas
  `#tabLoginMiPlan`/`#tabRegistroMiPlan` y los formularios
  `#formLoginMiPlan` (correo + contraseña) y `#formRegistroMiPlan`
  (**nombre `required`** + correo + contraseña `minlength=8`). Los
  `<label>` van con la clase `.sr-only` que ya existía: el layout
  aprobado muestra solo placeholders, pero los inputs no quedan sin
  nombre accesible. El eyebrow, el título, el párrafo y "Volver al
  sitio" no cambiaron.
- `css/styles.css`: bloque nuevo `.miplan-auth*`. Los inputs reusan el
  tratamiento visual de `.contact-form` (fondo `--paper-2`, borde
  `--line`, foco `--purple`) para no introducir un segundo estilo de
  campo en el sitio. `.miplan-auth-submit` neutraliza el borde nativo del
  `<button>`, porque `.btn`/`.btn-solid` se habían escrito para los `<a>`
  del sitio y no traen `border`/`cursor`.
- `js/mi-plan.js`: toggle de pestañas, submit de cada formulario,
  `authMensajeError()` (mapea los mensajes de GoTrue a castellano por
  substring, con fallback genérico), bloqueo del botón mientras responde
  el servidor, y el `doLogout()` nuevo.

**Efecto secundario medido y no del todo recuperado:** la tarjeta pasó de
618px a 841px de alto (2 botones → pestañas + campos), así que `#miPlan`
dejó de entrar sin scroll donde antes entraba. Se recuperaron ~98px
compactando `.miplan-locked` (`padding:20px 0`→`8px 0`),
`.miplan-locked-card` (`36px 40px 32px`→`30px 40px 28px`) y ocultando los
labels. Resultado: entra sin scroll desde ~986px de alto de viewport,
contra ~825px antes. La única palanca grande que queda es achicar el
título, que el usuario ya evaluó y descartó en una sesión anterior, así
que **no se tocó** — queda anotado en "Pendientes conocidos" por si lo
quiere reconsiderar.

**Verificado con Playwright** (`netlifyIdentity` mockeado, sin red real):
toggle entre pestañas; registro → `signup` recibiendo
`{full_name:"Ana Pérez"}` → login automático → dashboard con avatar "A" y
nombre pintados; credenciales inválidas; email ya registrado; fallback de
"Email not confirmed" (vuelve a la pestaña de login con el aviso verde);
el botón se restaura tras el error; mobile 390px; `window.scrollX===0`
tras forzar scroll horizontal. El gap tarjeta↔cerebro se remidió en
900/1024/1280/1440/1600/1920 y es idéntico al de antes del cambio
(50-60px): la tarjeta creció en alto, no en ancho.

**Lo que NO se pudo probar** (y queda en "Pendientes conocidos"): nada de
esto se ejercitó contra Netlify de verdad — no hay credenciales ni acceso
de red a `netlify.com` desde el entorno. Falta confirmar en el deploy los
textos exactos de error del servidor (si alguno no matchea, cae al
mensaje genérico) y que el sync con el backend siga andando tras un login
por esta vía. Tampoco se implementó la recuperación de contraseña, que el
widget sí ofrecía.

Archivos tocados: `mi-plan.html`, `css/styles.css`, `js/mi-plan.js`,
`memoria.md`, `changelog.md`.

## 2026-09-15 (continuación) — Email de sesión movido a la tarjeta "Cierre" + plan a futuro de login/registro propios

Sesión de seguimiento sobre el rediseño en 3 columnas del día anterior
(commit `0a06514`). No se tocó ese rediseño; dos cosas nuevas:

**1. `<p id="miPlanEmail">` ("Sesión iniciada como X") reubicado.**
Vivía como línea suelta debajo del título "Tu progreso con SINAPTIX"
(`#miPlanConSesion .sec-head-center`). A pedido del usuario, se sacó de
ahí y ahora vive dentro de `.miplan-cierre`, justo arriba de los botones
"Generar mi plan"/"Cerrar sesión" — así queda claro de qué cuenta es la
sesión que se cierra, en vez de repetir el dato arriba de toda la
pantalla. Cambio quirúrgico: mismo `id="miPlanEmail"`, así que
`js/mi-plan.js` (`pintarMiPlan()`) no se tocó — solo cambió dónde vive
el `<p>` en `mi-plan.html` y se agregó `.miplan-cierre-session` en
`css/styles.css` (texto chico, `color:var(--ink-soft)`, mismo criterio
que el resto de texto muted dentro de tarjetas blancas). Verificado con
Playwright: desktop 1440px y mobile 390px, con y sin `full_name`
cargado.

Archivos tocados: `mi-plan.html`, `css/styles.css`.

**2. Plan a futuro (NO implementado, documentado a pedido del usuario
para otra sesión):** reemplazar el widget nativo de Netlify Identity
por pantallas de login/registro propias en `mi-plan.html`, para (a)
bajar de 3 a 2 los clicks reales para loguearse desde `index.html` (hoy:
nav → botón "Iniciar sesión" de `mi-plan.html` → completar el widget
nativo) y (b) poder pedir el nombre como campo obligatorio en el
registro (evita el caso de fallback del avatar con el prefijo del
email). Absorbe y reemplaza el pendiente suelto de "Opción B" charlado
más temprano en esta misma sesión (formulario propio de signup contra
la API de GoTrue) — ver detalle completo del alcance en "Pendientes
conocidos" de `memoria.md`.

**Verificación visual con Playwright de "Mi plan"** (dashboard con
sesión, fallback de avatar, modal del wizard paso 8 en `index.html`):
hecha en esta sesión, sin encontrar roturas — ver detalle en
`memoria.md`.

**Revisado README.md → "Próximos pasos":** el único punto accionable
(verificación en un deploy real de Netlify) no se puede hacer desde este
entorno por falta de credenciales/acceso de red a `netlify.com`.

**Revisado y aclarado el punto "Descartado: trazos tipo marcador"** de
`memoria.md`: se confirmó que no hay nada pendiente ahí (la
funcionalidad descartada no existe en el sitio); se aclaró además que no
debe confundirse con los trazos manuscritos naranjas de Método/Pilares,
que son una función distinta y sí siguen vigentes.

## 2026-09-15 — "Detalle del plan de nutrición": rediseño en 3 columnas (Plan / Prioridades y Moderación / Cierre)

Commit `0a06514` (autoreado correctamente), patch generado y entregado
al usuario para aplicar con `git am`. Pendiente real: confirmarle al
usuario el criterio de fallback del avatar de "Cierre" (ver más abajo)
— no bloquea, es un detalle menor a validar cuando pueda.

A partir de una referencia visual del usuario (mockup con 3 columnas:
tarjeta blanca "Plan" a la izquierda, columna cálida "Prioridades y
Moderación" al medio, tarjeta "Cierre" con avatar a la derecha),
rediseño de `nutriBuildResumenHTML()` (`js/nutricion-planes.js`),
compartida entre el paso 8 del wizard (`#nutriResumen`, modal de
`index.html`) y "Mi plan" (`#miPlanDetalle`, `mi-plan.html`).

Decisiones confirmadas con el usuario antes de construir:
- El emoji 🧠 del título del plan se reemplaza por un ícono SVG lineal
  a mano (mismo criterio que los íconos de las tarjetas
  Antropometría/Objetivo cognitivo: trazo fino, `currentColor`, sin
  imagen ni librería) — no imagen ni emoji.
- La tarjeta "Cierre" suma avatar (inicial) + nombre. El nombre sale de
  `user.user_metadata.full_name` (Netlify Identity); si la persona no lo
  cargó al registrarse, se usa como fallback la parte del email antes de
  la `@` — decisión propia de esta sesión, no se le preguntó
  puntualmente al usuario cuál fallback prefería, documentarlo por si lo
  quiere cambiar.

Cambios:
- `nutriBuildResumenHTML()` ahora arma, por cada plan resuelto, un
  `.nutri-plan-block` con 2 sub-`<div>`: `.nutri-plan-main` (ícono+título,
  enfoque, nutrientes clave, día tipo — igual que antes) y
  `.nutri-plan-side` (Priorizar / Moderar, antes eran 2 `<ul>` sueltos en
  el mismo nivel que nutrientes/día tipo). "Ajustado a tu caso" (viene de
  `nutriConstruirAjustes`, es de la encuesta completa, no de un plan en
  particular) se cuelga de `.nutri-plan-side` del **último** plan
  resuelto — en el caso más común (un solo plan) coincide con la
  referencia. Si no resolvió ningún plan pero sí hay ajustes (no debería
  pasar en la práctica), hay un fallback que los muestra sueltos como
  antes, para no perder el dato en silencio.
- 3 íconos SVG nuevos como constantes en `js/nutricion-planes.js`
  (`NUTRI_ICON_BRAIN`, `NUTRI_ICON_CHECK`, `NUTRI_ICON_WARN`), mismo
  criterio de línea fina que `.miplan-card-icon`.
- CSS nuevo en `css/styles.css`: `.nutri-plan-block`/`.nutri-plan-main`/
  `.nutri-plan-side` (por defecto apilan en columna — así el modal
  angosto de `index.html` sigue viéndose en una sola columna, sin CSS
  especial), `.nutri-side-title`/`.nutri-side-box`/`.nutri-side-box-head`/
  `.nutri-side-icon` (cajas "Priorizar"/"Moderar", blancas sobre el fondo
  cálido `--panel` de `.nutri-plan-side`), `.nutri-side-box--ajustes`
  (única caja con color sólido, `--gold` terracota + texto blanco, para
  que resalte como la personalización real del plan — no se creó un
  color nuevo).
- **Se reemplazó el viejo `column-count:2` de `#miPlan .nutri-summary`**
  (era un layout tipo "diario" para repartir los `<div>` sueltos del
  resumen en 2 columnas, de una sesión anterior) **por un grid real** en
  `#miPlan .nutri-plan-block{display:grid;grid-template-columns:1.6fr 1fr}`
  (mismo breakpoint, `min-width:680px`) — ya no hace falta el
  `column-count` porque ahora cada plan arma sus propias 2 columnas
  explícitas (Plan / Prioridades y Moderación) en vez de repartir texto
  suelto. Si algo dependía del comportamiento viejo de `column-count`,
  ya no existe.
- `mi-plan.html`: la tarjeta `.miplan-cierre` suma `.miplan-cierre-head`
  (título "Cierre" + `.miplan-cierre-user` con avatar/nombre).
- `js/mi-plan.js`: `pintarMiPlan()` suma el pintado de avatar+nombre
  (5 líneas, ver más arriba el criterio de fallback). No se tocó nada
  más de esa función.

Verificado con Playwright (mockeando `netlifyIdentity` y datos en
`localStorage`, sin acceso real a Netlify): desktop 1440px en
`mi-plan.html` calza contra la referencia del usuario (3 columnas,
avatar+nombre en Cierre); mobile 390px apila todo en una columna;
modal de `index.html` (paso 8 del wizard) sigue viéndose apilado en una
columna, sin romperse con este cambio.

Archivos tocados: `js/nutricion-planes.js`, `css/styles.css`,
`mi-plan.html`, `js/mi-plan.js`.

## 2026-09-14 — "Mi plan" con sesión: rediseño visual del dashboard (#miPlanConSesion)

Rediseño visual del estado "con sesión" de `mi-plan.html` (el dashboard
"Tu progreso con SINAPTIX"), a partir de un mockup IA de referencia
(sidebar + tarjetas "Datos clave" con silueta corporal/brújula + tarjeta
ancha "Detalle del plan"). No se tocó `#miPlanSinSesion` (rediseñado en
una sesión anterior) ni la lógica de qué pinta cada dato en
`js/mi-plan.js`/`js/nutricion-planes.js`.

Decisiones de esta sesión:
- **Sidebar descartada** (confirmado con el usuario antes de tocar el
  `<header>`): reemplazar el `<nav>` superior fijo por una sidebar
  afectaría el layout global compartido con `index.html` y con
  `#miPlanSinSesion`, fuera del alcance pedido. Se adaptó la idea del
  mockup a una sola columna con el nav superior existente, sin cambios
  de estructura fuera de `#miPlanConSesion`.
- Las 2 tarjetas de "Datos clave" (Antropometría / Objetivo cognitivo)
  suman un header con ícono SVG inline a mano (silueta corporal y
  "diana"/objetivo — no existen como asset en `img/Iconos/`, se
  descartó inventar rutas de imagen) + un anillo de progreso de 2
  estados (SVG `<circle>` + `stroke-dasharray`, sin imagen ni
  librería): vacío por defecto, se completa (`.is-complete`, verde para
  Antropometría/azul para Objetivo) cuando `js/mi-plan.js` ya logró
  parsear esos datos. Esto sumó 4 líneas aditivas en `pintarMiPlan()`
  (agregar la clase `is-complete` en los mismos `try` que ya existían) —
  el resto del comportamiento de esa función no cambió.
- Cada tarjeta suma un CTA propio (`.miplan-card-cta`) que hace scroll
  (`<a href="#miplanCierreAnchor">`, `scroll-behavior:smooth` nativo, sin
  JS nuevo) hasta el botón real "Generar mi plan" — no existe un flujo
  separado para cargar solo antropometría o solo objetivo, ambos salen
  de la misma encuesta de 8 pasos. El CTA se oculta solo (CSS
  `:has()`, ya usado antes en este stylesheet para `.scale-opt`) una vez
  que el anillo de esa tarjeta está completo.
- `.miplan-cierre` (tarjeta ancha, ya existía) suma una fila de íconos
  decorativos reusando los `img/Iconos/icon-*.webp` existentes (omega3,
  neuronas, antioxidantes, hidratación, complejo B) — visible solo
  mientras no hay plan generado, resuelto con CSS puro
  (`#miPlanCta.hidden + .miplan-cierre-icons{display:none}`, hermano
  inmediato del texto que `js/mi-plan.js` ya ocultaba/mostraba sin
  cambios).

Detalle completo de la decisión de la sidebar y de cada pieza visual en
`memoria.md` (sección "Mi plan — estado con sesión").

Archivos tocados: `mi-plan.html`, `css/styles.css`, `js/mi-plan.js` (solo
las 4 líneas aditivas descritas arriba).

## 2026-09-14 — "Mi plan" sin sesión: cerebro más a la derecha (de verdad), botón Registrarme, y nav principal apunta al login

Seguimiento del patch anterior (que había corrido el cerebro grande de
`right:-60px` a `right:-140px`): el usuario reportó con una captura de
producción que la tarjeta seguía tapando el cerebro. Medido con
Playwright (`getBoundingClientRect()` de `.miplan-locked-card` y
`.miplan-locked-brain.is-right` en 901/950/1024/1100/1280/1440/1600/
1920px), con `-140px` había ~100px de solapamiento **constante** en
todo el rango de anchos grandes — no se notaba en una sola captura
porque el instructivo visual (líneas del SVG) tiene "aire" antes de
empezar a dibujar. Se subió a `right:-300px`, verificado el mismo
chequeo: gap real de ~48-60px en todo el rango, sin solapamiento.

Se agregó `#btnRegistrarseMiPlan` (`btn-ghost`) junto a
`#btnLoginMiPlan` dentro de `.miplan-locked-card` — abre
`netlifyIdentity.open('signup')` (mismo widget de Identity, pestaña de
registro, no requiere backend nuevo). Para que la tarjeta no quedara
con 3 botones de igual peso, "Volver al sitio" bajó de `.btn-row` a un
link de texto simple debajo (`.miplan-locked-back`).

En `index.html`, los botones de nav "Iniciar sesión" y "Acceder" ahora
son links normales a `mi-plan.html` (antes "Iniciar sesión" abría el
widget de Identity inline y "Acceder" hacía scroll a `#lam-06`) — se
sacó ese comportamiento de `js/script.js` para que todo el flujo de
login/registro pase por la pantalla propia de "Mi plan".

Verificado con Playwright: sin scroll horizontal en 1440/1600/390px,
sin errores de consola al cargar `mi-plan.html`, y click en "Acceder"
navega correctamente a `mi-plan.html`.

## 2026-09-14 — "Mi plan" sin sesión: quitar cerebro chico y correr el grande más a la derecha

A pedido del usuario, en el estado sin sesión de "Mi plan"
(`#miPlanSinSesion` / `.miplan-locked`): se eliminó la copia chica del
cerebro decorativo (`.miplan-locked-brain.is-left`, la que estaba junto
al aguacate) de `mi-plan.html` y su regla CSS correspondiente en
`css/styles.css`. La copia grande (`.is-right`) se corrió más hacia la
derecha, de `right:-60px` a `right:-140px`, para separarla de la
tarjeta central y que se vea completa (antes quedaba parcialmente
pegada/tapada contra el borde de `.miplan-locked-card`).

Verificado con Playwright en 1440px, 1280px y 390px: sin scroll
horizontal real en ningún ancho (`window.scrollX` tras forzar
`mouse.wheel`), cerebro oculto en mobile como antes (`<900px`), y el
cerebro grande se ve completo y despegado de la tarjeta en desktop/
tablet.

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
