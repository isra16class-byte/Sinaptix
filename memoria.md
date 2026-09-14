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
  encuesta guardada. Reutiliza exactamente el mismo cálculo y la misma
  escala de color que ya usaban los anillos de "Método", para que ambos
  coincidan si se miran los dos.
  - `gaugeComputeAreas`, `gaugeColorForPercent` y sus helpers de color
    (`gaugeHexToRgb`, `gaugeLerp`, `gaugeRgbToHex`, `GAUGE_LOW/MID/HIGH`)
    se movieron de `js/script.js` a `js/nutricion-planes.js` (compartido)
    — son funciones puras de cálculo, sin DOM, así que no hubo que
    duplicar nada. `js/script.js` conserva solo lo que sí es específico de
    los anillos SVG de índice (`gaugeArc`, `gaugeBuildItem`,
    `renderMethodGauges`).
  - **Comparación "antes → después" (sesión que conectó `sinaptix_reevaluacion`
    con este gráfico)**: al igual que los anillos de "Método", el gráfico de
    barras ya **no** es un solo punto en el tiempo. `gaugeFechaCorta` y
    `gaugeDeltaHtml` (antes solo en `js/script.js`, específicas de los
    anillos) también se movieron a `js/nutricion-planes.js` porque ahora
    las usan ambas pantallas con el mismo criterio visual (texto "Antes:
    X% (+N pts)" en verde/rojo/gris según la diferencia).
  - `nutriBuildBarChartHTML(objetivo, reeval)` en `js/nutricion-planes.js`
    **cambió de firma**: antes recibía solo la encuesta
    (`nutriBuildBarChartHTML(encuesta)`), ahora recibe el objeto completo
    `sinaptix_objetivo` (`objetivo`, necesita `objetivo.fecha` para la
    leyenda) y, opcional, el objeto `sinaptix_reevaluacion` completo
    (`reeval`, o `null`/`undefined` si no existe). Si `reeval` es
    `null`/`undefined`, se comporta exactamente igual que antes (una sola
    foto). Si existe, cada barra muestra el valor de la reevaluación como
    "actual" y debajo un `<p class="gauge-delta">` con el valor previo y
    la diferencia; al final se agrega una leyenda de fechas
    (`.gauge-dates.bar-chart-dates`, reutiliza la clase `.gauge-dates` de
    los anillos). Se llama desde `pintarMiPlan(user)` en `js/mi-plan.js`,
    que ahora lee `localStorage.getItem('sinaptix_reevaluacion')` (mismo
    patrón try/catch que `renderMethodGauges` en `script.js` para datos
    corruptos) y se lo pasa como segundo argumento.
  - Estilos nuevos/ajustados en `css/styles.css`: `.bar-chart-card`,
    `.bar-chart-title`, `.bar-chart-text`, `.bar-item` (wrapper nuevo por
    fila, para poder meter el `.gauge-delta` debajo de cada `.bar-row` sin
    romper el `margin-bottom` entre filas), `.bar-row`, `.bar-label`,
    `.bar-track`, `.bar-fill`, `.bar-pct`, y `.bar-item .gauge-delta`
    (indenta el delta para que quede alineado bajo el track, no bajo el
    label) — reutilizan las variables de color/tipografía existentes
    (`--paper-2`, `--line`, `--panel-line`, `--font-d`, `--font-m`), no
    hay ninguna librería de gráficos nueva (Chart.js, etc.): son `<div>`
    con `width` en porcentaje, simple CSS.
  - Se muestra/oculta igual que antes: si todavía no hay
    `sinaptix_objetivo` guardado, `#miPlanBarras` queda oculto (no hay
    datos que graficar todavía). La reevaluación sigue siendo opcional —
    solo se genera desde el modal `#modalReevaluacion` en la sección
    "Método" de `index.html` (no hay, todavía, una forma de reevaluar
    directamente desde `mi-plan.html`).
  - **Paso 6 del wizard** (`.nutri-hint` de "Cómo te sentís día a día", en
    `index.html` y `mi-plan.html`): se le agregó una segunda oración
    explicando que esas 4 preguntas alimentan este gráfico y se van a
    poder comparar más adelante — para que quede claro por qué se siguen
    preguntando aunque ya se haya elegido un objetivo (justificación en
    `plan-mejoras-mi-plan-y-encuesta.md`, sección 4.2, que el usuario
    subió como documento de planeación previo a esta sesión).
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
- **Peso y talla en el paso 2: resumen + "Actualizar" en vez de inputs
  vacíos para volver a completar** (sesión que implementó el punto 3 de
  `plan-mejoras-mi-plan-y-encuesta.md`, sección 4.2 — "lógica condicional
  para no repetir datos ya conocidos"): si el usuario ya registró peso y
  talla en "Registrar datos antropométricos" (`#modalAntropometria`,
  guardado en `sinaptix_antropometria`), el paso 2 ya **no** muestra los
  dos inputs de Peso/Talla para volver a completarlos — muestra una frase
  resumen ("Ya tenemos tu peso y talla registrados (fecha) — 70 kg, 175
  cm.") con un botón "Actualizar peso y talla" que revela los inputs si
  el usuario quiere cambiarlos. Edad y sexo biológico **sí** se siguen
  mostrando como inputs/select normales (solo se prellenan), porque son
  más rápidos de confirmar con un vistazo que peso/talla y no tienen el
  mismo problema de "dos campos numéricos vacíos para volver a llenar".
  - Markup nuevo en `index.html` y `mi-plan.html` (paso 2, idéntico en
    ambos): el `.modal-row` de Peso/Talla ahora tiene `id="nutriAntroInputs"`,
    y justo debajo se agregó `<div class="nutri-antro-resumen hidden"
    id="nutriAntroResumen">` con un `<p id="nutriAntroResumenTexto">` y el
    botón `#btnNutriAntroEditar` (`.btn.btn-ghost`, mismo lenguaje visual
    que los CTA de "Método"). Reemplaza al viejo `<p id="nutriAntroHint">`
    (ya no existe).
  - Lógica en `resetNutriWizard()` (`js/nutricion-wizard.js`): si
    `sinaptix_antropometria` tiene `peso` **y** `tallaCm`, arma el texto
    del resumen (reutiliza `gaugeFechaCorta`, de `js/nutricion-planes.js`,
    para la fecha corta) y oculta `#nutriAntroInputs` / muestra
    `#nutriAntroResumen`; si no, es al revés (inputs visibles, resumen
    oculto) — mismo comportamiento que antes para quien no tiene datos
    guardados. **Los inputs de peso/talla se prellenan igual aunque estén
    ocultos** (no se vacían), así que si el usuario ve el resumen y no
    hace click en "Actualizar", `nutriCollectData()` sigue leyendo el
    mismo peso/talla que ya tenía guardado — no hace falta ninguna rama
    especial en el submit del formulario.
  - **Sentido inverso (sesión "Auto-guardar antropometría desde la
    encuesta de nutrición"): si NO hay `sinaptix_antropometria` guardada
    pero sí se completa peso/talla en este paso 2**, al enviar la
    encuesta (paso 8) esos datos se guardan automáticamente como
    `sinaptix_antropometria` — así no hace falta ir aparte a "Registrar
    datos antropométricos" para que el medidor de IMC de "Mi plan"
    aparezca. Función compartida `nutriGuardarAntropometriaSiFalta(d)` en
    `js/nutricion-planes.js` (recibe el objeto de `nutriCollectData()`,
    valida los mismos rangos que `#formAntro` en `js/script.js`, y solo
    guarda si no había un registro previo — nunca pisa uno ya existente).
    Se llama justo antes de `localStorage.setItem('sinaptix_objetivo', ...)`
    en los dos handlers de `submit` del wizard (`js/script.js` para
    `index.html`, `js/mi-plan.js` para la encuesta inline de "Mi plan").
    Si peso/talla quedaron vacíos (son opcionales) o fuera de rango, no
    guarda nada. Esto es independiente del punto anterior (prellenar
    desde antropometría ya existente): uno cubre "ya tengo mis datos, no
    me los vuelvas a pedir", este cubre "recién los puse acá, no me hagas
    repetirlos en el otro formulario".
  - El click en `#btnNutriAntroEditar` solo alterna las clases `hidden`
    (mismo patrón `classList.toggle`/`add`/`remove` que el resto del
    sitio) para volver a mostrar los inputs; no hay forma de "volver" al
    resumen sin cerrar y reabrir el wizard (`resetNutriWizard` se encarga
    de eso la próxima vez).
  - Probado con un script de Node + `jsdom` (no hay browser de Playwright
    instalado en este entorno, ver nota más abajo) que carga el
    `#formNutricion` real de `index.html` y corre `resetNutriWizard()` con
    tres escenarios: sin antropometría guardada, con peso+talla guardados,
    y con antropometría que no incluye peso/talla (solo edad/sexo) — los
    tres se comportan como se espera.
- **Convención visual de obligatorio/opcional** (desde la sesión que sacó
  la palabra "opcional"): todos los campos de `#formNutricion` tienen una
  etiqueta visible (`.nutri-field-label` para inputs/selects sueltos, o el
  `<span class="nutri-field-label">` que ya se usaba para grupos de
  checkbox/radio) — ya **no** queda ningún campo con `<label class=
  "sr-only">` + placeholder como única referencia. Los obligatorios llevan
  `<span class="req" aria-hidden="true">*</span>` pegado al final del
  texto de la etiqueta (asterisco rojo, clase nueva en `css/styles.css`,
  usa `var(--red)`); los opcionales no llevan ningún símbolo ni la palabra
  "opcional" en ningún lado (ni en la etiqueta ni en el placeholder). Hay
  una frase aclaratoria una sola vez, debajo de la intro del formulario:
  "Los campos marcados con \* son obligatorios." **Si se agrega un campo
  nuevo a esta encuesta en el futuro, seguir este mismo patrón** (etiqueta
  visible + `.req` si es obligatorio, nada si no lo es) en vez de volver
  al patrón de `sr-only` + placeholder.

**Los 4 planes en sí no cambiaron ni se descartaron** — siguen siendo los
mismos 4 objetivos que ya existían en el select (`Mejorar concentración`,
`Reducir fatiga mental`, `Sostener memoria de trabajo`, `Manejo de estrés
mental`), ahora con contenido real por plan (`NUTRI_PLANES` en
`js/nutricion-planes.js` — **no** en `js/script.js`, se movió ahí cuando
se extrajo la lógica compartida entre `index.html` y `mi-plan.html`, ver
más arriba): enfoque, nutrientes clave, alimentos a priorizar, a moderar
y, desde la sesión que implementó el punto 4 de
`plan-mejoras-mi-plan-y-encuesta.md` (sección 4.3), un **"día tipo"**
(`diaTipo`, 4 entradas `{momento, detalle}`: Desayuno/Snack/Almuerzo/Cena)
por plan. Se agregó una quinta opción al select, `"No estoy seguro / varios
objetivos"`, que **no es un plan nuevo**: dispara
`nutriResolverObjetivo`, que compara las 4 escalas del paso 6 y devuelve
el/los plan(es) existentes con puntaje más alto (si hay empate, muestra
más de uno, cada uno con su propio "día tipo").

- **"Un día tipo" en el resumen del plan** (`nutriBuildResumenHTML`, en
  `js/nutricion-planes.js`): se agregó como cuarto bloque dentro de cada
  plan (después de "Moderar"), renderizado como una grilla
  (`.nutri-dia-tipo` → `.dia-tipo-item` × 4, `grid-template-columns:
  repeat(auto-fit,minmax(130px,1fr))`) en vez de una lista más — se
  envuelve sola según el ancho disponible (2 columnas en el modal angosto
  de `index.html`, hasta 4 en el panel más ancho de `mi-plan.html`), sin
  necesitar JS de resize como el truco de sangrado de `.lam-title-frame`
  (ver más abajo). El contenido de cada `diaTipo` **no es información
  nutricional nueva**: son combinaciones de los mismos alimentos que ya
  estaban en `priorizar`/`moderar` de cada plan, organizados por momento
  del día — no se inventó ningún alimento o nutriente que no estuviera ya
  en la tabla de contenido de los 4 planes. Si el objetivo es "No estoy
  seguro" y hay empate, cada plan combinado muestra su propio "día tipo"
  por separado (no se mezclan las comidas de los dos planes en una sola
  grilla).

**Tabla de conexiones** (`nutriConstruirAjustes` / `nutriConstruirAvisos`
en `js/nutricion-planes.js`) — así es como las respuestas modifican el
plan antes de mostrarlo:
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
  nivel `'alto'` de validar el plan con un profesional antes de
  aplicarlo — no bloquea el envío, solo lo marca.

**Avisos graduados** (desde la sesión del punto 5 de
`plan-mejoras-mi-plan-y-encuesta.md`, sección 4.2): `nutriConstruirAvisos`
ya **no** devuelve strings, devuelve objetos `{nivel, texto}` con
`nivel` `'moderado'` o `'alto'`. `nutriBuildResumenHTML` usa `nivel` para
elegir la clase CSS: `'moderado'` → `.nutri-note` (fondo dorado, el
estilo que ya existía), `'alto'` → `.nutri-note.nutri-note--alto` (fondo
rojo, clase nueva en `css/styles.css`). Si se agrega un aviso nuevo en el
futuro, tiene que devolver este mismo shape `{nivel, texto}` o
`nutriBuildResumenHTML` rompe (asume `a.nivel`/`a.texto`, ya no `a` como
string).

- **Sueño**: antes disparaba solo (`d.sueno` <6h o `d.calidadSueno` ≤2).
  **Decisión tomada con el usuario en esta sesión**: ahora exige
  *además* estrés alto (`d.estres >= 4`) — alguien con mal sueño pero
  estrés bajo/medio ya no ve ningún aviso de sueño. Es intencional, no
  un bug; si se quiere volver a que sea independiente, es cuestión de
  sacar el `&& estresAlto` de esa condición.
- **Eje combinado nuevo**: `d.estres >= 4` **y** `d.fatiga >= 4` a la vez
  → aviso propio de magnesio/complejo B (antes no existía; lo mencionaba
  el documento original como "Plan 4" pero no estaba implementado).
- **Cafeína**: `'4 o más al día'` → nivel `'alto'` (mismo texto de
  siempre); `'2 a 3 al día'` → nivel `'moderado'` **nuevo** (antes ese
  escalón no generaba ningún aviso).
- **Ultraprocesados**: `'A diario'` → nivel `'alto'` (mismo texto de
  siempre); `'Algunas veces por semana'` → nivel `'moderado'` **nuevo**
  (antes tampoco generaba aviso).
- `.nutri-summary` ya tenía `gap:12px` en su `display:flex`, así que con
  varios avisos a la vez (ahora es un caso común, antes casi no pasaba)
  no hizo falta tocar el espaciado del contenedor.

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

## Interruptor "Mi progreso" / "Mi IMC" (`#methodGauges`, sección 03)

Desde esta sesión, `#methodGauges` (la tarjeta descrita arriba) **ya no
pinta directo su contenido en el propio `#methodGauges`** — ahora es un
contenedor fijo con un interruptor tipo pestañas + dos paneles que se
alternan, porque el usuario pidió poder elegir entre ver los anillos de
progreso o el medidor de IMC en esa misma sección (antes solo existían
los anillos ahí; el medidor de IMC solo vivía en "Mi plan").

- **Estructura en `index.html`**, dentro de `<aside id="methodGauges">`:
  - `.gauges-switch` (`#gaugesSwitch`): dos botones, `#btnVerProgreso` y
    `#btnVerImc` (`role="tab"`, `aria-selected`). Estilo pill/segmented
    control (`.gauges-switch-btn`, activo = `.is-active`).
  - `#methodGaugesProgreso`: el panel de los anillos — es el mismo
    contenido que antes se pintaba en `#methodGauges` a secas;
    `renderMethodGauges()` (`js/script.js`) solo cambió su `el` de target,
    ninguna otra lógica de esa función se tocó.
  - `#methodGaugesImc`: panel nuevo, pintado por `renderMethodImc()`
    (`js/script.js`). Reusa el mismo medidor semicircular SVG que
    `mi-plan.html` (arcos `.imc-zone-*` fijos + `.imc-aguja` rotada) y las
    funciones compartidas `imcCategoria`/`imcGaugeAngulo` de
    `js/nutricion-planes.js` — no hay una tercera copia de los umbrales
    de IMC. Si no hay `sinaptix_antropometria` en `localStorage`, muestra
    un estado vacío con botón `#btnGaugeAntro` que abre
    `#modalAntropometria` (el click se delega sobre `#methodGaugesImc`
    porque el botón se crea dentro de HTML inyectado por `innerHTML`,
    mismo patrón que `#btnGaugeDiagnostico`/`#btnReevaluar`).
- **`setGaugesView(view)`** (`'progreso'` o `'imc'`): togglea `.hidden` en
  ambos paneles y `.is-active`/`aria-selected` en ambos botones — solo un
  panel visible a la vez. **Se llama una única vez, `setGaugesView
  ('progreso')`, al final del arranque de `js/script.js`** — el
  interruptor siempre abre en "Mi progreso" por decisión explícita del
  usuario, sin importar si ya hay un IMC guardado. No hay persistencia de
  la pestaña elegida entre recargas (a propósito: si se agrega en el
  futuro, usar una clave nueva de `localStorage`, no reemplazar el
  default).
- **`renderMethodImc()` se repinta**, además de al cargar la página, en:
  el submit de `#formAntro` (justo después de guardar
  `sinaptix_antropometria`) y en ambas ramas (con/sin sesión) del submit
  del wizard de nutrición en `js/script.js` — por si
  `nutriGuardarAntropometriaSiFalta` guardó antropometría por primera vez
  ahí. Así el panel de IMC no queda desactualizado sin recargar, aunque
  esté oculto en ese momento (repintar un panel oculto es barato, es solo
  `innerHTML` de un `<div>` chico).
- Si en el futuro se agrega una tercera gráfica a esta tarjeta, seguir el
  mismo patrón: un botón más en `.gauges-switch`, un panel más como
  hermano de `#methodGaugesProgreso`/`#methodGaugesImc`, y sumar esa rama
  a `setGaugesView` (hoy es un booleano `showImc`, pasaría a comparar
  contra el string `view` en cada rama en vez de invertir un solo flag).
- Verificado simulando el DOM de `index.html` con **jsdom** (no
  Playwright — ver limitación de red ya anotada en la sección de anillos
  de progreso, sigue vigente en esta sesión): estado inicial con
  "Progreso" activo y "IMC" oculto; click en "Mi IMC" alterna paneles y
  estado de botones; con un IMC de prueba guardado en `localStorage`,
  `renderMethodImc()` pinta número/categoría/color correctos; volver a
  "Mi progreso" alterna de nuevo. **Pendiente**: verificación visual real
  en navegador (layout del `.gauges-switch` sobre el fondo de
  `.method-gauges`, responsive ≤900px) en cuanto haya acceso a Playwright.

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

**Título de "Mi plan" (`#miPlanConSesion`) sin eyebrow y en Caveat, una sola línea**
(sesión posterior a la que armó el dashboard, feedback viendo el resultado
real): el usuario pidió sacar el `eyebrow` ("Mi plan") de arriba del título
porque no aportaba y pidió que "Tu progreso con SINAPTIX" usara la misma
tipografía manuscrita del título de Pilares (`#lam-04`) en vez de Fraunces,
y que entrara en una sola línea (antes se partía en dos, ocupando espacio
vertical sin dar impacto). Se resolvió con una clase nueva reusable,
`.title-hand` (en `css/styles.css`): mismo `font-family:var(--font-hand)`
(Caveat) + `letter-spacing:0` + `font-size:clamp(40px,6vw,68px)` que ya
tenían `#lam-03 .lam-title`/`#lam-04 .lam-title`, pero sin acoplarla a un
`id` de sección — se aplicó `class="lam-title title-hand"` solo al `h2` de
`#miPlanConSesion`, con `style="max-width:28ch"` (antes `16ch`) para que
entre en una línea. **A propósito no se tocó** el resto de `.lam-title`
de `mi-plan.html` (el de "Iniciá sesión para ver tu plan" en
`#miPlanSinSesion`, ni el de la encuesta inline "Creamos tu plan de
neuroalimentación") — siguen en Fraunces. Si se quiere aplicar Caveat a
algún otro título puntual en el futuro, reusar `.title-hand` en vez de
acoplar el cambio a un `id` de sección.

**Espaciado vertical recortado, menos scroll** (sesión posterior, feedback
contra la imagen de referencia: "en la de nosotros se nos va casi toda la
pantalla"): `#miPlan` heredaba el padding vertical genérico de `section`
(`130px 0 110px`, pensado para las secciones tipo slide de `index.html`)
y el `margin-top:100px` de `footer` — mucho más aire del que necesita una
pantalla de utilidad/dashboard como esta. Se recortó **solo para
`#miPlan`** (`section`/`footer` genéricos no se tocaron, `index.html`
sigue igual): `#miPlan{padding:104px 0 56px}`,
`#miPlan footer{margin-top:48px}`, menos margen alrededor del título/email
del header (`#miPlanConSesion .sec-head-center .lam-title`/`.lam-text`),
`.miplan-subhead` con menos `margin-bottom`, el segundo subhead con
`margin-top:26px` en vez de `40px` (en `mi-plan.html`), y el padding
interno de `.stat-box`/`.bar-chart-card`/`.miplan-cierre`/`.nutri-summary`
bajado de `26-28px` a `20px` dentro de `#miPlan`. **Importante**: esta
sesión fue exclusivamente sobre espaciado — la tipografía del título
(`.title-hand`, Caveat) de la sesión anterior no se tocó ni se discutió,
sigue vigente.

**Dos bugs reales corregidos tras diagnóstico contra la referencia**: la
tarjeta `.miplan-cierre` tenía `align-self:stretch` (se sacó — la
referencia la muestra compacta, del alto de su contenido, no estirada
para igualar la columna de al lado) y `#miPlanDetalle`/`#nutriResumen`
(`.nutri-summary`) se pintaba en una sola columna larga con todas las
listas apiladas, mucho más alta que en la referencia (que agrupa el
mismo contenido en pares de columnas). Se resolvió **sin tocar
`nutriBuildResumenHTML`** (sigue siendo el mismo HTML/función
compartida con el paso 8 del wizard de `index.html`): a partir de
`680px` de viewport, `#miPlan .nutri-summary` pasa a `column-count:2`
(CSS multi-columna tipo diario) con `break-after`/`break-inside:avoid-
column` en títulos y listas para que no se corten a la mitad — scoped a
`#miPlan`, así que el modal angosto de `index.html` no se ve afectado.
Los botones de "Cierre" pasan de apilados a lado a lado
(`flex-direction:row`), porque con la tarjeta ya compacta apilarlos no
hacía falta. **Lección para sesiones futuras**: si un ajuste de padding
"alrededor" de un bloque no achica el scroll como se esperaba, revisar
primero si el contenido *adentro* de ese bloque es el que está ocupando
más alto del necesario (como acá) antes de seguir recortando márgenes
por fuera.

## Layout tipo dashboard de "Mi plan" (`.miplan-*`, `mi-plan.html`)

A partir de una imagen de referencia que trajo el usuario (mockup de "Mi
plan" reorganizado, con encabezados "Datos Clave" y "Detalle del Plan de
Nutrición" y las mismas frutas decorativas que ya usa el sitio), se
reacomodó `#miPlanConSesion` en una grilla de 2 columnas más densa en vez
de una sola columna larga apilada. **No se crearon componentes de datos
nuevos ni se tocó ningún `id`** — son los mismos de siempre (medidor de
IMC, tarjeta de objetivo, gráfico de barras, resumen del plan armado por
`nutriBuildResumenHTML`, botones de acción), solo reordenados en el
markup; `js/mi-plan.js` no necesitó ningún cambio.

- **Encabezado centrado**: eyebrow + `h2.lam-title` + email quedan
  envueltos en `.sec-head-center` (clase ya existente, la misma que usan
  los títulos centrados de Método/Pilares en `index.html`) — antes estaban
  alineados a la izquierda.
- **`.miplan-subhead`**: subtítulo de sección nuevo (texto normal, no
  `.eyebrow` ni `.lam-title`) — hay dos en la página: "Datos clave" y
  "Detalle del plan de nutrición".
- **`.miplan-grid`** (2 columnas, `@media(max-width:900px)` colapsa a 1):
  a la izquierda el `stat-box` del medidor de IMC (`#miPlanImc` y todo lo
  que ya existía, sin cambios); a la derecha `.miplan-col` (flex-column)
  con dos tarjetas apiladas:
  - `.stat-box.miplan-objetivo`: la tarjeta de objetivo cognitivo, ahora
    con un ícono (`img/Iconos/icon-neuronas.webp`, reusado del set de
    Pilares — ver sección "Iconos ilustrados..." de este archivo) arriba
    de una etiqueta itálica ("Objetivo cognitivo principal") y el valor
    (`#miPlanObjetivo`) debajo — antes el valor iba primero y la etiqueta
    después, como en el resto de `.stat-box`.
  - `#miPlanBarras` (`.bar-chart-card`, el gráfico de barras de
    Foco/Memoria/Energía/Calma): sin cambios internos, solo cambió de
    posición (antes vivía debajo del `stat-grid` a ancho completo).
- **`.miplan-detalle-grid`** (2 columnas, mismo breakpoint de colapso):
  a la izquierda `#miPlanDetalle` (`.nutri-summary`, el detalle del plan
  armado por `nutriBuildResumenHTML` — sin cambios); a la derecha una
  tarjeta nueva, `.miplan-cierre` ("Cierre"), que agrupa el texto de
  `#miPlanCta` (el mensaje que invita a generar el plan, oculto vía JS
  cuando ya hay uno guardado, igual que antes) y los botones "Generar mi
  plan" (`#btnAbrirNutricionMiPlan`) / "Cerrar sesión" (`#btnLogout`) —
  antes esos dos botones quedaban sueltos al final de la columna única,
  sin agrupar visualmente con ningún texto.
- Si se agrega contenido nuevo a "Mi plan" en el futuro que necesite su
  propia fila del dashboard, seguir el mismo patrón: un `.miplan-subhead`
  + una grilla `.miplan-grid`/`.miplan-detalle-grid` (o una nueva si la
  proporción de columnas no calza con ninguna de las dos) en vez de volver
  a apilar todo en una sola columna.
- **Pendiente de verificación visual real**: mismo problema de red que
  otras sesiones anotadas en este archivo — Playwright no pudo instalar
  Chromium en este entorno (descarga bloqueada por la whitelist de
  dominios). Se verificó con jsdom (estructura del DOM, anidado de las
  grillas, unicidad de `id`) y con la librería `css` de npm (que
  `css/styles.css` sigue parseando sin errores con los selectores nuevos
  presentes), pero no hay captura de pantalla real. Revisar en cuanto haya
  acceso a Playwright: que `.miplan-cierre` no quede desproporcionada en
  alto/bajo respecto a `.nutri-summary` cuando el plan tiene mucho
  contenido (varios avisos + "día tipo"), y el responsive ≤900px (ambas
  grillas colapsan a 1 columna, pero no se vio en pantalla real).

## Medidor de IMC tipo velocímetro (`.imc-gauge`, "Mi plan")

Antes el IMC en "Mi plan" era solo un número pelado (`#miPlanImc`), sin
ningún contexto de si era bajo, normal, alto, etc. Ahora tiene un medidor
semicircular (SVG) con aguja + categoría en texto + leyenda de colores.

- **Cálculo y categorías**: `imcCategoria(imc)` vive en
  `js/nutricion-planes.js` (compartida, ya no duplicada) y devuelve
  `{cat, zona}`. Umbrales (los mismos de siempre, no cambiaron):
  `<18.5` bajo peso, `18.5–24.9` peso saludable, `25–29.9` sobrepeso,
  `≥30` **"rango a vigilar"** — se mantiene ese término en vez de
  "obesidad" (decisión de tono ya tomada por el usuario, coherente con
  que el sitio ya evitaba la palabra clínica). `js/script.js` (el
  formulario de antropometría de `index.html`) ahora llama a esta misma
  función en vez de tener su propia copia de los umbrales — si se cambia
  un umbral en el futuro, se cambia en un solo lugar.
- **Geometría del arco**: también en `js/nutricion-planes.js`,
  `imcGaugeAngulo(imc)` mapea el IMC a un ángulo (180°→0°) sobre un
  rango fijo de display `IMC_GAUGE_MIN=15` / `IMC_GAUGE_MAX=40` — valores
  fuera de ese rango se recortan **solo para la posición de la aguja**,
  nunca para el número exacto que se muestra al lado (ese siempre es el
  IMC real, sin recortar). Los 4 arcos de color (`.imc-zone-*` en
  `mi-plan.html`) son `<path>` con coordenadas **fijas** (siempre
  representan los mismos umbrales) — lo único dinámico es la rotación de
  `#miPlanImcAguja` vía `transform="rotate(deg cx cy)"` seteado desde JS
  (`js/mi-plan.js`, dentro de `pintarMiPlan`), calculado como
  `90 - imcGaugeAngulo(imc)`. Si se necesita este mismo medidor en otro
  lado, reusar `imcCategoria`/`imcGaugeAngulo` en vez de recalcular los
  umbrales o el mapeo de ángulos a mano.
- **Color**: mismo criterio que los avisos graduados (ver más abajo) —
  dorado (`--gold`) para atención moderada (bajo peso y sobrepeso), rojo
  (`--red`) para alto (rango a vigilar), verde (`--green`) para
  saludable. Se aplica tanto a los arcos como al texto de la categoría
  (`.imc-cat-*`) y a los puntos de la leyenda (`.imc-dot-*`).
- **Estado sin datos**: el gauge, la categoría y la leyenda arrancan con
  `class="hidden"` en el HTML y solo se muestran (`classList.remove
  ('hidden')`) dentro de `pintarMiPlan` si existe
  `sinaptix_antropometria` en localStorage — si no hay datos, se ve
  igual que antes (placeholder "—" + "Aún no registras tus datos
  antropométricos"), sin el medidor roto o vacío.
- Verificado con Playwright (Chromium headless, con un stub de
  `window.netlifyIdentity` inyectado vía `addInitScript` ya que el script
  real de `identity.netlify.com` no carga en este sandbox — 403): 4
  capturas forzando `sinaptix_antropometria` con un IMC de cada zona
  (16.8, 22.1, 27.4, 33.9) confirmando que la aguja cae en el arco
  correcto y el texto/color de categoría coincide, más una captura sin
  datos guardados, más una prueba del formulario real de `index.html`
  (`#formAntro`) para confirmar que `imcCategoria` compartida no le
  rompió el resultado ni el guardado en `sinaptix_antropometria`.

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

## Decoraciones extra, glow lila y tipografía manuscrita en el Hero (`lam-01`)

Sesión que sumó densidad decorativa al hero, un tinte de color a la
derecha, y unificó la tipografía del `<h1>` con la de los títulos
manuscritos de Método/Pilares (ver sección "Títulos manuscritos tipo
'marcador'..." más arriba en este archivo — es la misma fuente, `--font-
hand`, aplicada ahora también acá).

- **Decoraciones nuevas**: además de las que ya había (walnut abajo-
  izquierda, berries arriba-derecha, 6 `deco-espiga`), se agregaron 6
  `<img class="deco">` más, reutilizando SVGs de `svg/` que ya existían
  pero no se usaban en el hero: `deco-blob-orange`, `deco-blob-avocado`,
  `deco-blob-kiwi`, `deco-leaf-beneficios`, un `deco-espiga` extra, y
  `svg/signal-wave.svg` (la línea tipo electrocardiograma que hasta ahora
  solo se usaba como separador en `#lam-04`) a modo de "señal de vida" en
  el centro del hero.
  - **Por qué se pudo poner cosas "en el centro" sin que choquen con el
    texto ni con el cerebro**: `.deco` tiene `z-index:0` y `.wrap` (donde
    vive todo el contenido real) tiene `z-index:1` — todo lo que se agregue
    como `.deco` queda automáticamente detrás del contenido. Esto significa
    que una decoración "en el centro" no tapa nada mientras se ubique en un
    hueco visual real del layout (el gap de 60px entre las dos columnas del
    `.hero-grid`, el espacio entre el párrafo y los botones, encima del
    `btn-row`, cerca del `hero-foot`), pero **si se pusiera detrás de texto
    sólido quedaría invisible** — no vale la pena agregar una decoración
    ahí porque no se va a ver. Antes de agregar una decoración nueva en el
    centro del hero, ubicarla mentalmente (o revisando en pantalla) en un
    hueco, no debajo de una línea de texto.
  - Las decoraciones centradas usan `left:50%` + `transform:translateX
    (-50%) rotate(...)` en vez de `left`/`right` en px como las de los
    costados — funciona porque `.wrap` está `margin:0 auto` (centrado en
    el viewport sea cual sea el ancho de pantalla), entonces `left:50%`
    del `<section>` cae siempre sobre el eje central del contenido.
  - No hizo falta tocar ningún media query: las reglas ya existentes
    `@media(max-width:720px){.deco-fruit{display:none}}` y
    `.deco-scribble{display:none}` ocultan también las piezas nuevas en
    mobile (todas llevan esas mismas clases).
  - Si se pide "más densidad" todavía en el futuro, quedan sin usar en el
    hero: `deco-blob-almonds.svg`, `deco-dots-contacto.svg`, y por
    supuesto se puede repetir cualquiera de las ya usadas con otra
    posición/rotación (como ya se hace en el resto del sitio).
- **Glow lila diluido a la derecha**: `.hero.dark` ya tenía un
  `radial-gradient` de fondo (`--panel`→`--paper`). Se le puso **encima**
  una segunda capa `radial-gradient(55% 60% at 96% 30%,rgba(113,75,103,.16)
  0%,rgba(113,75,103,0) 72%)` — `rgba(113,75,103,...)` es el mismo
  `--purple` de marca (`#714B67`) expresado en rgba para poder diluirlo a
  `.16` de opacidad y que se apague del todo (`,0)`) antes de llegar al
  bloque de texto de la izquierda. No se creó ninguna variable de color
  nueva; si se quiere más o menos intensidad, tocar solo el `.16` (subirlo
  se nota más morado, bajarlo se pierde).
- **`<h1>` del hero ahora usa `--font-hand` (Caveat)**, igual que
  `#lam-03 .lam-title`/`#lam-04 .lam-title`: mismo `font-weight:700` y
  `letter-spacing:0`. Como Caveat "pesa" visualmente menos que la Fraunces
  que usaba antes (heredada de la regla genérica `h1,h2,h3`), se subió el
  `clamp()` de tamaño de `44px–80px` a `58px–104px` y el `line-height` de
  `1.02` a `1.08` para compensar — si en el futuro se cambia de fuente acá
  otra vez, revisar si hace falta un ajuste de tamaño parecido, Caveat no
  es 1:1 con una serif al mismo `font-size`. También se sacó el
  `font-style:italic` de `.hero h1 em` (queda `normal`): Caveat solo está
  cargado en pesos `600;700` sin itálica real (ver el `<link>` de Google
  Fonts en `<head>` de `index.html`), y una itálica sintética sobre una
  fuente ya cursiva se veía forzada — la palabra "claridad" se distingue
  con el color `--purple` nada más.
- **Verificación visual**: a diferencia de sesiones anteriores (ver notas
  de "pendiente de verificación visual real" en otras secciones de este
  archivo), en esta sesión Playwright **sí pudo instalar/lanzar Chromium**
  y se confirmó con capturas reales (servidor local +
  `page.screenshot`) que ninguna decoración nueva choca con texto, botones
  ni con la imagen del cerebro. La fuente de Google (`fonts.googleapis.
  com`) seguía bloqueada por la red restringida de *esta sesión de
  trabajo*, así que para confirmar el cambio de tipografía se instaló
  Caveat como fuente de sistema únicamente para tomar la captura de
  prueba — no se tocó ningún archivo del repo por esto, y en el sitio real
  (con internet normal) el `<link>` de Google Fonts que ya existía en
  `index.html` la carga sin problema.

## Frutas fotográficas flotando alrededor del cerebro (`.brain-fruit`, Hero)

El usuario pidió, mostrando una imagen de referencia (cerebro con frutas
reales — cereza, arándanos, nuez, uvas — flotando alrededor, conectadas
con líneas punteadas), replicar ese efecto en el hero usando fotos propias
que ya tenía subidas en `img/imagenes-frutas/` (5 JPG genéricos
`Gemini_Generated_Image_*.jpg`, con fondo blanco liso, no transparente).

- **Por qué hizo falta procesarlas antes de usarlas**: a diferencia de los
  iconos ilustrados de `img/Iconos/` (que tenían fondo tipo ajedrez
  horneado en los píxeles, ver sección "Iconos ilustrados..." más abajo),
  estas 5 fotos tenían fondo **blanco liso de foto de producto**, pero con
  dos problemas propios que un flood-fill simple no resuelve:
  1. Cada foto trae una sombra ovalada de estudio (gris, no blanco puro)
     debajo de la fruta — si solo se quita "lo blanco puro" queda un
     borrón gris/blanco pegado abajo de cada fruta, muy notorio al ponerlas
     flotando sobre el fondo claro del hero.
  2. Algunas fotos (las uvas) tienen huecos de fondo blanco **internos**,
     no conectados al borde de la imagen (el hueco entre el tallo y los
     granos) — un flood-fill que solo arranca desde el borde no los
     detecta y quedan como parches blancos flotando en medio de la fruta.
- **Script de procesamiento** (Python, Pillow + numpy + scipy, no quedó
  guardado en el repo — se corrió una sola vez sobre los 5 JPG ya
  existentes, igual que pasó con el script de los iconos de `img/Iconos/`;
  si hace falta reprocesar o agregar una fruta nueva del mismo estilo,
  recrear esta lógica):
  1. Detectar todas las regiones "casi blancas" (los 3 canales RGB por
     encima de un umbral, ~232) de la imagen completa, **sin exigir que
     toquen el borde** — así se resuelven a la vez el fondo exterior y los
     huecos internos tipo el de las uvas. Solo se descartan del recorte
     final las regiones clarísimas demasiado chicas (brillos/reflejos
     sobre la piel de la fruta, esos se dejan como parte de la textura).
  2. Aplicar un **desvanecido vertical** (`alpha *= rampa lineal`) que
     apaga gradualmente todo lo que quede en el ~20% inferior de la foto
     — ahí es donde vive la sombra ovalada de estudio en las 5 fotos, y
     como es gris (no blanco puro) el paso 1 no la eliminaba del todo.
     Este desvanecido es la clave que evita el "borrón" bajo la fruta.
  3. Erosionar el primer plano ~2px + `GaussianBlur(1.4)` sobre el canal
     alpha para que el borde no quede dentado (mismo criterio que ya se
     usaba para los iconos de `img/Iconos/`).
  4. Recortar al bounding box real del contenido (`alpha > 12`) con 6px de
     margen, para no cargar de más "aire" transparente alrededor.
  5. Reescalar a máx. 600px de lado y exportar a WebP (`quality=90`).
- **Archivos resultantes**, en el mismo `img/imagenes-frutas/` (los 5 JPG
  originales se dejan igual, como backup/referencia, no se usan
  directamente en el sitio — mismo criterio que los JPG de Gemini en
  `img/Iconos/`): `fruta-nuez.webp`, `fruta-cereza.webp`,
  `fruta-arandanos.webp`, `fruta-uvas.webp`, `fruta-fresa.webp`.
- **HTML**: las 5 `<img class="brain-fruit bf1..bf5">` se agregan dentro
  de `.synapse-art`, como hermanas del `<svg>` de líneas/puntos y del
  `div.brain-art` (no adentro de `.brain-art`, que es solo para la
  ilustración del cerebro y sus `.brain-spark`). Se ubicaron **encima de
  los mismos puntos de conexión que ya dibujaba el SVG** (los `<circle>`
  en `cx/cy` de un viewBox `0 0 500 500`), convirtiendo esas coordenadas a
  porcentaje (`cx/500*100`, `cy/500*100`) para que cada fruta quede en la
  punta de la línea punteada correspondiente, igual que en la imagen de
  referencia:
  - `bf1` nuez → `left:14%;top:23%` (esquina superior izquierda, punto
    `70,120`).
  - `bf2` cereza → `left:87%;top:16%` (esquina superior derecha, punto
    `440,90`).
  - `bf3` arándanos → `left:10%;top:78%` (esquina inferior izquierda,
    punto `60,380`).
  - `bf4` uvas → `left:88%;top:80%` (esquina inferior derecha, punto
    `430,380`).
  - `bf5` fresa → `left:3%;top:47%` (a la izquierda, a media altura) —
    esta es la única **sin** punto/línea correspondiente en el SVG (no
    había un quinto punto dibujado), se agregó "libre" para dar más
    densidad, igual que en la imagen de referencia tiene una fruta extra
    suelta además de las que sí están conectadas.
- **CSS (`.brain-fruit`)**: cada imagen es un elemento absoluto centrado
  sobre su punto con `transform:translate(-50%,-50%)` **fijo**, y la
  animación de flotación (`@keyframes brain-fruit-float`, nueva, separada
  de `@keyframes float` que ya usaba `.brain-art-img`) redeclara ese mismo
  `translate(-50%,-50%)` en cada paso del keyframe junto con el
  `translateY` — **si se hubiera reusado el `@keyframes float` genérico
  (que solo anima `translateY`), la animación habría pisado el
  `transform` estático de centrado** y las frutas se hubieran ido
  corriendo de posición en vez de quedarse centradas sobre su punto y
  solo flotar verticalmente. Si se agrega otro elemento flotante que
  también necesite un `transform` fijo de posicionamiento (rotación,
  centrado, etc.), tener el mismo cuidado: no combinarlo con una
  animación de `transform` genérica ya existente, sino declarar un
  `@keyframes` propio que incluya la parte fija en todos sus pasos.
  - `filter:drop-shadow(...)` propio (más marcado que el de `.deco-fruit`,
    `0 14px 26px`) porque estas fotos son mucho más realistas/detalladas
    que los blobs SVG y necesitan más profundidad para leerse como que
    "flotan" y no que están pegadas al cerebro.
  - `animation-delay` distinto por clase (`bf2`..`bf5`) para que no
    floten todas sincronizadas, mismo criterio que `.deco-fruit.d2/d3`.
  - `z-index:4`, por encima de `.brain-art`
    (`z-index:2`) y del SVG de fondo (sin `z-index`, queda por debajo de
    ambos) — las frutas se ven "por encima" del cerebro cuando se
    superponen en los bordes, igual que en la referencia.
  - `@media(max-width:640px){.brain-fruit{display:none}}`: en mobile el
    `.synapse-art` se achica mucho (el grid pasa a una columna) y 5 fotos
    reales flotando alrededor de un cerebro ya chico se ve saturado y
    compite con los `.brain-spark`; se ocultan solas, mismo patrón que
    `.deco-fruit`/`.deco-scribble` en el resto del sitio (aunque el corte
    ahí es en `720px`, acá se bajó a `640px` porque en el layout de una
    columna el `.synapse-art` todavía se ve bien de tamaño hasta ese
    ancho).
- **Verificación visual real**: esta sesión sí tuvo Playwright/Chromium
  disponible. Se confirmó con capturas en desktop (1600px), tablet (800px)
  y mobile (400px) que: las 5 frutas quedan bien ubicadas alrededor del
  cerebro sin halos blancos ni sombra residual, la animación de flotación
  se nota (se comparó una captura contra otra tomada ~1.8s después), y en
  ≤640px se ocultan limpio sin dejar huecos raros en el layout.
- Si se pide sumar más densidad de frutas reales al hero en el futuro,
  reusar el mismo criterio (procesarlas con el mismo script/pasos antes de
  usarlas, no directamente los JPG con fondo blanco) y, si es posible,
  ubicarlas sobre los puntos ya existentes del SVG en vez de inventar
  coordenadas nuevas, para que la línea punteada siempre apunte a algo.

## Identidad visual de "Mi plan" alineada con el resto del sitio (`mi-plan.html`)

Pedido del usuario: que "Mi plan" (`mi-plan.html`) tenga el mismo estilo
visual que ya tiene el resto del sitio (`index.html`), no solo comparta
`css/styles.css` de forma genérica. Antes de esta sesión, `#miPlan` era la
única sección `.dark` de todo el sitio **sin una sola decoración SVG** —
`index.html` tiene entre 2 y 7 elementos `.deco` por sección (frutas,
espigas de trigo, círculos, puntos), pero `mi-plan.html` no tenía
ninguno — se veía plana/genérica en comparación.

- **Decoraciones agregadas** (como hijos directos de `<section
  id="miPlan">`, antes de `.wrap`, mismo patrón que cualquier sección de
  `index.html` — no se creó ningún asset nuevo, todo reutiliza
  `svg/*.svg` ya existente). Primera pasada: 4 elementos (circles-vision
  arriba a la derecha + 1 fruta + 2 espigas). El usuario vio el resultado
  desplegado y pidió explícitamente "aumentale frutas y más cositas", así
  que se sumaron 4 más en la misma sesión — **son 8 en total**, repartidos
  en todo el alto de la sección (arriba, a la mitad, y cerca del footer),
  no solo en la cabecera:
  - `deco-circles-vision.svg` (los mismos círculos de fondo de la sección
    Manifiesto), muy sutil (`opacity:.12`), arriba a la derecha — encaja
    con el tono de "panel/dashboard" de esta pantalla mejor que una fruta.
  - 4 frutas (`deco-fruit`, con flotación): `deco-blob-kiwi.svg` abajo a
    la izquierda, `deco-blob-orange.svg` a la izquierda a la altura del
    título/párrafo, `deco-blob-avocado.svg` a la derecha a la altura del
    `stat-grid`/gráfico de barras, `deco-blob-almonds.svg` a la izquierda
    más abajo, cerca de los botones de CTA/footer.
  - 3 `deco-espiga.svg` (espigas de trigo) en 3 esquinas distintas
    (arriba-derecha, abajo-izquierda, abajo-derecha), ángulos distintos
    — mismo criterio de "espigas cruzadas" que usan lam-02/04/05/06, acá
    con una tercera para que la esquina inferior derecha (donde antes no
    había nada) también tenga acento.
  - Si se pide aumentar todavía más la densidad decorativa en el futuro,
    seguir sacando de los mismos `svg/deco-*.svg` ya existentes (hay
    `deco-blob-walnut.svg`, `deco-blob-berries.svg` y
    `deco-leaf-beneficios.svg` sin usar todavía en esta página) en vez de
    generar assets nuevos — es el patrón que sigue todo `index.html`.
  - Se **evitó a propósito** el tratamiento `.title-mark` (subrayado tipo
    marcador debajo de una palabra del título) que sí usan los `<h2>` de
    `index.html`: la sección "Pendientes conocidos" de este mismo archivo
    ya documenta que esa idea se probó y se revirtió una vez por romper
    el wrapping dentro de contenedores `flex`; no vale la pena
    reintroducir ese riesgo en un título que además es left-aligned acá
    (el patrón existente es para títulos centrados en `.sec-head-center`).
- **Fix de contraste real, no solo decorativo**: `#miPlan` es una sección
  `.dark` (fondo `--panel`, `#F7F1F5`). Las tarjetas que ya vivían ahí
  (`.stat-box`, `.bar-chart-card`) usan `--paper-2` (`#FAF7F9`, un tono
  casi idéntico a `--panel`) y `.nutri-summary` usa `--panel` **directo**
  (el mismo color exacto, sin borde propio) — en `index.html` esto no se
  nota porque esas mismas clases se usan sobre fondo blanco (`stat-grid`
  de Manifiesto, que no es `.dark`) o dentro del modal blanco
  (`.nutri-summary` en `#modalNutricion`, `.modal-card` usa `--paper`).
  En "Mi plan" sí se notaba: las tarjetas casi no se distinguían del
  fondo de la sección, y la tarjeta de resumen del plan
  (`#miPlanDetalle`/`#nutriResumen`, ambas `.nutri-summary`) quedaba
  **sin ningún borde ni contraste**, prácticamente invisible como
  tarjeta. Se agregó en `css/styles.css`:
  ```css
  #miPlan .stat-box,
  #miPlan .bar-chart-card{background:var(--paper)}
  #miPlan .nutri-summary{background:var(--paper);border:1px solid var(--line)}
  ```
  Mismo tratamiento que ya usa `.method-gauges` (blanco puro `--paper`)
  sobre su propia sección oscura en Método — no se tocó ninguna de estas
  clases fuera de `#miPlan`, así que `index.html` sigue exactamente
  igual.
- Si se agrega una tarjeta nueva a "Mi plan" en el futuro, aplicar el
  mismo criterio: fondo `--paper` (blanco puro) cuando la tarjeta vive
  dentro de una sección `.dark`, no `--paper-2` ni `--panel` (ambos se
  confunden con el fondo de la sección en ese contexto).
- **Pendiente de verificación visual real**: mismo problema de red que
  el resto de esta sesión — Playwright no pudo instalar Chromium. Se
  verificó con jsdom que las 4 imágenes decorativas quedan como hijas
  directas de `#miPlan` (antes de `.wrap`, mismo nivel que en
  `index.html`) y que el selector `#miPlan .nutri-summary` alcanza tanto
  a `#miPlanDetalle` como a `#nutriResumen`, y con la librería `css` que
  la hoja de estilos sigue parseando sin errores tras el cambio — pero no
  hay captura de pantalla real confirmando que las decoraciones y el
  contraste se ven bien en el navegador. Si una sesión futura tiene
  Playwright, conviene revisar sobre todo el espaciado del blob
  `deco-blob-kiwi` cerca del botón "Cerrar sesión" del estado sin plan
  generado, y el responsive ≤900px (las clases `.deco-fruit`/
  `.deco-scribble` ya se ocultan solas en `max-width:720px`, pero no se
  vio en pantalla real).

## Iconos ilustrados en secciones 02 y 04 (`img/Iconos/`)

Los iconos de línea SVG originales de la sección "Nuestra visión" (que no
tenía iconos, solo números) y "Pilares nutricionales" (4 `<svg
class="pillar-icon">` inline) se reemplazaron por un set de 8 iconos
ilustrados estilo "glossy 3D gradient bubble" (parecido a los iconos de
producto de Firefox/Mozilla), generados con Gemini a partir de prompts que
usan la paleta de marca (`--navy-bright`, `--green`, `--gold`, `--purple`).

- **Archivos fuente en `img/Iconos/`**: los 8 JPG originales que bajó el
  usuario de Gemini (`Gemini_Generated_Image_*.jpg`, nombres genéricos sin
  relación con el contenido) se conservan como referencia/backup por si
  hay que regenerar algo, pero **no se usan directamente en el sitio**.
- **Archivos usados en el sitio** (mismo directorio, formato WebP,
  256×256, con transparencia real): `icon-energia-cerebral.webp`,
  `icon-neuronas.webp`, `icon-semanas.webp`, `icon-acompanamiento.webp`
  (sección 02) e `icon-omega3.webp`, `icon-antioxidantes.webp`,
  `icon-complejo-b.webp`, `icon-hidratacion.webp` (sección 04).
- **Por qué hubo que procesarlos**: los JPG de Gemini no traen canal alfa
  — lo que se ve como "fondo transparente" en la vista previa de Gemini es
  en realidad un patrón de ajedrez gris/blanco **horneado en los píxeles
  de la imagen**. Se limpiaron con un script Python (Pillow + numpy +
  scipy) que detecta los 2 tonos de ajedrez por imagen (no son
  exactamente iguales entre archivos — uno de los iconos tiene además un
  efecto de esfera de vidrio semitransparente que deja ver el ajedrez a
  través, eso sí es parte del diseño original y se dejó tal cual), hace
  flood-fill desde los bordes, cierra huecos de ruido de compresión JPEG y
  erosiona 2px el borde para quitar el flequillo punteado remanente. El
  script no quedó guardado en el repo (se corrió una sola vez sobre los
  JPG ya commiteados); si hace falta reprocesar algún icono nuevo del
  mismo estilo, recrear la lógica: detectar color de ajedrez por imagen
  (no asumir un valor fijo), usar `scipy.ndimage.binary_closing(...,
  border_value=1)` — **ojo con el `border_value` por defecto (0), rompe el
  flood-fill en el borde real de la imagen** —, y erosionar ~2px el
  primer plano antes de exportar a WebP.
- **CSS**: `.stat-icon` (40×40, `margin-bottom:14px`, dentro de
  `.stat-box`) y `.pillar-icon-img` (56×56, `object-fit:contain`, dentro
  de `.pillar`, que ya es flex-column con `gap:16px` así que no hace
  falta margin manual). La clase vieja `.pillar-icon` (para los SVG de
  línea) se eliminó de `css/styles.css`.
- **Pendiente de verificación visual real**: esta sesión no llegó a
  confirmar en navegador (ni con `wkhtmltoimage` ni Playwright) que los 8
  iconos se vean bien alineados y con buen contraste dentro de
  `.stat-box`/`.pillar`. Revisar sobre todo que el `object-fit:contain` de
  `.pillar-icon-img` no deje los iconos redondos con bordes raros al lado
  del texto, y que el icono de "neuronas" (con efecto vidrio) se vea bien
  sobre el fondo claro de `.stat-box`.

## Backend real para Mi plan (Netlify Database + Netlify Functions)

Implementa el punto 1 de "Próximos pasos" (README.md): los 3 bloques de
datos de "Mi plan" (`sinaptix_antropometria`, `sinaptix_objetivo`,
`sinaptix_reevaluacion`) ahora también se guardan en el servidor cuando hay
sesión iniciada, no solo en `localStorage`. Diseño elegido: **`localStorage`
sigue siendo la única fuente que lee el resto del sitio** (`pintarMiPlan`,
`renderMethodGauges`, el medidor de IMC, etc.) — no se tocó ninguna de esas
lecturas. Lo que se agregó es un "espejo" hacia el servidor por encima de
eso, no un reemplazo.

> **Corrección importante (sesión posterior a la implementación
> original)**: la primera versión de este backend usaba el paquete
> `@netlify/neon` (la extensión "Neon" de Netlify DB, en beta). Al probarlo
> en un sitio real desplegado, la función fallaba en **todas** las
> invocaciones con `[@netlify/neon] Failed to instantiate Neon client:
> connection string is not provided ... (NETLIFY_DATABASE_URL)`. Investigando
> con el usuario se confirmó la causa raíz: **esa extensión quedó
> deprecada** — Netlify bloqueó la creación de bases nuevas vía
> `@netlify/neon`/`NETLIFY_DATABASE_URL` desde abril de 2026, reemplazada
> por **Netlify Database**, ahora GA (general availability), con el
> paquete nativo `@netlify/database` y su propia variable `NETLIFY_DB_URL`.
> Como el sitio nunca había llegado a provisionar una base con la extensión
> vieja (era un sitio nuevo), no había forma de que la variable apareciera.
> **Segunda corrección (misma sesión de fix)**: resuelto el paquete, el
> siguiente deploy tiró un error distinto —
> `MissingDatabaseConnectionError: The environment has not been configured
> to use Netlify Database` — a pesar de que el log del deploy confirmaba
> que el provisioning de la base se había completado bien. Causa raíz,
> confirmada contra la guía oficial de troubleshooting de Netlify
> Database: `netlify/functions/plan.js` estaba escrita con la firma
> **clásica** (`exports.handler = async function(event, context)`), que
> Netlify reconoce como **"Lambda compatibility mode"** — y esa
> documentación dice explícitamente que en ese modo la connection string
> de Netlify Database **no se inyecta automáticamente al runtime de la
> función** (es el único primitivo de la plataforma donde hay que
> pasarla a mano). El fix fue migrar la función al **formato moderno**
> (`export default`, Web `Request`/`Response`), no seguir con la firma
> clásica. Ver el detalle técnico completo más abajo en esta misma
> sección — todo lo que sigue ya describe la versión con ambas
> correcciones aplicadas.

- **`netlify/functions/plan.mjs`** (nota: extensión `.mjs`, no `.js` — ver
  por qué en el bullet de autenticación/formato más abajo): una sola
  función, `GET` devuelve `{antropometria, objetivo, reevaluacion}` (solo
  las claves que ese usuario ya guardó — nunca `null` explícito, para que
  el cliente no pise localStorage con vacío), `POST` recibe `{tipo, datos}`
  y hace upsert de **una sola columna** (`tipo` es uno de `antropometria` /
  `objetivo` / `reevaluacion`, validado contra una lista fija antes de
  interpolarlo en el SQL — no es una columna arbitraria del body) sin
  tocar las otras dos que ya tuviera guardadas ese usuario, porque cada
  formulario del sitio llama a esto en un momento distinto.
  - `GET` usa `db.sql` (tagged template de `@netlify/database`): los
    valores interpolados (acá, `user.id`) se bindean como parámetros
    reales de forma segura.
  - `POST` usa `db.pool` (un `pg.Pool` crudo que expone `@netlify/database`
    para casos que `db.sql` no cubre) porque necesita interpolar un
    **nombre de columna** (`tipo`) en el texto de la query — eso no se
    puede hacer con los placeholders de un tagged template (esos son solo
    para valores, no para identificadores). El resto de los valores sí van
    con placeholders `$1/$2/$3` normales.
- **La tabla `mi_plan` ya NO se crea en runtime** (a diferencia del diseño
  original con `CREATE TABLE IF NOT EXISTS` en cada invocación de la
  función): con Netlify Database, el esquema se maneja **solo** vía
  archivos de migración en `netlify/database/migrations/`, que Netlify
  aplica automáticamente durante el deploy — nunca a mano ni desde el
  código de la función. Este repo tiene una sola migración,
  `netlify/database/migrations/20260913231933_create_mi_plan.sql`, con el
  `CREATE TABLE mi_plan (...)` (mismas 6 columnas de siempre: `user_id`
  primary key = identificador único del usuario, `email`, `antropometria`,
  `objetivo`, `reevaluacion` como `jsonb`, `updated_at`). **Una vez
  aplicada esta migración en cualquier entorno (local, preview o
  producción), no se edita** — un cambio de esquema futuro (una columna
  nueva, un índice) va en un archivo de migración nuevo, no modificando
  este.
- **Autenticación y formato de la función (corregido en la segunda parte
  de esta sesión de fix)**: la versión original tenía
  `exports.handler = async function(event, context)` (formato clásico) y
  leía `context.clientContext.user`. Netlify reconoce esa firma como
  **"Lambda compatibility mode"**, y en ese modo **no inyecta la
  connection string de Netlify Database al runtime** — de ahí el segundo
  error (`MissingDatabaseConnectionError`) tras corregir el paquete. El
  fix fue migrar el archivo al **formato moderno de Netlify Functions**:
  - Archivo renombrado de `plan.js` a **`plan.mjs`** (extensión `.mjs` para
    forzar ES modules explícitamente, sin depender de si el `package.json`
    más cercano tiene `"type":"module"` — que este repo no tiene, y no
    hacía falta agregarlo solo por esto).
  - `export default async (req, context) => {...}` en vez de
    `exports.handler`; `req` es un `Request` estándar de la Web
    (`req.method`, `await req.json()`), la respuesta se arma con
    `Response.json(...)` en vez de `{statusCode, body}`.
  - Autenticación vía **`getUser()` de `@netlify/identity`** (paquete
    nuevo, agregado a `package.json`) en vez de
    `context.clientContext.user`: `getUser()` lee sola el header
    `Authorization: Bearer <access_token>` de la request entrante (lo
    sigue mandando `js/plan-sync.js`, sin cambios ahí) y devuelve el
    usuario ya verificado o `null` — es el mecanismo que documenta Netlify
    para Identity en el formato moderno de Functions. `user.id` reemplaza
    a lo que antes era `user.sub` (mismo identificador único del usuario,
    solo cambia el nombre de la propiedad en este paquete).
  - **Sigue sin verificarse end-to-end en un deploy real** (ver "Pendiente
    de verificación real" más abajo): el diagnóstico y el fix se armaron
    contra la documentación oficial de troubleshooting de Netlify
    Database y de `@netlify/identity`/Functions, pero esta sesión no tuvo
    forma de reproducir el error ni de confirmar un `GET`/`POST` exitoso
    de punta a punta contra un sitio desplegado real.
- **Base de datos**: **Netlify Database** (Postgres, GA), acceso vía el
  paquete oficial `@netlify/database` — `getDatabase()` devuelve una
  conexión (`db.sql` para tagged-template queries, `db.pool` para SQL
  crudo/transacciones) sin que haga falta pasar ninguna connection string
  a mano; se autoconfigura con la variable de entorno `NETLIFY_DB_URL` que
  Netlify inyecta sola (**no** `NETLIFY_DATABASE_URL`, esa es la variable
  de la extensión vieja/deprecada — no confundir ambas si se vuelve a
  tocar este archivo) **siempre que la función use el formato moderno**
  (ver bullet anterior — en Lambda compatibility mode esta variable no se
  inyecta). **Provisionamiento automático**: al tener `@netlify/database`
  listado en `package.json` (el sitio sigue sin build step propio, ver
  `netlify.toml`), Netlify provisiona la base y aplica la migración de
  `netlify/database/migrations/` en el próximo
  `netlify dev`/`netlify build`/push — no hace falta ningún paso manual en
  el dashboard, a diferencia de "Enable Identity" que sí sigue siendo
  manual (ver sección de requisitos del README). Se agregó `.gitignore`
  (no existía) con `node_modules/` porque ahora hay
  `package.json`/`package-lock.json` versionados.
- **`netlify.toml`**: tiene el bloque `[functions]` con
  `directory = "netlify/functions"` y `node_bundler = "esbuild"` — Netlify
  auto-detecta esa carpeta igual sin el bloque, pero se dejó explícito. No
  hizo falta agregar nada nuevo a `netlify.toml` para Netlify Database (a
  diferencia de Functions, no tiene un bloque de configuración propio acá).
- **`js/plan-sync.js`** (nuevo, compartido entre `index.html` y
  `mi-plan.html`, se carga después de `nutricion-wizard.js` y antes de
  `script.js`/`mi-plan.js` — mismo orden que ya usa `nutricion-planes.js`):
  - `planSyncGuardar(tipo, datos)`: llamada "fire and forget" — si hay
    sesión, manda `{tipo, datos}` por `POST` a la función; si falla
    (sin red, función caída), solo un `console.warn`, nunca bloquea el
    formulario que la llamó. Sin sesión, no hace nada (el dato ya quedó en
    `localStorage` por el código que ya existía antes de esta sesión).
  - `planSyncCargar()`: `GET` a la función, mezcla la respuesta en
    `localStorage` (el servidor manda: si trae un bloque, pisa el que
    hubiera en este navegador — puede venir de otro dispositivo; un bloque
    ausente en la respuesta no borra nada local). Nunca rechaza la
    promesa, atrapa sus propios errores y devuelve `null` si algo falla,
    para que quien la llame no necesite un `.catch` aparte.
- **Puntos donde se enganchó `planSyncGuardar`** (los 3 mismos lugares que
  ya escribían en `localStorage`, sin cambiar nada de su lógica existente,
  solo agregando la llamada justo después del `setItem`):
  - `js/script.js`, submit de `#formAntro` (antropometría, `index.html`).
  - `js/script.js`, submit de `#formNutricion` (objetivo/plan, `index.html`).
  - `js/script.js`, submit de `#formReevaluacion` (reevaluación).
  - `js/mi-plan.js`, submit del wizard inline de nutrición en
    `mi-plan.html` (objetivo/plan).
  - `js/nutricion-planes.js`, `nutriGuardarAntropometriaSiFalta` (el
    autoguardado de antropometría desde el paso 2 de la encuesta cuando
    todavía no había un registro previo) — esta función ya tenía un efecto
    secundario de `localStorage` antes de esta sesión (ver su comentario
    original más arriba en este archivo), así que sumarle el de red acá es
    consistente con eso, no una excepción nueva a "son funciones puras".
- **Punto donde se enganchó `planSyncCargar`**: `js/mi-plan.js`,
  `mostrarEstadoConSesion` (se llama tanto desde el evento `init` como
  `login` de Identity) — ahora es quien decide cuándo pintar: espera a
  `planSyncCargar()` (que nunca falla hacia afuera) y recién después llama
  a `pintarMiPlan(user)`, para que la pantalla se pinte con los datos ya
  mezclados del servidor. No se agregó en `index.html`/`script.js` porque
  esa página ya no muestra el contenido de "Mi plan" in-place — al hacer
  login ahí se redirige directo a `mi-plan.html` (ver más arriba en este
  mismo archivo), que es donde vive toda la lectura.
- **Por qué no se usó Drizzle**: para una sola tabla de 6 columnas y 3
  tipos de upsert, SQL crudo via `@netlify/database` (`db.sql`/`db.pool`)
  alcanza y evita sumar una herramienta más a un repo que no tenía build
  step ni `package.json` hasta la sesión que agregó este backend. Lo que
  **sí** es obligatorio con `@netlify/database` (a diferencia del diseño
  original con `@netlify/neon`) es que el esquema viva en migraciones —
  eso ya está resuelto (ver arriba), no es algo pendiente. Si en el futuro
  se agregan más tablas o relaciones, ahí sí conviene evaluar Drizzle (la
  guía de Netlify Database ya trae ese camino armado, con
  `drizzle-orm@beta`).
- **Verificado en producción real** (deploy `master@94d6ba4`, confirmado
  por el usuario): con la función ya en formato moderno (`plan.mjs`) y
  `@netlify/database`, "Mi plan" guardó y cargó el plan correctamente con
  sesión real iniciada — el ciclo completo (`getUser()` de
  `@netlify/identity` resolviendo el usuario desde el header
  `Authorization`, `getDatabase()` conectando sin
  `MissingDatabaseConnectionError`, el `POST` con columna interpolada vía
  `db.pool`, y el `GET` trayendo los datos de vuelta) funciona de punta a
  punta. Los dos bugs de esta sesión de fix (paquete deprecado +
  Lambda compatibility mode) están resueltos y confirmados, no solo
  diagnosticados. Queda pendiente, no por dudas sobre si funciona sino
  como validación adicional a futuro, confirmar la persistencia entre dos
  navegadores/dispositivos distintos con la misma cuenta (no se probó
  específicamente ese caso) y el costo/consumo de créditos de Functions +
  Netlify Database en el plan usado.

## Fotos de comida generadas (`img/generadas` / `img/generadas-cutout`)

- El usuario sube fotos/ilustraciones de alimentos generadas (estilo
  "cutout" con fondo blanco) a **`img/generadas/`** (jpg, sin
  transparencia): `granada.jpg`, `chocolate.jpg`, `curucma.jpg` (nombre de
  archivo con ese typo, ojo al referenciarlo), `espinaca.jpg`, `filete.jpg`
  (en realidad es una posta/rodaja de salmón), `huevo.jpg`, `remolacha.jpg`,
  `semilla chia.jpg` (con espacio en el nombre), `te.jpg`, `aceite de
  oliva.jpg` (con espacios), más una imagen suelta sin usar
  (`Gemini_Generated_Image_ot5quuot5quuot5q.jpg`).
- Como esos jpg tienen fondo **blanco sólido, no transparente**, no se
  pueden usar directamente como decoración flotante sobre secciones con
  fondo de color (`section.dark`) sin que se note un recuadro blanco. Se
  generó una segunda carpeta, **`img/generadas-cutout/`**, con versiones
  `.webp` con el fondo removido (transparencia real) y recortadas a su
  contenido (bounding box + padding), con nombres normalizados sin espacios
  ni typos: `granada.webp`, `chocolate.webp`, `curcuma.webp`,
  `espinaca.webp`, `filete.webp`, `huevo.webp`, `remolacha.webp`,
  `semilla-chia.webp`, `te.webp`, `aceite-oliva.webp`.
  - Removido con un script puntual (no versionado, no forma parte del
    repo): por cada imagen, se calculó una máscara alfa según la distancia
    de cada píxel al blanco puro (`(255,255,255)`), con una rampa suave
    entre umbrales (~8 a ~45 de distancia euclídea) para no perder
    anti-aliasing en los bordes; después se recortó al bounding box del
    contenido con relleno de 8px. Si en el futuro se suben más imágenes
    "cutout" con fondo blanco, se puede repetir el mismo enfoque en vez de
    pedir el recorte manual en otra herramienta.
  - **Si el usuario sube una imagen nueva a `img/generadas/` y pide
    usarla como decoración**, primero hay que generarle su versión cutout
    en `img/generadas-cutout/` (mismo proceso), no usar el jpg original
    directamente en una sección con `class="deco deco-fruit"`.
- **Dónde se usaron** (ver detalle en la sección de LAM-02/05/06 más abajo
  en este archivo): son decoraciones flotantes, mismo tratamiento visual
  que ya tenían las frutas del hero (`.deco-fruit`: animación de flotación
  + `drop-shadow`, se ocultan automáticamente por CSS en mobile
  `max-width:720px`), **no** son contenido informativo — son
  `aria-hidden="true"` con `alt=""`, puramente decorativas.

## Decoraciones nuevas en LAM-02 / LAM-05 / LAM-06 (fotos de comida)

Antes de esta sesión, `lam-02` (Visión), `lam-05` (Beneficios) y `lam-06`
(Contacto) solo tenían blobs SVG (`svg/deco-blob-*.svg`, `deco-espiga.svg`,
etc.) como decoración — a diferencia del hero, que ya combinaba blobs SVG
con fotos flotantes de fruta (`.brain-fruit`, `img/imagenes-frutas/`). El
usuario pidió unificar el estilo agregando fotos de comida (de
`img/generadas-cutout/`, ver sección de arriba) como decoración flotante en
esas tres secciones, igual que el resto de la página. Los SVG existentes
**no se tocaron**, solo se agregaron `<img>` nuevas con
`class="deco deco-fruit"` (reutiliza la animación/drop-shadow ya definida
en `css/styles.css`, no se agregó CSS nuevo) intercaladas entre los decos
existentes de cada sección, con posiciones/rotaciones/opacidades a mano
para no chocar con el contenido real (todas van detrás del contenido:
`.deco` tiene `z-index:0`, `.wrap` tiene `z-index:1`).

- **`lam-02`**: `huevo.webp`, `curcuma.webp`, `aceite-oliva.webp`.
- **`lam-05`**: `granada.webp`, `remolacha.webp`, `chocolate.webp`,
  `semilla-chia.webp`.
- **`lam-06`**: `te.webp`, `filete.webp`, `espinaca.webp`.

No se usó `Gemini_Generated_Image_ot5quuot5quuot5q.jpg` (la imagen suelta
sin nombre descriptivo) — si el usuario quiere sumarla a alguna sección,
falta decidir qué alimento es y generarle su cutout.

**No se pudo verificar visualmente el resultado en esta sesión**: se
intentó capturar un screenshot del `index.html` renderizado
(`wkhtmltoimage`) para confirmar que las posiciones/tamaños quedan bien,
pero el entorno de este sesión no tiene acceso de red a
`fonts.googleapis.com`/`identity.netlify.com` (bloqueados por la
configuración de red del sandbox) y además el sitio usa animaciones
"reveal" por `IntersectionObserver` que no dispararon de forma confiable en
el render headless usado para probar. El texto de las tres secciones no se
vio en las capturas de prueba por eso (no es un bug real del sitio), pero
sí se pudieron confirmar posición/tamaño/opacidad de las fotos nuevas
porque los `.deco` son hermanos del `.reveal`, no dependen de él. **Si el
usuario nota algo descuadrado (tamaño, posición, opacidad, choque con
texto) al verlo en un navegador real, avisar en la próxima sesión — los
valores se puede ajustar sin tocar el resto de la sección.**

## Pendientes conocidos (ver README.md → "Próximos pasos" para el detalle)

- ~~Backend real para "Mi plan" (Netlify Database + Functions)~~ —
  implementado y **verificado en producción real** (deploy
  `master@94d6ba4`), ver sección "Backend real para Mi plan (Netlify
  Database + Netlify Functions)" más abajo. Los dos bugs encontrados en el
  camino (paquete deprecado `@netlify/neon`, y luego la función en Lambda
  compatibility mode sin poder recibir la connection string) quedaron
  corregidos y confirmados con un guardado/carga de plan real, con sesión
  real, en el sitio desplegado.
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
