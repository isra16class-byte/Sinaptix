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
  `lam-06` (Hero, Visión, Método, Pilares, Beneficios, Contacto).
- `mi-plan.html` — página propia (no sección de `index.html`) para "Mi
  plan": nav propio, estado sin sesión (`#miPlanSinSesion`, con
  login/registro propios) y estado con sesión (`#miPlanConSesion`,
  dashboard con IMC, objetivo, gráfico de barras, detalle del plan).
- `css/styles.css` — toda la hoja de estilos (paleta, tipografía, layout).
- `js/script.js` — lógica específica de `index.html` (wizard modal de
  nutrición, formularios, Netlify Identity, anillos de progreso de
  Método).
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
  Hoy solo `docs/mockup-pdf-mi-plan.html`: la maqueta aprobada del PDF de
  "Mi plan", para poder mirar y discutir el diseño en el navegador sin
  generar un PDF. No se carga desde ninguna página.
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

- **PDF de "Mi plan" (`js/mi-plan-pdf.js`, sesión 2026-09-18)**: botón
  "Descargar mi plan en PDF" (`#btnDescargarPdf`) en la tarjeta "Cierre",
  junto a "Generar mi plan" y "Cerrar sesión". Genera el documento 100% en
  el navegador de quien hace click; no toca Netlify Functions ni genera
  cargos.
  - **Vectorial, sin html2canvas**: todo se dibuja con primitivas de jsPDF
    (texto, `rect`/`roundedRect`, líneas, `triangle`, y polígonos para los
    sectores de la dona — jsPDF no tiene primitiva de arco, se aproxima el
    arco con segmentos rectos de 3° vía `doc.lines`). Resultado: texto
    seleccionable y buscable, nítido a cualquier zoom, ~138 KB.
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
    `js/nutricion-planes.js`). `nutriPdfModelo()` es pura y testeable; el
    dibujo vive aparte.
  - ⚠️ **`NUTRI_PLANES` se resuelve por identificador léxico, no por
    `window`**: `nutricion-planes.js` lo declara con `const` en el tope de
    un `<script>` clásico, y los `const`/`let` de nivel superior NO quedan
    colgados de `window` (a diferencia de las `function`). Buscarlo en
    `window` devolvía `undefined` y el PDF salía vacío. Ver
    `depsPorDefecto()`.
  - ⚠️ **Paleta propia, NO la del sitio**: el morado de marca
    (`--purple`/`--purple-dark`) se usó en la primera versión y el usuario
    lo rechazó ("el morado no queda en ese PDF"). En papel y en visores de
    PDF lee como un lila apagado y le da al documento aire de folleto, no
    de informe. El PDF usa una paleta neutra —azul noche `#1A2542` para
    títulos y marca, azul acero `#3B6EA5` para acentos, grises pizarra
    para texto y reglas— con acentos semánticos. La marca sigue presente
    por el logo y la tipografía. **No "arreglar" esto volviendo a la
    paleta del sitio.**
  - **Rampa semántica propia** (`RAMPA` / `pdfColorPorcentaje`): las barras
    y las zonas del IMC van rosa `#BE123C` → ámbar `#D97706` → esmeralda
    `#059669`, no los colores de `gaugeColorForPercent` (terracotas cálidos
    del sitio, que sobre esta paleta se ven embarrados). Es el mismo
    criterio, distintos tonos: si cambia el criterio de color del
    dashboard, revisar también acá.
  - **Trazo fino, no grueso**: barras de 2,4 mm (antes 3,4), anillo de la
    dona de 4,5 mm de grosor (antes 7,5), bordes de 0,25 mm, filetes de
    color a sangre de 1 mm contra el borde de cada caja, círculos del
    timeline de r=2,5 mm. Los títulos de sección son versalitas sobre una
    regla, no serif grande con el número en un círculo relleno: ese
    tratamiento competía con el encabezado y engordaba el documento.
  - **Tipografía**: Times + Helvetica en vez de Fraunces + Inter. jsPDF
    solo trae las 14 fuentes estándar del formato PDF, y embeber las
    reales como TTF base64 sumaba ~300 KB solo para esta feature. Se
    conserva el par serif-display / sans-cuerpo del sitio. Paleta,
    jerarquía y layout sí son idénticos. Además, las fuentes estándar usan
    WinAnsi: los acentos y la ñ entran bien, pero `pdfTextoSeguro()`
    normaliza los símbolos que no (— → “ ” … ✓), y **desescapa** el HTML
    que `nutriConstruirAjustes` había escapado para `innerHTML` (si no, se
    vería `&amp;` literal).
  - **Bloques del documento**: encabezado con el logo real
    (`img/sinaptix-icon.png` vía `addImage`, con fallback vectorial si el
    `fetch` falla) → panel destacado de objetivo → fila de 2 tarjetas
    (barras foco/memoria/energía/calma con marca de meta punteada + barra
    de IMC por zonas OMS con puntero) → estrategia nutricional (chips de
    nutrientes + cajas Priorizar/Moderar de alto igualado) → día tipo
    (timeline numerado + dona con leyenda al costado) → ajustes → avisos
    con color por nivel → panel legal → pie con "Página X de Y".
  - **Dos números que NO salen de la encuesta** (van rotulados como
    orientativos en el propio PDF): la meta de las barras, fija en 80% e
    igual para las 4 áreas, y el reparto de la dona (Desayuno 30 / Snack
    10 / Almuerzo 35 / Cena 25). Si algún plan estrena un momento nuevo en
    su `diaTipo`, hay que agregarlo a `REPARTO` — hay un test que lo
    verifica.
  - **Paginación**: `ctx.espacio(h)` reserva alto y abre página nueva con
    encabezado compacto; los títulos de sección reservan también el alto
    del bloque que viene debajo, para que nunca quede un título colgado al
    pie. Con el caso más cargado (6 prioridades, 6 ajustes, 5 avisos) el
    documento sale en 2 páginas.
  - **Referencia visual**: `docs/mockup-pdf-mi-plan.html`. Si se cambia el
    diseño del PDF, actualizar los dos.
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
  **Frutas/alimentos grandes difuminados de fondo (sesión 2026-09-17)**:
  antes la sección solo tenía 1 `.deco-fruit` (aguacate). Ahora tiene 6,
  todas `.deco-fruit` (ocultas en mobile `<720px` por la regla general,
  con la animación float de siempre):
  - 4 en las esquinas del `<section>`, grandes (150–230px) y con
    opacidad baja (.4–.5) para leerse como fondo difuminado, no como
    protagonistas: aguacate (`svg/deco-blob-avocado.svg`, arriba-izq.),
    granada (`img/generadas-cutout/granada.webp`, arriba-der.), huevo
    (`img/generadas-cutout/huevo.webp`, abajo-izq.) y té
    (`img/generadas-cutout/te.webp`, abajo-der.) — mismo criterio visual
    que ya usan Beneficios/Contacto.
  - 2 más chicas y más opacas (.6–.9, se leen más nítidas, no son
    "fondo") forman un cluster junto a la granada, a la derecha del
    título, a pedido explícito del usuario con una imagen de referencia:
    una hoja fina (`svg/deco-leaf-beneficios.svg`) y una naranja
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
  tarjeta blanca centrada (`.miplan-locked-card`) con candado SVG a mano,
  formularios propios de login/registro (ver punto siguiente) y "Volver
  al sitio" como link de texto. Detrás, 1 ilustración grande de cerebro
  (`img/decoraciones-neurona/cerebro-mi-plan.webp`, sangrando por el
  borde derecho, oculta en mobile `<900px`) + 3 `deco-fruit` reusadas
  (aguacate/kiwi/almendras). `#miPlan{min-height:100vh;overflow:hidden}`
  para evitar franja blanca bajo el footer.
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
    `icon-red-neuronal`, `icon-reloj-arena`, `icon-cintas-azules`), no
    quemados en el fondo — el fondo sin íconos es
    `fondo-vision-red-sin-iconos.webp`. **Estado actual: revertidos a la
    versión original tal cual se generaron la primera vez** (sin el
    agrandado que se probó y descartó en tandas intermedias, sin recortes
    contra el borde del lienzo). Reproducibles con
    `scripts/separar-iconos-vision.py` si hace falta volver a generarlos.
    ⚠️ Estas proporciones no son las que calibraron `.vision-icon--*`
    (width/top en `css/styles.css`) — **falta confirmar en navegador real
    si tapan el texto de las anotaciones de abajo**; si tapa, ajustar
    `.vision-icon--*`, no las imágenes.
  - **Los 4 datos ya no son tarjetas** (`.stat-box`, descartado): son 4
    `.stat-annot` (punto de color + número Fraunces + etiqueta corta) con
    posición libre en porcentaje dentro de `.vision-art` (contenedor
    compartido con `.vision-brain-bg`, así escalan juntos a cualquier
    ancho). **Solo hecho para desktop (`min-width:901px`)** — mobile
    (`<900px`) queda con fallback simple en columna, sin diseñar (ver
    "Pendientes conocidos", sesión 2). Colores por dato: dorado 20%,
    morado 86B, verde 4–6, azul 1:1 — mismos 4 de siempre.
  - Subtítulos de los 3 bullets de texto (`.vision-bullets strong`) en
    `--purple` (antes casi negro), para combinar con "alimenta" del
    título.
  - `svg/icon-*.svg` (los íconos de línea `.stat-icon` de la etapa vieja
    de tarjetas) y las variables `--vision-card-*` quedan sin uso en esta
    sección — no se borraron, limpieza pendiente para la sesión 2.

- **Beneficios (`#lam-05`, "Para quién es")**: fondo `--panel` (lavanda
  claro, heredado de `section.dark`). Los 4 destinatarios son una lista
  vertical (`.ben-audience-grid`/`.ben-audience-item`, flex) con ícono de
  línea propio a la izquierda del texto (`svg/icon-maletin.svg`,
  `icon-graduacion.svg`, `icon-equipo.svg`, `icon-reloj-fatiga.svg` —
  stroke `currentColor`, creados para esto, no existía ese estilo en el
  repo). Las 2 `.quote-card` de testimonios tienen: 5 estrellas
  (`.quote-stars`, SVG inline; las llenas llevan clase `.is-filled` →
  `fill:var(--gold)` — M.R. 4/5, J.S. 5/5, calificación fija en el
  markup, no dinámica) + badge "Verified Client" con ícono escudo-check
  arriba; texto sin cursiva ni comillas propias; avatar circular con
  iniciales + nombre en negrita/rol en línea aparte
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
  - **3 frutas chicas "saliendo" de las tarjetas** (mismo pedido,
    ajuste siguiente): cada `.quote-card` ahora tiene su propio
    `.quote-card-wrap` (`position:relative`) en vez de un solo
    contenedor para las 2 — así cada fruta se ancla a la esquina real
    de SU tarjeta (`top`/`bottom`/`left`/`right` en px negativos) sin
    depender de adivinar la altura total. Arándanos
    (`svg/deco-blob-berries.svg`, 78px) en la esquina superior derecha
    de la 1ª tarjeta; kiwi (`svg/deco-blob-kiwi.svg`, 66px) en la
    superior izquierda de la 2ª; almendras
    (`svg/deco-blob-almonds.svg`, 80px) en la inferior derecha de la
    2ª. Overlap ajustado para que la mayor parte quede tapada por el
    vidrio (`top`/`right`/etc en solo -14/-16px, no como el intento
    anterior que dejaba más afuera que adentro) y **sin el
    `drop-shadow`** de `.deco-fruit` (`.ben-quote-fruit{filter:none}`)
    — ese filtro es justo lo que las hacía ver como stickers sueltos
    flotando encima en vez de saliendo de la tarjeta. Feedback del
    usuario tras la 1ª versión (grande pero "como stickers sueltos"):
    confirmado por elección múltiple, no fue posición ni las frutas en
    sí.

- **Contacto (`#lam-06`)**: sobre `.contact-wrap` (columna izquierda +
  `.contact-form`), la columna izquierda tiene: franja de confianza
  (`.contact-trust`, ítems con ícono en `--purple`) → `.big-email` con
  botón circular de copiar al lado (`.copy-email-btn`,
  `navigator.clipboard`, tooltip "Copiado ✓" por CSS) → redes sociales
  como grid de tarjetas (`.social-cards`/`.social-card`, 2x2 desktop/1
  col ≤480px, ícono en círculo + nombre + handle), ya no lista de filas.
  El formulario y su envío por `mailto:` (`js/script.js`) no cambiaron
  en su lógica.
  - **Color de marca por red** (`.social-card-icon`): Instagram, Facebook
    y TikTok llevan su color/degradado oficial + ícono blanco
    (`.social-card-icon--instagram/--facebook/--tiktok`, clases
    modificadoras sobre el círculo base). Teléfono queda con el círculo
    genérico `--panel-2`/ícono `--purple` de siempre (no es red social,
    no tiene color de marca que aplicar).
  - **CTA principal al wizard, email/formulario pasan a alternativa
    secundaria** (sesión 2026-09-18, pedido explícito: el usuario no
    quiere estar respondiendo correos uno por uno, prefiere que el
    plan se genere solo): arriba de `.contact-wrap`, nuevo panel
    `.contact-cta` (fondo `--purple-soft`, mismo criterio que
    `.scale-opt:has(input:checked)`) con eyebrow "Sin esperas", título
    "Generá tu plan de neuroalimentación ahora mismo" y botón
    `.btn.btn-solid.btn-lg.js-abrir-nutricion` ("Generar mi plan
    ahora"). `.btn-lg` es un modificador nuevo y genérico (`padding:16px
    30px;font-size:16px`), reutilizable en cualquier `.btn` del sitio.
    `.js-abrir-nutricion` es una clase (no id, para poder repetirse en
    más de un botón a futuro) con listener propio en `js/script.js` que
    hace lo mismo que `#btnNutricion` (`resetNutriWizard()` +
    `openModal('modalNutricion')`) — no se reusó el id porque ya existe
    en Método y los id deben ser únicos en el documento.
    `.contact-wrap` original queda envuelto en `.contact-wrap-secondary`
    (`opacity:.92`, ajuste sutil, no oculta nada) con un
    `.contact-secondary-label` ("¿Preferís escribirnos igual?") arriba
    del texto. Se sacó el ítem de confianza "Respondemos en menos de
    24h" (prometía respuesta humana con SLA, contradice el pedido) y se
    reescribió el copy de la columna ("También podés contactarnos por
    estos medios para consultas puntuales" en vez de invitar a escribir
    como acción principal). El botón "Enviar mensaje" del formulario
    pasó de `.btn-solid` a `.btn-ghost` para que no compita visualmente
    con el CTA del wizard. No se tocó el envío por `mailto:` en sí — si
    más adelante se quiere sacar el email de raíz o automatizar la
    respuesta, ver ideas descartadas/pendientes de la conversación con
    el usuario (no todas implementadas todavía: FAQ, autorespuesta,
    redirigir "Enviar mensaje" al wizard, botón flotante global, etc.).

## Pendientes conocidos

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
  - Pendiente menor de diseño: cuando la persona no tiene datos
    antropométricos, la tarjeta "ANTROPOMETRÍA" queda bastante vacía (solo
    una línea de texto) porque su alto lo fija la tarjeta de barras de al
    lado. Se dejó así a propósito (mantiene la grilla), pero si molesta,
    lo natural es que la tarjeta de barras pase a ocupar todo el ancho.

- **Verificar en navegador real (sesión 2026-09-18, escala numerada del
  medidor de IMC + segunda pasada "más estético": riel de fondo, marcas
  chicas, sombra de aguja, pivote tipo tuerca, halo del marcador)**: no
  hay browser en este entorno. Falta confirmar que los números 15/40 de
  los extremos no queden pegados/cortados contra el borde de la tarjeta
  `.stat-box` en mobile (`mi-plan.html`) ni contra `.method-imc-featured`
  en Método, que el halo de color detrás del marcador no se vea
  demasiado fuerte/artificial, y que las puntas redondeadas del arco se
  vean bien contra el riel gris de fondo.
- **Verificar en navegador real (sesión 2026-09-18, Contacto — CTA al
  wizard + email/formulario secundario)**: implementado sin poder ver el
  resultado en un navegador. Falta confirmar: que `.contact-cta` no se vea
  desbalanceado contra el resto de la sección (fondo `--purple-soft` muy
  sutil/muy fuerte), que `.contact-wrap-secondary{opacity:.92}` se note lo
  suficiente como "secundario" sin parecer un error de estilos, y que el
  botón `.btn-ghost` de "Enviar mensaje" siga siendo cómodo de ver/clickear
  sobre `.contact-form` (fondo `--paper`).
- **Verificar en navegador real (sesión 2026-09-18, íconos de redes +
  tarjetas de Pilares + fundido)**: implementado a partir de una captura
  que mandó el usuario, sin poder correr Playwright (no hay browser
  instalado en este entorno ni acceso de red para instalarlo). Falta
  confirmar: que el degradado de Instagram se vea bien, que el tamaño
  nuevo de `.pillar` ya no se sienta vacío, y que el fundido de
  `#lam-05` disimule el corte contra `#lam-04` en pantallas reales
  (no solo en la lógica del gradiente).
- **Visión — sesión 2 (mobile + limpieza)**: falta decidir y construir el
  posicionamiento de las 4 `.stat-annot` en mobile (`≤900px`) — el
  posicionamiento libre de desktop no aplica ahí tal cual, puede requerir
  una versión apilada (punto + número + etiqueta en línea) u otra
  solución, no decidido de antemano. Revisar que no choquen con
  `.brain-fruit`/`.deco-blob-berries`/`.deco-scribble` en ningún
  breakpoint. Decidir si se limpian las variables/reglas sin uso
  (`--vision-card-*`, `svg/icon-*.svg` de la etapa de tarjetas) o quedan
  comentadas. Verificar con Playwright en 1440 y 390px antes de cerrar.
- **Verificación visual real pendiente** (implementado y revisado a
  mano/con Playwright local, pero no confirmado en un navegador real
  sobre el deploy) en varios frentes:
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
  en el elemento `html`.

**Importante para quien retome cualquier cambio visual: mostrar una
captura al usuario y esperar confirmación explícita antes de dar la
sesión por buena.** Ya pasó más de una vez que un cambio (colores de
íconos, fondo pastel, tamaño de íconos de Visión) se implementó sin
poder verse en un navegador real y terminó siendo revertido o corregido
en la sesión siguiente porque no convenció o rompía algo — no repetir
ese patrón.
