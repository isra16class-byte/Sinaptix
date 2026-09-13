# Memoria del proyecto — SINAPTIX

> Este archivo existe para que **cualquier sesión nueva** (de Claude o de
> quien sea) pueda retomar el trabajo en este repo sin que el usuario tenga
> que volver a explicar el contexto. Léelo completo antes de tocar código.
> Actualízalo en cada patch que generes (ver "Reglas de esta memoria" al
> final).

## Ramas: `main` es de trabajo, `master` es producción

- **`main`**: rama donde se aplican los patches de cada sesión (`git am`) y
  se hace push normalmente. Es donde vive el trabajo más reciente.
- **`master`**: rama de **producción**, es la que Netlify tiene configurada
  para desplegar. **No recibe patches directamente.**
- Flujo para que un cambio llegue a producción, después de aplicar los
  patches de la sesión en `main` y hacer `git push origin main`:
  ```bash
  git checkout main
  git push origin main:master
  ```
  Esto es un fast-forward (mismos commits, sin nuevo historial), así que
  **no requiere un patch aparte** — es un paso manual que hace el usuario
  cuando quiere publicar lo que ya está validado en `main`.
- Si en algún momento `master` tiene commits que `main` no tiene (o al
  revés), avisar antes de asumir que un simple `push main:master` va a
  funcionar limpio (podría no ser fast-forward).

## Quién soy en este repo (autoría de commits)

Todos los commits de este proyecto deben quedar autoreados como:

```
isra16class-byte <isra16class@gmail.com>
```

El entorno de trabajo (Claude) **no tiene credenciales propias de GitHub**,
así que nunca se hace `git push` directo. El usuario aplica los cambios él
mismo con `git am`.

## Flujo de trabajo (fijo, no preguntar cada vez)

1. El usuario pide un cambio.
2. Se trabaja sobre una copia local clonada del repo
   `https://github.com/isra16class-byte/Sinaptix.git`.
3. Se hace el/los commit(s) correspondientes con:
   ```bash
   git config user.name "isra16class-byte"
   git config user.email "isra16class@gmail.com"
   git commit -m "..."
   ```
   (o `git commit --amend --author="isra16class-byte <isra16class@gmail.com>"`
   si el commit ya existía con otro autor).
4. **Antes de generar el patch final**, se actualizan `memoria.md` y
   `changelog.md` (ver reglas abajo) y ese cambio va incluido en el mismo
   commit o en un commit adicional dentro del mismo patch set.
5. Se genera el parche con:
   ```bash
   git format-patch -1 HEAD --output-directory /tmp/patches
   ```
   (usar `-N` en vez de `-1` si son varios commits nuevos en la sesión).
6. Se entrega el/los archivo(s) `.patch` al usuario para que aplique con:
   ```bash
   git am 000X-nombre-del-parche.patch
   git push origin main   # o master, ver nota de ramas en README.md
   ```
7. Nunca se le pide al usuario que pegue código a mano ni que copie/pegue
   diffs: siempre se entrega el `.patch` descargable.

## Reglas de esta memoria (obligatorio en cada patch)

- **`memoria.md`** (este archivo): actualizar la sección "Estado actual del
  diseño / producto" cada vez que cambie algo estructural (paleta, stack,
  secciones, integraciones, decisiones de arquitectura). Es el "estado
  presente", no un historial — se reescribe, no se acumula.
- **`changelog.md`**: cada patch agrega **una entrada nueva arriba del
  todo** (orden cronológico inverso) con: fecha de la sesión, resumen corto
  del cambio, y el hash del commit una vez generado el patch (si se conoce).
  Es el "historial", ahí sí se acumula y no se borra nada viejo.
- Si un patch no cambia memoria/changelog, revisar si realmente no hacía
  falta (cambios triviales tipo un typo pueden no requerirlo, pero ante la
  duda, documentar).

## Estado actual del diseño / producto

**Producto**: SINAPTIX, landing de una sola página para un servicio de
asesoría en neuroalimentación (nutrición para rendimiento cognitivo). Sitio
100% estático (HTML/CSS/JS sin build step), desplegado en Netlify. Ver
`README.md` para detalle de funcionalidad (formularios, login con Netlify
Identity, sección "Mi plan", limitación de `localStorage`, próximos pasos de
backend).

**"Mi plan" es una página propia, no una sección de `index.html`**: desde
la sesión donde se agregó `mi-plan.html`, "Mi plan" **ya no** es la sección
`<section id="miPlan">` oculta dentro de `index.html` — es una página HTML
separada, `mi-plan.html`, con su propia URL. Si se retoma trabajo sobre
"Mi plan", el punto de partida es este archivo, no `index.html`.

- **Archivos involucrados**:
  - `mi-plan.html`: la página en sí. Nav propio (marca + "Volver al sitio"
    + "Cerrar sesión") y dos estados dentro de la misma `<section
    id="miPlan">`: `#miPlanSinSesion` (mensaje + botón que abre el login de
    Identity ahí mismo) y `#miPlanConSesion` (el contenido que antes vivía
    en `index.html`: email, IMC, objetivo, detalle del plan, CTA — sin
    cambios de copy).
  - `js/nutricion-planes.js`: **compartido** entre `index.html` y
    `mi-plan.html`. Contiene `NUTRI_PLANES` y las funciones puras de
    cálculo del plan (`nutriResolverObjetivo`, `nutriConstruirAjustes`,
    `nutriConstruirAvisos`, `nutriBuildResumenHTML`) — nada de esto toca el
    DOM del wizard, solo recibe un objeto de datos y devuelve texto/HTML,
    por eso se pudo sacar de `js/script.js` sin romper nada. **Debe
    cargarse antes** que `js/script.js` (en `index.html`) o `js/mi-plan.js`
    (en `mi-plan.html`) — ambos scripts asumen que `nutriBuildResumenHTML`
    ya existe en el global scope.
  - `js/mi-plan.js`: toda la lógica propia de `mi-plan.html` (init de
    Netlify Identity, pintar el plan guardado en `localStorage`, togglear
    los dos estados, logout). **No se reutilizó `js/script.js` tal cual**
    en esta página — ese archivo tiene varios
    `document.getElementById(...).addEventListener(...)` **sin** guarda de
    `null` (ej. el submit del form de contacto, el form de antropometría,
    el botón que abre el wizard de nutrición) pensados para elementos que
    solo existen en `index.html`; incluirlo tal cual en `mi-plan.html`
    tiraría un error de JS apenas cargue. Si en el futuro se necesita
    compartir más lógica entre ambas páginas, extraerla a un archivo aparte
    (como se hizo con `nutricion-planes.js`) en vez de intentar reusar
    `script.js` completo.
  - `index.html`: ya no tiene la sección "Mi plan". El nav tiene un nuevo
    link `#btnMiPlanNav` ("Mi plan" → `mi-plan.html`), oculto por defecto y
    visible solo con sesión iniciada (mismo mecanismo `classList.toggle
    ('hidden', !user)` que ya usaba `#btnAcceder`, invertido). Carga
    `js/nutricion-planes.js` antes que `js/script.js`.
- **Flujo de login/logout** (en `js/script.js`, dentro del bloque de
  Netlify Identity de `index.html`): al hacer login desde `index.html`
  (`netlifyIdentity.on('login', ...)`), ya no se pinta nada localmente —
  se redirige directo con `window.location.href = 'mi-plan.html'`. La
  lógica de pintar/ocultar la sección in-place (`pintarMiPlan`,
  `mostrarMiPlan`, `ocultarMiPlan`) se eliminó de `script.js` porque el
  elemento `#miPlan` ya no existe en `index.html`.
- **Flujo del wizard de nutrición completado con sesión ya iniciada**: en
  vez de pintar la vieja sección local y hacer `scrollIntoView`, ahora
  redirige a `mi-plan.html` (que lee el plan recién guardado solo de
  `localStorage` al cargar).
- **Botón "Generar mi plan" en `mi-plan.html`**: como esa página no tiene
  el modal/wizard de nutrición (vive solo en `index.html`), el botón es un
  link a `index.html?generarPlan=1#lam-06`. En `js/script.js`, al final del
  bloque del wizard, hay un chequeo de `URLSearchParams` que si encuentra
  `generarPlan=1` abre el modal automáticamente
  (`resetNutriWizard()`+`openModal('modalNutricion')`) y limpia el
  parámetro de la URL con `history.replaceState` para que un refresh no
  reabra el modal solo.
- **Botón "Generar mi plan" en `mi-plan.html`**: la encuesta se muestra
  **inline, en la misma pantalla** (no un modal chico ni una redirección a
  `index.html`) — el usuario pidió expresamente que no lo mandara a la
  página de inicio, sino que la encuesta apareciera ahí mismo, "como una
  sección que ocupe la pantalla normal para que haya más visión". El botón
  oculta `#miPlanConSesion` y muestra `#nutriInline` (mismo formulario que
  el modal de `index.html`, mismos `id`, sin el contenedor `.modal-card` —
  vive suelto dentro de `.wrap`, con `max-width:640px` en el form para
  legibilidad pero sin el límite de alto/ancho de un modal). Un botón
  "← Volver a Mi plan" (`#nutriInlineVolver`) permite cancelar sin guardar.
  Al enviar, como esta pantalla solo es alcanzable con sesión ya iniciada,
  siempre se guarda en `localStorage` y se vuelve a pintar "Mi plan" en el
  momento (llamando de nuevo a `pintarMiPlan(user)`) sin recargar ni
  redirigir a ningún lado.
- **`js/nutricion-wizard.js`** (nuevo, compartido): se extrajo de
  `js/script.js` el "motor" del wizard — navegación entre pasos
  (`nutriShowStep`, `resetNutriWizard`), validación (`nutriValidateStep`),
  recolección de datos (`nutriCollectData`, `nutriGetChecked`,
  `nutriGetRadio`) y render del resumen (`nutriRenderResumen`) — porque
  ahora dos lugares distintos (el modal de `index.html` y la sección
  inline de `mi-plan.html`) necesitan la misma navegación de pasos sobre
  `#formNutricion`. Este archivo **no** decide qué pasa al enviar el
  formulario (`submit`) ni cómo se abre — eso es distinto en cada página y
  se define en `js/script.js` (index.html) / `js/mi-plan.js` (mi-plan.html)
  respectivamente. Debe cargarse después de `js/nutricion-planes.js` (usa
  `nutriBuildResumenHTML`) y antes de `js/script.js` / `js/mi-plan.js`, y
  después del HTML del formulario (asume que `#formNutricion` ya existe en
  el DOM al cargar, igual que el resto de los scripts de este sitio).
- **Gráfico de barras en "Mi plan"** (`#miPlanBarras`, en `mi-plan.html`):
  a pedido del usuario, se agregó un gráfico de barras horizontales con el
  "estado actual" (Foco, Memoria, Energía, Calma), calculado a partir de la
  encuesta guardada. **No** es una comparación antes/después (eso solo
  existe en los anillos de "Método", en `index.html`) — es un solo punto
  en el tiempo. Reutiliza exactamente el mismo cálculo y la misma escala
  de color que ya usaban los anillos de "Método", para que ambos
  coincidan si se miran los dos.
  - `gaugeComputeAreas`, `gaugeColorForPercent` y sus helpers de color
    (`gaugeHexToRgb`, `gaugeLerp`, `gaugeRgbToHex`, `GAUGE_LOW/MID/HIGH`)
    se movieron de `js/script.js` a `js/nutricion-planes.js` (compartido)
    — son funciones puras de cálculo, sin DOM, así que no hubo que
    duplicar nada. `js/script.js` conserva solo lo que sí es específico de
    los anillos SVG de índice (`gaugeArc`, `gaugeBuildItem`,
    `gaugeDeltaHtml`, `gaugeFechaCorta`, `renderMethodGauges`).
  - Nueva función `nutriBuildBarChartHTML(encuesta)` en
    `js/nutricion-planes.js`: arma el HTML de las 4 barras a partir de
    `gaugeComputeAreas`. Se llama desde `pintarMiPlan(user)` en
    `js/mi-plan.js`, igual que `nutriBuildResumenHTML`.
  - Estilos nuevos en `css/styles.css`: `.bar-chart-card`,
    `.bar-chart-title`, `.bar-chart-text`, `.bar-row`, `.bar-label`,
    `.bar-track`, `.bar-fill`, `.bar-pct` — reutilizan las variables de
    color/tipografía existentes (`--paper-2`, `--line`, `--panel-line`,
    `--font-d`, `--font-m`), no hay ninguna librería de gráficos nueva
    (Chart.js, etc.): son `<div>` con `width` en porcentaje, simple CSS.
  - Se muestra/oculta igual que el resto de "Mi plan": si todavía no hay
    `sinaptix_objetivo` guardado, `#miPlanBarras` queda oculto (no hay
    datos que graficar todavía).
  (`#formNutricion`) está duplicado entre `index.html` (dentro del modal) y
  `mi-plan.html` (inline) — es contenido estático, no hay motor de
  templates en este sitio (sin build step), así que si se agrega/cambia un
  campo de la encuesta hay que replicarlo a mano en las dos páginas. Los
  `id` de los campos son los mismos en ambas (no hay colisión porque viven
  en documentos HTML distintos); `nutriCollectData()` (en
  `nutricion-wizard.js`) los lee por `id` sin importar en qué página está.

**Estilo visual (vigente desde el rediseño visual del sitio)**: el sitio se
rediseñó a partir de una referencia visual clara y editorial. Antes tenía un
tema oscuro/navy con tipografía editorial (Space Grotesk + IBM Plex Mono).
Ahora:

- **Paleta** (definida en `css/styles.css`, bloque `:root`): fondo blanco
  (`--paper:#FFFFFF`) / lavanda muy claro para secciones alternadas
  (`--panel:#F7F1F5`), morado de marca `--purple:#714B67` (y
  `--purple-dark:#4B2E45`) como color estructural principal (botones, nav,
  eyebrows, iconos), más acentos secundarios: verde `--green:#2E7D5B`,
  terracota `--gold:#C1703B`, azul `--navy-bright:#3B6EA5`. Texto en
  `--ink:#26161F` y variantes con opacidad.
- **Tipografía**: `Inter` (Google Fonts) en cuerpo de texto, navegación,
  eyebrows y elementos de UI (`--font-b` / `--font-m`). Los títulos y
  elementos de display (`h1`, `h2`, `h3`, marca del nav, números de
  stat-box, valor de "Mi plan") usan `Fraunces` en peso 800, normal e
  itálica (`--font-d`), elegida para dar un aire editorial/cálido que
  conecte con lo nutricional sin perder seriedad — incluye el `<em>` de
  "con *claridad*" en el H1 del Hero, que queda en Fraunces itálica. Sin
  mayúsculas ni tracking tipo monoespaciado en los eyebrows.
- **Componentes**: botones tipo píldora (`border-radius: 999px`), tarjetas
  redondeadas con sombra suave (`--radius`, `--shadow`, `--shadow-lg`) para
  stats, pilares nutricionales y testimonios, nav fijo blanco con blur y una
  barra de progreso de scroll (`.nav-progress`) que reemplazó al "rail"
  lateral (hilo sináptico) que existía antes — ese rail se eliminó de HTML,
  CSS y JS.
- El contenido/copy en español **no cambió**, solo el sistema visual.
- Los SVG decorativos (`svg/*.svg`) y el ícono del hero se recolorearon para
  funcionar sobre fondo claro (antes estaban pensados para fondo oscuro).
- **Trazos de fondo: espiga de trigo real vectorizada (Hero/Visión/Para quién
  es/Contacto) + marcador original (Método/Pilares)**: hay dos SVG de rayón
  de fondo que conviven, mismo patrón `.deco` (position:absolute,
  z-index:0, detrás del `.wrap`, clase `.deco-scribble` en
  `css/styles.css`, opacidad base `.85`, oculto en móvil
  `max-width:720px`) que ya usan los blobs de fruta, pero **con dos SVG
  distintos según la sección**:
  - `svg/deco-scribble.svg` (trazo tipo marcador liso, `stroke:#EDA23A`,
    un único path sin ondulaciones): sigue en uso, pero **solo** en
    `lam-03` (Método) y `lam-04` (Pilares) — tanto en los `.deco
    .deco-scribble` propios de esas dos secciones como en el mecanismo
    `.title-mark`/`.title-scribble` (ver más abajo, "Rayón pegado al
    título"). No tocar este archivo si se retoma esa idea en otro lado.
  - `svg/deco-espiga.svg` (nuevo, **reemplaza dos intentos previos
    descartados**): usado en `lam-01` (Hero), `lam-02` (Visión), `lam-05`
    (Para quién es) y `lam-06` (Contacto).
    - **Historia del proceso** (por si se repite algo similar): el
      primer intento fue un SVG hecho a mano con un trazo + "aristas"
      tipo espina de pescado — el usuario lo rechazó ("se ve horrible").
      El segundo intento fue una espiga vertical generada por script
      (kernels tipo almendra) — tampoco convenció al usuario, que pidió
      en cambio pedirle la imagen a un generador externo (Gemini) y que
      Claude hiciera "la magia" de adaptarla. Se le dio al usuario un
      prompt en español e inglés para pedir una espiga de trigo en line
      art, dorada, aislada en fondo blanco. El usuario subió la imagen
      generada (un trazo de espiga muy limpio y detallado). Esa imagen
      **se vectorizó con potrace** (recorte al bounding box con PIL,
      umbral a blanco/negro, `potrace -s`), y el resultado (paths
      cerrados rellenos, no strokes) se recoloreó a `fill="#D9A441"` —
      así quedó como SVG liviano y fiel al dibujo original, ya no como
      un trazo hecho a mano.
    - **Si se necesita volver a vectorizar una imagen de referencia en
      este entorno**: `potrace` está disponible (se instaló con
      `apt-get install -y potrace`); flujo: recortar al contenido con
      PIL (bounding box de píxeles no blancos), umbralizar a blanco/negro
      duro, `potrace input.pbm -s -o out.svg`, y luego recolorear el
      `fill` del `<g>` resultante al color deseado.
    - **Forma final**: viewBox `0 0 163 669` (una sola espiga, vertical,
      con aristas/awns saliendo del grano y tallo con dos hojas en la
      base), color `#D9A441` (dorado trigo, más amarillo que el naranja
      `#EDA23A` original).
    - **Posición/ángulo (ajuste pedido por el usuario tras ver el primer
      montaje)**: el usuario pidió que no fueran solo trazos con
      leve inclinación, sino que se vieran "revueltos" (ángulos de
      rotación bien variados, no solo unos pocos grados) y que algunas
      espigas salieran cortadas por el borde real de la pantalla, como
      mecidas por el viento. Se lograron los cortes de borde real
      simplemente con offsets negativos grandes (`right:-25px`,
      `left:-35px`, etc.) combinados con rotaciones amplias y variadas
      (entre 18° y 42°, alternando signo) — **no** hizo falta el truco
      `var(--vw100, 100vw)` de `lam-03`/`lam-04` en este caso porque las
      instancias de `.deco-scribble` en `lam-01/02/05/06` son hijas
      directas de la `<section>` (que ya ocupa el ancho completo del
      viewport), a diferencia de las de `lam-03`/`lam-04` que están
      anidadas dentro de un contenedor con `max-width` propio. El corte
      real del borde funciona porque `.hero` tiene `overflow:hidden` y el
      `body`/`html` tiene `overflow-x:hidden` (línea existente en
      `css/styles.css`), así que cualquier elemento posicionado con
      offset negativo grande queda recortado limpio en el borde real.
    - **Si se agregan nuevas instancias de este trazo en el futuro,
      usar `deco-espiga.svg` por defecto** — `deco-scribble.svg` queda
      reservado para Método/Pilares y para el subrayado de título.
  - Distribución (sin cambios de cantidad respecto a antes, solo cambió
    el archivo, tamaño/rotación/posición donde corresponde): 6 en el
    Hero y 2 por cada una de las otras 3 secciones que usan la espiga
    (`lam-02`, `lam-05`, `lam-06`).
  - **Verificación visual**: en este entorno hay Chromium + Playwright
    instalados; antes de entregar un patch de este tipo (decoración
    visual de fondo/tamaños/posiciones/forma/color de un trazo) conviene
    levantar un servidor local (`python3 -m http.server` sobre el repo) y
    tomar capturas con Playwright para confirmar cómo se ve realmente —
    incluyendo confirmar que las secciones que NO debían cambiar (Método/
    Pilares en este caso) efectivamente siguen igual. Se iteró varias
    veces (3 versiones de la espiga) mostrando capturas al usuario antes
    de aplicar el cambio final al repo real.
- **Capa de "vida" ilustrada (sesión posterior al rediseño visual)**: hay 6
  ilustraciones en `svg/deco-blob-*.svg` — un blob suave en color de marca
  (opacity baja) con una fruta/fruto seco flat-illustration encima
  (arándanos, aguacate, naranja, nuez, almendras, kiwi). Clase CSS
  `.deco-fruit` (en `css/styles.css`) les da flotación suave
  (`animation:float`, reusa el keyframe del hero) con distintos
  `animation-delay` (`.d2`, `.d3`) para que no floten sincronizadas, y se
  ocultan en móvil (`max-width:720px`) para no saturar el layout angosto.
  Siguen el mismo patrón que los `.deco` existentes: hijos directos de la
  `<section>`, `position:absolute`, `z-index:0`, por lo que quedan detrás
  del `.wrap` (que tiene `z-index:1`).
  - **Posicionamiento** (ajustado siguiendo patrón de lectura en Z de
    landing pages — ver `changelog.md` sesión "posiciones estratégicas"):
    nuez cerca del botón "Solicitar asesoría" del Hero, arándanos chico
    arriba-derecha del Hero (framing), arándanos grande junto al título de
    Visión + arándanos mini junto al stat-grid, almendras junto a los
    botones CTA de Método, aguacate junto al título de Pilares, naranja
    junto a las tarjetas de testimonios en Beneficios, kiwi junto al
    formulario de contacto (CTA final). La idea es que cada fruta viva
    cerca de un punto de atención real (título, CTA, dato clave), no solo
    decorativa al azar.
  - **Nivel de acabado**: los 6 SVG usan degradados (`linearGradient` /
    `radialGradient`) en vez de rellenos planos, y una sombra de apoyo
    (`ellipse` semitransparente) debajo de cada fruta para que no se vean
    "pegadas" sino con volumen. La nuez en particular tiene un contorno
    lobulado (no un óvalo liso) para que se lea de inmediato como nuez —
    el usuario reportó que la primera versión (óvalo tostado simple) no se
    reconocía como fruta/fruto seco.

**Estructura de archivos** (sin cambios respecto al README): `index.html`
(todo el markup, secciones `lam-01` a `lam-06`), `css/styles.css`,
`js/script.js`, `img/`, `svg/`, `netlify.toml`.

**Encabezados centrados en Método y Pilares (lam-03, lam-04)**: el usuario
pidió que los títulos de esas dos secciones (antes alineados a la
izquierda, como el resto) quedaran centrados. Se envolvió el bloque
`eyebrow + h2` en un `<div class="sec-head-center">` nuevo, con la clase
`.sec-head-center{text-align:center}` en `css/styles.css` (más
`margin-left/right:auto` en `.lam-title` dentro de ese contenedor, porque
es un bloque con `max-width` propio y necesita margen automático para
centrarse). El timeline de Método y el `pillar-grid` / `signal-wave` de
Pilares quedan **fuera** de ese contenedor y siguen su layout de grilla
normal, sin cambios. El resto de secciones (02, 05, 06) no se tocó y
sigue con sus títulos alineados a la izquierda.

**Nota (sesión posterior, ver `changelog.md` "Párrafo de Pilares movido
debajo de la ola")**: el `<p class="lam-text">` de Pilares ya **no** vive
dentro de `sec-head-center` — se movió después del `.signal-wave`, ver
más abajo.

**Rayón pegado al título en Método y Pilares**: además del centrado, el
usuario pidió (mostrando de nuevo su referencia visual) que el
título tuviera un rayón subrayando la última palabra clave + una línea
completa debajo de todo el título, no solo rayones sueltos de fondo. Se
resolvió con dos piezas nuevas en `css/styles.css`, pensadas para ser
robustas ante cambios de texto (no usan coordenadas absolutas):
- `.title-mark`: se aplica a un `<span>` que envuelve la última palabra
  del `h2` (p.ej. `<span class="title-mark">genérica</span>`), con
  `background-image:url(../svg/deco-scribble.svg)` en
  `background-position:left bottom` y `background-size:100% 32%` — el
  subrayado se estira automáticamente al ancho real de la palabra, sea
  cual sea, sin depender de un pixel fijo.
- `.title-scribble`: un `<img>` de `svg/deco-scribble.svg` colocado como
  **hermano normal del `h2`** (no absoluto), con `display:block;
  margin:6px auto 0`, así que queda centrado y fluye justo debajo del
  título sin importar en cuántas líneas se parta el texto (evita el
  problema de coordenadas fijas que rompió el intento revertido de
  "trazos tipo marcador" original).
- Se aplicó envolviendo la última palabra en `lam-03` ("genérica") y en
  `lam-04` ("trabajo"). **Nota importante**: esto sí envuelve una palabra
  en un `<span>` dentro de un `h2`, pero a diferencia del intento que se
  revirtió, estos `h2` **no** son `display:flex` (son bloques de texto
  normales), así que el span no rompe el wrapping — se verificó con
  capturas Playwright que el texto sigue fluyendo bien. Si se repite este
  patrón en otro título, confirmar primero que ese `h2` no use
  `display:flex`.

## Encuesta y planes de nutrición especializada (`#modalNutricion`)

El botón "Generar nutrición especializada" (`#btnNutricion`, en Método/
lam-03) ya no abre un formulario de una sola pantalla (objetivo + email).
Ahora abre un **wizard de 8 pasos** dentro del mismo `#modalNutricion`,
con barra de progreso (`.nutri-progress`, puntos que se van marcando
`done`/`active`) y botones Atrás/Siguiente (`#nutriBack`/`#nutriNext`),
más un botón final `#nutriSubmit` en el paso 8.

- **Pasos 1 a 7**: recolectan objetivo cognitivo, contacto, datos
  personales/antropométricos, rutina y exigencia mental, hábitos
  alimentarios actuales, salud/alergias/restricciones, percepción actual
  (4 escalas 1-5: estrés, fatiga, dificultad de concentración, olvidos) y
  preferencias/presupuesto + consentimiento. Cada paso valida sus campos
  obligatorios con `:invalid` antes de dejar avanzar (`nutriValidateStep`
  en `js/script.js`); los campos opcionales no llevan `required`.
- **Paso 8**: muestra el plan resuelto (`nutriRenderResumen`), ya
  ajustado a las respuestas — no es solo un mensaje de "solicitud
  recibida", se arma en pantalla antes de enviar.
- Si el usuario ya registró peso/talla/edad/sexo en "Registrar datos
  antropométricos" (`#modalAntropometria`, guardado en
  `sinaptix_antropometria`), el paso 2 se prellena automáticamente con
  esos datos (`resetNutriWizard`, que corre cada vez que se abre el
  modal) para no volver a pedirlos.

**Los 4 planes en sí no cambiaron ni se descartaron** — siguen siendo los
mismos 4 objetivos que ya existían en el select (`Mejorar concentración`,
`Reducir fatiga mental`, `Sostener memoria de trabajo`, `Manejo de estrés
mental`), ahora con contenido real por plan (`NUTRI_PLANES` en
`js/script.js`): enfoque, nutrientes clave, alimentos a priorizar y a
moderar. Se agregó una quinta opción al select, `"No estoy seguro / varios
objetivos"`, que **no es un plan nuevo**: dispara
`nutriResolverObjetivo`, que compara las 4 escalas del paso 6 y devuelve
el/los plan(es) existentes con puntaje más alto (si hay empate, muestra
más de uno).

**Tabla de conexiones** (`nutriConstruirAjustes` / `nutriConstruirAvisos`
en `js/script.js`) — así es como las respuestas modifican el plan antes
de mostrarlo:
- Alergias marcadas u "otra alergia" → nota de exclusión + sustitución
  dentro del mismo grupo nutricional.
- Restricción Vegetariano/Vegano → nota de sustitución de fuentes
  animales por vegetales.
- Restricción Sin gluten → nota de sustitución de cereales con gluten.
- Presupuesto "Ajustado" → nota de reemplazo por alternativas económicas.
- Tiempo para cocinar bajo / "como afuera" → nota de recetas
  simplificadas.
- Alimentos que no le gustan (texto libre) → se listan como excluidos.
- Hora de mayor exigencia mental → nota de en qué momento del día se
  ubica el snack de refuerzo.
- Condición de salud marcada y/o medicación regular = Sí → **aviso**
  (`.nutri-note`, fondo dorado) de validar el plan con un profesional
  antes de aplicarlo — no bloquea el envío, solo lo marca.
- Sueño <6h o calidad de sueño ≤2 → aviso de que el plan no sustituye
  dormir lo suficiente.
- Cafeína "4 o más al día" → aviso de reducir gradualmente.
- Ultraprocesados "a diario" → aviso de transición gradual.

**Envío (ya no es por correo — reemplazado por login + "Mi plan")**: al
enviar el paso 8, se guarda todo en `localStorage` bajo `sinaptix_objetivo`
(mismo key que antes, con el campo `encuesta` con todas las respuestas).
**Ya no se arma un `mailto:`** — como el plan se genera y se muestra en
pantalla al instante (paso 8), pedirlo por correo dejó de tener sentido.
En su lugar:
- Si hay sesión de Netlify Identity iniciada (`netlifyIdentity.currentUser()`):
  se pinta el plan de inmediato en `#miPlan` (objetivo + detalle completo),
  se cierra el modal y se hace scroll hasta esa sección
  (`#nutriResultado` muestra "Tu plan quedó guardado en tu cuenta...").
- Si no hay sesión: el plan queda guardado igual en este navegador
  (`localStorage`), pero se invita a iniciar sesión para no perderlo y
  verlo completo — el mensaje lo dice explícito y, a los ~900ms,
  se abre el login de Netlify Identity (`netlifyIdentity.open('login')`)
  automáticamente.
- Botón del paso 8: ya no dice "Solicitar plan", dice **"Guardar mi plan"**
  (`#nutriSubmit`). El texto de intro del modal también se actualizó para
  reflejar que el plan se genera al instante, no que "el equipo arma la
  propuesta".

**Sección "Mi plan" (`#miPlan`) ahora muestra el plan real, no un mensaje
de espera**: antes decía "tu plan está siendo preparado por el equipo,
te escribimos a tu correo" — eso ya no aplica porque el plan se genera en
el momento. Cambios:
- Nuevo contenedor `#miPlanDetalle` (clase `.nutri-summary`, reutiliza el
  mismo estilo del resumen del wizard) que muestra el plan completo
  (nutrientes clave, priorizar, moderar, ajustes y avisos) reconstruido
  desde `sinaptix_objetivo.encuesta` guardado en `localStorage` — se pinta
  cada vez que se inicia sesión (`pintarMiPlan` en `js/script.js`) y
  también apenas se guarda un plan nuevo estando ya logueado.
- Nuevo párrafo/CTA `#miPlanCta` + botón `#btnAbrirNutricionMiPlan`
  ("Generar mi plan"): se muestra en vez del detalle cuando todavía no hay
  ningún `sinaptix_objetivo` guardado, y abre el wizard
  (`resetNutriWizard()` + `openModal('modalNutricion')`, igual que
  `#btnNutricion`).
- Se extrajo la lógica de armado del HTML del plan a una función
  compartida, `nutriBuildResumenHTML(d)` en `js/script.js` (antes vivía
  solo dentro de `nutriRenderResumen`, usado por el paso 8) — ahora la
  usan tanto el paso 8 del wizard como `pintarMiPlan` y el handler de
  `submit`, para no repetir la tabla de conexiones dos veces.

**Verificado con Playwright** en este entorno (servidor local +
capturas): navegación entre pasos, validación por paso, resolución
automática de "No estoy seguro", aplicación de ajustes/avisos, prellenado
desde antropometría, y layout en viewport móvil (380px) — checkboxes en
grilla de 2 columnas y escalas 1-5 en fila siguen siendo usables. Para el
flujo de login, como el widget real de Netlify Identity no puede
autenticar sin salir a la red en este entorno, se probó con un stub de
`window.netlifyIdentity` inyectado antes de que cargue `script.js`: sesión
ya iniciada (Mi plan se pinta al instante, sin CTA), sin plan guardado
(se ve la CTA "Generar mi plan"), y el flujo completo de guardar un plan
nuevo estando logueado (mensaje, cierre de modal, scroll a Mi plan, plan
visible) — todo sin errores de JS y confirmado también en viewport móvil
(380px).

## Anillos de progreso en Método (`#methodGauges`)

La sección 03 (Método) ya no es solo el `.timeline` a ancho completo: ahora
`.timeline` y una tarjeta nueva, `.method-gauges` (`#methodGauges`), viven
lado a lado dentro de `.method-body` (grid de 2 columnas, se apila en
móvil ≤900px). La tarjeta muestra 4 anillos de progreso tipo "Apple Watch"
en una grilla 2×2 (`.gauge-grid`), uno por área: **Foco, Memoria, Energía,
Calma**. Todo en SVG puro (`js/script.js`, sin librería de gráficos — el
sitio no tiene build step).

**Historial de esta tarjeta**: primero se implementó como radar/spider
chart (ver `changelog.md`, entrada "Radar de progreso..."). El usuario lo
vio, pidió algo más llamativo, se le mostraron 3 mockups (A: dumbbell
conectado antes/después, B: anillos tipo gauge, C: barras agrupadas) y
eligió **B**, pidiendo además que **el color de cada anillo cambie según
su propio porcentaje**. Se implementó primero con **dos anillos
concéntricos por área** (externo = estado actual, interno = diagnóstico
inicial), pero el usuario mandó una captura real: a ese tamaño los dos
anillos quedaban demasiado pegados, y cuando el valor inicial era bajo
(rojo/dorado) se leía como un glitch pegado al anillo externo verde en vez
de una comparación clara — **se descartó el doble anillo** por ese
motivo (ver `changelog.md`, entrada de la sesión que lo corrigió). Esta
sección describe el resultado final vigente, no ninguna de las dos
versiones anteriores — si algo menciona "radar" en el código es solo un
comentario histórico explicando el origen del dato.

- **De dónde salen las 4 áreas**: se reutilizan las mismas 4 escalas 1-5
  del paso 6 del wizard de nutrición (estrés, fatiga, dificultad de
  concentración, olvidos) — no se agregó ninguna pregunta nueva a la
  encuesta. Se invierten (`6 - valor`, `gaugeComputeAreas` en
  `js/script.js`) para que un valor más alto sea siempre "mejor":
  dificultad de concentración → **Foco**, olvidos → **Memoria**, fatiga →
  **Energía**, estrés → **Calma**. Luego se convierten a porcentaje
  (`valor/5*100`), que da siempre 20/40/60/80/100% sin decimales — si
  alguna vez todas las áreas muestran 100%, no es un bug: significa que se
  contestó la opción "mejor" en las 4 preguntas de esa medición.
- **Un solo anillo por área** (`gaugeBuildItem` en `js/script.js`): dibuja
  el estado más reciente (la reevaluación si existe, si no el diagnóstico
  inicial), coloreado según su propio porcentaje
  (`gaugeColorForPercent`). Cuando hay reevaluación guardada, debajo del
  anillo se agrega una línea de texto (`gaugeDeltaHtml`, clase
  `.gauge-delta`) con el valor inicial y la diferencia, p.ej. "Antes: 20%
  (+80 pts)" en verde si mejoró, en rojo `#B3261E` si empeoró, o "sin
  cambios" en gris si quedó igual. Esto reemplaza al anillo interno que
  había antes.
- **Estados de la tarjeta** (función `renderMethodGauges`, se llama al
  cargar la página y después de guardar un diagnóstico o una
  reevaluación):
  1. Sin `sinaptix_objetivo.encuesta` guardado → estado vacío con CTA
     "Generar mi diagnóstico" (`#btnGaugeDiagnostico`) que abre el wizard
     de nutrición normal.
  2. Con diagnóstico inicial → cada uno de los 4 anillos muestra ese
     porcentaje, sin línea de delta debajo + botón "Actualizar mi estado".
  3. Con una reevaluación posterior guardada → el anillo muestra el valor
     de la reevaluación, con la línea de delta debajo, y el botón pasa a
     "Actualizar mi estado otra vez".
- **Color dinámico por porcentaje** (`gaugeColorForPercent`, interpolación
  RGB continua): rojo `#B3261E` (0% — mismo rojo que ya usan los mensajes
  de error de los formularios del sitio, reutilizado a propósito) → dorado
  `var(--gold)` (50%) → verde `var(--green)` (100%). Hay una leyenda de
  escala (`.gauge-scale`) que explica el significado de los 3 tramos de
  color ("Necesita atención" / "En progreso" / "Sólido"), y una línea
  aparte con las fechas (`.gauge-dates`, ya no habla de anillo
  externo/interno porque ya no hay doble anillo).
- **Reevaluación = segunda medición real** (sin cambios respecto al radar
  original): botón "Actualizar mi estado" (`#btnReevaluar`, dentro de la
  tarjeta), abre el modal `#modalReevaluacion` con las mismas 4 preguntas
  de escala 1-5 del paso 6 (inputs con prefijo `reeval`). Al enviar
  (`#formReevaluacion`), se guarda en `localStorage` bajo
  `sinaptix_reevaluacion` (`{estres, fatiga, concentracion, olvidos,
  fecha}`), sobrescribiendo cualquier reevaluación anterior (no hay
  historial de más de una todavía).
- Depende únicamente de `localStorage` (`sinaptix_objetivo` y
  `sinaptix_reevaluacion`), no de sesión de Netlify Identity — funciona
  igual con o sin login, igual que "Mi plan".
- **Pendiente de verificación visual real**: en este entorno, Playwright
  no pudo instalar Chromium (la descarga del navegador sale de un dominio
  no permitido en la configuración de red de este entorno). El diagnóstico
  y el ajuste del doble anillo a un solo anillo + texto de delta se
  hicieron a partir de una captura de pantalla que mandó el usuario, no de
  una verificación propia en navegador. Si una sesión futura tiene acceso
  a Playwright, conviene confirmar con capturas (desktop y móvil 380px)
  que el anillo único + la línea de delta se ven bien, sobre todo con
  nombres de área más largos o valores negativos de delta.

## Títulos manuscritos tipo "marcador" en Método y Pilares (`lam-03`, `lam-04`)

A partir de una referencia visual que dio el usuario (título en fuente
manuscrita/cursiva estilo marcador, casi negro, con rayón subrayando la
última palabra + un "marco" de rayones sueltos en las esquinas), se
aplicó ese tratamiento **solo** a los `h2.lam-title` de `lam-03` (Método)
y `lam-04` (Pilares) — el resto de secciones sigue en Fraunces.

- **Fuente**: `Caveat` (Google Fonts, pesos 600/700), agregada al mismo
  `<link>` de Fraunces/Inter en `<head>` de `index.html`. Nueva variable
  `--font-hand:'Caveat',cursive` en `css/styles.css` (bloque `:root`).
  Regla con scope `#lam-03 .lam-title, #lam-04 .lam-title` que pone
  `font-family:var(--font-hand)`, `letter-spacing:0` (sin el tracking
  negativo de Fraunces) y `font-size:clamp(40px,6vw,68px)` — más grande
  que el resto de `h2` porque una cursiva se ve visualmente más chica al
  mismo tamaño en px. El contenido de los títulos no cambió.
- **Salto de línea forzado en `lam-03`** (sesión posterior, ver
  `changelog.md` "Rayones reagrupados junto al título"): el título de
  Método envolvía en 3 líneas de forma poco prolija con el wrap
  automático por `max-width` en `ch`. Se resolvió igual que el `<br>`
  del H1 del Hero: `<br>` explícito después de "fases," en el `h2` de
  `lam-03`, más `style="max-width:32ch"` en ese mismo `h2` (solo para
  evitar que "Un método en cuatro fases," vuelva a wrapear sola antes
  del `<br>` — el `.lam-title` base sigue en `max-width:12ch` para el
  resto de secciones). Si el copy de ese título cambia, revisar dónde
  cae el `<br>` a mano, no depende del ancho de pantalla.
- **`.title-mark`** (el `<span>` que subraya la última palabra del
  título, ya existía desde antes): para estas dos secciones se ajustó
  `background-position`/`background-size` (`left bottom 6px` /
  `100% 26%`) para que el rayón quede pegado a la línea base del texto
  manuscrito, distinto del ajuste que le sirve a Fraunces en otras
  secciones si se reutilizara ahí.
- **Rayones "marco" del título (`.lam-title-frame`, ajustado en sesión
  posterior — ver `changelog.md` "Rayones reagrupados junto al
  título")**: son 7 `deco-scribble` (mismo patrón `.deco`/
  `.deco-scribble` de siempre, solo cambia `style` inline de tamaño/
  rotación/posición) — **idénticos en `lam-03` y `lam-04`**: un trazo
  largo + dos cortos apilados arriba a la derecha (el "abanico"), y
  abajo un corto a la izquierda, un largo y dos cortos hacia la
  derecha. **Ya no son hijos directos de la `<section>`** (que es muy
  alta por el timeline/pilar-grid de cada sección) — son hijos de un
  contenedor nuevo, `.lam-title-frame` (`position:relative`, en
  `css/styles.css`), que envuelve únicamente el `.sec-head-center`
  (eyebrow + h2 + `.title-scribble` — **ya no incluye el `<p
  class="lam-text">` de Pilares**, ver nota del párrafo movido más
  abajo). Esto es a propósito: así los valores `top`/`bottom` quedan
  relativos a la altura del bloque de título, no a la de toda la
  sección, y los rayones quedan pegados al título en vez de aparecer
  sueltos cerca del CTA final (que es lo que pasaba antes de este
  ajuste, con los mismos 7 rayones como hijos directos de
  `<section>`). Sigue ocultándose en móvil (`max-width:720px`) por la
  regla ya existente de `.deco-scribble`. Si se quiere aplicar este
  mismo tratamiento a otra sección en el futuro, reusar
  `.lam-title-frame` + este mismo set de 7 posiciones (ver
  `index.html`, secciones `lam-03`/`lam-04`) en vez de inventar uno
  nuevo, para mantener el "marco" consistente.
- **Párrafo de Pilares movido debajo de la ola** (sesión posterior, ver
  `changelog.md` "Párrafo de Pilares movido debajo de la ola"): el
  usuario vio en una captura real que el `<p class="lam-text">` de
  Pilares (dentro de `sec-head-center` en ese momento) quedaba
  apretado contra el `.signal-wave` y con uno de los rayones del
  `.lam-title-frame` cruzándole el texto encima. Se sacó ese `<p>` de
  `sec-head-center`/`lam-title-frame` y se movió como hermano
  independiente, **después** de `.signal-wave` y **antes** de
  `.pillar-grid`, con una clase nueva `.lam-text-center` (en
  `css/styles.css`: `text-align:center;margin:-16px auto 44px`, se
  suma a `.lam-text` base que ya da `max-width:52ch`) para mantenerlo
  centrado igual que antes, ahora que ya no está dentro de
  `.sec-head-center`. Efecto secundario esperado y correcto: al salir
  el `<p>` de `.lam-title-frame`, ese contenedor quedó más bajo (ya
  no incluye la altura del párrafo), así que los rayones de abajo
  terminan pegados justo bajo el subrayado del título — más cerca
  todavía, igual que en `lam-03` que nunca tuvo `<p>` ahí. `lam-03`
  no tiene este párrafo, así que no se tocó.
- **Nota de verificación**: `fonts.googleapis.com` no es accesible desde
  el entorno de trabajo (sandbox con lista blanca de dominios), así que
  la fuente no se veía en las capturas de Playwright tomadas ahí
  directamente — se confirmó el resultado inyectando temporalmente el
  archivo de Caveat (bajado desde el repo de Google Fonts en GitHub, que
  sí está permitido) solo para la captura de verificación. En un deploy
  real (Netlify) la fuente carga normal desde Google Fonts, no hace
  falta ningún cambio adicional para eso.
- **Rayón inferior izquierdo con sangrado real al borde del viewport**
  (sesión posterior, feedback contra una captura de referencia): el
  usuario mostró una referencia donde el rayón inferior izquierdo del
  `.lam-title-frame` nace justo en el borde de la pantalla, no cerca del
  título. El rayón ya existía (uno de los 7 de `.lam-title-frame`,
  `left:6px;bottom:-6px`), pero al estar posicionado relativo a
  `.lam-title-frame` (que hereda el ancho del contenido de `.wrap`,
  centrado con `max-width:1180px`), quedaba a ~200-250px del borde real
  en vez de nacer de él — por eso se percibía como "falta un rayón".
  Se cambió su `left` a `calc(50% - 50vw)` en vez de un valor fijo en
  `index.html` (`lam-03` y `lam-04`, ambos con el mismo markup): como
  `.lam-title-frame` es un bloque centrado cuyo centro horizontal
  coincide con el centro del viewport (hereda el ancho de `.wrap`, que
  tiene `margin:0 auto`), este truco de CSS hace que el borde izquierdo
  del rayón caiga exactamente en `x=0` del viewport sin importar el
  ancho de pantalla (no depende de un `px` fijo que se rompería en otras
  resoluciones). Se subió el `width` de ese rayón de 140px a 170px para
  que se note más al nacer del borde. Verificado con Playwright en 1600px
  y 1280px de ancho: en ambos casos el rayón sigue naciendo del borde
  real. En esta sesión solo se tocó el rayón izquierdo — ver nota
  siguiente sobre el lado derecho, corregido en una sesión posterior tras
  feedback adicional del usuario (comparando de nuevo contra la
  referencia, dijo explícitamente que aún no se veía la diferencia
  porque solo el lado izquierdo sangraba al borde).
- **Rayones del lado derecho también sangran al borde real** (sesión
  posterior, mismo feedback de la referencia): el usuario insistió en
  que las rayas "tienen que aparecer del borde de la pantalla" — el
  primer fix solo cubrió el rayón izquierdo, pero en la referencia
  también el rayón más externo del cluster superior derecho y el más
  externo del cluster inferior derecho nacen del borde derecho real.
  Se aplicó el mismo truco en `index.html` (`lam-03` y `lam-04`) a esos
  dos rayones (los que tenían `right:-10px`, los más pegados al borde
  del `.lam-title-frame` de cada cluster): ahora usan
  `right:calc(50% - 50vw)` en vez de un valor fijo, análogo al
  `left:calc(50% - 50vw)` del rayón izquierdo, así que su borde derecho
  cae siempre en el borde real del viewport sin importar el ancho de
  pantalla. Se les subió un poco el `width` (120→150px arriba, 170→190px
  abajo) para que se noten más al nacer del borde. El resto de los
  rayones del cluster (los más centrales/largos) se dejaron igual — en
  la referencia esos no llegan al borde, solo los extremos.
- **Aguacate de Pilares movido al lado izquierdo** (misma sesión): al
  hacer que el rayón superior derecho sangrara hasta el borde real, ese
  rayón quedaba cruzando por encima de `svg/deco-blob-avocado.svg` (la
  fruta decorativa de `lam-04`, que vive pegada a la esquina superior
  derecha de la `<section>`, fuera de `.lam-title-frame`). El usuario
  mismo sugirió mover la fruta si estorbaba. Se cambió su posición de
  `right:-20px` a `left:-20px` (con `top:0px` igual que antes, solo se
  invirtió la rotación de `-5deg` a `5deg` para que el espejo se vea
  natural) — ahora el aguacate vive en la esquina superior izquierda y
  el rayón derecho queda limpio. Ninguna otra sección tiene este
  conflicto (el fruto de `lam-03`, almendras, vive abajo a la derecha,
  lejos de donde sangra el rayón superior).
  Verificado con Playwright en 1917px, 1600px y 1280px de ancho en
  `lam-04`, y en 1600px en `lam-03` (que no tiene fruta arriba, así que
  no necesitó ajuste de posición).
- **Sangrado al borde real: fix robusto con variable CSS + JS** (sesión
  posterior, ver `changelog.md` "Fix robusto de sangrado + segundo rayón
  superior que faltaba"): el truco `calc(50% - 50vw)` usado para que los
  rayones "sangraran" hasta el borde real de la pantalla **no era
  confiable en navegadores con scrollbar clásica** (no overlay, ej.
  Windows/Chrome): `vw` se calcula sobre el ancho total del viewport
  (incluye el hueco del scrollbar), pero `.wrap{margin:0 auto}` centra
  usando `clientWidth` (ancho visible, sin scrollbar) — esa diferencia
  (~15-17px) hacía que el sangrado, sobre todo del lado derecho, se
  quedara corto del borde real. **Ya no se usa `50vw` directo.** En
  `js/script.js`, `setViewportWidthVar()` fija una variable CSS
  `--vw100` con `document.documentElement.clientWidth` (la misma base
  que usa `.wrap` para centrarse), actualizada al cargar y en cada
  `resize`. Los 6 rayones que sangran en `.lam-title-frame` (`lam-03` y
  `lam-04`) usan ahora `calc(50% - (var(--vw100, 100vw) / 2))` en vez de
  `calc(50% - 50vw)` — `100vw` queda solo como fallback antes de que
  corra el JS. **Si se agrega un nuevo elemento que deba sangrar al
  borde real en el futuro, usar este mismo patrón (`var(--vw100, 100vw)`
  en vez de `50vw` a secas), no volver al truco viejo.**
- **Segundo rayón del cluster superior derecho (el que faltaba)** (misma
  sesión): comparando contra una captura de referencia externa, el
  cluster superior derecho de `.lam-title-frame` debía tener **dos**
  rayones sangrando al borde real (uno grande arriba, uno chico justo
  debajo), pero el sitio solo tenía el grande — el rayón chico
  (`right:-4px;top:-10px;width:110px`) se quedaba pegado al borde del
  `.lam-title-frame`, lejos del borde real de la pantalla. Se reemplazó
  por `right:calc(50% - (var(--vw100, 100vw) / 2));top:-6px;width:100px;
  transform:rotate(6deg)` en `lam-03` y `lam-04`, así el cluster superior
  derecho queda con 3 rayones en total (uno "flotante" cerca del texto +
  dos que sangran al borde real, uno arriba del otro), igual que el
  cluster inferior. El resto del set de 7 rayones de `.lam-title-frame`
  no se tocó (el usuario ya los había validado como correctos).
- **Título de Pilares en una sola línea en desktop** (misma sesión,
  captura de `lam-04`): el usuario notó que el título "Cuatro frentes de
  trabajo" se partía en dos líneas ("Cuatro frentes" / "de trabajo")
  aunque a ese ancho de pantalla entraba de sobra en una sola. Causa: el
  `h2.lam-title` de `lam-04` no tenía `style` propio y heredaba el
  `max-width:12ch` base de `.lam-title` (pensado para títulos más
  cortos), muy por debajo de los ~25 caracteres del texto. Se agregó
  `style="max-width:26ch"` al `h2` de `lam-04` (mismo mecanismo que ya
  usa `lam-03` con `32ch`, ver sección de títulos manuscritos arriba) —
  ahora entra en una línea desde ~900px de ancho de viewport en adelante,
  y sigue partiéndose de forma natural en mobile (`max-width:720px`,
  donde `.deco-scribble` también se oculta). Verificado con Playwright en
  1917px, 1600px, 1280px, 900px (una sola línea) y 380px (dos líneas,
  sin cortes raros).

- **Grosor y cruce corregido en los 7 rayones de `lam-04` (Pilares)** (sesión
  posterior, feedback contra una imagen de referencia externa que mostraba
  el patrón deseado de rayones): el usuario mostró una captura de
  referencia (no de este repo, un mock de otra sección con el mismo
  lenguaje visual) donde el cluster de rayones de fondo tiene un patrón
  reconocible: **una raya larga y fina** "flotante" (no sangra al borde) +
  **dos rayas cortas y gruesas** que sangran al borde real, sin cruzarse
  entre sí. En `lam-04` los 7 `<img class="deco-scribble">` heredan el
  grosor del trazo por *aspect-ratio* natural del SVG (`viewBox 400x30`,
  `stroke-width:11`) — al no llevar `height` explícito en el `style`
  inline, un `width` chico (100-190px, los que sangran al borde) da un
  trazo fino, y un `width` grande (300-320px, los "flotantes") da un trazo
  grueso: **exactamente al revés** de lo que pedía la referencia. Además,
  el cluster superior derecho tenía las dos rayas de sangrado con
  `rotate` de signo opuesto (`-4deg` y `6deg`), por lo que visualmente se
  cruzaban formando una V/flecha en vez de quedar paralelas.
  - **Fix**: se agregó `height` explícito (en px) a los 7 `style` inline
    de `lam-04`, independiente del `width`, para desacoplar el grosor
    visual del largo del trazo (el `<img>` ya no preserva el aspect-ratio
    del SVG al tener ambas dimensiones fijadas, así que se puede pedir un
    trazo largo-y-fino o corto-y-grueso a voluntad): los 2 "flotantes"
    (top:-24px width:300px y bottom:14px width:320px, ambos cerca del
    título) bajaron a `height:10px` (más finos); los 5 que sangran al
    borde o son el acento chico subieron a `height:14-15px` (más gruesos).
    Se unificó el signo del `rotate` de las dos rayas del cluster superior
    derecho a `-3deg` ambas (antes `-4deg`/`6deg`) para que queden
    paralelas y no se crucen. La raya chica del cluster inferior central
    (antes `right:70px;bottom:-18px;width:90px`, pegada/solapada con la
    raya larga de al lado) se movió a `right:-10px;bottom:-16px;width:100px`
    para dejar un hueco claro entre ambas, igual que en la referencia.
  - **Patrón a seguir si se repite en otras secciones** (`lam-03` usa el
    mismo esquema de 7 rayones en `.lam-title-frame` y **no** se tocó en
    esta sesión — el usuario solo pidió el ajuste en Pilares/`lam-04`):
    si se quiere replicar esta corrección ahí, aplicar el mismo criterio
    (rayas "flotantes" largas y finas vía `height` chico, rayas de
    sangrado/acento cortas y gruesas vía `height` más grande, rotaciones
    del mismo signo dentro de un mismo cluster para que no se crucen).
  - Verificado con Playwright (servidor local + captura) a 1600px de
    ancho de viewport, comparando contra la imagen de referencia que dio
    el usuario.

## Imagen principal del Hero (`lam-01`, `.synapse-art`)

El hero ya **no** usa el logotipo (`img/sinaptix-badge.png`) como pieza
central flotante — el usuario pidió reemplazarlo por una ilustración de
un cerebro dividido a la mitad: un lado hecho de frutas/verduras, el otro
lado iluminado como una red de neuronas (`img/hero-cerebro-nutricion.png`,
PNG 1024×1024 con fondo transparente, ~1.2MB — pendiente optimizar/pasar
a WebP si el peso se vuelve un problema real de rendimiento).

- El SVG de fondo de `.synapse-art` (las líneas finas + los puntos que
  viajan por ellas, `.pulse-dot`) **no se tocó**, sigue detrás de la
  imagen igual que antes con el logo.
- Nueva estructura dentro de `.synapse-art`: un `div.brain-art` que
  contiene la `<img class="brain-art-img">` (la ilustración) más 8
  `<span class="brain-spark">` posicionados en `%` sobre los puntos de
  luz más brillantes del lado de neuronas de la imagen (coordenadas
  sacadas analizando los píxeles más brillantes del PNG). Cada spark es
  un punto con `radial-gradient` + `box-shadow` que parpadea
  (`@keyframes spark-twinkle`, opacidad y escala) con duración y
  `animation-delay` distintos por `span` (variables CSS `--dur`/`--d`
  inline) para que no parpadeen todos sincronizados — simula que las
  "neuronas" de la imagen se encienden y apagan, ya que el PNG en sí es
  una imagen estática y no se le puede animar el brillo interno
  directamente.
- `.brain-art-img` conserva la misma animación de flotación
  (`animation:float`) que antes tenía `.logo-badge` (la clase
  `.logo-badge` y su CSS se dejaron intactos en `css/styles.css` por si
  se necesita revertir, pero ya no se usan en el HTML).
- `width:82%` en `.brain-art` (antes `.logo-badge` usaba `56%`) — la
  ilustración ocupa más espacio del círculo de `.synapse-art` porque es
  una imagen compuesta que se lee mejor grande, a diferencia del
  logotipo que era un ícono simple.
- `prefers-reduced-motion:reduce` también apaga `.brain-art-img`
  (flotación) y dejar `.brain-spark` visible pero fijo en opacidad .6
  (sin parpadeo) — mismo criterio que ya existía para `.logo-badge` y
  `.pulse-dot`.
- Si se vuelve a cambiar esta imagen en el futuro, para reposicionar los
  `.brain-spark` sobre los nuevos puntos de luz: abrir la imagen con
  cualquier herramienta de análisis de píxeles, filtrar los píxeles más
  brillantes/blancos del lado que corresponda a "neuronas" (no confundir
  con brillos del lado de comida, ej. el ajo o el limón también son
  claros) y convertir sus coordenadas a porcentaje del ancho/alto total
  de la imagen para que el posicionamiento siga funcionando aunque el
  contenedor cambie de tamaño.

## Pendientes conocidos (ver README.md → "Próximos pasos" para el detalle)

- Backend real para "Mi plan" (Netlify Database + Functions) — hoy los datos
  antropométricos y el objetivo cognitivo solo viven en `localStorage`.
- **Descartado**: trazos tipo "marcador" dispersos por el sitio (estilo
  ilustrado, en verde de marca). Se probó en una sesión, se revirtió por no
  convencer visualmente y por romper el layout del título de Visión al
  envolver una palabra en un `<span>` dentro de un `h2` con
  `display:flex` (ver `changelog.md`, entrada "Revertidos los trazos tipo
  marcador"). Si se retoma la idea, evitar envolver palabras sueltas
  dentro de contenedores `display:flex` sin antes revisar cómo se
  comporta el wrapping, y validar el estilo visual con el usuario antes
  de aplicarlo a las 6 secciones de una vez.
- No hay más tareas de diseño pendientes anotadas por el usuario a la
  fecha de esta entrada; si pide más ajustes de estilo, este documento
  debe actualizarse con las nuevas decisiones tomadas.
