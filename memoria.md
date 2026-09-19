# Memoria del proyecto — SINAPTIX

> Este archivo existe para que **cualquier sesión nueva** (de Claude o de
> quien sea) pueda retomar el trabajo en este repo sin que el usuario tenga
> que volver a explicar el contexto. Léelo completo antes de tocar código.
> Actualízalo en cada patch que generes (ver "Reglas de esta memoria" al
> final).

## Histórico (archivos anteriores de memoria/changelog)

Este archivo y `changelog.md` se archivaron dos veces por tamaño:

- **14/09/2026**: `memoria.md` y `changelog.md` habían crecido a ~2200 y
  ~1960 líneas. Quedaron completos en `historico/memoria-2026-09-14.md`
  y `historico/changelog-2026-09-14.md` (detalle de decisiones de
  diseño/arquitectura hasta esa fecha: paleta, tipografía, wizard de
  nutrición, backend, ilustraciones, ajustes pixel-a-pixel de cada
  sección, etc.).
- **17/09/2026**: volvieron a crecer a ~2060 y ~3400 líneas. Quedaron
  completos en `historico/memoria-2026-09-17.md` y
  `historico/changelog-2026-09-17.md` (todo el detalle de la etapa de
  "Mi plan" con login/registro propios, el rediseño de las 3 tarjetas
  del dashboard, la animación de los anillos de Método, y el proceso
  completo de Visión: reemplazo del fondo por composición generada por
  código, separación de íconos en archivos individuales, y el plan de
  anotaciones en 2 sesiones — incluye todos los intentos descartados,
  bugs encontrados/corregidos y el detalle pixel-a-pixel de cada ajuste).

**Si vas a tocar algo que ya existe en el sitio y esta memoria condensada
no trae el detalle suficiente (por qué se hizo así, qué se probó y se
descartó, ajustes finos de posición/color/tamaño), buscá primero en el
histórico más reciente que mencione el tema** (tienen índice de
secciones con `##`/`###`, es fácil de grepear por palabra clave: sección,
componente, archivo) antes de asumir o rehacer algo que ya se resolvió.
No se repite ese contenido acá para no volver a inflar este archivo.

Si en el futuro esta memoria vuelve a crecer demasiado, repetir el mismo
patrón: archivar con fecha en `historico/`, reiniciar condensado, y
agregar la entrada correspondiente en esta sección.

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
   `https://github.com/isra16class-byte/Sinaptix.git`, rama `main`.
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
   git push origin main   # o master, ver nota de ramas arriba
   ```
7. Nunca se le pide al usuario que pegue código a mano ni que copie/pegue
   diffs: siempre se entrega el `.patch` descargable.

## Reglas de esta memoria (obligatorio en cada patch)

- **`memoria.md`** (este archivo): actualizar la sección "Estado actual del
  diseño / producto" cada vez que cambie algo estructural (paleta, stack,
  secciones, integraciones, decisiones de arquitectura). Es el "estado
  presente", no un historial — se reescribe, no se acumula. Mantenerla
  **condensada**: un párrafo/lista breve por componente, con nombres de
  archivo/clase/id concretos para que se pueda ubicar el código rápido. Si
  una decisión necesita el "por qué" largo (qué se probó, qué se
  descartó, capturas de referencia, ajustes finos iterativos), ese detalle
  va en `changelog.md` (la entrada del patch que lo introdujo) y, si hace
  falta, en `historico/` — no infles esta sección con la historia completa
  de cada ajuste.
- **`changelog.md`**: cada patch agrega **una entrada nueva arriba del
  todo** (orden cronológico inverso) con: fecha de la sesión, resumen corto
  del cambio, y el hash del commit una vez generado el patch (si se
  conoce). Es el "historial", ahí sí se acumula y no se borra nada viejo.
- Si un patch no cambia memoria/changelog, revisar si realmente no hacía
  falta (cambios triviales tipo un typo pueden no requerirlo, pero ante la
  duda, documentar).
- Si `memoria.md` vuelve a crecer mucho (varios cientos de líneas), no
  esperar a que el usuario lo pida: proponer archivarlo con el mismo
  patrón de esta sección "Histórico".

## Producto: qué es SINAPTIX

Landing de una sola página para un servicio de asesoría en
neuroalimentación (nutrición para rendimiento cognitivo). Sitio 100%
estático (HTML/CSS/JS sin build step, salvo las Netlify Functions del
backend), desplegado en Netlify. Ver `README.md` para detalle funcional
completo (formularios, login con Netlify Identity, sección "Mi plan",
próximos pasos).

## Estructura de archivos

- `index.html` — todo el markup del sitio principal, secciones `lam-01` a
  `lam-07` (Hero, Visión, Método, Pilares, Beneficios, Conócenos, Cierre —
  ver "Estado actual del diseño" para el detalle de las dos últimas, que
  antes eran una sola sección "Contacto").
- `mi-plan.html` — página propia (no sección de `index.html`) para "Mi
  plan": nav propio, estado sin sesión (`#miPlanSinSesion`, con
  login/registro propios) y estado con sesión (`#miPlanConSesion`,
  dashboard con IMC, objetivo, gráfico de barras, detalle del plan).
- `css/styles.css` — toda la hoja de estilos (paleta, tipografía, layout).
- `js/script.js` — lógica específica de `index.html` (wizard modal de
  nutrición, formularios, Netlify Identity, anillos de progreso de
  Método, y al final una IIFE que traza la energía morada de Visión).
- `js/mi-plan.js` — lógica propia de `mi-plan.html` (login/registro/
  recuperación de contraseña propios, init de Identity, pintar el plan,
  logout, encuesta inline).
- `js/nutricion-planes.js` — **compartido** entre `index.html` y
  `mi-plan.html`: `NUTRI_PLANES`, `NUTRI_RANGOS`, funciones puras de
  cálculo/render (plan resuelto, gráfico de barras, medidor de IMC,
  validación de campos libres). Debe cargarse **antes** que
  `js/script.js`/`js/mi-plan.js`.
- `js/nutricion-wizard.js` — **compartido**: motor de navegación/validación
  del wizard de 8 pasos (`#formNutricion`), usado tanto por el modal de
  `index.html` como por la encuesta inline de `mi-plan.html`. Se carga
  después de `nutricion-planes.js` y antes de `script.js`/`mi-plan.js`.
- `js/mi-plan-pdf.js` — genera el PDF de "Mi plan" con jsPDF (ver sección
  "PDF de Mi plan" abajo). Se carga en `mi-plan.html` **después** de
  `nutricion-planes.js` (depende de sus funciones puras) y antes de
  `mi-plan.js` (que lo llama desde `pintarMiPlan`).
- `js/plan-sync.js` — **compartido**: sincroniza `localStorage` con el
  backend (Netlify Functions) cuando hay sesión iniciada. Se carga después
  de `nutricion-wizard.js` y antes de `script.js`/`mi-plan.js`.
- `netlify/functions/plan.mjs` — única función serverless, `GET`/`POST`
  de los 3 bloques de datos de "Mi plan" contra Netlify Database.
  **Formato moderno** (`export default`, Web Request/Response) — no usar
  el formato clásico (`exports.handler`), rompe la inyección de la
  connection string. Importa `TIPOS_VALIDOS`/`esTipoValido` desde
  `netlify/functions/plan-validacion.mjs` (módulo aparte, sin imports de
  `@netlify/identity`/`@netlify/database`, para poder testearlo solo).
- `netlify/database/migrations/` — esquema de la tabla `mi_plan` (Postgres,
  vía Netlify Database/`@netlify/database`). El esquema se maneja **solo**
  con migraciones nuevas, nunca editando ni recreando en runtime.
- `svg/`, `img/` — assets. Notables: `svg/deco-scribble-purple.svg` (trazo
  "marcador" de títulos, `--purple-dark`), `svg/icon-{calendario-check,
  red-nodos,conversacion,bateria-rayo}.svg` (íconos de línea de las
  tarjetas de Visión, ver sección Visión abajo),
  `img/decoraciones-neurona/` (fondo de Visión, íconos separados de
  Visión, ilustraciones de "Mi plan"), `scripts/generar-fondo-vision.py`
  y `scripts/separar-iconos-vision.py` (reproducen por código los assets
  de Visión, ver sección Visión).
- `docs/` — documentación visual que no se publica como parte del sitio.
  Hoy: `docs/mockup-pdf-mi-plan.html` (la maqueta aprobada del PDF de
  "Mi plan", para poder mirar y discutir el diseño en el navegador sin
  generar un PDF) y `docs/mockup-collage-redes.html` (alternativa en
  HTML/CSS al collage de IA de Conócenos, **no integrada**, ver "Estado
  actual del diseño"). Ninguna se carga desde una página del sitio.
- `tests/` — tests unitarios (ver sección "Tests" abajo).

## Tests

- **`tests/nutricion-planes.test.js`** — 54 tests con `node --test`
  (nativo de Node, sin dependencias nuevas) sobre las funciones de
  cálculo puro de `js/nutricion-planes.js` (resolución de objetivo,
  ajustes/avisos, antropometría, categoría/gauge de IMC, gauges de
  Método, validación de rango/nombre, escapado HTML). No cubre las que
  arman HTML (`nutriBuildResumenHTML`, `nutriBuildBarChartHTML`) ni el
  contenido de `NUTRI_PLANES` — no son cálculo, quedan fuera a propósito.
  `js/nutricion-planes.js` se carga como `<script>` plano en el navegador
  (sin `export`/`import`); al final tiene un bloque guardado
  (`if(typeof module!=='undefined'...)`) que solo corre bajo Node. El
  test mockea `localStorage` in-memory antes de requerir el módulo.
- **`tests/plan-validacion.test.mjs`** — 5 tests ESM sobre
  `netlify/functions/plan-validacion.mjs` (`esTipoValido`). El resto de
  `plan.mjs` (auth real, SQL real) sigue **sin testear** — solo
  verificable contra un deploy real de Netlify.
- **`tests/mi-plan-pdf.test.js`** — 21 tests con `node --test` sobre las
  funciones puras de `js/mi-plan-pdf.js` (el modelo de datos del PDF). El
  foco es que el modelo salga de la MISMA fuente que el dashboard: cada
  test compara contra `nutriResolverObjetivo`/`gaugeComputeAreas`/
  `imcCategoria`/`nutriConstruirAjustes`/`nutriConstruirAvisos` en vez de
  contra valores escritos a mano, así que si esas funciones cambian, el
  PDF no se queda atrás en silencio. No testea el dibujo.
- **`tests/mi-plan-pdf.e2e.test.mjs`** — 4 subtests con Playwright sobre
  `mi-plan.html` (`netlifyIdentity` mockeado, como el resto del proyecto):
  el botón aparece con sesión + plan guardado, no aparece sin plan, el
  click dispara una descarga llamada `mi-plan-sinaptix.pdf`, y el
  contenido del PDF coincide con los datos del plan (se inspecciona el
  buffer que devuelve jsPDF **antes** de la descarga, inflando los streams
  con `zlib` y leyendo los literales de texto — no hace falta ninguna
  herramienta externa de PDF). También verifica el lazy load: antes del
  click `window.jspdf` es `undefined`.
  - Corre bajo `npm test` como cualquier otro test, pero **Playwright y
    jsPDF NO están en `package.json` a propósito** (el sitio no tiene
    build step y no queremos que Netlify los instale en cada deploy): si
    faltan, el archivo se saltea con un mensaje en vez de fallar. Para
    correrlo: `npm i -D playwright jspdf && npx playwright install chromium`.
  - El CDN de jsPDF se intercepta con `page.route` y se sirve el bundle
    local de `node_modules`, así que el test corre sin red y contra la
    misma versión (3.0.1) que usa producción.
- **Cómo correrlos**: `npm test` (= `node --test`, sin argumentos —
  pasarle `tests/` como argumento lo resuelve como módulo y falla).
- **No se testea a propósito**: diseño/layout (se verifica con Playwright
  ad hoc en cada patch de UI, no hay suite fija).
- **CI**: no hay pipeline (`netlify.toml` con `command=""`). Correr los
  tests es manual antes de generar cualquier patch que toque
  `js/nutricion-planes.js` o `netlify/functions/plan.mjs`/
  `plan-validacion.mjs`.

## Estado actual del diseño (resumen)

- **Timeline "Cómo trabajamos" más chico en mobile (`.tl-*`, `#lam-03`,
  sesión 2026-09-19)**: el usuario mandó una captura a 390px pidiendo
  achicar el flujo de 4 pasos (lo vio grande: círculo de 56px, título
  22px, 56px de aire entre pasos). Escalado ~20% hacia abajo, solo
  dentro de `@media(max-width:900px)` (desktop sin cambios, sin queja
  ahí): `.tl-num` 56→44px (`top:-4px`→`-2px` para seguir centrado contra
  un título más chico, `font-size` 15→13px), `.tl-line{left:22px}`
  (mitad del círculo nuevo, antes 27px = mitad de 56px),
  `.tl-item{padding-left:60px;padding-bottom:40px}` (antes 76/56),
  `.tl-item h3{font-size:18px}` (antes 22px), `.tl-item p{font-size:14px}`
  (antes 15.5px). Verificado con Playwright a 390px (antes/después) y
  1440px (desktop, sin diferencias contra la captura previa al cambio).

- **Espacio Hero→Visión en mobile (`.hero.dark`/`#lam-02`, sesión
  2026-09-19)**: con `.hero-foot` oculto (`≤720px`), la imagen del hero
  quedaba seguida del `padding-bottom` genérico de `section` (70/110px
  según breakpoint) + el `padding-top` genérico de `#lam-02` (90/130px)
  — hasta 215px de blanco medido con Playwright a 390px, reportado por
  el usuario con una captura real como demasiado espacio entre la
  sección 1 y 2. Se recorta **solo** para este par de secciones, dentro
  de `@media(max-width:900px)`: `.hero.dark{padding-bottom:30px}` y
  `#lam-02{padding-top:50px}` (nuevo, con ID así que no interfiere con
  el `padding` genérico de `section` que siguen usando todas las demás).
  Gap resultante medido: 135px (antes 215px). El resto de las
  transiciones entre secciones sigue con el padding genérico sin tocar.
  Verificado con Playwright a 390px (gap medido + captura) y comparado
  el hero de desktop 1440px contra la captura de antes del cambio, sin
  diferencias (el override vive solo dentro del media query mobile).

- **Visión — grilla mobile de las 4 `.stat-annot` (`#lam-02`, sesión
  2026-09-19)**: resuelve el pendiente que ya estaba anotado como "sesión
  2 mobile" (ver más abajo, en pendientes). El usuario mandó una captura
  a 390px: sin `.vision-brain-bg`/`.vision-icons` (ocultos ≤900px), las 4
  anotaciones caían en el fallback simple (columna de puntos sueltos, sin
  ícono ni fondo) con ~134px de blanco antes de la primera por el
  `margin-top:90px` viejo de `.vision-stats-col` (heredado del diseño de
  tarjetas grandes que tuvo esta columna antes). Se ve "muy simple".
  - Fix, todo dentro de `@media(max-width:900px)` y con selector
    `#lam-02` (no toca desktop, ni `.stat-box`/`.stat-grid` de "Mi plan"
    que comparte nombre de variable): `.vision-stats-col` pasa de
    `margin-top:90px` a `12px`. `#lam-02 .stat-annotations` pasa a
    `display:grid;grid-template-columns:1fr 1fr` (2×2, antes columna de
    a 1). Cada `.stat-annot` suma fondo/borde con
    `--vision-card-dorado/morado/verde/azul` (ya existían en `:root`,
    sin uso desde que las tarjetas de caja se reemplazaron por
    anotaciones sueltas — pensadas justo para esto).
  - **Ícono nuevo por tarjeta** (`.stat-annot-icon`, `<img>` agregado en
    `index.html` dentro de cada `.stat-annot`): mismos 4 WebP que ya usa
    `.vision-icon` en desktop (`icon-cerebro`/`icon-red-neuronal`/
    `icon-calendario`/`icon-acompanamiento.webp`, ver sección Visión más
    abajo) — no se generó ningún asset nuevo. Oculto por defecto
    (`display:none`), solo se muestra `display:block` dentro del mismo
    `@media(max-width:900px)`, así que en desktop no existe visualmente
    (sigue con los íconos grandes sueltos sobre el fondo). El
    `.stat-annot-deco` (punto+línea punteada, pensado para apuntar al
    ícono sobre el fondo) se oculta en este rango: sin fondo detrás no
    apunta a nada y se veía como un punto suelto sin sentido.
  - Verificado con Playwright en este entorno a 360/390/760/900px
    (mobile, sin blanco de más, tarjetas legibles) y 1440px (desktop
    comparado píxel a píxel contra la captura de antes del cambio, sin
    diferencias). `npm test` sigue en verde (86 tests).
  - Con esto queda resuelto el bullet "Visión — sesión 2 (mobile +
    limpieza)" de más abajo en cuanto al posicionamiento de las 4
    `.stat-annot` en mobile. Sigue pendiente, sin tocar en esta sesión:
    decidir si se limpian `--vision-card-*` (ahora sí en uso, ya no
    aplica) y las reglas `#lam-02 .stat-box`/`.stat-grid` sin uso real.

- **Hero: hueco para el nav fijo en mobile (`.hero.dark`, sesión
  2026-09-19)**: el nav (`.nav{position:fixed}`) no reserva espacio
  propio en el documento. En desktop no se nota porque el contenido del
  hero entra holgado dentro de `min-height:100vh` y el
  `display:flex;align-items:center` lo centra bien debajo del nav; en
  mobile el título ocupa más líneas y la imagen queda apilada debajo del
  texto, así que el contenido total supera los 100vh, deja de haber
  margen para centrar y el título queda pegado arriba, tapado por el nav
  (reportado por el usuario con una captura a 390px). Fix: dentro del
  `@media(max-width:900px)` que ya colapsa `.hero-grid` a 1 columna, se
  agregó `.hero.dark{padding-top:88px}` — mismo valor que ya usa
  `#miPlan` para este mismo nav compartido. Sin cambios en desktop.
  **No verificado en navegador real ni con Playwright** (sin browser
  instalable en este entorno): el cálculo sale de sumar el padding y la
  altura de línea/botón del nav a mano, no de medirlo en pantalla.

- **Decoración solo del login (`mi-plan.html`, sesión 2026-09-19)**: clase
  `.deco-solo-login` (espejo de `.deco-solo-sesion`; oculta con
  `#miPlan:has(#miPlanSinSesion.hidden)`). 5 espigas (`svg/deco-espiga.svg`)
  en un manojo en el margen izquierdo (grande/mediana/chica) + 2 chicas
  arriba, y 2 frutas nuevas creadas para esto: `svg/deco-blob-strawberry.svg`
  (frutilla) y `svg/deco-blob-grapes.svg` (uva), mismo estilo que los demás
  `deco-blob-*` (200×200, disco translúcido + degradados radiales). La
  frutilla lleva `.deco-solo-login--cerca` y se oculta en ≤1180px (se
  metería detrás de la tarjeta). Posiciones en px desde arriba, elegidas
  para no pisar naranja/aguacate/almendras/kiwi. Detalle y medidas en el
  changelog.
  - **Bajas del 2026-09-19** (pedido del usuario, sobre la pantalla de
    login): se quitaron la **uva** (`svg/deco-blob-grapes.svg`, estaba en
    `left:238px;top:580px`) y las **almendras del margen izquierdo**
    (`svg/deco-blob-almonds.svg`, `left:-20px;bottom:180px`), que era la
    fruta que quedaba justo arriba del kiwi. La uva se reusó después en
    Pilares (ver `#lam-04`) y las almendras siguen usándose en la tarjeta
    del login (`.miplan-locked-fruit is-almonds`), así que ningún asset
    quedó huérfano.
- **Íconos 3D de "Para quién es" en morado/negro (`#lam-05`, sesión
  2026-09-19)**: pedido del usuario tras ver la versión a color de la
  ronda anterior — mismo estilo clay 3D isométrico, pero con la paleta
  del sitio (`--purple-dark` `#4B2E45` para el cuerpo, negro para
  agarres/detalles, un acento chico dorado/azul suave por ícono) en vez
  de colores libres. Mismos 4 archivos, mismo mapeo de significado,
  mismo pipeline: `scripts/recortar-iconos-audiencia.py` (chroma key por
  dominancia de verde, fondo `#00FF00` en los JPG de Gemini) sobre
  `img/Iconos/{icon-maletin,icon-graduacion,icon-equipo,
  icon-reloj-fatiga}.webp` — se sobrescriben los mismos nombres, sin
  tocar `index.html`/CSS. Verificado a mano (composición sobre blanco y
  negro): recorte limpio, sin aro ni halo verde en ninguno de los 4.
  **Sin verificar en navegador real**: no se pudo instalar Playwright en
  esta sesión (sin red a los dominios de descarga del navegador). Las 4
  imágenes de referencia de Gemini no quedaron versionadas en el repo
  (igual que en la ronda anterior de estos mismos íconos).
- **Botón "Actualizar" en "Tu estado actual" + frutas solo con plan
  (`mi-plan.html`, sesión 2026-09-19)**:
  - `#btnActualizarEstado` (`.bar-chart-refresh`) vive en el encabezado de
    `#miPlanBarras` (`.bar-chart-head`), a la derecha del título. Lo genera
    `nutriBuildBarChartHTML(objetivo, reeval, {conBotonActualizar:true})`
    (`js/nutricion-planes.js`; opt-in, único llamador `pintarMiPlan`). Como
    el HTML se recrea en cada repintado, el click está **delegado** sobre
    `#miPlanBarras` (`js/mi-plan.js`). Abre `#modalReevaluacion`
    (`mi-plan.html`): las mismas 4 preguntas que la reevaluación de Método,
    misma clave `sinaptix_reevaluacion` + `planSyncGuardar('reevaluacion')`
    (un dato compartido entre ambas pantallas y el PDF). Esta página no
    carga `js/script.js`, así que abrir/cerrar del modal (×, click fuera,
    Esc, foco de vuelta al botón) vive en `js/mi-plan.js`. Al guardar se
    repinta `pintarMiPlan` y cierra a los 900 ms.
  - **Frutas `.deco-solo-plan`** (remolacha, té, granada, espinaca,
    chocolate; `img/generadas-cutout/`): solo con plan cargado. `pintarMiPlan`
    pone `.has-plan` en `#miPlan` si el detalle quedó visible; CSS:
    `.deco-solo-plan{display:none}` + `@media(min-width:721px){#miPlan.has-plan
    .deco-solo-plan{display:block}}` + oculta con el login a la vista. `top`
    en % de la altura de la sección. Asomadas detrás de las tarjetas entre
    1200 y 780px, igual que las `.deco-solo-sesion`. Ver changelog para
    alternativas no aplicadas (disco pastel detrás, ocultar ≤1200px).
- **Título en tarjeta y botones de Cierre (`mi-plan.html`, sesión
  2026-09-19)**: "Tu progreso con SINAPTIX" vive en `.miplan-titlecard`
  (ancha y baja, pareja con `.miplan-grid`, 3 íconos por lado creciendo
  hacia el título; se ocultan en ≤760px). Se descartó la variante que
  sobresale (ver changelog para reactivarla en una línea). Los 3 botones de
  Cierre tienen jerarquía: principal (Generar), secundario (PDF) y
  terciario (Cerrar sesión). ⚠️ Sus íconos son `::before` con `mask`, NO
  `<svg>` en el HTML: `js/mi-plan-pdf.js` cambia `btn.textContent` y borraría
  un `<svg>` hijo.
  - **Tamaño del título (sesión 2026-09-18)**:
    `#miPlanConSesion .sec-head-center .lam-title` →
    `font-size:clamp(32px,4.35vw,48px)` (42 → 48px en desktop) con
    `line-height:clamp(34.5px,4.485vw,48.3px)`, exactamente el alto de caja
    del tamaño anterior: el título se ve más grande sin empujar la tarjeta
    ni el resto del panel hacia abajo (verificado: tarjeta 122px de alto /
    top 92 y `.miplan-grid` en 282, igual que antes).
  - **Fondo (crema, elegido el 2026-09-18)**: el sólido lila
    (`--miplan-card-lila`, el de la tarjeta de Cierre) se probó y el usuario
    lo **rechazó** ("no me gustó"); entre las 3 opciones que se le mostraron
    con vista previa eligió la **crema dorado `#FDF4EA`**, que es el
    `background` actual de `.miplan-titlecard` (antes: gradiente
    blanco/lavanda). Hace juego con el círculo dorado de "SINAPTIX" y no
    compite con las 3 tarjetas de color de abajo.
  - **Íconos de los lados (sesión 2026-09-19, 2ª ronda)**: los 6 íconos
    glossy/3D de `img/Iconos/` (esferas degradadas) se reemplazaron por 6
    SVG de línea nuevos, `svg/icon-titlecard-{berries,grain,walnut,citrus,
    drop,neuron}.svg` — mismo criterio visual que el cerebro de "Objetivo
    cognitivo" (`img/ilustraciones-mi-plan/objetivo-cerebro.png`): un solo
    trazo sin relleno, color fijo `#4B2E45` (`--purple-dark`) horneado
    adentro del propio SVG (no `currentColor`: son `<img>`, no heredan CSS
    de la página). Mapeo 1 a 1 con el significado anterior: arándanos
    (antioxidantes), espiga (complejo B), nuez (omega 3 — además se parece
    a un cerebro chico, buen guiño), cítrico en corte (energía cerebral),
    gota (hidratación), neurona (neuronas) — mismo orden/tamaños que ya
    fijaba el CSS (`is-left`/`is-right`, `nth-child`). Se sacó el
    `filter:drop-shadow(...)` de `.miplan-titlecard-icons img` (pensado
    para dar volumen a las esferas; con íconos de línea plana no
    correspondía, igual que el cerebro de al lado no lleva sombra).
    Se borraron `img/Iconos/icon-energia-cerebral.webp` e
    `icon-neuronas.webp` (quedaron sin otra referencia en el repo);
    `icon-antioxidantes/-complejo-b/-omega3/-hidratacion.webp` **no** se
    tocaron, siguen en uso en las tarjetas `.pillar` de `#lam-04`.
    Verificado con Playwright a los tamaños reales (30–76px) antes de
    integrar: los 6 se leen bien incluso en el extremo chico.
  - **Íconos de los lados (sesión 2026-09-19, 3ª ronda — calco de
    referencias del usuario)**: el usuario mandó 6 imágenes de
    referencia (line-art generado con Gemini, JPG) y pidió calcarlas
    para reemplazar los 6 SVG geométricos hechos a mano de la ronda
    anterior por trazos fieles a esas referencias. Mismo mapeo de
    significado y mismos nombres de archivo (se sobrescriben los 6,
    `svg/icon-titlecard-{berries,grain,walnut,citrus,drop,neuron}.svg`),
    así que no hace falta tocar `mi-plan.html` ni `css/styles.css`.
    - **Pipeline de vectorizado** (no versionado en `scripts/`, las 6
      imágenes de referencia eran adjuntos del usuario y no quedaron en
      el repo): Pillow (`ImageFilter.MedianFilter` para limpiar ruido
      JPEG antes de binarizar, recorte al bounding box del contenido
      con ~4% de margen, reescalado a 600px de lado mayor,
      `ImageFilter.MinFilter(5)` para engrosar el trazo fino de las
      referencias y que pese similar al resto del set, threshold final)
      → `potrace -s --turdsize 40 --alphamax 1.3 --opttolerance 1.2`
      (paquete `potrace` de apt, instalado en el entorno de trabajo) →
      recentrado del `<path>` resultante dentro de un `viewBox="0 0 300
      300"` (contenido a ~220 unidades, mismo margen que ya usaba el
      resto del set) → recoloreado del `fill` de negro a `#4B2E45`.
      Son `<path>` rellenos (no `stroke`), a diferencia de los SVG a
      mano del resto del sitio que son `stroke` sin relleno — da igual
      visualmente para un ícono estático sin hover, y es justamente lo
      que hace potrace al vectorizar un dibujo de líneas (rellena el
      área que ocupaba la tinta).
    - **Peso**: subieron de ~600 bytes cada uno (geometría a mano) a
      3.8–9.8 KB (calco real, más nodos de curva) — 40 KB los 6 juntos.
      Se probó primero a 800px de lado mayor (~95 KB los 6) y se bajó a
      600px sin pérdida visible al tamaño real de uso (30–76px): mismo
      criterio de "no inflar peso de más" que ya se aplicó con el WebP
      del Hero, pero en este caso no hay margen para bajar mucho más
      sin perder detalle real de las referencias (el cerebro/nuez y el
      cítrico son los que más pesan, por la cantidad de curvas finas).
    - Verificado con Playwright: los 6 aislados a 300×300 contra las
      referencias originales (mismo trazo, proporciones y detalle) y la
      tarjeta real de `mi-plan.html` con sesión mockeada a 1440px y
      390px — a 1440px los 6 se integran con la misma jerarquía de
      tamaños de siempre; a 390px siguen ocultos por la regla `≤760px`
      ya existente, sin cambios ahí. Falta la confirmación de siempre
      sobre un navegador real/deploy.
- **Nota bajo las etiquetas de cambios (`.miplan-cambios-nota`, sesión
  2026-09-19)**: texto fijo de ~2 líneas dentro de `#miPlanCambios` que
  explica que 20 puntos = un nivel de la respuesta. Ocupa el hueco que
  sobraba en la tarjeta verde; si se alarga, la fila de "Datos clave" se
  estira. Hereda la condición de las etiquetas (reevaluación y >900px).
- **Etiquetas "Qué cambió desde tu diagnóstico" en la tarjeta Antropometría
  (`mi-plan.html`, sesión 2026-09-19)**: solo con reevaluación guardada
  (`sinaptix_reevaluacion`), `#miPlanCambios` → `#miPlanCambiosChips`
  (`.miplan-cambios`/`.miplan-cambios-chip`), debajo de la leyenda del IMC y
  arriba de los chips de nutrientes. Sale de `nutriCambiosDesdeDiagnostico`
  (`js/nutricion-planes.js`), que reusa el cálculo de las barras
  (`gaugeComputeAreas` → %) para no divergir de la tarjeta naranja. Existe
  porque al reevaluar la naranja crece (líneas "Antes: …") y a la verde le
  sobraba alto. **Se ocultan en ≤900px** (1 columna): no hay hueco y
  repetirían las barras. Alternativa considerada y no elegida (por ahora):
  que la naranja no crezca, con una marca del valor anterior sobre la barra
  y el "+20" al lado del %.
- **Chips de nutrientes clave en la tarjeta Antropometría (`mi-plan.html`,
  sesión 2026-09-18)**: al pie de la tarjeta verde, `#miPlanNutrientes` →
  `#miPlanNutrientesChips` (`.miplan-nutri`/`.miplan-nutri-chip`), anclado
  con `margin-top:auto`. Sale de `nutriNutrientesClave(d, max)`
  (`js/nutricion-planes.js`): mismo plan resuelto que el detalle y el PDF
  (`nutriResolverObjetivo` + `NUTRI_PLANES[..].nutrientes`), con etiquetas
  cortas de `NUTRI_NUTRIENTE_CORTO` (un nutriente sin entrada se muestra
  tal cual). Con varios planes combinados intercala y quita repetidos;
  `pintarMiPlan()` pide máx. 5 para que entren en una fila. Oculto sin
  plan. **Sin punto de color en los chips**: el punto verde ya es
  "Saludable" en la leyenda del IMC. Si se agrega un nutriente nuevo a un
  plan, conviene sumarle etiqueta corta (hay un test que exige ≤26
  caracteres por etiqueta).
- **PDF de "Mi plan" (`js/mi-plan-pdf.js`)**: botón "Descargar mi plan en
  PDF" (`#btnDescargarPdf`) en la tarjeta "Cierre", junto a "Generar mi
  plan" y "Cerrar sesión". Genera el documento 100% en el navegador de
  quien hace click; no toca Netlify Functions ni genera cargos.
  - **Vectorial, sin html2canvas**: todo se dibuja con primitivas de jsPDF
    (texto, `rect`/`roundedRect`, líneas, `triangle`, anillos con
    `sectorDona`). Texto seleccionable y buscable, nítido a cualquier
    zoom, ~134 KB.
  - **jsPDF 3.0.1 por `<script>` desde cdnjs, en lazy load**: se inyecta
    recién al primer click, así que no afecta la carga inicial del sitio.
    Versión fijada (no `latest`) para que el spec de Playwright pueda
    servir el mismo bundle local. **Sin SRI**: no se pudo verificar desde
    el entorno de trabajo que el archivo de cdnjs sea byte a byte el de
    npm, y un hash equivocado rompe la feature en silencio — agregarlo si
    alguna vez se puede comprobar contra el CDN real.
  - **Fuente de datos**: el mismo plan resuelto que ya usa
    `nutriBuildResumenHTML` (`sinaptix_objetivo`, `sinaptix_antropometria`
    y `sinaptix_reevaluacion` de `localStorage` + las funciones puras de
    `js/nutricion-planes.js`). `nutriPdfModelo()` es pura y testeable
    (21 tests en `tests/mi-plan-pdf.test.js`, sin cambios en esta ronda);
    el dibujo vive aparte y sí cambió por completo — ver más abajo.
  - ⚠️ **`NUTRI_PLANES` se resuelve por identificador léxico, no por
    `window`**: `nutricion-planes.js` lo declara con `const` en el tope de
    un `<script>` clásico, y los `const`/`let` de nivel superior NO quedan
    colgados de `window` (a diferencia de las `function`). Buscarlo en
    `window` devolvía `undefined` y el PDF salía vacío. Ver
    `depsPorDefecto()`.

  ### Diseño vigente (sesión 2026-09-19, 3ra ronda) — referencia del usuario, "tal cual"

  ⚠️ **Esta es la dirección visual vigente y reemplaza las 2 anteriores**
  (paleta neutra sin morado, luego tarjetas compactas — ambas documentadas
  más abajo solo como historial). El usuario subió un mockup HTML propio
  y pidió explícitamente "dejalo tal cual" — no seguir iterando sobre mi
  diseño. **No volver a la dirección anterior sin que el usuario la pida
  de nuevo.**

  - **Paleta**: vuelve un acento tipo ciruela oscuro `#502d4b` (`C.plum`)
    para títulos de sección y de tarjeta — viene del mockup del usuario,
    no es un error ni una vuelta a `--purple` del sitio (son valores
    distintos que casualmente se parecen). `C.marca` (azul noche
    `#1A2542`) queda reservado solo para la palabra "SINAPTIX". Nuevo:
    verde `#15803D` para el banner de resumen y la columna "Prioridades",
    azul acero `#3B6EA5` para la columna "Nutrientes clave", ámbar para
    la caja de ajustes, rosa oscuro `#881337` para el puntero del IMC.
  - **Tipografía: un solo sans-serif** (Helvetica) en todo el documento,
    incluida la marca "SINAPTIX". El mockup del usuario usa
    `'Segoe UI', Arial, sans-serif` en todas partes, sin una fuente serif
    de display — se sacó `F_TITULO` (Times) de la marca por fidelidad;
    la constante queda declarada pero sin uso, por si algún día se separan
    de nuevo las 2 familias tipográficas.
  - **Bloques del documento** (de arriba a abajo): encabezado compacto →
    banner verde "Resumen ejecutivo" (1-2 frases autogeneradas, ver
    `pdfResumenEjecutivo()`) → fila de 2 tarjetas iguales (Antropometría:
    barra degradada de 4 colores con puntero + valor; Estado inicial: 4
    anillos de progreso Foco/Memoria/Energía/Calma) → "N. ESTRATEGIA
    NUTRICIONAL: {plan}" (un bloque por plan si el objetivo resolvió en
    más de uno) con 2 columnas **coloreadas para diferenciarse** (azul
    "NUTRIENTES CLAVE" / verde "PRIORIDADES" — pedido explícito del
    usuario; en su mockup original ambas eran del mismo color) → "N.
    ESTRUCTURA DE DÍA TIPO" como lista simple "Momento: detalle" (ya no
    timeline con círculos ni dona) → caja ámbar "Ajustado a tu caso
    particular" → pie con 1 línea de aviso legal + "Página X de Y".
  - **`parrafoEnfasis()` / `altoParrafoEnfasis()`** (nuevas): texto con
    fragmentos en distinto peso (normal/bold) que se ajustan de línea
    juntos, palabra por palabra — jsPDF no tiene texto de formato mixto
    nativo. Se usan para "Tu plan... está enfocado en **{objetivo}**." del
    resumen y "**Momento:** detalle" del día tipo. Comparten
    `tokenizarSegmentos()`, que fusiona un token de puntuación sola
    (".", ",") con la palabra anterior — si no, queda un espacio de más
    antes del punto (bug real, encontrado y corregido en esta sesión).
  - ⚠️ **Qué se sacó del dibujo, a propósito, porque el mockup del
    usuario no lo tenía** (los datos siguen en el modelo, por si se
    reincorporan):
    - El panel grande "OBJETIVO COGNITIVO PRINCIPAL" (el nombre del plan
      ahora vive en el banner de resumen + en cada título de sección).
    - La columna "MODERAR" (queda en `plan.moderar`, sin usar).
    - Los avisos personalizados (medicación, sueño, estrés+fatiga) y el
      panel legal grande "AVISO" — el pie de página sigue teniendo el
      aviso corto en cada hoja.
    - El timeline con círculos numerados y la dona de reparto del día
      tipo, y la marca de "meta" en las barras de estado (ahora son
      anillos sin meta visible).
  - ⚠️ **Qué NO se implementó aunque el mockup del usuario lo mostraba, y
    por qué** (esto no es una omisión de fidelidad, es una decisión
    deliberada — no agregarlo sin resolver antes el problema de fondo):
    - El **QR "Verificación Digital"**: no existe ningún backend que
      emita o valide un código así. Ponerlo sería mostrarle a la persona
      una promesa de verificación que no existe.
    - El pill **"Semana X"**: la app no tiene ningún concepto de "semana
      del plan" en ningún lado (se buscó en el código, no está).
    - Los **íconos** de cada sección/tarjeta (lupa, reloj, escudo, del
      set lucide del mockup): reconstruirlos a mano con primitivas de
      jsPDF a ese tamaño (unos mm) lee como una forma rota, no como un
      ícono reconocible — se probó con una bombilla y no funcionaba, se
      sacaron todos.
  - **Bug corregido de paso**: el carácter `²` (para "kg/m²") no está
    garantizado en las 14 fuentes estándar del PDF (WinAnsi) y se
    dibujaba como espacio en blanco. Se cambió a "KG/M2" sin superíndice.
  - **Referencia visual**: `docs/mockup-pdf-mi-plan.html` — es casi
    literalmente el HTML que subió el usuario, con la diferenciación de
    color de Nutrientes/Prioridades aplicada y 2 etiquetas rojas marcando
    el QR y el pill "Semana X" como no implementados (para que quien lea
    el archivo no asuma que sí lo están). Si se cambia el diseño del PDF,
    actualizar los dos.

  ### Historial: direcciones de diseño descartadas (no reabrir sin pedido explícito)

  1ra ronda (paleta neutra, sin morado): el morado de marca `--purple` se
  probó y el usuario lo rechazó ("el morado no queda en ese PDF"). Se pasó
  a una paleta neutra de azules/grises. 2da ronda (tarjetas compactas): el
  usuario marcó que las tarjetas de arriba y el panel de objetivo se veían
  "estiradas hacia abajo"; se recalcularon alturas y se corrigió un bug de
  overflow en el título del panel de objetivo con múltiples planes
  combinados. **Ninguna de las 2 decisiones sigue vigente**: la 3ra ronda
  reemplazó ambas por el mockup del usuario. Quedan acá solo como
  contexto de por qué el código pasó por esas formas antes de llegar a la
  actual — si algo de esa lógica (rampa semántica `RAMPA`/
  `pdfColorPorcentaje`, por ejemplo) sigue viva, está anotado en el bloque
  de arriba.
- **Imagen del Hero (`img/hero-cerebro-nutricion.webp`)**: sesión
  2026-09-18, el usuario notó que tardaba bastante en cargar al entrar a
  la web. Causa: era un PNG de 1.2 MB (1024×1024 RGBA) sin comprimir —
  se convirtió a WebP calidad 85 (232 KB, ~80% menos peso, mismas
  dimensiones; no se percibe pérdida de calidad visible a ese tamaño de
  render, `.brain-art{width:82%}` sobre `.synapse-art{max-width:560px}`
  ≈ 460px en pantalla). Se borró el `.png` viejo (sin otras referencias
  en el repo). Además se le agregó `width="1024" height="1024"` (evita
  salto de layout mientras carga) y `fetchpriority="high"` (es la imagen
  más grande arriba del pliegue — probable LCP de la página — así el
  navegador la prioriza sobre íconos/decoraciones que sí van con
  `loading="lazy"`, como los de Pilares).
- **Paleta** (`css/styles.css`, bloque `:root`): fondo blanco `--paper`,
  panel lavanda claro `--panel`, morado de marca `--purple`/`--purple-dark`
  como color estructural, acentos `--green`, `--gold` (terracota),
  `--navy-bright`. Texto `--ink`. Todas las secciones "dark" (Método,
  Beneficios, Contacto) comparten esta misma paleta estándar (la paleta
  cálida crema+café que tuvo Método en su momento se descartó).
- **Tipografía**: `Inter` cuerpo/UI, `Fraunces` (800, normal+itálica)
  títulos, `Caveat` (`--font-hand`, `.title-hand`) para look manuscrito
  (Método, Pilares, título de "Mi plan").
- **Títulos de sección**: todos los `<h2 class="lam-title">` del sitio
  (salvo Visión) usan `.title-mark{color:var(--purple)}` sobre una
  palabra clave, igual que el Hero. Método (`#lam-03`) y Pilares
  (`#lam-04`), centrados, suman `.title-scribble` (curva centrada debajo,
  `svg/deco-scribble-purple.svg`). Beneficios (`#lam-05`) y Contacto
  (`#lam-06`), alineados a la izquierda, suman el mismo `.title-scribble`
  (sin centrar) + 1-2 `.brain-spark` chicos. Visión (`#lam-02`) sin
  acento, sin cambios. `mi-plan.html` no usa `.title-mark` en ninguno de
  sus `<h2>`.
- **Pilares (`#lam-04`)**: dentro de `.lam-title-frame` queda un solo
  `<img class="deco deco-scribble">` suelto cerca del título (los otros 6
  que estaban dispersos se sacaron a pedido del usuario), más
  `.title-scribble` y `.title-mark` — 3 trazos totales pegados al título.
  **La onda azul que venía debajo del título se borró el 2026-09-19**
  (pedido del usuario: "quitá esa raya celeste que está abajo del título").
  Era el bloque `.signal-wave` (`svg/signal-wave.svg`, trazo `#3B6EA5`,
  `margin:6px 0 40px` + `opacity:.6`), que ocupaba **90px** de alto (44 de
  imagen + 6 arriba + 40 abajo). Ese espacio lo conserva ahora el párrafo
  de la sección con `#lam-04 .lam-text-center{margin-top:74px}`
  (`.lam-text-center` es `margin:-16px auto 44px`, así que −16 + 90 = 74):
  así, al sacar la raya, el párrafo y las 4 tarjetas quedan **en el mismo
  lugar** que antes y el párrafo no pisa el rayón morado del título (sin
  ese ajuste se subía y se superponía al trazo). El asset sigue en uso en
  el Hero y las reglas `.signal-wave{...}` quedan sin uso (no se borraron).
  **Cuadro sinóptico (2026-09-19)**: rayitas finas (1px, `--sinop-line` =
  morado al 38%) que salen del párrafo y bajan a las 4 `.pillar`, como
  árbol/llave. Solo pseudo-elementos, sin markup nuevo: `.pillar-grid::before`
  (tronco), `.pillar-grid::after` (barra del centro de la col. 1 al de la 4),
  `.pillar::before` (bajada) y `.pillar::after` (punto de 7px sobre el borde
  de la tarjeta). `.pillar-grid` pasó a `margin-top:76px` (antes 64) y
  `.pillar` a `position:relative`. En hover la bajada se acorta 4px para
  seguir pegada a la barra. Oculto en ≤900px (con 2/1 columnas no hay una
  barra única). Ver changelog.
  **Íconos de las tarjetas sin círculo rosado (2026-09-19)**:
  `.pillar-icon-circle` ya no tiene fondo `--panel-2` ni `border-radius`
  (queda solo como contenedor flex de 56×56); `.pillar-icon-img` pasó de
  32px a 56px (las esferas de `img/Iconos/icon-*.webp` son de 256px y
  ocupan todo su cuadro) y suma un `drop-shadow` suave. Los `width/height`
  del `<img>` en `index.html` se actualizaron a 56.
  **Recorte limpio de los 4 íconos (2026-09-19)**: los `img/Iconos/icon-
  {omega3,antioxidantes,complejo-b,hidratacion}.webp` traían un tablero de
  ajedrez gris horneado (fondo transparente "falso") pegado al borde,
  sobre todo abajo. Se limpiaron por código con
  `scripts/limpiar-iconos-pilares.py` (separa la esfera por croma, ajusta
  el círculo con RANSAC, alfa antialiasado, r−2.5px). El script
  **sobrescribe los .webp**: si se regeneran los originales (ej. con IA),
  correrlo de nuevo sobre ellos. `.pillar-icon-img` suma `margin-left:-3px`
  para alinear el borde del disco con el texto.
  **Frutas/alimentos grandes difuminados de fondo (sesión 2026-09-17)**:
  antes la sección solo tenía 1 `.deco-fruit` (aguacate). Hoy tiene 4,
  todas `.deco-fruit` (ocultas en mobile `<720px` por la regla general,
  con la animación float de siempre):
  - 3 en las esquinas del `<section>`, grandes (150–230px) y con
    opacidad baja (.4–.5) para leerse como fondo difuminado, no como
    protagonistas: aguacate (`svg/deco-blob-avocado.svg`, arriba-izq.),
    granada (`img/generadas-cutout/granada.webp`, arriba-der.) y té
    (`img/generadas-cutout/te.webp`, abajo-der.) — mismo criterio visual
    que ya usan Beneficios/Contacto. **El huevo**
    (`img/generadas-cutout/huevo.webp`, abajo-izq.) **se borró el
    2026-09-19** a pedido del usuario ("en la parte izquierda quitale el
    huevo"); el asset sigue en uso en el collage de Conócenos.
  - 2 más chicas y más opacas (.6–.9, se leen más nítidas, no son
    "fondo") forman un cluster junto a la granada, a la derecha del
    título, a pedido explícito del usuario con una imagen de referencia.
    Ese cluster era una hoja fina (`svg/deco-leaf-beneficios.svg`)
    + una naranja; **el 2026-09-19 el usuario pidió "reemplazá la hoja
    de la derecha por el racimo de uva" y después "hacelo más grande"**,
    así que hoy es el racimo (`svg/deco-blob-grapes.svg`, `right:70px;
    top:225px`, `opacity:.6`, `rotate(-8deg)`) a **110px** de ancho
    (primero quedó en los 60px que tenía la hoja y se veía chico al lado
    de los otros blobs) + la naranja
    (`svg/deco-blob-orange.svg` — este asset ya traía su propio halo/blob
    suave detrás del gajo, es el mismo efecto de "círculo detrás de la
    fruta" que pedía la referencia, no se agregó CSS nuevo para eso).
    **Recorte de la granada** (ajuste a continuación, mismo pedido): el
    usuario pidió que la granada se vea "menos de la mitad" en vez de
    casi completa — se corrió todo el cluster hacia la derecha
    (`right` más negativo en los 3 elementos, mismo delta de 80px) para
    que el borde del `<section>` corte la granada bastante antes de su
    mitad (queda ~39% visible, `right:-110px` sobre `width:180px`).
    No hay asset de hoja rellena tipo perejil en el repo (la única hoja
    disponible es este trazo fino en un solo color) — si el usuario pide
    que se note más, es de las primeras cosas a ajustar (agrandar/subir
    opacidad, o cambiarla por otra fruta chica ya usada en Método).
  - **Tarjetas `.pillar`** (las 4 de "Cuatro frentes de trabajo"):
    compactas (`min-height:198px`, padding `28px 26px`, gap `14px` — antes
    250px/34px/16px, se veían muy vacías). Cada ícono va dentro de
    `.pillar-icon-circle` (60px, fondo `--panel-2`) con el ícono a 32px
    adentro, en vez de flotar solo (56px) sobre el blanco de la tarjeta.
  - **Fundido con Beneficios**: `#lam-05` pisa su `background` (heredado
    de `section.dark`) con un `linear-gradient` que arranca en `--paper`
    y funde a `--panel` en los primeros 180px, para no cortar en seco
    contra el blanco de esta sección — mismo criterio que `#lam-03` (ver
    comentario en `css/styles.css` de esa sección). Solo hace falta
    fundir el borde de arriba: el vecino de abajo de `#lam-05` es
    `#lam-06`, también `--panel`, sin corte que disimular ahí.
- **Método (`#lam-03`)**: paleta estándar del sitio (no crema/café). 3
  `deco-fruit` chicas de fruta real. 2 neuronas laterales decorativas
  (`neurona-izquierda/derecha.webp`) son una ilustración completa (no
  media neurona recortada), fondo transparente. Círculos numerados del
  timeline (`.tl-num`) con degradado `--purple`→`--purple-dark` + sombra
  de 2 capas; `.tl-line` en degradado. Botones (`.method-cta`) viven
  dentro de `.method-left` (wrapper junto al timeline), siempre pegados
  al final del timeline sin importar cuánto crezca `.method-gauges` al
  lado. El switch "Mi progreso"/"Mi IMC" (`.gauges-switch`) vive en un
  footer (`.gauges-footer`) al pie de la tarjeta, junto al botón de
  acción de la pestaña activa (renderizado ahí, no dentro de cada panel).
  - **Tarjeta "Mi progreso"** (`renderMethodGauges`, `js/script.js`):
    frase de insight arriba, área con más margen de mejora destacada
    aparte (más grande, borde + ícono + badge de nivel), las otras 3 en
    grilla de 3 columnas, delta como badge con flecha, ícono lineal por
    área. Paleta propia `METHOD_GAUGE_LOW/MID/HIGH` (no confundir con el
    semáforo genérico de "Mi plan"). Animación de llenado
    (`stroke-dashoffset`, ~0.7s, escalonada: destacado primero, los 3
    chicos ~90ms después) + marcador de "antes" (punto blanco/gris sobre
    el arco, solo si hay reevaluación) vía `gaugeArc`/`gaugeAnimateArcs`/
    `gaugeArcMarker`. Respeta `prefers-reduced-motion`. **Pendiente de
    verificación en navegador real** (no se pudo correr Playwright en la
    sesión que la implementó).
  - **Tarjeta "Mi IMC"** (`renderMethodImc`): misma jerarquía — frase de
    insight fija por zona, medidor+número+categoría agrupados en
    `.method-imc-featured` con badge de color por zona
    (`.imc-tier-bajo/-saludable/-sobrepeso/-obesidad`), rango de peso
    saludable estimado (`.method-imc-range`, solo si hay talla cargada).
    No afecta `mi-plan.html` (usa sus propias clases sin tocar).
- **Categoría "obesidad" (antes "rango a vigilar")**: la 4ª zona del IMC
  (`imc >= 30`) decía "rango a vigilar" por una decisión de tono de una
  sesión anterior. Corregido en sesión 2026-09-18 a pedido explícito del
  usuario ("ponele lo que realmente es") — ahora `imcCategoria()`
  devuelve `{cat:'obesidad', zona:'obesidad'}` (antes `'vigilar'`), y
  todas las clases CSS que usaban el sufijo `-vigilar`
  (`.imc-zone-vigilar`, `.imc-cat-vigilar`, `.imc-dot-vigilar`,
  `.imc-tier-vigilar`, `.imc-gauge-marker-glow-vigilar`) pasan a
  `-obesidad` en `css/styles.css`, `js/script.js` y `mi-plan.html` —
  umbrales de IMC (18.5/25/30) sin cambios, son los estándar de la OMS
  para adultos y ya estaban bien.
- **Medidor de IMC tipo velocímetro (`.imc-gauge`)**: compartido entre
  `mi-plan.html` (`#miPlanImcGauge`) y "Mi IMC" de Método. Degradado
  continuo dorado→verde→dorado→rojo en un solo `<linearGradient>`
  (`imcGaugeGradientStops()`/`imcGaugeGradientDefsHtml()`,
  `js/nutricion-planes.js`). En "Mi plan" la aguja anima con barrido
  (~0.7s) desde el extremo mínimo hasta el valor real (no en Método, que
  pinta directo en la posición final); marcador fijo
  (`.imc-gauge-marker`) sobre el arco en el valor exacto, sin animar.
  Respeta `prefers-reduced-motion` en JS y CSS.
  - **Escala con marcas y números (sesión 2026-09-18)**: 6 rayitas +
    números (15/20/25/30/35/40, `.imc-tick`/`.imc-tick-label`) alrededor
    del arco, geometría fija calculada por radio/ángulo desde el mismo
    centro que el arco (`IMC_GAUGE_TICKS`/`imcGaugeTickPoint()`/
    `imcGaugeTicksHtml()`, `js/nutricion-planes.js` — no depende del IMC
    de la persona, es la misma escala siempre). `renderMethodImc`
    (`js/script.js`) la inserta llamando a `imcGaugeTicksHtml()`;
    `mi-plan.html` la tiene escrita a mano (mismo motivo que el
    `<linearGradient>` de al lado: es HTML estático, sin JS corrido
    todavía) — si `IMC_GAUGE_TICKS` o sus radios cambian, actualizar
    también ahí. El `viewBox` del `<svg>` en ambos lugares pasó de
    `"0 0 220 140"` a `"-10 -2 240 148"` para darle aire a los números
    de los extremos (15/40) sin recortarlos.
  - **Segunda pasada "más estético" (mismo día, a pedido explícito de
    que "se seguía viendo simple")**: 5 marcas chicas intermedias sin
    número entre cada 2 principales (`.imc-tick-minor`,
    `imcGaugeMinorTicksHtml()`); "riel" gris claro de fondo detrás del
    arco de color (`.imc-gauge-track`, `imcGaugeTrackHtml()` —
    stroke-width 22 vs 18 del arco de color, un solo `<path>` con las 2
    puntas redondeadas, da sensación de ranura); sombra suave
    (`filter:drop-shadow`) en la aguja; pivote con look de "tuerca"
    (`.imc-pivote-outer` anillo claro + `.imc-pivote` punto oscuro
    encima, antes un único círculo); halo de color detrás del marcador
    del valor exacto (`.imc-gauge-marker-glow`, mismo criterio de color
    que `.imc-dot-*`/`.imc-cat-*` — bajo/sobrepeso dorado, saludable
    verde, obesidad rojo), posición y clase de color puestas por JS junto
    con el marcador (`pintarMiPlan()` en `js/mi-plan.js`,
    `renderMethodImc()` en `js/script.js`, elemento
    `#miPlanImcMarcadorGlow` en `mi-plan.html`). Las puntas del arco
    completo (tramos `.imc-zone-bajo`/`.imc-zone-obesidad`) siguen en
    `stroke-linecap:round` (los 2 tramos intermedios en `butt`, para no
    dejar costuras redondeadas entre colores) — look más de velocímetro
    real. **Sin confirmar en navegador real** (no hay browser instalado
    en este entorno para captura/Playwright) — ver "Pendientes
    conocidos".
- **"Mi plan" — estado sin sesión** (`#miPlanSinSesion`, `.miplan-locked`):
  tarjeta blanca centrada (`.miplan-locked-card`, con **`zoom:.9`** desde el
  2026-09-19 a pedido del usuario — "más pequeña en conjunto": encoge
  tarjeta + campos + botones + espaciados en una sola proporción. Se usa
  `zoom` y no `transform:scale` porque la tarjeta lleva `.reveal`, cuyo
  `.reveal.in{transform:translateY(0)}` pisa cualquier `transform`. Medidas
  visibles: ~414×660 en vez de 460×733 a 1440px) con candado SVG a mano,
  formularios propios de login/registro (ver punto siguiente) y "Volver
  al sitio" como link de texto. Detrás, 1 ilustración grande de cerebro
  (`img/decoraciones-neurona/cerebro-mi-plan.webp`, sangrando por el
  borde derecho con `right:-200px` — 100px más a la izquierda que el
  `-300px` original, a pedido del usuario el 2026-09-18; oculta en mobile
  `<900px`) + 3 `deco-fruit` reusadas (aguacate/kiwi/almendras).
  `#miPlan{min-height:100vh;overflow:hidden}` para evitar franja blanca
  bajo el footer.
- **Decoraciones de `#miPlan` (sesión 2026-09-18)**: 8 a nivel de sección
  (se ven en los dos estados: kiwi, naranja, palta, almendras, 3 espigas y
  los círculos) + 4 frutas marcadas **`.deco-solo-sesion`** (berries arriba
  a la izquierda, walnut a media altura a la izquierda, orange arriba a la
  derecha, berries abajo a la derecha) que se muestran **solo con sesión
  iniciada**, vía `#miPlan:has(#miPlanSinSesion:not(.hidden))
  .deco-solo-sesion{display:none}`. Las 4 de sesión quedan a nivel de
  sección (no dentro de `#miPlanConSesion`) para que su `top/left/right`
  siga midiéndose contra `#miPlan` (full-bleed) y cuelguen del borde de la
  ventana: dentro de `.wrap` (`position:relative`) quedaban 122px metidas
  hacia adentro, pegadas a las tarjetas. Verificado 0 solapes con las
  tarjetas a 1440/1200/1000/900/780px.
- **"Mi plan" — login/registro propios** (`.miplan-auth`, reemplazan al
  widget nativo de Netlify Identity): 2 pestañas
  (`#tabLoginMiPlan`/`#tabRegistroMiPlan`) + recuperación de contraseña
  propia (`#formRecuperarMiPlan`/`#formNuevaPassMiPlan`). Estrategia
  **híbrida**: usa el cliente GoTrue que expone el widget
  (`netlifyIdentity.gotrue`, métodos `.login()`/`.signup()`/
  `.requestPasswordRecovery()`/`.recover()`) en vez de `fetch` a mano, así
  `js/plan-sync.js` (que depende de `currentUser()`) sigue funcionando
  sin cambios. Como se saltea el widget, `js/mi-plan.js` dispara a mano
  `mostrarEstadoConSesion(user)` tras login/registro y usa
  `currentUser().logout()` en vez de `netlifyIdentity.logout()`.
  Registro pide nombre obligatorio (`full_name`) — cierra el viejo
  pendiente de fallback de avatar sin nombre para cuentas nuevas (las
  cuentas viejas sin nombre siguen con el fallback del prefijo del
  email). Confirmación por correo está **desactivada** en el panel de
  Netlify, así que tras un signup exitoso se hace login automático (con
  fallback al aviso de "revisá tu correo" si `Email not confirmed`).
  El `#recovery_token=…` del correo se intercepta con un script inline
  en el `<head>` de `index.html` (reenvía a `mi-plan.html`) y
  `mi-plan.html` (antes de que el widget lo vea). Mensajes de error de
  GoTrue (en inglés) se mapean a castellano por substring en
  `authMensajeError()`. **Sin probar contra Netlify real** (todo
  verificado con `netlifyIdentity` mockeado) — ver "Pendientes
  conocidos".
- **Nav de `index.html`**: "Iniciar sesión"/"Acceder" son ahora links
  normales a `mi-plan.html` (antes abrían el widget nativo o hacían
  scroll a Contacto). `setLoginButton()` sigue cambiando el texto a "Mi
  cuenta"/nombre cuando hay sesión.
- **Backend real**: Netlify Database (Postgres) + Netlify Functions
  (`plan.mjs`) espejando `localStorage` al servidor cuando hay sesión.
  Verificado funcionando en producción (`master@94d6ba4`).
- **Wizard de nutrición** (`#formNutricion`, 8 pasos, compartido entre
  modal de `index.html` y sección inline de `mi-plan.html`): 4 planes con
  "día tipo" cada uno + resolución automática. Paso 1 (nombre/correo) se
  oculta/prellena si hay sesión, y si no hay sesión, esos datos
  precargan el login/registro de "Mi plan" al llegar ahí
  (`prefillAuthDesdeEncuesta()`). Último paso: si no hay sesión, muestra
  un botón real "Iniciar sesión" (`#nutriLoginBtn`, `btn-ghost`, link a
  `mi-plan.html`) con auto-scroll al mostrarse, en vez de abrir el widget
  nativo automáticamente.
- **Validación de la encuesta**: `NUTRI_RANGOS`
  (`js/nutricion-planes.js`) es la fuente única de rangos (edad 14–120,
  peso 30–250kg, talla 100–230cm, horas 0–18h) usada tanto en atributos
  HTML como en JS (antes desalineados entre 3 lugares). Nombre validado
  por patrón (al menos una letra). Campos de texto libre
  (`nutriAlergiaOtra`/`nutriDisgustos`) escapados con `nutriEscaparHTML`
  antes de insertarse vía `innerHTML` (eran XSS reales) y con
  `overflow-wrap:anywhere;word-break:break-word` en los contenedores que
  los muestran (`.nutri-summary`, `.nutri-side-box`, `.nutri-note`,
  reusadas en "Mi plan") para que cadenas sin espacios no desborden el
  modal. "Prefiero no decir" ya no convive con otras condiciones
  tildadas.
- **Overflow horizontal**: **nunca poner `overflow-x`/`overflow-y` en
  `html`** (solo en `body`, que ya lo tiene). Ponerlo en `html` sin fijar
  también `overflow-y` fuerza el scrollbar clásico de Chrome/Windows
  (efecto "doble scroll gris" ya reportado una vez). Si aparece un
  desborde nuevo, diagnosticar con Playwright (`window.scrollX` tras
  forzar scroll), no con `scrollWidth` vs `clientWidth` solamente.
- **"Mi plan" — dashboard con sesión** (`#miPlanConSesion`): una sola
  columna (sin sidebar, descartada a pedido del usuario). Las 3 tarjetas
  (Antropometría/verde, Objetivo cognitivo/dorado, Cierre/lila) tienen
  fondo sólido de color (`--miplan-card-verde/-dorado/-lila`) + su propia
  ilustración de cabecera (`.miplan-card-illustration`, reemplaza el
  ícono de línea — "Cierre" conserva su ícono de línea) + mismo layout de
  cabecera (`.miplan-card-head`: ícono/avatar + anillo de progreso de
  2 estados vacío/completo, `.miplan-ring`). Alturas igualadas
  (`align-items:stretch` en `.miplan-grid` + `flex:1` en
  `.miplan-objetivo`). "Cierre" suma una tira de íconos decorativa
  (`.miplan-cierre-icons-strip`) visible solo sin plan generado. El texto
  "Sesión iniciada como {email}" vive pegado a los botones de
  `.miplan-cierre` (no bajo el título). Botón "Datos clave" anclado
  siempre al fondo de cada tarjeta vía flex (`margin-top:auto`).
  - **Detalle del plan**: `nutriBuildResumenHTML()` arma cada plan con
    `.nutri-plan-main` (ícono+título+enfoque+día tipo) +
    `.nutri-plan-side` (cajas priorizar/moderar). En `mi-plan.html` se
    activa un grid de 2 columnas desde 680px; en el modal angosto queda
    apilado. "Ajustado a tu caso" va embebido en el último plan dentro
    del wizard, pero en `mi-plan.html` es tarjeta propia
    (`.miplan-ajustes`, `incluirAjustesEnSide:false`) para no desbalancear
    la columna cuando hay muchos ajustes.
  - **Título "Tu progreso con SINAPTIX"**: la palabra "SINAPTIX" va en
    `<span class="miplan-brand-circled">` con un círculo `::after` hecho
    de una foto real (`img/ilustraciones-mi-plan/circulo-brand-sinaptix.png`,
    trazo de crayón, recoloreado a nivel de píxel — actualmente
    `--gold`). Tamaño de este `<h2>` puntual:
    `clamp(30px,3.9vw,42px)` (no toca `.lam-title` global).
- **Visión (`#lam-02`)**: fondo `.vision-brain-bg` es una composición
  armada por código a partir de 5 elementos generados por separado
  (cerebro, red neuronal, reloj de arena, cintas azules + listones
  conectores dibujados con curvas), no un fondo único de IA — variante
  "redonda" del cúmulo de neuronas, elegida sobre la alternativa
  "corazón" (ambas archivadas en `img/decoraciones-neurona/
  vision-elementos/`). Reproducible con
  `scripts/generar-fondo-vision.py` (constantes de posición/tamaño de
  cada elemento y de los listones documentadas en el propio script).
  - **Los 4 íconos son archivos individuales** en
    `img/decoraciones-neurona/vision-iconos/` (`icon-cerebro`,
    `icon-red-neuronal`, `icon-calendario`, `icon-acompanamiento`), no
    quemados en el fondo — el fondo sin íconos es
    `fondo-vision-red-sin-iconos.webp`. **Estado actual: cerebro y red
    neuronal están revertidos a la versión original tal cual se generaron
    la primera vez** (sin el agrandado que se probó y descartó en tandas
    intermedias, sin recortes contra el borde del lienzo); **calendario y
    acompañamiento son nuevos (2026-09-19, ver abajo)**. Reproducibles con
    `scripts/separar-iconos-vision.py` si hace falta volver a generarlos.
    ⚠️ Estas proporciones no son las que calibraron `.vision-icon--*`
    (width/top en `css/styles.css`) — **falta confirmar en navegador real
    si tapan el texto de las anotaciones de abajo** (con Playwright local a
    1920/1440/1100px no lo hacen); si tapa, ajustar `.vision-icon--*`, no
    las imágenes.
  - **Íconos de "4–6" y "1:1" reemplazados (sesión 2026-09-19)**: el reloj
    de arena (`icon-reloj-arena.webp`, verde) por un **calendario de cristal
    esmeralda con brote y lapicera** (`icon-calendario.webp`), y el nudo de
    cintas azules (`icon-cintas-azules.webp`, que no decía "acompañamiento")
    por **dos bustos de fibras azules con un hilo de luz entre ellos**
    (`icon-acompanamiento.webp`). Generados con Gemini por el usuario y
    recortados a RGBA por código (método y prompts en el changelog). Los 2
    archivos viejos **quedan en el repo sin uso** (los sigue generando
    `scripts/separar-iconos-vision.py`) por si se quiere volver atrás. CSS:
    `.vision-icon--azul` no cambió (`left:68%; top:76%; width:32%`);
    `.vision-icon--verde` pasó de `top:71%; width:22%` a `top:76%;
    width:33%` (el reloj era angosto, 309×566; el calendario es casi
    cuadrado y con 22% quedaba diminuto) y después a **`width:29%`** el
    2026-09-19 (ver el bullet de `--vision-pares-shift`/`--vision-bajos-shift`
    más abajo). Con `top:76%` verde y azul comparten línea superior. Sin cambios en mobile (`≤900px`, siguen
    ocultos).
  - **Energía morada que recorre los 4 íconos (`.vision-energy`, sesión
    2026-09-19)**: dos pulsos de luz (a media vuelta uno del otro)
    dan vueltas en sentido horario por un rectángulo redondeado que pasa por
    el centro de cerebro → neurona → acompañamiento → calendario (el
    recorrido lo dibujó el usuario sobre una captura). Es un `<svg>`
    absoluto dentro de `.vision-art` (después de `.vision-brain-bg`, **por
    detrás de `.vision-icons`** — así que el pulso queda tapado por cada
    ícono justo donde el trazado le pasa "por dentro", da el efecto de que
    la energía sale de ahí; funciona porque los 4 `.webp` son recortes con
    transparencia real, no un cuadrado opaco), con 9 `<path>` por pulso
    (halo con `feGaussianBlur`, 6 capas de cola que se desvanecen, cuerpo,
    núcleo claro) animados con
    `stroke-dashoffset` (`@keyframes veRun`, 7 s por vuelta = `--ve-T`).
    Grosor (`stroke-width`) bajado a ~60% el 2026-09-19 (3ª ronda) y de
    nuevo a ~78% de eso (4ª ronda, "un poco más fino"): valores actuales
    `7.5/1/1.25/1.4/1.6/1.8/2/2.3/1` para
    glow/t1/t2/t3/t4/t5/t6/body/core, misma proporción entre capas.
    **Aparece/desaparece (5ª ronda, `--ve-fadeT:8s`)**:
    además de correr sin parar, ahora los 2 pulsos se desvanecen
    (fundido, no corte) parte de cada ciclo. El riel de fondo
    (`.ve-rail`) no se ve afectado, queda siempre visible.
    **Secuencia exacta (6ª→7ª→8ª ronda)**: no
    es una alternancia pareja (eso se probó primero con un
    `animation-delay` de medio ciclo y no era lo pedido) — es
    `@keyframes veFadeA`/`veFadeB`, uno por pulso
    (`.ve-pulse:nth-of-type(1)`/`(2)`). **Ojo con el timing**: la 6ª
    ronda encadenaba las 2 transiciones sin pausa entre medio (una
    terminaba justo donde arrancaba la otra) y por eso se veía "casi
    simultáneo" — la 7ª ronda metió 0.6s de pausa real entre que uno
    termina de salir/entrar y el otro arranca. Reparto final en los 8s:
    los 2 visibles y corriendo juntos (3s) → sale 1 (.6s) → pausa con
    solo 1 afuera (.6s) → sale 2 (.6s) → los 2 invisibles (1.4s) → entra
    1 (.6s) → pausa con solo 1 adentro (.6s) → entra 2 (.6s), empalma con
    el ciclo siguiente. Un delay corrido no alcanzaba porque desplaza
    TODO el ciclo por igual; acá hacía falta que estuvieran sincronizados
    en el tramo "juntos" y se separen con una pausa real en las 2
    transiciones — eso pide 2 recorridos de opacidad distintos, no uno
    corrido.
    **Sin coordenadas en el CSS ni en el HTML**: el `d` del trazado lo arma
    una IIFE al final de `js/script.js` midiendo los 4 `.vision-icon`
    (`getBoundingClientRect`, esquinas = promedio de los centros de cada
    fila/columna) y se recalcula con `ResizeObserver` (resize y carga tardía
    de las imágenes). **Si se mueven los íconos, el recorrido los sigue solo.**
    Solo ≥901px (igual que los íconos), oculto con
    `prefers-reduced-motion`, y pausado fuera de pantalla (clase `is-paused`
    por `IntersectionObserver`). ⚠️ El `<path>` necesita `pathLength="100"` y el
    período de `stroke-dasharray` tiene que sumar 100 (ej. `12 88`) para que
    el pulso cruce la costura del trazado sin cortarse. Detalle y
    alternativas (destello de cada ícono al pasar la energía) en el
    changelog.
    - **Color por ícono (2ª ronda, misma sesión)**: el pulso ya no es
      violeta fijo — toma el color del ícono al que se acerca. **Ojo:**
      no son los `--gold`/`--purple`/`--navy-bright`/`--green` de las
      `.stat-annot` (se probó primero así y no coincidía con el color
      real de cada imagen, sobre todo el azul) — son colores muestreados
      directo de los `.webp` con Python/Pillow (promedio ponderado en
      HSV, descartando fondo/piel): dorado `#AD653F` (arco del cerebro),
      morado `#8A5C86` (red neuronal), azul `#1355A5` (bustos), verde
      `#599E71` (calendario). Si en algún momento se vuelven a tocar los
      íconos (otra imagen, otro recorte), estos 4 hex habría que
      re-muestrearlos, ya no van a coincidir solos.
      Motor: un solo custom property `--ve-c` (registrado con `@property`
      al principio de `css/styles.css`, tipo `<color>`, para que interpole
      en vez de saltar de golpe) animado por `@keyframes veColor`; cada
      capa deriva su tono de `--ve-c` con `color-mix()` en vez de tener
      color propio. Los 3 puntos intermedios del keyframe (morado/azul/
      verde — dorado queda fijo en 0%/100%) **se calculan en runtime** en
      la misma IIFE de `js/script.js` (`fraccionMasCercana`, muestrea el
      `<path>` del riel con `getPointAtLength` porque los 4 íconos no
      están a igual distancia entre sí) y se inyectan en un `<style
      id="veColorKeyframes">` en el `<head>`; si esa medición falla, el
      `@keyframes veColor` fijo del CSS (25/50/75 parejo, mismos 4 hex)
      sirve de resguardo. `.ve-rail` (el riel de fondo) no cambia de color, queda
      fijo en el violeta original vía `--ve-rail-c`. Detalle de por qué no
      hizo falta leer `--ve-T` desde JS (y el bug de regex que evitó) en
      el changelog.
  - **Los 4 datos ya no son tarjetas** (`.stat-box`, descartado): son 4
    `.stat-annot` (punto de color + número Fraunces + etiqueta corta) con
    posición libre en porcentaje dentro de `.vision-art` (contenedor
    compartido con `.vision-brain-bg`, así escalan juntos a cualquier
    ancho). **Solo hecho para desktop (`min-width:901px`)** — mobile
    (`<900px`) queda con fallback simple en columna, sin diseñar (ver
    "Pendientes conocidos", sesión 2). Colores por dato: dorado 20%,
    morado 86B, verde 4–6, azul 1:1 — mismos 4 de siempre.
    **Subida uniforme (2026-09-18, retocada el 2026-09-19)**:
    `--vision-pares-shift` (definido en `.vision-art`) = `-17%` de la altura
    de `.vision-art` (≈51px a 1440px, donde `.vision-art` mide 297px de
    alto), aplicado con
    `top:calc(<original> + var(--vision-pares-shift))` a los 4
    `.vision-icon--*` y a los 4 `.stat-annot--*`, para que los 4 pares
    ícono+texto se muevan juntos (pedidos del usuario en 3 tandas: `-6.5%`,
    "un poco más" → `-11%`, y "más arriba los 4 textos y los 4 íconos en
    conjunto" → `-17%`). Los `left` y los `width` no se tocaron.
    **`--vision-bajos-shift` (2026-09-19)**: segundo valor, `5%` (≈15px a
    1440px), que se suma solo a la **fila de abajo** — `.vision-icon--verde`
    y `.vision-icon--azul` con sus `.stat-annot--verde`/`--azul` — (pedido:
    "hacé un poquito más abajo los íconos de la libreta verde y el de los 2
    hombres azules, bajalos en conjunto con su respectivo texto"). Para
    mover todo junto se cambia `--vision-pares-shift`; para mover solo la
    fila de abajo, `--vision-bajos-shift`. `width` de la libreta verde
    (`.vision-icon--verde`): de `33%` a **`29%`** el 2026-09-19 (160 → 141px
    a 1440px), mismo `left:0%` y mismo `top`.
  - Subtítulos de los 3 bullets de texto (`.vision-bullets strong`) en
    `--purple` (antes casi negro), para combinar con "alimenta" del
    título.
  - `svg/icon-*.svg` (los íconos de línea `.stat-icon` de la etapa vieja
    de tarjetas) y las variables `--vision-card-*` quedan sin uso en esta
    sección — no se borraron, limpieza pendiente para la sesión 2.

- **Beneficios (`#lam-05`, "Para quién es")**: fondo `--panel` (lavanda
  claro, heredado de `section.dark`). Los 4 destinatarios son una lista
  vertical (`.ben-audience-grid`/`.ben-audience-item`, flex) con ícono
  propio a la izquierda del texto. **Desde 2026-09-19 son ilustraciones 3D**
  (generadas con Gemini sobre fondo verde chroma y recortadas con
  `scripts/recortar-iconos-audiencia.py`) — primera ronda a color libre,
  **reemplazada en la misma sesión** por una 2ª ronda en la paleta del
  sitio (morado `--purple-dark`/negro, ver bullet "Íconos 3D de 'Para
  quién es' en morado/negro" más arriba, que tiene el detalle): `img/Iconos/icon-maletin.webp`,
  `icon-graduacion.webp`, `icon-equipo.webp`, `icon-reloj-fatiga.webp`
  (256×256, alfa real, sin destellos sueltos salvo las gotas/líneas del
  cronómetro). Tamaños en variables sobre `.ben-audience-grid`:
  `--aud-icon:56px` y `--aud-text:18px` (48px/17px en ≤520px) — para subir
  el texto basta cambiar esas dos. Los `svg/icon-*.svg` de línea morada
  (stroke `currentColor`) quedaron sin uso, no se borraron. Las 2 `.quote-card` de testimonios tienen: 5 estrellas
  (`.quote-stars`, SVG inline; las llenas llevan clase `.is-filled` →
  `fill:var(--gold)` — M.R. 4/5, J.S. 5/5, calificación fija en el
  markup, no dinámica) + badge "Verified Client" con ícono escudo-check
  arriba; texto sin cursiva ni comillas propias; avatar circular con
  iniciales o foto + nombre en negrita/rol en línea aparte
  (`.quote-card-author`); comilla grande decorativa de fondo
  (`.quote-mark`, esquina inferior derecha, recortada con
  `overflow:hidden`).
  - **`.quote-card` con efecto "vidrio esmerilado"** (sesión 2026-09-18,
    a partir de una imagen de referencia del usuario): fondo pasó de
    `var(--paper)` sólido a `rgba(255,255,255,.55)` +
    `backdrop-filter:blur(10px)` (con prefijo `-webkit-` y fallback a
    fondo sólido vía `@supports not` para navegadores sin soporte), para
    que las frutas de fondo de `#lam-05` (remolacha/naranja/chocolate/
    granada) se noten difuminadas detrás de las 2 tarjetas de
    testimonios sin perder legibilidad del texto. No se tocó tamaño/
    posición/opacidad de las frutas — ya coinciden con la referencia.
  - **Sin frutas sobre las tarjetas (2026-09-19, pedido del usuario)**:
    las 3 frutas chicas que "salían" de las esquinas de las tarjetas
    (arándanos, kiwi, almendras, clase `.ben-quote-fruit`) se sacaron del
    HTML en una sesión anterior — **reemplazado más tarde, ver bullet
    siguiente**.
  - **Frutas por los lados de las tarjetas de comentarios (2026-09-19,
    mismo día, pedido posterior del usuario — cantidad final 4, no 6)**: vuelve `.ben-quote-fruit`, pensadas
    para asomar detrás del vidrio esmerilado en vez de sobre él. Van como
    `<img>` **antes** de `.quote-card` dentro de cada `.quote-card-wrap`
    (sin z-index propio, así el fondo semitransparente + blur de la
    tarjeta las tapa a medias y solo asoma la punta) — mismo mecanismo
    que la versión de 3 del 2026-09-18, ver `.ben-quote-fruit{filter:none}`
    en el CSS (sin eso se ven como estampitas con sombra propia encima,
    no "saliendo" de atrás).
    - **Primer intento (3 por tarjeta, igual de tamaño/offset)**:
      reemplazado por el usuario a mano el mismo día, ver siguiente
      bullet — no quedan en el HTML.
    - **Ajuste final a mano del usuario** (commit `6fbec2b`, sin patch de
      esta sesión — el usuario edita directo, no siempre pasa por el
      flujo de `.patch`): confirmado visualmente por el usuario ("quedó
      bien"). Tarjeta 1 (M.R.): **una sola fruta**, kiwi arriba-izquierda,
      96px, `top:-34px;left:-42px`. Tarjeta 2 (J.S.): las 3 originales
      pero bastante más grandes y desplazadas — palta arriba-derecha
      132px `top:-38px;right:-100px`, frutilla a la izquierda a media
      altura 82px `top:40%;left:-44px`, almendras abajo-derecha **156px**
      `bottom:-150px;right:-166px` (con ese offset quedan bien afuera del
      rectángulo de la tarjeta, ya no "asomando apenas" — el usuario lo
      quiso así). Assets: `svg/deco-blob-{kiwi,avocado,strawberry,
      almonds}.svg` (se sacaron `berries`/`walnut` de esta sección, siguen
      en uso en otras). Se ocultan solas en ≤720px (regla general de
      `.deco-fruit`).
    - **Sin verificar con Playwright** en ningún momento (sin browser
      instalable en este entorno) — el ajuste final lo validó el usuario
      directo en su navegador, no hace falta repetirlo.
  - **Avatares con foto (2026-09-19)**: `.quote-avatar` pasó de 42px a
    56px, con aro blanco + sombra; contiene `<span class="quote-avatar-ini">`
    (iniciales) y un `<img>` encima (`img/testimonios/mr.webp` y `js.webp`,
    `object-fit:cover`). Si la foto no existe o no carga, el `onerror` saca
    el `<img>` y quedan las iniciales. **Las 2 fotos ya están** (retratos
    generados con Gemini por el usuario, preparados con
    `scripts/preparar-fotos-testimonios.py`: recorte cuadrado cerrado en la
    cara, 200×200 `.webp`; los originales de 1024px no se guardaron en el
    repo). Si se cambian por fotos reales de clientes, correr el script con
    los nuevos JPG y ajustar `RECORTES` (centro/lado del recorte).
  - **Layout (2026-09-19)**: en ≥901px `.ben-quotes` baja 64px
    (`margin-top`) para alinear con el título en vez del eyebrow, y
    `.ben-audience-grid` tiene 52px de aire bajo el título (antes 26px
    inline; ahora en CSS).

- **Conócenos (`#lam-06`, antes "Contacto", sesión 2026-09-18, retocada
  2026-09-19)**: el usuario no quiere responder correos a mano; la acción
  principal del sitio para "empezar" ya no es este formulario, es el
  wizard de nutrición (ver bullet "Cierre" abajo). Esta sección se redujo
  a solo información de contacto pasivo: eyebrow "Conócenos", título
  "Conócenos <span class="title-mark">de cerca</span>", un párrafo corto,
  y sobre `.contact-info` (antes `.contact-wrap`, ya no es grid de 2
  columnas — `max-width:640px`, una sola columna): franja de confianza
  (`.contact-trust`, 2 ítems con ícono en `--purple`) → redes sociales
  como **columna de 4 tarjetas** (`.social-cards`/`.social-card`: Correo,
  Instagram, TikTok, Teléfono). **Se sacó el `<form id="formContacto">`**
  (nombre/correo/mensaje + envío por `mailto:` en `js/script.js`) — ya no
  existe en el sitio.
  - ⚠️ **El correo ya NO es el `.big-email` grande con botón de copiar al
    lado** (sesión 2026-09-19, pedido explícito del usuario: "para que
    sean 4 tarjetas"). Pasó a ser la primera tarjeta de `.social-cards`,
    con la misma estructura que Instagram/TikTok/Teléfono (ícono círculo +
    nombre "Correo" + `hola@sinaptix.com` como handle, todo el `<a
    href="mailto:...">` clickeable). Se sacó el botón `.copy-email-btn`
    (círculo con `navigator.clipboard` y tooltip "Copiado ✓"): no encajaba
    dentro de una tarjeta que ya es un `<a>` completo — anidar un
    `<button>` interactivo dentro de un `<a>` interactivo es HTML
    inválido y complica los clicks. El `mailto:` de la tarjeta sigue
    abriendo el cliente de correo, que es la función principal; se perdió
    el "copiar al portapapeles" como conveniencia menor. Si se quiere de
    vuelta, la forma correcta es un ícono de copiar chico *dentro* del
    texto del handle, no un botón separado a nivel de tarjeta.
    `.big-email`/`.big-email-row`/`.copy-email-btn` se sacaron del CSS
    (`css/styles.css`) y el listener de `js/script.js` (quedó solo un
    comentario explicando por qué no está más).
  - ⚠️ **Los 2 mensajes de `.contact-trust` cambiaron** (mismo pedido):
    eran "Respondemos en menos de 24h" y "Primera consulta sin costo" —
    esta última no describía bien el producto real (no hay "consultas"
    pagas de por medio, es un generador de plan automático y gratuito vía
    el wizard). Pasaron a "Tu plan, 100% gratis" y "Tus datos quedan
    protegidos" (relevante porque el wizard pide datos de salud:
    antropometría, condiciones médicas). El usuario pidió el cambio sin
    especificar el reemplazo ("cambiale ... por otra cosa"); se le
    preguntó el motivo antes de inventar copy nuevo, y con esa respuesta
    ("quiero otro mensaje de confianza, decime cuál") se propuso este par
    y se implementó directo, ofreciendo swap si no conforma.
  - **Color de marca por red** (`.social-card-icon`): Instagram y TikTok
    llevan su color/degradado oficial + ícono blanco
    (`.social-card-icon--instagram/--tiktok`, clases
    modificadoras sobre el círculo base). Teléfono y Correo quedan con el
    círculo genérico `--panel-2`/ícono `--purple` de siempre (ninguno de
    los 2 es una red social, ninguno tiene color de marca que aplicar).
    **Actualizado 2026-09-19 (2ª pasada)**: a pedido del usuario Correo y
    Teléfono también llevan color propio, estilo apps nativas:
    `.social-card-icon--mail` (degradado azul `#5AC8FA→#1A7CF5`, sobre
    blanco relleno con solapa del azul vía `--mail-fold`) y
    `.social-card-icon--phone` (degradado verde `#4CD964→#1FA84A`,
    auricular blanco relleno). Ambos SVG son de relleno (`fill`), no de
    trazo, y 19px en vez de 17px.
  - **`.contact-trust-item` en negrita** (`font-weight:800`, antes 600).
- **Cierre (`#lam-07`, sección nueva, sesión 2026-09-18)**: mini-hero de
  cierre al final del sitio, reemplaza al panel `.contact-cta` descartado
  (ver "Pendientes conocidos" → Descartado) como forma de empujar el
  wizard de nutrición sin depender de que alguien responda un correo. A
  partir de una imagen de referencia del usuario. Sección propia (no
  `section.dark`, fondo `--paper` blanco — funde el borde de arriba
  igual que `#lam-03`/`#lam-05`, mismo criterio aunque acá el salto de
  color panel→paper es sutil), todo centrado (`#lam-07{text-align:center}`):
  - `.closing-deco` (`max-width:620px`, `position:relative;z-index:0`):
    la imagen `svg/deco-sparkle-burst.svg` (destellos dorados + 2
    corazones, calcado por visión por computadora de la imagen de
    referencia del usuario — contornos reales, no dibujado a mano, ver
    `historico`/conversación de chat si hace falta el detalle del
    proceso) más 2 `.brain-spark` sueltos encima para el brillo animado
    que ya usa el resto del sitio. **Los destellos quedan fijos en su
    sitio** (pedido explícito del usuario): lo que se mueve es el texto,
    ver `--closing-lift` abajo.
  - **`--closing-lift` (2ª pasada, 2026-09-18)**: variable local de
    `#lam-07`, `calc(.4 * min(620px,100%) / 1.9185)` = ~40% de la altura
    del deco (el `1.9185` es su aspect ratio, 1412/736; va como fracción
    del **ancho** del deco porque un `margin-top` en `%` resuelve contra
    el ancho del contenedor, no el alto — así escala solo en mobile).
    Se aplica como `margin-top` negativo al `.closing-title`
    (`.closing-title{position:relative;z-index:1;margin:calc(-1 *
    var(--closing-lift)) auto 34px}`): como es el primer elemento después
    del deco, **arrastra todo el bloque** (título + botón + flecha +
    pie) hacia arriba en conjunto, hasta meterlo dentro del racimo de
    destellos. El `z-index` (deco `0`, título `1`) es para que el texto
    quede por encima de los destellos. Subir/bajar ese número mueve el
    bloque entero.
  - `.closing-title`: dos líneas en `--font-hand` (Caveat) — "Potencia"
    en `--ink` (`.closing-title-line1`, `clamp(60px,8.3vw,98px)`) y "tu
    claridad mental y enfoque" en `--closing-teal`
    (`.closing-title-line2`, más grande, `clamp(60px,8.7vw,106px)`),
    cada una su propio `<span class="closing-title-lineN">` en bloque
    (no hay `.title-mark` acá, el color va directo en el span). Ambas
    líneas se agrandaron ~15% respecto de los valores originales, y
    "Potencia" otro ~13% extra (el usuario pidió más presencia para esa
    palabra). En desktop la 2ª línea entra en 1 sola línea (1010px de
    1100 disponibles); en mobile pasa a 3 líneas, sin desborde.
  - `--closing-teal:#00CEB3`: verde azulado **muestreado del dominante
    no-blanco de la imagen de referencia** que mandó el usuario. Variable
    local de `#lam-07` para **no tocar el `--green` global** (`#2E7D5B`),
    que usan otras secciones. Solo lo llevan la 2ª línea del título y la
    flecha.
  - Botón `.btn.btn-solid` "Descubrir mi plan personalizado"
    (`#btnNutricionCierre`) — **mismo listener que `#btnNutricion`**
    (`resetNutriWizard()` + `openModal('modalNutricion')`) pero id
    propio porque un id no puede repetirse en el documento; se agregó
    un segundo `addEventListener` en `js/script.js`, no se reusó ningún
    selector de clase compartido. Lleva además `.closing-btn`
    (`font-size:16.5px;padding:17px 35px`), un override **local** para
    agrandarlo ~15% sin tocar el `.btn` global del sitio.
  - `.closing-arrow` (flecha SVG simple apuntando arriba, `color:
    var(--closing-teal)`, `30px` de lado, y el `stroke-width` del
    `<path>` en `index.html` subido de `2` a `3.25` a pedido del usuario
    — ~4px efectivos, se ve "robusta") con una animación propia de rebote
    suave (`closing-arrow-bounce`, 1.8s, recorrido de 7px, respeta
    `prefers-reduced-motion`) — no reutiliza `@keyframes float` del
    sitio (ese tiene un recorrido más grande, pensado para elementos
    flotantes grandes).
  - `.closing-sub`: texto chico "Diseñamos tu plan de neuroalimentación
    en menos de 3 minutos." debajo de la flecha (`17px`, agrandado ~15%
    junto con el resto del bloque).
  - El `<footer>` (antes al final de `#lam-06`) se movió acá — ahora es
    el cierre real del `<body>`. `#lam-07 footer{text-align:left}`
    para que no herede el `text-align:center` de la sección (el footer
    ya se alinea solo vía flex `space-between`, esto es solo por el
    texto dentro de cada span/div).
  - El botón "Solicitar asesoría" del nav (`href` en `#lam-01`) ahora
    apunta a `#lam-07` en vez de `#lam-06` — es la acción de "empezar",
    tiene que llevar al wizard, no a la info de contacto pasivo. El link
    "Contacto" del nav (`#lam-06`) no se tocó: sigue siendo correcto,
    ahí vive el email/redes.
  - **6 frutas chicas alrededor (sesión 2026-09-18)**: pedido del usuario,
    "frutas pequeñas como alrededor", y después "alejalas más del texto".
    Son `<img class="deco deco-fruit closing-fruit …">` hijas directas de
    `<section id="lam-07">` (antes de `.wrap`; mismo patrón que Pilares/
    Beneficios: float, `z-index:0` detrás del texto, `.deco-fruit` ya las
    oculta en `<720px`). Posiciones inline en `index.html`:
    kiwi/naranja (arriba, a los lados de los destellos) y palta/almendras
    (abajo, a los lados del botón) van **ancladas al centro** de la
    sección (`calc(50% ± Npx)` envuelto en `max()`/`min()` para no
    salirse del borde en anchos medianos), porque destellos, botón y
    subtítulo también están centrados y así conservan la distancia a
    cualquier ancho; arándanos y granada (`.closing-fruit--side`, a la
    altura de "Potencia") van en `%` del viewport (`left:3%`/`right:4%`).
    En `css/styles.css` (junto a `.closing-deco`): `.closing-fruit--side`
    se oculta en `≤1000px` y todas `.closing-fruit` en `≤860px` (más
    temprano que el `720px` general, porque antes chocaban con el botón,
    el subtítulo o los destellos). Assets reusados: `svg/deco-blob-
    {kiwi,orange,berries,avocado,almonds}.svg` + `img/generadas-cutout/
    granada.webp`.
    ⚠️ **Para verificar el layout hay que tener las fuentes reales**: sin
    Caveat/Fraunces (Google Fonts no carga offline) el título cae a un
    serif y pasa a 2 líneas, así que las posiciones "se ven bien" en un
    layout que no es el de producción. En el entorno de trabajo se
    instalaron `@fontsource/{caveat,fraunces,inter}` con npm en `/tmp` y
    se inyectaron con `page.addStyleTag` (`@font-face` con `file://`) en
    la prueba de Playwright. Con el título en 1 línea (Caveat real) el
    resultado se midió a 1425/1911/1100/900px.
    Primer intento (frutas a ~20% del borde, pegadas al texto) descartado:
    el usuario las pidió más lejos; a 800px se pisaban con el botón y el
    subtítulo.
  - **Pie con degradado lila (sesión 2026-09-18)**: pedido del usuario,
    "la parte final de la web como moradito difuminado, de abajo hacia
    arriba, hasta donde dice © 2026 SINAPTIX…", "mismo color de las otras
    secciones que tienen el color morado". Es `#lam-07::before`
    (`css/styles.css`, junto a `#lam-07 footer{text-align:left}`): franja
    a todo el ancho pegada al borde inferior de la sección, a **color
    pleno** `--panel` (#F7F1F5, el lavanda de Visión/Método/Beneficios/
    Conócenos, no un morado nuevo) detrás de las 2 filas del pie, y recién
    arriba se desvanece a blanco:
    `linear-gradient(0deg, var(--panel) 0, var(--panel) var(--closing-foot-solid), rgba(247,241,245,0) 100%)`.
    Variables locales de `#lam-07`: `--closing-foot-solid` (tramo sólido:
    `135px` desktop, `165px` en `≤900px`) y `--closing-foot-h` (alto total:
    `240px` / `270px`). `z-index:0` detrás del `.wrap` y de las frutas.
    Se hizo en un pseudo-elemento de la sección y no en el `<footer>`
    porque este vive dentro de `.wrap` (1180px) y no llega a los bordes.
    Medidas (Playwright): las filas de texto del pie quedan a 110–130px
    del borde inferior en desktop y hasta 160px en `≤900px` (el pie se
    parte en 2 filas; `padding-bottom` de la sección baja a 70px en
    `≤720px`); el subtítulo termina ~257px sobre el borde (`margin-top`
    del footer 100px + línea del pie a 157px), por eso `--closing-foot-h`
    se queda debajo de eso para no tocarlo. Si cambia el `padding-bottom`
    de `#lam-07` o el texto/estructura del `<footer>`, re-medir y ajustar
    solo esas 2 variables.
    ⚠️ **No volver a un degradado lineal continuo desde el borde**: la
    primera versión (mismo color, `--panel` a 0 y transparente a 175px,
    con un punto medio a alfa .6) se desvanecía tan rápido que a la altura
    del texto del pie quedaba ~20% del color y el usuario lo veía
    "todavía blanco" en su navegador. El color en sí ya era el correcto;
    el problema era la intensidad en la zona del texto. Si se quiere más
    marcado todavía, la opción es `--panel-2` (#F1E5EC) en la base, pero
    ya no sería el mismo color que el resto de las secciones moradas.
- **Collage de redes en `#lam-06` "Conócenos" (sesión 2026-09-18, integrado
  en HTML/CSS propio)**: nueva columna derecha con una composición tipo
  "app showcase" — perfil de TikTok, teléfono con Instagram, correo y
  dashboard de "Mi plan", superpuestos con leve inclinación — armada 100%
  con HTML/CSS/SVG y assets reales del sitio (texto seleccionable, sin
  pixelado). **Reemplaza** a la versión anterior (imagen `.webp` generada
  por IA, que traía texto deformado y bordes sucios de recorte — el
  archivo se borró del repo, ya no lo usa nada). Portado 1:1 desde
  `docs/mockup-collage-redes.html` (esa maqueta sigue en el repo como
  referencia/banco de pruebas para futuros ajustes, no se carga desde
  ninguna página del sitio).
  - `.contact-info` (columna de texto/redes que ya existía) y la nueva
    `.conocenos-collage` viven dentro de `.conocenos-grid`
    (`grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)`, colapsa a 1
    columna en `≤900px`). Tamaño/posición del wrapper: sangrado a la
    derecha con `--collage-bleed` =
    `clamp(0px,calc((100vw - 1180px)/2 + 70px),250px)` (offset base
    `+70px`, tope `250px`; bajado desde `+100px/280px` el 2026-09-19 con
    "un poquito más pequeño", y antes desde `+140px/340px` el 2026-09-18),
    `left:20px` en desktop,
    `left:0` + `max-width:560px` centrado en `≤900px`. Como todas las
    medidas internas salen de `100cqw`, bajar el sangrado encoge todo el
    collage en proporción: **~836px × 507px** a 1440px (antes 866×525, y
    906×550 antes de eso), con el borde izquierdo en el mismo lugar. Con
    el valor actual, a 1440px el collage entra completo (se ven las
    tarjetas "hola@sinaptix.com" y "Tu progreso con SINAPTIX" de la
    derecha). Ver
    `css/styles.css` para el detalle de esas reglas, no repetido acá.
  - **`.collage`** (antes `.conocenos-collage-img`): `container-type:
    inline-size`, `width:100%`, `aspect-ratio:1162/705`, con la animación
    `float` (la misma `@keyframes float` del Hero/Pilares) +
    `prefers-reduced-motion`. Adentro, `.stage` define `--u:calc(100cqw/
    1000)` y **todas** las medidas de las piezas (`.mk-*`) salen de esa
    unidad — cambiar el ancho del wrapper reescala todo (texto incluido),
    sin media queries adicionales.
    ⚠️ **Ojo con `width` fijo en `.collage`**: en la maqueta original tenía
    `width:970px;max-width:100%` (pensado para verse bien "suelto"). Puesto
    dentro de `.conocenos-collage` (grid item con `margin:auto`/sizing
    automático), ese `width:970px` fijo se filtraba al cálculo de tamaño
    intrínseco (`max-content`) de los contenedores padre — los navegadores
    ignoran `max-width` en porcentaje durante ese cálculo — y terminaba
    **desbordando el layout ~190px en mobile** aunque visualmente pareciera
    contenido. Se resolvió sacando el `width:970px` y dejando `width:100%`
    a secas (el propio `.conocenos-collage` ya define el ancho máximo real).
    Si se vuelve a copiar código desde `docs/mockup-collage-redes.html`
    (que sigue con `width:970px;max-width:100%`, ahí no da problema porque
    no vive dentro de un contenedor con sizing automático), **no copiar
    esa línea tal cual** a `styles.css`.
  - El dashboard de "Mi plan" dentro del collage (`.mk-dash`) dibuja su
    propio medidor de IMC de ejemplo con **las mismas funciones y clases**
    que Método/"Mi plan" (`imcGaugeAgujaDeg`, `imcGaugeMarkerPos`,
    `imcCategoria`, `imcGaugeGradientDefsHtml`, clases `.imc-*`) — función
    `renderConocenosImcGauge()` en `js/script.js` (llamada junto con
    `renderMethodGauges()`/`renderMethodImc()` al cargar), host
    `#conocenosImcGauge`. Valor fijo (IMC 24,5, "Saludable"), sin marcas
    numeradas ni animación de barrido — mismo criterio que el medidor
    chico de la maqueta original.
  - ⚠️ **Datos de ejemplo sin reemplazar**: seguidores/publicaciones/"me
    gusta" de TikTok e Instagram, remitentes/asuntos del correo, y el IMC/
    objetivo/barras del dashboard son todos inventados (idénticos a los de
    `docs/mockup-collage-redes.html`). Mostrar métricas de redes falsas en
    el sitio real puede jugar en contra — reemplazar por datos reales o
    quitar los números antes de un deploy a producción. Pendiente, no
    resuelto en esta sesión (el usuario aprobó el diseño, no dio números
    reales todavía).
  - ⚠️ **Legibilidad del texto en mobile**: medido en este entorno con
    Playwright a 390px de viewport (ancho real del collage ≈346px, dentro
    de `.conocenos-grid`), el texto queda entre **~3.5px y ~5px** de
    tamaño de fuente real (ej. `.mk-ig-bio` ~3.8px, `.mk-mail-row .sub`
    ~3.5px) — nítido (es vectorial) pero prácticamente ilegible a simple
    vista en un teléfono real. El wrapper ya es `aria-hidden="true"` (es
    "prueba social" visual, no contenido que deba leerse letra por letra —
    incluye el mismo criterio que ya usaba la imagen de IA, que tampoco
    era legible a ese tamaño) y una sesión anterior ya había decidido que
    este bloque se achica en vez de ocultarse en mobile (no es decoración
    pura como los `.deco-fruit` de alrededor). Se deja así a propósito,
    pero si en algún momento se pide que se lea mejor en mobile, las
    opciones son: (a) subir el `max-width` mínimo del wrapper en `≤900px`
    a costa de permitir que sobresalga un poco del grid, o (b) mostrar
    menos piezas en mobile (ej. solo el teléfono) para poder agrandarlas.
  - **✅ Verificado visualmente** en este entorno con Playwright/Chromium a
    1440px y 390px (mismo browser cacheado que otras verificaciones de esta
    fecha, ver nota de entorno más abajo): a 1440px se ve idéntico en
    composición/posición a la versión con imagen; a 390px **no hay overflow
    horizontal** (`scrollWidth === clientWidth`, corregido el bug de
    `width:970px` de arriba) y las `deco-fruit` de fondo no chocan con el
    collage. Falta la confirmación de siempre sobre un deploy real (ver
    "Pendientes conocidos").
  - **Halo oscuro difuso detrás del collage (sesión 2026-09-18)**: pedido
    del usuario, "difuminado transparente oscuro por los bordes del
    collage, **sin alterar la imagen**". Se resolvió con un
    `filter:drop-shadow(0 0 <blur> rgba(38,22,31,<alpha>))` en `.stage`
    (`css/styles.css`, justo debajo de `.stage svg`): se pinta **debajo**
    del contenido, sigue la silueta real de las piezas y no toca los
    píxeles del collage. Se ajusta con 2 variables locales de `.stage`:
    `--collage-halo-alpha` (`.48`) y `--collage-halo-blur`
    (`calc(var(--u)*46)`, escala con el collage). El usuario pidió
    "más aún" tras ver `.42`/`38u` (de ahí `.62`/`46u`) y después pidió
    bajarlo "solo un poco": alfa final `.48` (2026-09-18).
    ⚠️ **No reintentar** los 3 enfoques descartados: (1) viñeta encima
    (overlay `linear-gradient` en `::after`) → rectángulo oscuro con
    borde duro; (2) anillo `radial-gradient` elíptico encima → "se ve un
    óvalo oscuro"; (3) `mask-image` en el wrapper → difuminaba el propio
    collage, que es justo lo que el usuario NO quería. Regla: el efecto
    va **detrás** de las piezas, nunca encima ni como máscara.
    Verificado con Playwright (`reducedMotion:'reduce'` para congelar el
    `float`) comparando pixel a pixel contra la versión sin halo: el
    contenido de fotos/tarjetas queda igual; lo único que cambia adentro
    es el antialiasing de los bordes del texto (el navegador pinta bajo un
    `filter` con otro suavizado, imperceptible a simple vista).

## Pendientes conocidos

> **Nota sobre el entorno de trabajo (2026-09-18)**: varios pendientes de
> abajo dicen "no hay browser en este entorno" — eso fue cierto en las
> sesiones que los escribieron, pero en la sesión del collage de redes
> **sí había Playwright con Chromium ya instalado y cacheado**
> (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, `node -e "require('playwright')"`
> resolvía sin error). Como el entorno de trabajo se resetea entre
> sesiones, **no asumir en ningún sentido** (ni que hay browser ni que no
> hay) — probar `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node -e
> "require('playwright').chromium.launch().then(b=>b.close())"` al
> arrancar cualquier sesión que tenga pendientes de verificación visual
> antes de asumir que hay que saltearla o pedirle al usuario una captura.
> Si está disponible, se puede abrir `index.html`/`mi-plan.html` con
> `file://` directo (sitio estático, no hace falta servidor) y sacar
> screenshots de las secciones en cuestión a distintos anchos.

- **Collage de redes — decidir entre imagen de IA y maqueta HTML/CSS**:
  ver "Estado actual del diseño" → "Alternativa en HTML/CSS". Esperando
  que el usuario mire `docs/mockup-collage-redes.html` y diga si se
  integra o se descarta.
- **Collage de redes en `#lam-06` "Conócenos" — verificar en un deploy
  real**: ver "Estado actual del diseño" → bullet "Collage de redes" para
  el detalle de la implementación. Se verificó visualmente en este mismo
  entorno (Playwright/Chromium, resultó estar disponible esta sesión —
  ver nota en "Entorno de trabajo" más abajo) a 1440px y 390px, ambos se
  ven bien, pero falta el mismo tipo de confirmación que el resto del
  sitio: cómo se ve en un navegador real sobre el deploy de Netlify.
  - Ajuste fino del 2026-09-18 (ver changelog): verificado en el
    navegador integrado de VS Code sobre Live Server a
    1000/1100/1280/1366/1440/1567/1920px (versión imagen, ~970px de ancho
    a 1567px) y a 1440px (versión HTML/CSS, ~836px con `--collage-bleed`
    en `+70px/250px`). En el deploy real conviene mirar sobre todo el
    borde derecho, aunque con el valor actual ya no queda cortado a
    1440px (antes se salía ~87–88px de pantalla, corte aceptado por el
    usuario) y en ventanas de ~1000px `.contact-info`
    desborda su columna 113px (el email grande + botón de copiar) —
    desborde preexistente, sin tocar.

- **PDF de "Mi plan" — verificar contra el CDN real y en visores reales**:
  todo se verificó con el bundle de jsPDF servido localmente (cdnjs no es
  alcanzable desde el entorno de trabajo) y mirando el PDF rasterizado con
  `pdftoppm`. Falta confirmar en un deploy real: (a) que el `<script>` a
  `cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.1/jspdf.umd.min.js` carga bien
  y no lo bloquea ninguna CSP, (b) que el `fetch` de `img/sinaptix-icon.png`
  para el logo no da problemas de CORS en producción (es mismo origen, no
  debería), y (c) cómo se ve el documento en Acrobat/Preview/visores de
  Android, no solo rasterizado. Si el logo fallara, el PDF igual se genera
  con el fallback vectorial.
  - Pendiente del diseño vigente (3ra ronda, 2026-09-19): si el usuario
    pide en algún momento el QR de verificación o el pill "Semana X" que
    tenía su mockup, hace falta primero construir el backend real detrás
    (endpoint de verificación; concepto de "semana del plan" en el
    modelo de datos) — no maquillarlo con un QR o un número que no
    signifique nada. Ver la nota roja en `docs/mockup-pdf-mi-plan.html`.
  - Los íconos de sección/tarjeta del mockup del usuario (lucide) no se
    reconstruyeron con primitivas de jsPDF — se probó con una bombilla
    para el banner de resumen y a ese tamaño lee como forma rota. Si en
    algún momento se agregan íconos reales, lo más simple es embeberlos
    como PNG pequeños (`addImage`), no como vectores dibujados a mano.

- **Verificar en navegador real (sesión 2026-09-18, escala numerada del
  medidor de IMC + segunda pasada "más estético": riel de fondo, marcas
  chicas, sombra de aguja, pivote tipo tuerca, halo del marcador)**: no
  hay browser en este entorno. Falta confirmar que los números 15/40 de
  los extremos no queden pegados/cortados contra el borde de la tarjeta
  `.stat-box` en mobile (`mi-plan.html`) ni contra `.method-imc-featured`
  en Método, que el halo de color detrás del marcador no se vea
  demasiado fuerte/artificial, y que las puntas redondeadas del arco se
  vean bien contra el riel gris de fondo.
- **Verificar en navegador real (sesión 2026-09-18, íconos de redes +
  tarjetas de Pilares + fundido)**: implementado a partir de una captura
  que mandó el usuario, sin poder correr Playwright (no hay browser
  instalado en este entorno ni acceso de red para instalarlo). Falta
  confirmar: que el degradado de Instagram se vea bien, que el tamaño
  nuevo de `.pillar` ya no se sienta vacío, y que el fundido de
  `#lam-05` disimule el corte contra `#lam-04` en pantallas reales
  (no solo en la lógica del gradiente).
- **Visión — sesión 2 (mobile + limpieza)**: el posicionamiento de las 4
  `.stat-annot` en mobile ya se resolvió (sesión 2026-09-19, grilla 2×2
  con tinte de color + ícono, ver "Estado actual del diseño" arriba).
  Falta solo la parte de limpieza: `--vision-card-*` ya está en uso de
  nuevo (no aplica limpiarlas), pero las reglas `#lam-02 .stat-box`/
  `.stat-grid`/`svg/icon-*.svg` de la vieja etapa de tarjetas de caja
  siguen sin uso real en esta sección — decidir si se borran o quedan
  comentadas. Falta también revisar que la nueva grilla no choque con
  `.brain-fruit`/`.deco-blob-berries`/`.deco-scribble` en ningún
  breakpoint (no revisado explícitamente en esta sesión, aunque las
  capturas a 360/390/760/900px no mostraron superposición).
- **Verificación visual real pendiente** (implementado y revisado a
  mano/con Playwright local, pero no confirmado en un navegador real
  sobre el deploy) en varios frentes:
  - **Color por ícono del pulso de Visión y orden detrás de los íconos**
    (`--ve-c`, sesión 2026-09-19, 3ª ronda — reemplaza la nota de la 2ª
    ronda de esta misma lista, que usaba los colores de las `.stat-annot`
    en vez de los reales): verificado con Playwright/Chromium en este
    entorno — orden del DOM confirmado (`svg` antes de `.vision-icons`,
    se ve el pulso tapado por cada ícono), 6 capturas a lo largo de un
    ciclo a 1440px con los 4 colores nuevos (muestreados de los `.webp`),
    sin errores de consola, keyframes inyectados con los valores
    esperados. Sigue siendo la primera vez que el sitio usa `@property` y
    `color-mix()` — conviene confirmar explícitamente que el navegador
    real soporta ambas features (son relativamente nuevas) y no solo que
    "se ve bien": si `@property` no corre, el pulso se queda en un solo
    color fijo (el `initial-value`, dorado) en vez de romperse, así que
    un fallo ahí sería silencioso.
  - **`#lam-07` (Cierre)**: ✅ **verificado visualmente** en la 2ª pasada
    del 2026-09-18, ya con browser disponible (escritorio 1440px +
    móvil 390px, sin desborde horizontal). Confirmado: que el deco se ve
    bien a `max-width:620px`, que el texto entra en el racimo con
    `--closing-lift`, que las 2 líneas del título no se ven
    desproporcionadas, y que el salto `--panel`→`--paper` contra
    `#lam-06` es sutil y no necesita un fundido más marcado. Falta solo
    verlo sobre un deploy real (hasta ahora, todo local).
  - `#formContacto` sacado de `#lam-06` (sesión 2026-09-18): revisado el
    markup y el JS a mano, pero **no visualmente** — confirmar que no
    dejó nada roto.
  - Íconos de Visión ya revertidos a tamaño original — confirmar que no
    tapan el texto de "4–6"/"1:1" (ver bullet de arriba).
  - Animación de llenado + marcador de "antes" de los anillos de Método,
    y auto-scroll del wizard al mensaje final — no se pudo correr
    Playwright en las sesiones que las implementaron.
  - Login/registro/recuperación de contraseña propios de "Mi plan":
    todo lo anterior se verificó con `netlifyIdentity` mockeado (el
    script real de `identity.netlify.com` no es alcanzable desde este
    entorno). Falta confirmar contra Netlify real: (a) signup con
    confirmación desactivada entra directo al dashboard, (b) los textos
    exactos de error del servidor coinciden con `authMensajeError()`
    (si no, cae al mensaje genérico y hay que agregar el caso), (c)
    `plan-sync.js` sigue sincronizando tras un login por esta vía, (d) la
    plantilla de recuperación de Netlify apunta a
    `{{ .SiteURL }}/#recovery_token={{ .Token }}`, y (e) un token vencido
    da error y no un 200.
- **Cambio de correo** (`#email_change_token=…`): no está cubierto por el
  intercepto del `<head>` (solo mira `recovery_token`). No hay ninguna
  parte del sitio que ofrezca cambiar el correo, así que hoy no es
  alcanzable en la práctica, pero si se agrega esa opción hay que sumar
  el caso.
- **Login con Google/GitHub**: no existe. `gotrue.loginExternalUrl(provider)`
  lo haría, pero requiere habilitar el proveedor en el panel de Netlify
  primero.
- Ver `README.md` → "Próximos pasos" para el detalle funcional. El único
  punto realmente accionable ahí (verificación en un deploy real) **no
  se puede hacer desde este entorno**: no hay credenciales de Netlify ni
  acceso de red a dominios `netlify.app`/`netlify.com`.
- Descartado (no reintroducir sin que el usuario lo pida): trazos tipo
  "marcador" dispersos sueltos por el sitio (rompía el wrapping de
  títulos con `display:flex`); doble anillo concéntrico en los gauges de
  Método; sidebar en el dashboard de "Mi plan"; `overflow-x`/`overflow-y`
  en el elemento `html`; panel `.contact-cta` (CTA grande al wizard
  arriba de Contacto con el bloque de email/formulario atenuado como
  secundario, sesión 2026-09-18) — implementado y revertido en la misma
  sesión, el usuario lo vio y no le gustó (sin más detalle de qué
  específicamente). **Reemplazado (misma sesión 2026-09-18) por un
  enfoque distinto que si se implementó**: sección `#lam-07` propia al
  final del sitio (mini-hero de cierre centrado, a partir de una imagen
  de referencia del usuario) en vez de un panel dentro de Contacto — ver
  "Estado actual del diseño" → bullet "Cierre". Si el usuario tampoco
  queda conforme con este segundo intento, no volver al panel
  `.contact-cta` sin preguntar primero qué no convenció de ninguno de
  los dos.

**Importante para quien retome cualquier cambio visual: mostrar una
captura al usuario y esperar confirmación explícita antes de dar la
sesión por buena.** Ya pasó más de una vez que un cambio (colores de
íconos, fondo pastel, tamaño de íconos de Visión) se implementó sin
poder verse en un navegador real y terminó siendo revertido o corregido
en la sesión siguiente porque no convenció o rompía algo — no repetir
ese patrón.
