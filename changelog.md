# Changelog

Historial de cambios de este repo, un patch por entrada, orden cronológico
inverso (lo más nuevo arriba). No se borran entradas viejas. Ver
`memoria.md` para el estado actual del proyecto y las reglas de este
archivo.

## 2026-09-13 — Ajuste fino de la neurona derecha de LAM-03 (más visible y más abajo)

- El usuario confirmó con una captura que el ajuste anterior (bajar la
  neurona derecha y empujarla fuera de pantalla) se veía bien, y pidió
  dos afinamientos menores: que se asomen un poco más las ramitas, y
  bajarla un poco más.
- `index.html`: en `neurona-derecha.webp`, el offset extra del anclaje
  al borde real pasó de `-260px` a `-200px` (60px menos de empuje hacia
  afuera, así se ve un poco más de las puntas de las dendritas), y
  `top` pasó de `340px` a `400px`.
- Archivos tocados: `index.html`.

## 2026-09-13 — Neurona derecha de LAM-03 bajada y empujada fuera de pantalla (solo ramitas visibles)

- El usuario mandó una captura de cómo se veía la sección en producción:
  ambas neuronas (izquierda y derecha) se veían completas y muy
  prominentes, casi simétricas, ocupando gran parte del ancho. Pidió que
  la neurona **derecha** se bajara y se moviera más hacia la derecha
  para que **solo se vieran las puntas de las ramas** (no el soma ni el
  cuerpo principal).
- `index.html`: en `neurona-derecha.webp` (hija directa de
  `#lam-03`), `top` pasó de `10px` a `340px` (baja de estar junto al
  título a la altura del bloque de progreso/timeline), y el offset del
  truco de anclaje al borde real (`right:calc(50% - (var(--vw100,
  100vw) / 2))`) se le restaron `260px` adicionales
  (`... - 260px`), empujando la imagen más allá del borde derecho real.
  Como la imagen es el espejo de la izquierda, el soma queda en el
  borde derecho de la imagen — al empujarla más afuera, el soma y el
  cuerpo quedan fuera de pantalla y solo asoman las puntas de las
  dendritas que se extendían hacia la izquierda de la imagen.
- La neurona izquierda **no se tocó**.
- **No verificado en navegador real** desde este entorno (el render
  headless disponible no decodifica `.webp`); el ajuste se razonó por
  valores CSS. Si al verlo se asoma más o menos de lo esperado, avisar
  para afinar el offset de `-260px` o el `top:340px`.
- Archivos tocados: `index.html`.

## 2026-09-13 — Neuronas de LAM-03 ancladas al borde real de la pantalla y más grandes

- El usuario mandó una captura marcando en rojo, sobre las dos neuronas
  agregadas en el patch anterior, que el corte recto del soma quedaba
  "feo" flotando a mitad de camino (no coincidía con ningún borde real)
  y pidió agrandarlas bastante, del tamaño aproximado de los círculos
  que dibujó a mano.
- `index.html`: se movieron `neurona-izquierda.webp` y
  `neurona-derecha.webp` de ser hijas de `.lam-title-frame` a ser hijas
  directas de `<section id="lam-03">` (mismo nivel que
  `chocolate.webp`/`semilla-chia.webp`), y se cambió su posicionamiento
  horizontal de offsets fijos (`left:-60px`/`right:-60px`, relativos a
  `.lam-title-frame`) al mismo truco que ya usan los `deco-scribble` de
  esta sección para anclarse al **borde real del viewport**:
  `left:calc(50% - (var(--vw100, 100vw) / 2))` (y su espejo
  `right:calc(...)`). Al coincidir el corte recto del soma con el borde
  de la pantalla, deja de leerse como un error y pasa a verse como que
  la neurona "sale" del borde. De paso se agrandaron de `160px` a
  `380px` de ancho.
- Sin cambios en las imágenes en sí (mismos `.webp`), solo en cómo se
  posicionan.
- Archivos tocados: `index.html`.

## 2026-09-13 — Dos neuronas decorativas flanqueando el título de LAM-03 (Método)

- Se agregaron dos ilustraciones de neurona (`.deco deco-fruit`, mismo
  tratamiento que las fotos de comida: flotación, oculta en mobile
  <720px, detrás del contenido) a cada lado del `.lam-title-frame` en
  `#lam-03`.
- **Pieza izquierda** (`img/decoraciones-neurona/neurona-izquierda.webp`):
  reconstruida a partir de `img/neuronas/neurona-izquierda-aprobada
  (1).jpg` (ilustración ya aprobada por el usuario). Ese archivo fuente
  era un JPG con el cuadriculado de "transparencia" de un visor
  **horneado como píxeles reales** (sin canal alfa real) — se detectó y
  se reconstruyó un PNG con transparencia real, y como el brillo dorado
  difuminado de las puntas de sinapsis se perdía casi por completo al
  quitar el cuadriculado (quedaban fragmentos duros), se regeneró ese
  brillo de forma sintética (glow radial suave) sobre las puntas
  detectadas de las dendritas, dejando intactos el soma, las ramas y el
  ícono de cerebrito+nube tal cual estaban.
- **Pieza derecha** (`img/decoraciones-neurona/neurona-derecha.webp`):
  se decidió **no volver a pedirle a Gemini** que generara la pieza
  derecha — varios intentos previos no lograban replicar la misma
  composición espejada (forma de soma distinta, dos neuronas conectadas,
  canopy completo en vez de media copa). En cambio: se tomó la imagen
  izquierda ya reconstruida, se le quitó el ícono de cerebrito, se
  espejó horizontalmente (flip simple), y se dibujó un ícono de hoja
  (mismo estilo lineal delgado y color que `svg/deco-leaf-beneficios.svg`)
  en la posición espejada donde estaba el cerebrito.
- `index.html`: ambas imágenes se insertaron como hijas de
  `.lam-title-frame` en `#lam-03`, una a cada lado del título
  (`left:-60px` / `right:-60px`, `width:160px`, `opacity:.9`). Se bajó
  la opacidad de `chocolate.webp` en esa misma sección (`.5` → `.3`,
  única decoración de comida cercana verticalmente al título) para que
  las neuronas sean el elemento protagonista al enmarcar el título;
  `semilla-chia.webp` no se tocó (está en la parte baja de la sección,
  lejos del título).
- **No se pudo verificar visualmente en un navegador real desde este
  entorno**: mismo problema de siempre (sin red a Google
  Fonts/Netlify Identity) más un hallazgo nuevo — el render headless
  disponible (`wkhtmltoimage`, motor QtWebKit) no decodifica `.webp`,
  así que ni siquiera sirve para chequear posición/tamaño de estas
  imágenes puntuales. Si al verlo en un navegador real las neuronas
  quedan mal ubicadas, se superponen con el texto del título, o chocan
  con `chocolate.webp`/`semilla-chia.webp`, avisar para ajustar los
  valores (no hace falta tocar el resto de la sección).
- Archivos tocados: `index.html`; nuevos
  `img/decoraciones-neurona/neurona-izquierda.webp` y
  `img/decoraciones-neurona/neurona-derecha.webp`.

## 2026-09-13 — Tipografía unificada, quitar granada de LAM-03 y arreglar corte de fotos en la costura LAM-02/LAM-03

- El usuario mandó una captura y pidió tres cosas sobre el patch anterior:
  1. Que el título de **todas** las secciones use la misma tipografía
     manuscrita que ya tenía la sección 3 (Método).
  2. Quitar la foto de granada que se había agregado a `lam-03`.
  3. Arreglar que `curcuma.webp` y `aceite-oliva.webp` (en `lam-02`) se
     ven "cortadas" justo donde empieza `lam-03`, **sin mover su
     posición** (el usuario aclaró que la posición está bien).
- `css/styles.css`: se movió el tratamiento tipográfico manuscrito
  (`--font-hand`, `font-weight:700`, `font-size:clamp(40px,6vw,68px)`,
  etc.) de la regla especial `#lam-03 .lam-title, #lam-04 .lam-title`
  a la regla **base** `.lam-title` — ahora todos los títulos de sección
  (`lam-02` a `lam-06`, más los de `mi-plan.html`) salen con la misma
  fuente. Se eliminó la regla especial (quedaba duplicada) y se dejó
  intacto el ajuste del subrayado `.title-mark` de `lam-03`/`lam-04`. Ver
  "Tipografía de títulos unificada" en `memoria.md`.
- `index.html`, sección `#lam-03`: se quitó el `<img>` de
  `granada.webp` agregado en el patch anterior. Quedan solo
  `chocolate.webp` y `semilla-chia.webp` en esa sección.
- `index.html`, sección `#lam-02`: se agregó `z-index:1` (inline, en el
  `style` existente) a `curcuma.webp` y `aceite-oliva.webp` — la causa
  del corte era orden de pintado (la sección siguiente se pinta encima
  por ir después en el HTML, no la posición), así que se corrigió el
  `z-index` sin tocar `left/right/bottom/width/opacity/transform`. Ver
  detalle del razonamiento en "Bug de recorte en la costura entre
  secciones" en `memoria.md`.

## 2026-09-13 — Método (LAM-03): agregar fotos de comida decorativas

- El usuario pidió agregarle a la sección 3 (`lam-03`, Método) las
  decoraciones que ya se usaron en `lam-02`/`lam-05`/`lam-06`: fotos de
  comida recortadas (`img/generadas-cutout/`) flotando con el mismo
  tratamiento visual (`.deco.deco-fruit`) que ya tenían los blobs SVG de
  esa sección.
- `index.html`, sección `#lam-03`: se agregaron tres `<img>` nuevas
  (hermanas del blob de almendras existente, `svg/deco-blob-almonds.svg`,
  que no se tocó) usando fotos ya generadas en sesiones anteriores:
  `chocolate.webp`, `semilla-chia.webp` y `granada.webp` (las mismas tres
  que ya se usan en `lam-05` — no había fotos cutout sin usar en el
  repo, así que se reutilizaron; son puramente decorativas y no
  informativas, reutilizarlas entre secciones no es un problema).
- No se agregó CSS nuevo: reutiliza la clase `.deco-fruit` ya definida
  (animación de flotación + `drop-shadow`, oculta en mobile
  `max-width:720px`). Posiciones elegidas a mano (esquinas de la sección,
  detrás del contenido `z-index:0`) para no chocar con el timeline ni el
  panel de medidores.
- Mismo problema de siempre para verificar visualmente desde este
  entorno (sin red a Google Fonts/Netlify Identity, render headless
  inconsistente) — si al verlo en un navegador real alguna foto se ve
  descuadrada o choca con el timeline/medidores, avisar para ajustar
  posición/tamaño/opacidad sin tocar el resto de la sección.

## 2026-09-13 — Método (LAM-03): difuminar la costura con las secciones blancas vecinas

- El usuario mandó una captura mostrando que el cambio de color anterior
  (crema sólido) generaba una línea horizontal muy marcada contra el
  blanco de las secciones de arriba/abajo (`lam-02`, `lam-04`), y pidió
  diluir esa transición.
- `css/styles.css`, mismo bloque `#lam-03{...}`: se agregó
  `background:linear-gradient(180deg, var(--paper) 0, var(--panel) 220px,
  var(--panel) calc(100% - 220px), var(--paper) 100%)` (funde a blanco en
  los primeros/últimos ~220px de la sección en vez de cortar en seco), y
  se aclaró un poco la paleta (`--panel` `#EBE5D7` → `#F1ECDE`, `--purple`
  `#7C5C45` → `#82644E`) para que se sienta menos saturada.
- Ver "Paleta cálida propia de LAM-03" en `memoria.md` para el detalle
  completo y la nota de siempre: no se pudo verificar visualmente en un
  navegador real desde este entorno.

## 2026-09-13 — Paleta cálida (crema + café) solo en Método (LAM-03)

- El usuario mandó una imagen de referencia (mockup generado con IA) con
  un fondo beige/crema y acentos café, y pidió aplicar ese color a la
  sección 3 (Método).
- `css/styles.css`: se agregó un bloque `#lam-03{--panel:#EBE5D7;
  --panel-line:...; --panel-text:...; --purple:#7C5C45;
  --purple-dark:#5B4432; --purple-soft:...}` que sobreescribe, solo
  dentro de esa sección, las custom properties que ya usaban el fondo, el
  eyebrow, la línea de tiempo, el switch "Mi progreso"/"Mi IMC" y los
  botones — no se duplicó CSS, se aprovechó que las custom properties
  heredan a los descendientes (incluido el SVG de los anillos que arma
  `js/script.js`). Las demás secciones "dark" (Beneficios, Contacto) y
  "Mi plan" no cambian.
- No se tocaron los colores semánticos de los medidores (rojo/dorado/
  verde según umbral, ej. zonas de IMC) ni la tipografía del título de
  `#lam-03` (sigue en `Caveat`, manuscrita) — el pedido fue solo el color.
- Ver "Paleta cálida propia de LAM-03" en `memoria.md`: **no se pudo
  verificar visualmente en un navegador real desde este entorno** (mismas
  limitaciones de red/render headless de siempre); avisar si el color no
  coincide con lo esperado al verlo.

## 2026-09-13 — Fotos de comida flotantes en Visión, Beneficios y Contacto

- El usuario subió 10 fotos/ilustraciones de alimentos (estilo "cutout",
  fondo blanco) a `img/generadas/` y pidió adaptar las secciones 2
  (Visión), 5 (Beneficios) y 6 (Contacto) al mismo estilo visual que ya
  usa el resto de la página (fotos de fruta flotantes, como en el hero).
- Como los jpg originales tienen fondo blanco sólido (no transparente), no
  se podían usar tal cual sobre secciones con fondo de color sin que se
  viera un recuadro blanco. Se generaron versiones `.webp` con el fondo
  removido y recortadas al contenido, guardadas en la carpeta nueva
  `img/generadas-cutout/` (nombres normalizados sin espacios/typos:
  `granada`, `chocolate`, `curcuma`, `espinaca`, `filete`, `huevo`,
  `remolacha`, `semilla-chia`, `te`, `aceite-oliva`).
- Se agregaron esas imágenes como decoración flotante (`class="deco
  deco-fruit"`, reutilizando la animación/drop-shadow que ya existía en
  `css/styles.css` — no se agregó CSS nuevo) en `lam-02` (huevo, cúrcuma,
  aceite de oliva), `lam-05` (granada, remolacha, chocolate, semilla de
  chía) y `lam-06` (té, filete, espinaca). Los blobs SVG que ya tenía cada
  sección no se tocaron.
- Ver "Fotos de comida generadas" y "Decoraciones nuevas en LAM-02 /
  LAM-05 / LAM-06" en `memoria.md` para el detalle del proceso de recorte
  y una nota importante: **no se pudo verificar visualmente el resultado
  en un navegador real desde este entorno** (sin acceso de red a Google
  Fonts/Netlify Identity para el render headless de prueba); si algo se ve
  descuadrado, avisar en la próxima sesión para ajustar posiciones sin
  tocar el resto.
- No se usó `Gemini_Generated_Image_ot5quuot5quuot5q.jpg` (imagen suelta
  sin nombre descriptivo, quedó sin usar en `img/generadas/`).

## 2026-09-13 — Confirmado en producción: el backend de "Mi plan" funciona de punta a punta

- El usuario probó "Mi plan" en el sitio real desplegado (deploy
  `master@94d6ba4`, el que migró la función a formato moderno) con sesión
  real iniciada: el plan se guardó y se cargó correctamente. Confirma que
  los dos fixes anteriores (`@netlify/neon` → `@netlify/database`, y
  `plan.js` → `plan.mjs` con `getUser()` de `@netlify/identity`)
  resolvieron el problema de verdad, no solo en teoría contra la
  documentación.
- `memoria.md`: se actualizó la sección "Backend real para Mi plan" y el
  listado de "Pendientes conocidos" para reflejar que esto ya está
  verificado en producción, no pendiente. No se cambió ningún código en
  esta entrada — es puramente documentación.

## 2026-09-13 — Fix: la función seguía sin conectar (Lambda compatibility mode no inyecta la connection string)

- **Segundo bug real, en el mismo deploy de prueba**: resuelto el paquete
  (`@netlify/database`) y confirmado que el provisioning de la base se
  completó bien (según el log del deploy), la función seguía fallando con
  `MissingDatabaseConnectionError: The environment has not been configured
  to use Netlify Database`.
- **Causa raíz**, confirmada contra la guía oficial de troubleshooting de
  Netlify Database: `netlify/functions/plan.js` usaba la firma **clásica**
  (`exports.handler = async function(event, context)`), que Netlify
  reconoce como **"Lambda compatibility mode"**. En ese modo, la
  connection string de Netlify Database **no se inyecta automáticamente**
  al runtime — es el único primitivo de la plataforma donde eso pasa.
- **Fix**: la función se migró al **formato moderno de Netlify Functions**:
  - Renombrada `netlify/functions/plan.js` → **`netlify/functions/plan.mjs`**
    (extensión `.mjs` para forzar ES modules sin tocar `"type"` en
    `package.json`).
  - `export default async (req, context) => {...}` (Web `Request`/
    `Response`) en vez de `exports.handler` (`event`/`{statusCode, body}`).
  - Autenticación migrada de `context.clientContext.user` a **`getUser()`
    de `@netlify/identity`** (dependencia nueva en `package.json`), que
    lee sola el header `Authorization` de la request entrante. `user.id`
    reemplaza a `user.sub` como identificador único del usuario en las
    queries (mismo valor, distinto nombre de propiedad).
- **`README.md`** y **`memoria.md`** actualizados con el nombre de archivo
  correcto (`plan.mjs`) y una segunda nota explicando este bug, para que
  una sesión futura no vuelva a escribir una función de este repo con la
  firma clásica.
- **Sigue sin verificarse en un deploy real** si este segundo fix resuelve
  el error de verdad (no hay cuenta de Netlify ni deploy disponibles desde
  este entorno) — sí quedó confirmado, por los dos deploys reales que
  compartió el usuario, que el paquete `@netlify/database` en sí conecta
  bien una vez que el entorno tiene la connection string.

## 2026-09-13 — Fix: el backend de "Mi plan" usaba un paquete deprecado (`@netlify/neon` → `@netlify/database`)

- **Bug real encontrado en un deploy**: la función `plan.js` fallaba en
  *todas* las invocaciones con `[@netlify/neon] Failed to instantiate Neon
  client: connection string is not provided ... (NETLIFY_DATABASE_URL)`.
  Diagnóstico: la extensión "Neon"/`@netlify/neon` de Netlify DB (beta)
  quedó **deprecada** — Netlify bloqueó el aprovisionamiento de bases
  nuevas por esa vía desde abril de 2026, y la reemplazó por **Netlify
  Database** (GA), con el paquete nativo `@netlify/database` y su propia
  variable `NETLIFY_DB_URL` (no `NETLIFY_DATABASE_URL`). Como el sitio
  nunca provisionó nada con la extensión vieja, la variable jamás existió.
- **`package.json`**: reemplazada la dependencia `@netlify/neon` por
  `@netlify/database` (`^1.0.0`, resuelve a `1.1.0`). `package-lock.json`
  regenerado.
- **`netlify/functions/plan.js`** reescrita para usar `getDatabase()` de
  `@netlify/database` en vez de `neon()`: el `GET` usa `db.sql` (tagged
  template, bindea `user.sub` como parámetro seguro); el `POST` usa
  `db.pool` (un `pg.Pool` crudo, mismo patrón que las transacciones de la
  doc oficial) porque necesita interpolar un nombre de columna (`tipo`) en
  el texto de la query, algo que un tagged template no permite hacer de
  forma segura (esos placeholders son solo para valores).
- **Nueva `netlify/database/migrations/20260913231933_create_mi_plan.sql`**:
  el `CREATE TABLE mi_plan (...)` que antes vivía como
  `CREATE TABLE IF NOT EXISTS` dentro de la función (`ensureTabla`, ya
  eliminada) ahora es una migración de verdad — con Netlify Database, el
  esquema **debe** manejarse por archivos de migración que Netlify aplica
  solo durante el deploy; correr DDL desde el código de una función ya no
  es el patrón soportado.
- **`README.md`** y **`memoria.md`** actualizados: todas las menciones a
  `@netlify/neon`/Netlify DB (beta)/`NETLIFY_DATABASE_URL` en la sección de
  backend se corrigieron a `@netlify/database`/Netlify Database
  (GA)/`NETLIFY_DB_URL`. `memoria.md` agrega además una nota explicando el
  bug real y su diagnóstico, para que una sesión futura no repita el mismo
  error si vuelve a tocar este backend.
- **Sigue sin verificarse en un deploy real** (no hay cuenta de Netlify ni
  sitio desplegado disponible desde este entorno): que la migración se
  aplique sola, que el error original quede resuelto de verdad, y que el
  `POST`/`GET` funcionen de punta a punta con una sesión real. Ver
  `memoria.md`, sección "Backend real para Mi plan", "Pendiente de
  verificación real".

## 2026-09-13 — Backend real para "Mi plan": Netlify DB + Netlify Functions

- Implementa el pendiente conocido "backend real para Mi plan" (ver
  `memoria.md`): los 3 bloques de datos (antropometría, objetivo/plan,
  reevaluación) ahora se sincronizan con el servidor cuando hay sesión
  iniciada, además de seguir guardándose en `localStorage` como hasta
  ahora — `localStorage` sigue siendo lo único que lee el resto del sitio,
  esto es un espejo agregado encima, no un reemplazo.
- **Nuevo `package.json`** (no existía) declarando `@netlify/neon` como
  única dependencia — el sitio sigue sin build step propio. Se agregó
  `.gitignore` con `node_modules/` por lo mismo. Al tener esa dependencia,
  Netlify auto-provisiona Netlify DB (Postgres/Neon) y su variable de
  entorno en el próximo build/deploy, sin pasos manuales en el dashboard.
- **Nueva `netlify/functions/plan.js`**: `GET` devuelve los datos guardados
  del usuario autenticado, `POST` hace upsert de un solo bloque por vez
  (`antropometria` / `objetivo` / `reevaluacion`, validado contra una lista
  fija). Autenticación vía `context.clientContext.user` (Netlify decodifica
  el JWT de Identity solo con que el cliente mande el header
  `Authorization`). Tabla `mi_plan` (una fila por usuario) creada con
  `CREATE TABLE IF NOT EXISTS` en cada invocación, sin migraciones aparte.
- **`netlify.toml`**: se agregó `[functions]` con
  `directory = "netlify/functions"` y `node_bundler = "esbuild"`.
- **Nuevo `js/plan-sync.js`** (compartido entre `index.html` y
  `mi-plan.html`): `planSyncGuardar(tipo, datos)` (fire-and-forget, nunca
  bloquea el formulario que la llama) y `planSyncCargar()` (trae y mezcla
  en `localStorage` lo que haya en el servidor, el servidor manda).
- **Enganchado en los 3 puntos existentes de guardado** (`js/script.js`:
  `#formAntro`, `#formNutricion`, `#formReevaluacion`; `js/mi-plan.js`: el
  wizard inline de `mi-plan.html`; `js/nutricion-planes.js`:
  `nutriGuardarAntropometriaSiFalta`) sin cambiar la lógica que ya existía
  en ninguno, solo sumando la llamada de sincronización justo después de
  cada `localStorage.setItem` que ya estaba.
- **`planSyncCargar()` enganchado en `js/mi-plan.js`**, dentro de
  `mostrarEstadoConSesion` (se llama tanto en `init` como en `login` de
  Identity): ahora espera a traer los datos del servidor antes de llamar a
  `pintarMiPlan`. No se tocó `index.html`/`script.js` para esto porque esa
  página ya redirige a `mi-plan.html` al hacer login, que es donde vive
  toda la lectura de "Mi plan".
- **Pendiente de verificación real, no se pudo hacer desde esta sesión**
  (sin cuenta de Netlify ni deploy real disponibles acá): que la base se
  autoprovisione como documenta Netlify, que `context.clientContext.user`
  llegue poblado con un JWT real, que el upsert con columna interpolada
  funcione contra Neon, y que "Mi plan" persista de verdad entre dos
  dispositivos con la misma cuenta. Ver el detalle completo en
  `memoria.md`, sección "Backend real para Mi plan".

## 2026-09-13 — "Mi plan": dos bugs reales que impedían que se pareciera a la referencia

- El usuario pidió explícitamente diagnosticar por qué el resultado no se
  parecía a la imagen de referencia, en vez de seguir ajustando a ciegas.
  Se encontraron **dos problemas concretos** (no de tipografía ni de
  padding general, ya resueltos en sesiones anteriores):
  1. **`.miplan-cierre` tenía `align-self:stretch`** (agregado en la
     sesión que armó el dashboard, sin que se hubiera pedido): eso
     forzaba a la tarjeta "Cierre" a estirarse hasta igualar la altura de
     `#miPlanDetalle` (la columna de al lado), que es mucho más alta —
     el resultado era un cuadro "Cierre" con montón de aire vacío arriba
     de los botones (empujados al fondo con `margin-top:auto`). La
     referencia no hace esto: la tarjeta "Cierre" es compacta, del alto
     de su propio contenido. **Se sacó `align-self:stretch`** — el grid
     padre (`.miplan-detalle-grid`) ya tenía `align-items:start`, que es
     lo que se necesitaba.
  2. **`#miPlanDetalle` (`.nutri-summary`) se pintaba en una sola columna
     larga**, con todas las listas (nutrientes, priorizar, moderar, día
     tipo, ajustes, avisos) apiladas una debajo de la otra — de ahí que
     esa columna terminara siendo altísima comparada con la referencia,
     que agrupa el mismo tipo de contenido en pares de columnas más
     densos (Enfoque+Priorizar, Suplementos+Aviso). Esa era la causa real
     de "se nos va casi toda la pantalla": no era el padding general
     (ya se había ajustado antes), era que el contenido en sí ocupaba
     mucho más alto de lo necesario en una sola columna.
- **Diagnóstico de por qué no se había resuelto antes**: en las dos
  sesiones anteriores se evitó tocar el HTML interno que arma
  `nutriBuildResumenHTML()` (compartido con el paso 8 del wizard en
  `index.html`), por precaución de no romper ese otro uso — pero eso
  significó no atacar la causa real (la altura de esa columna), solo
  ajustar el padding alrededor. La solución no requería tocar esa
  función: se resuelve en CSS, scoped a `#miPlan .nutri-summary`.
- **Fix aplicado, ambos en `css/styles.css`**:
  - `.miplan-cierre` pierde `align-self:stretch`; los dos botones de
    `.miplan-cierre-btns` pasan de apilados verticalmente a lado a lado
    (`flex-direction:row`, `flex:1` cada uno) — con la tarjeta ya
    compacta, apilarlos ocupaba más alto del que hacía falta.
  - `@media(min-width:680px){ #miPlan .nutri-summary{ display:block;
    column-count:2; column-gap:28px } ... }`: reparte el mismo HTML de
    siempre (sin tocar `nutriBuildResumenHTML`) en 2 columnas tipo
    diario dentro de "Mi plan" únicamente — el modal de `index.html`
    (`#nutriResumen`, 640px de ancho) no se ve afectado porque el
    selector está scoped a `#miPlan`. Se agregan `break-after:avoid-
    column` en los títulos de bloque (`h4`, `.nutri-block-title`) y
    `break-inside:avoid-column` en las listas/`.nutri-dia-tipo`/notas
    para que un título no quede separado de su contenido ni una lista se
    parta a la mitad entre columnas. Por debajo de 680px de viewport
    sigue en una columna (mobile).
- No se tocó ningún `id` ni el HTML de `mi-plan.html` en este fix — es
  100% CSS. Verificado con jsdom (ids intactos) y con la librería `css`
  de npm (sigue parseando bien con las reglas nuevas).

## 2026-09-13 — "Mi plan": layout más compacto, menos scroll (sin tocar la tipografía)

- El usuario aclaró que el pedido anterior **no** era sobre la tipografía
  del título (esa parte quedó bien) sino sobre lo apretado/ordenado que se
  ve todo en la imagen de referencia comparado con cómo quedó el sitio
  real: acá se iba "casi toda la pantalla" y hacía falta bastante scroll
  para ver el mismo contenido que en la referencia entra sin apenas
  desplazarse. **No se tocó ningún commit anterior de tipografía** (el
  patch que revertía Caveat→Fraunces del intento anterior queda
  descartado, no se generó de nuevo).
- Causa principal: `#miPlan` es una pantalla de utilidad (dashboard), pero
  heredaba el padding vertical genérico de `section` (`130px` arriba /
  `110px` abajo, pensado para las secciones tipo "slide" de `index.html`)
  y el `margin-top:100px` de `footer` (mismo criterio, pensado para
  secciones largas) — sumado, dejaban más de 300px de aire vertical sin
  contenido real.
- **Se recorta solo para `#miPlan`** (no se toca `section`/`footer` en
  general, así que `index.html` sigue exactamente igual):
  - `#miPlan{padding:104px 0 56px}` (antes heredaba `130px 0 110px`).
  - `#miPlan footer{margin-top:48px}` (antes heredaba `100px`).
  - `#miPlanConSesion .sec-head-center .lam-title{margin:14px 0 6px}` y
    `.lam-text{margin:0}` en ese mismo bloque — recorta el aire entre el
    título y el email de sesión, sin cambiar tamaño de fuente ni el resto
    del tratamiento tipográfico.
  - `#miPlan .miplan-subhead{margin-bottom:12px}` (antes `16px`), y el
    `margin-top` del segundo subhead ("Detalle del plan de nutrición") en
    `mi-plan.html` bajó de `40px` a `26px`.
  - Padding interno de las tarjetas recortado de `26-28px` a `20px`:
    `#miPlan .stat-box`, `#miPlan .bar-chart-card`, `#miPlan .miplan-cierre`,
    `#miPlan .nutri-summary`.
  - `gap` de `.miplan-grid`/`.miplan-col`/`.miplan-detalle-grid` de `16px`
    a `14px`.
- Verificado con la librería `css` de npm que `css/styles.css` sigue
  parseando sin errores tras el cambio. Sigue pendiente la verificación
  visual real (Playwright no puede instalar Chromium en este entorno, ver
  entradas anteriores) — conviene confirmar que con esto el contenido de
  "Mi plan" entra con bastante menos scroll, comparando contra la imagen
  de referencia.

## 2026-09-13 — "Mi plan": título en una línea con tipografía manuscrita, sin el eyebrow "Mi plan"

- El usuario vio el layout tipo dashboard recién aplicado y pidió dos
  ajustes al título de `#miPlanConSesion`: que "Tu progreso con SINAPTIX"
  entre en una sola línea (antes se partía en dos y "se comía" espacio
  vertical sin dar impacto visual) y que use la misma tipografía
  manuscrita del título de la sección 4 (Pilares, `#lam-04`), no Fraunces.
- Se sacó el `<span class="eyebrow">Mi plan</span>` que iba arriba del
  título (a pedido explícito del usuario, "quitemos eso de mi plan").
- **Nueva clase reusable `.title-hand`** en `css/styles.css`: mismo
  tratamiento que ya tenían `#lam-03 .lam-title`/`#lam-04 .lam-title`
  (`font-family:var(--font-hand)` = Caveat, `font-weight:700`,
  `letter-spacing:0`, `line-height:1.15`,
  `font-size:clamp(40px,6vw,68px)`), pero como clase aplicable a un título
  puntual fuera de esas dos secciones — se eligió una clase nueva en vez
  de agregar `#miPlan .lam-title` al selector existente para no afectar de
  paso el título de "Iniciá sesión para ver tu plan" ni el de la encuesta
  inline ("Creamos tu plan de neuroalimentación"), que **no** se tocaron.
- En `mi-plan.html`, el `h2` de `#miPlanConSesion` pasa a
  `class="lam-title title-hand"` con `style="max-width:28ch"` (antes
  `16ch`, que era lo que forzaba el corte en dos líneas) — mismo mecanismo
  que ya usa `#lam-04` con `26ch` para su título de longitud similar (ver
  `memoria.md`, sección de títulos manuscritos).
- Verificado con jsdom: el `h2` mantiene el texto y el resto de `id`
  intactos, no queda ningún `.eyebrow` dentro de ese bloque, y
  `css/styles.css` sigue parseando con `.title-hand` definido — mismo
  límite de red que la entrada anterior (no se pudo confirmar con
  capturas reales de Playwright en este entorno).

## 2026-09-13 — "Mi plan": layout tipo dashboard (Datos clave / Detalle del plan)

- A partir de una imagen de referencia (mockup con "Mi plan" reorganizado en
  un dashboard más denso, con encabezados "Datos Clave" y "Detalle del Plan
  de Nutrición"), se reacomodó `#miPlanConSesion` en `mi-plan.html` sin crear
  componentes de datos nuevos — son los mismos de siempre (medidor de IMC,
  tarjeta de objetivo, gráfico de barras, resumen del plan, botones),
  reordenados en una grilla de 2 columnas en vez de una sola columna larga.
- Encabezado (eyebrow + título + email) ahora centrado, envuelto en
  `.sec-head-center` (clase ya existente, reusada de Método/Pilares).
- Nuevo subtítulo de sección `.miplan-subhead` ("Datos clave"), seguido de
  `.miplan-grid` (2 columnas): a la izquierda el `stat-box` del medidor de
  IMC (sin cambios internos), a la derecha `.miplan-col` con la tarjeta de
  objetivo (ahora con ícono `img/Iconos/icon-neuronas.webp`, reusado de
  Pilares) apilada arriba del `bar-chart-card` (gráfico de barras).
- Segundo subtítulo `.miplan-subhead` ("Detalle del plan de nutrición")
  seguido de `.miplan-detalle-grid` (2 columnas): a la izquierda el
  `nutri-summary` de siempre (`#miPlanDetalle`, mismo HTML que arma
  `nutriBuildResumenHTML`), a la derecha una tarjeta nueva `.miplan-cierre`
  ("Cierre") que agrupa el texto de `#miPlanCta` y los botones "Generar mi
  plan"/"Cerrar sesión" — antes esos dos botones quedaban sueltos al final
  de la columna única.
- Ningún `id` se tocó (`miPlanImc`, `miPlanObjetivo`, `miPlanBarras`,
  `miPlanDetalle`, `miPlanCta`, `btnAbrirNutricionMiPlan`, `btnLogout`,
  etc.), así que `js/mi-plan.js` no necesitó ningún cambio — solo se movió
  el markup de lugar.
- CSS nuevo en `css/styles.css`: `.miplan-subhead`, `.miplan-grid`,
  `.miplan-col`, `.miplan-objetivo`, `.miplan-detalle-grid`,
  `.miplan-cierre` + `.miplan-cierre-title`/`.miplan-cierre-btns`, con
  `@media(max-width:900px)` que apila ambas grillas a 1 columna (mismo
  breakpoint que ya usa `.split` en Manifiesto).
- **Verificación**: en este entorno Playwright no pudo instalar Chromium
  (la descarga sale de un dominio fuera de la whitelist de red de esta
  sesión, mismo problema ya documentado en otras entradas de este archivo).
  Se verificó en cambio con jsdom + la librería `css` de npm: los `id`
  siguen únicos, el anidado de `.miplan-grid`/`.miplan-detalle-grid` es el
  esperado, y `css/styles.css` sigue parseando sin errores con todos los
  selectores nuevos presentes. **Pendiente**: confirmar con capturas reales
  (desktop y ≤900px) en cuanto haya acceso a Playwright — sobre todo que la
  tarjeta `.miplan-cierre` no quede más alta/baja que `.nutri-summary` de
  forma rara cuando el detalle tiene mucho contenido (varios avisos, "día
  tipo", etc.).

## 2026-09-13 — Hero: frutas fotográficas flotando alrededor del cerebro

- A partir de una imagen de referencia que trajo el usuario (cerebro con
  frutas reales flotando alrededor, conectadas con líneas punteadas), se
  agregó ese mismo efecto a `#lam-01` usando las 5 fotos que el usuario ya
  tenía en `img/imagenes-frutas/` (cereza, arándanos, uvas, nuez, fresa).
- Las 5 fotos originales (JPG, fondo blanco liso de estudio) se procesaron
  con un script Python (Pillow + numpy + scipy, no versionado — ver
  `memoria.md` → "Frutas fotográficas flotando alrededor del cerebro" para
  la lógica completa si hay que reproducirlo) para: quitarles el fondo
  blanco (incluyendo huecos internos, no solo lo conectado al borde),
  apagar con un desvanecido vertical la sombra ovalada de estudio que
  traía cada foto, suavizar el borde recortado, y exportarlas a WebP con
  transparencia real: `fruta-nuez.webp`, `fruta-cereza.webp`,
  `fruta-arandanos.webp`, `fruta-uvas.webp`, `fruta-fresa.webp` (mismo
  directorio, los JPG originales quedan de backup sin usarse en el sitio).
- En `index.html`, las 5 imágenes se agregan como
  `<img class="brain-fruit bf1..bf5">` dentro de `.synapse-art`, ubicadas
  sobre los puntos de conexión que ya dibujaba el SVG de fondo (nuez y
  cereza arriba, arándanos y uvas abajo con línea punteada hacia el
  cerebro; la fresa se agregó "libre", sin línea, para dar más densidad).
- En `css/styles.css`, clase nueva `.brain-fruit` + `@keyframes
  brain-fruit-float` (animación propia, no se reusó `@keyframes float`
  porque pisaría el `transform:translate(-50%,-50%)` fijo que centra cada
  fruta sobre su punto). Respeta `prefers-reduced-motion` y se oculta en
  `max-width:640px` para no saturar el hero en mobile.
- Verificado con Playwright (capturas reales en 1600px/800px/400px):
  sin halos blancos ni sombra residual, animación de flotación confirmada
  comparando dos capturas, y ocultamiento limpio en mobile.

## 2026-09-13 — Hero: más decoraciones flotantes, glow lila y tipografía del título tipo "marcador"

- **Más elementos decorativos en `#lam-01` (hero)**: se agregan 6 `<img
  class="deco">` nuevos reutilizando SVGs ya existentes en `svg/` (mismo
  criterio que el resto del sitio, sin generar assets nuevos):
  `deco-blob-orange.svg` y `deco-blob-avocado.svg` (más fruta a los
  costados, densidad extra sobre lo que ya había con `deco-blob-walnut` y
  `deco-blob-berries`), un `deco-espiga.svg` y un `deco-leaf-beneficios.svg`
  chicos y muy sutiles (`opacity:.5`/`.55`) cerca de la parte superior
  central, `deco-blob-kiwi.svg` abajo al centro, y `svg/signal-wave.svg`
  (la línea tipo electrocardiograma que ya se usaba como separador en
  `#lam-04`) como "señal de vida" en el centro del hero, entre el bloque de
  texto y la ilustración del cerebro.
  - Todos estos `<img class="deco">` están fuera del `.wrap` del hero y
    por lo tanto quedan **detrás** del contenido (`.deco{z-index:0}` vs.
    `.wrap{z-index:1}`), así que se ubicaron a propósito en los huecos
    visuales del layout (el gap entre las dos columnas del grid, debajo
    del párrafo, encima de los botones, cerca del pie) para que no queden
    tapados ni choquen con el texto/CTA/cerebro. Verificado con captura
    real (Playwright, que esta sesión sí pudo instalar — ver nota abajo).
  - Los del centro usan `left:50%` + `transform:translateX(-50%)`
    combinado con la rotación, en vez de solo `left/right` como las
    decoraciones de los costados, porque `.wrap` está centrado en el
    viewport independientemente del ancho de pantalla, así que `left:50%`
    cae siempre en el eje central del layout.
  - Igual que el resto de `.deco-fruit`/`.deco-scribble`, estos elementos
    nuevos se ocultan solos en `max-width:720px` (reglas ya existentes en
    `css/styles.css`), no hizo falta agregar código responsive nuevo.
- **Glow lila diluido a la derecha del hero**: `.hero.dark` tenía un solo
  `radial-gradient` de fondo (`--panel` → `--paper`, arriba a la derecha).
  Se le agrega una segunda capa de `radial-gradient` **encima** con
  `rgba(113,75,103,.16)` (el mismo `--purple` de marca, `#714B67`, pero en
  rgba para poder diluirlo) que se desvanece a transparente
  (`rgba(113,75,103,0)`) al 72% — o sea, tinte lila muy sutil concentrado
  cerca del borde derecho, se pierde antes de llegar al texto de la
  izquierda. `--purple` es el único morado que ya existía en `:root`
  (`css/styles.css`), no se agregó ninguna variable de color nueva.
- **Tipografía del `<h1>` del hero = misma familia que los títulos de
  `#lam-03`/`#lam-04`**: `.hero h1` pasa de `font-family:var(--font-d)`
  (Fraunces, heredado de la regla genérica `h1,h2,h3`) a
  `font-family:var(--font-hand)` (Caveat, cursiva/manuscrita), mismo
  `font-weight:700` y `letter-spacing:0` que usa la regla
  `#lam-03 .lam-title, #lam-04 .lam-title`. Como Caveat visualmente "pesa"
  menos que Fraunces al mismo tamaño en px, se subió el `clamp()` de
  `clamp(44px,6.4vw,80px)` a `clamp(58px,8.2vw,104px)` y se ajustó
  `line-height` de `1.02` a `1.08` para que no se vea chico ni apretado
  comparado con antes. También se quita el `font-style:italic` de
  `.hero h1 em` (queda `normal`): Caveat solo está cargado en dos pesos
  (`600;700`, ver `<link>` de Google Fonts en `index.html`) sin variante
  itálica real, así que el navegador estaba sintetizando una itálica falsa
  sobre una fuente ya cursiva — con `--font-hand` puesto, la palabra
  "claridad" se distingue por el color `--purple` nada más, no hace falta
  inclinarla.
- **Nota de entorno — Playwright sí funcionó esta sesión**: a diferencia de
  sesiones anteriores (ver pendientes de verificación visual más abajo en
  este mismo archivo), esta vez `playwright install`/el Chromium ya
  presente en el entorno **sí pudo lanzarse**, así que se verificó con
  capturas de pantalla reales (servidor local `python -m http.server` +
  `page.screenshot`) que las decoraciones nuevas no chocan con nada. La
  fuente Google (`fonts.googleapis.com`) sigue bloqueada por la lista
  blanca de red del entorno de esta sesión — para confirmar el cambio de
  tipografía se instaló Caveat manualmente como fuente de sistema solo
  para la captura de prueba (no se tocó ningún archivo del repo para
  esto). En el sitio real, servido con acceso normal a internet, Google
  Fonts carga sin problema porque `index.html` ya tenía el `<link>`
  correspondiente desde antes.

## 2026-09-13 — Iconos ilustrados en secciones 02 y 04

- Se reemplazan los iconos de dos secciones de `index.html` por un set de
  8 iconos ilustrados (estilo "glossy 3D gradient bubble", generados con
  Gemini a partir de un prompt con la paleta de marca) en vez de los SVG
  de línea que había antes.
- **Sección 02 (Nuestra visión)**: se agrega un `<img class="stat-icon">`
  dentro de cada una de las 4 `.stat-box` (antes no tenían icono, solo el
  número): `icon-energia-cerebral.webp` (20%), `icon-neuronas.webp` (86B),
  `icon-semanas.webp` (4–6), `icon-acompanamiento.webp` (1:1).
- **Sección 04 (Pilares nutricionales)**: se reemplazan los 4
  `<svg class="pillar-icon">` inline por `<img class="pillar-icon-img">`:
  `icon-omega3.webp`, `icon-antioxidantes.webp`, `icon-complejo-b.webp`,
  `icon-hidratacion.webp`.
- Los 8 archivos originales que bajó el usuario de Gemini
  (`img/Iconos/Gemini_Generated_Image_*.jpg`) eran JPG de 1024×1024 sin
  canal alfa real: el "fondo transparente" que mostraba la vista previa de
  Gemini estaba **horneado como píxeles grises/blancos de ajedrez dentro
  de la propia imagen**. Se procesaron con un script Python
  (numpy+scipy+Pillow) que: detecta los 2 tonos de ajedrez por imagen
  (varían entre archivos), hace flood-fill desde los bordes para marcarlos
  como fondo, cierra huecos de ruido de compresión JPEG con
  `binary_closing(..., border_value=1)` (ver nota abajo), erosiona 2px el
  borde del primer plano para comer el flequillo punteado remanente,
  suaviza el alfa con `GaussianBlur(1.5)`, recorta al bounding box y
  reescala a 256×256. Resultado: WebP con transparencia real, ~13–18KB
  cada uno (vs. 500–630KB del JPG original).
- **Bug encontrado y corregido durante el procesamiento**: `scipy.ndimage.
  binary_closing` con su `border_value` por defecto (0) erosiona
  incorrectamente el borde real de la imagen (trata todo lo que está fuera
  del array como fondo/falso), lo que rompía la conexión del flood-fill al
  borde y dejaba sin quitar el ajedrez completo en algunas imágenes (pasó
  con el icono de "neuronas"). Se resuelve pasando `border_value=1`.
- Nuevas clases CSS en `css/styles.css`: `.stat-icon` (40×40,
  `margin-bottom:14px`) y `.pillar-icon-img` (56×56,
  `object-fit:contain`). Se elimina `.pillar-icon` (ya no se usa, era para
  los SVG de línea viejos).
- Falta 1 concepto del set original de 8 (Antioxidantes y polifenoles) en
  la primera tanda de imágenes que subió el usuario; se generó y subió por
  separado en un segundo push antes de este patch.
- **Pendiente**: no se hizo verificación visual real en navegador de esta
  sesión (se priorizó cerrar el patch antes del límite de sesión). Revisar
  en Netlify preview que los 8 iconos se vean bien alineados dentro de
  `.stat-box` y `.pillar` antes de mergear a `master`.

## 2026-09-13 — Más frutas y decoraciones en "Mi plan"

- El usuario vio el resultado de la entrada anterior ("Identidad visual de
  'Mi plan' alineada con el resto del sitio") desplegado en Netlify y
  pidió explícitamente "aumentale frutas y más cositas".
- Se pasó de 4 a 8 elementos decorativos en `#miPlan`, repartidos en todo
  el alto de la sección (antes solo estaban cerca de la cabecera): se
  agregaron 3 frutas más (`deco-blob-orange.svg` a la izquierda a la
  altura del título, `deco-blob-avocado.svg` a la derecha a la altura del
  `stat-grid`/gráfico de barras, `deco-blob-almonds.svg` a la izquierda
  cerca del CTA/footer) y una tercera `deco-espiga.svg` en la esquina
  inferior derecha, que antes quedaba sin ningún acento. Todo reusa
  `svg/*.svg` ya existente, sin crear assets nuevos.
- Quedan sin usar en esta página `deco-blob-walnut.svg`,
  `deco-blob-berries.svg` y `deco-leaf-beneficios.svg` por si se pide
  aumentar la densidad todavía más en una sesión futura.

## 2026-09-13 — Identidad visual de "Mi plan" alineada con el resto del sitio

- Pedido del usuario: que "Mi plan" (`mi-plan.html`) tenga el mismo estilo
  visual que ya tiene el resto del sitio, "y que quede incluso mejor".
- `mi-plan.html` era la única sección `.dark` de todo el sitio sin
  ninguna decoración SVG (`index.html` tiene entre 2 y 7 por sección). Se
  agregaron 4 (reusando SVGs ya existentes, sin crear assets nuevos):
  `deco-circles-vision.svg` sutil arriba a la derecha,
  `deco-blob-kiwi.svg` abajo a la izquierda, y 2 `deco-espiga.svg` en
  esquinas opuestas — mismo patrón que ya usan lam-02/04/05/06. No se
  agregó el subrayado tipo "marcador" (`.title-mark`) de los `<h2>` de
  `index.html` a propósito: esa idea ya se había revertido antes en el
  sitio (ver entrada "Revertidos los trazos tipo marcador" más abajo en
  este changelog) por romper el wrapping en contenedores flex, y el
  título de "Mi plan" además es left-aligned, no el patrón centrado para
  el que existe ese tratamiento.
- **Fix de contraste real** (no solo decorativo): dentro de la sección
  `.dark` de "Mi plan" (fondo `--panel`), las tarjetas `.stat-box` y
  `.bar-chart-card` (fondo `--paper-2`, casi el mismo tono que `--panel`)
  y sobre todo `.nutri-summary` (fondo `--panel`, el mismo color exacto,
  sin borde) casi no se distinguían del fondo — la tarjeta de resumen del
  plan quedaba prácticamente invisible como tarjeta. Se sobreescribió a
  `--paper` (blanco puro) + borde en `#miPlan .stat-box`,
  `#miPlan .bar-chart-card` y `#miPlan .nutri-summary`, mismo tratamiento
  que ya usa `.method-gauges` sobre su propia sección oscura en Método.
  No afecta el uso de esas mismas clases en `index.html` (stat-grid de
  Manifiesto sobre fondo blanco, o `.nutri-summary` dentro del modal
  blanco de nutrición), solo se scopeó a `#miPlan`.
- Verificado: la hoja de estilos sigue parseando sin errores (librería
  `css` de Node) y, simulando el DOM con jsdom, las 4 decoraciones quedan
  como hijas directas de `#miPlan` (mismo nivel que en `index.html`) y el
  selector `#miPlan .nutri-summary` alcanza tanto a `#miPlanDetalle` como
  a `#nutriResumen`. Pendiente de verificación visual real en navegador
  (Playwright no se pudo instalar por la misma restricción de red de
  sesiones anteriores) — ver detalle en `memoria.md`.

## 2026-09-13 — Interruptor "Mi progreso" / "Mi IMC" en la sección Método

- Pedido del usuario: en la sección `03 — Cómo trabajamos` (Método) de
  `index.html`, poder elegir entre ver los anillos de progreso o el
  medidor de IMC, con "Mi progreso" siempre activo por defecto.
- Nuevo interruptor tipo pestañas (`.gauges-switch`, dos botones
  `#btnVerProgreso` / `#btnVerImc`) dentro de la tarjeta `.method-gauges`
  (`#methodGauges`), que ahora contiene dos paneles en vez de uno:
  `#methodGaugesProgreso` (el contenido que antes se pintaba directo en
  `#methodGauges`, sin cambios de lógica, solo se movió el target de
  `renderMethodGauges()`) y `#methodGaugesImc` (nuevo).
- `renderMethodImc()` en `js/script.js`: pinta el mismo medidor
  semicircular de IMC que ya existía en "Mi plan" (arcos de color fijos +
  aguja), reusando `imcCategoria`/`imcGaugeAngulo` de
  `js/nutricion-planes.js` — no se duplicó el cálculo ni los umbrales. Lee
  `sinaptix_antropometria` de `localStorage`; si no hay datos, muestra un
  estado vacío con botón para abrir "Registrar datos antropométricos"
  (`#modalAntropometria`).
- `setGaugesView(view)` alterna la visibilidad de los dos paneles y el
  estado `is-active`/`aria-selected` de los botones. Se llama
  `setGaugesView('progreso')` una sola vez al cargar la página — el
  interruptor arranca siempre ahí, nunca en "Mi IMC", incluso si la
  persona ya tiene un IMC guardado.
- `renderMethodImc()` se vuelve a llamar (además de al cargar) cada vez
  que se guardan datos antropométricos nuevos (`#formAntro`) y en ambas
  ramas del guardado del plan de nutrición (por si
  `nutriGuardarAntropometriaSiFalta` guardó antropometría por primera vez
  ahí), para que el panel de IMC no quede desactualizado sin recargar la
  página.
- Verificado simulando el DOM de `index.html` con jsdom (Playwright no
  pudo instalarse en esta sesión por restricción de red del sandbox):
  estado inicial con "Mi progreso" visible y activo; click en "Mi IMC"
  alterna los paneles y el estado de los botones correctamente; al
  guardar un IMC de prueba en `localStorage` y repintar,
  `renderMethodImc()` muestra el número, la categoría y el color
  correctos; volver a "Mi progreso" alterna de nuevo sin problemas.

## 2026-09-13 — Auto-guardar antropometría desde la encuesta de nutrición

- Pedido del usuario: si en el paso 2 de "Generar nutrición especializada"
  ya se completa peso y talla, no debería hacer falta ir aparte a
  "Registrar datos antropométricos" para que "Mi plan" muestre el medidor
  de IMC — antes, si la persona nunca había usado ese formulario dedicado,
  el gauge quedaba oculto aunque acabara de generar su plan con esos
  mismos datos a mano.
- Nueva función compartida `nutriGuardarAntropometriaSiFalta(d)` en
  `js/nutricion-planes.js`: si **no** existe todavía
  `sinaptix_antropometria` en `localStorage` y los datos de la encuesta
  (`peso`, `talla`, `edad`, `sexo`) son válidos (mismos rangos que
  `#formAntro`), arma el mismo objeto que ese formulario y lo guarda. Si
  ya había un registro previo, no lo toca (para no pisar una medición más
  reciente o más precisa hecha a propósito con el formulario dedicado). Si
  faltan datos o están fuera de rango (peso/talla son opcionales en el
  paso 2), no guarda nada — se deja que la persona los complete cuando
  quiera desde "Registrar datos antropométricos".
- Se llama desde ambos handlers de `submit` del wizard, justo antes de
  guardar `sinaptix_objetivo`: en `js/script.js` (modal de `index.html`) y
  en `js/mi-plan.js` (encuesta inline de "Mi plan"). En `mi-plan.html` el
  efecto es inmediato: como el mismo `submit` vuelve a llamar a
  `pintarMiPlan(user)` sin recargar, el medidor de IMC aparece apenas se
  genera el plan, sin volver a `index.html` a poner los datos de nuevo.
- Este es el único cambio de esta entrada — no afecta el flujo inverso ya
  existente (prellenar peso/talla en el paso 2 desde antropometría ya
  guardada, ver `resetNutriWizard` en `js/nutricion-wizard.js`), que
  sigue igual.
- Verificado con Playwright: prueba unitaria de la función nueva (guarda
  con datos válidos y sin registro previo; no pisa un registro existente;
  no guarda con peso/talla vacíos; no guarda con datos fuera de rango) y
  una corrida end-to-end sobre `mi-plan.html` (login stub de Netlify
  Identity, encuesta completa sin antropometría previa) confirmando que
  tras enviar el plan el gauge de IMC aparece con el valor y la categoría
  correctos.

## 2026-09-13 — Medidor de IMC tipo velocímetro en "Mi plan"

- El IMC en "Mi plan" era solo un número (`#miPlanImc`) sin contexto. Se
  agregó un medidor semicircular (SVG, 4 arcos de color fijos por
  categoría + aguja que rota según el valor) más el nombre de la
  categoría en texto y una leyenda de colores, para responder qué
  significa cada tramo (pedido del usuario).
- Nuevas funciones compartidas en `js/nutricion-planes.js`:
  `imcCategoria(imc)` (umbrales: <18.5 bajo peso, 18.5-24.9 saludable,
  25-29.9 sobrepeso, ≥30 "rango a vigilar" — se mantiene ese término, no
  "obesidad", por decisión de tono ya tomada) e
  `imcGaugeAngulo(imc)` (mapea el IMC a un ángulo del arco, recortado a
  `[15, 40]` solo para la posición de la aguja, nunca para el número
  mostrado).
- `js/script.js` (formulario de antropometría de `index.html`) ya no
  tiene su propia copia de los umbrales — ahora llama a `imcCategoria`,
  la misma función que usa el medidor. Antes eran dos fuentes de verdad
  con los mismos números escritos dos veces.
- Color por zona: dorado (bajo peso/sobrepeso), verde (saludable), rojo
  (rango a vigilar) — mismo criterio que los avisos graduados de la
  entrada de abajo.
- El medidor/categoría/leyenda arrancan ocultos en el HTML y solo se
  muestran si hay `sinaptix_antropometria` guardado — sin datos, se ve
  igual que antes (sin gauge roto ni vacío).
- Verificado con Playwright (Chromium headless): 4 capturas (una por
  zona) más el estado sin datos, más una prueba del formulario real de
  antropometría para confirmar que compartir `imcCategoria` no le
  rompió nada. Netlify Identity no carga en este sandbox (403 al pedir
  `identity.netlify.com`), así que las pruebas usaron un stub de
  `window.netlifyIdentity` inyectado por Playwright — no afecta el
  comportamiento real en producción.

## 2026-09-13 — Avisos graduados y ejes combinados (estrés+sueño, estrés+fatiga)

- Punto 5 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.2, "Ajustes
  más graduales, no binarios"). `nutriConstruirAvisos` (`js/nutricion-planes.js`)
  ahora devuelve objetos `{nivel, texto}` en vez de strings — `nivel` es
  `'moderado'` o `'alto'`, usado por `nutriBuildResumenHTML` para pintar
  cada aviso con `.nutri-note` (moderado, dorado, sin cambios) o
  `.nutri-note.nutri-note--alto` (alto, rojo, clase nueva en
  `css/styles.css`).
- **Decisiones tomadas con el usuario para esta sesión** (el documento
  original dejaba esto abierto a decidir):
  - El aviso de sueño **ya no es independiente**: antes disparaba solo con
    `d.sueno`/`d.calidadSueno` malos; ahora exige además estrés alto
    (`d.estres >= 4`). Alguien con mal sueño pero estrés bajo/medio ya no
    ve ningún aviso de sueño — es un cambio de comportamiento intencional,
    no un bug, si en el futuro se quiere revertir a que sea independiente
    otra vez.
  - Nuevo aviso de **eje combinado**: `d.estres >= 4` y `d.fatiga >= 4` a
    la vez dispara un aviso propio (magnesio/complejo B), que antes no
    existía — el documento original lo mencionaba como "Plan 4" pero no
    estaba implementado.
  - Cafeína y ultraprocesados pasan de binario a **2 niveles**: el nivel
    superior (`'4 o más al día'` / `'A diario'`) mantiene el texto y
    nivel `'alto'` de antes; se agregó un nivel `'moderado'` nuevo para
    el escalón intermedio (`'2 a 3 al día'` / `'Algunas veces por
    semana'`), que antes no generaba ningún aviso.
  - El aviso médico/medicación se marcó como `'alto'` (ya existía, no
    cambió el texto ni la condición para mostrarlo).
- `.nutri-summary` ya tenía `gap:12px` en su `display:flex`, así que
  varios avisos seguidos (ahora es común, ver caso de prueba con 4 avisos
  a la vez) quedan espaciados sin tocar ese contenedor.
- Verificado con un script de Node que ejecuta `nutriConstruirAvisos` /
  `nutriBuildResumenHTML` contra casos sintéticos (sueño malo con y sin
  estrés alto, eje combinado, cada nivel de cafeína/ultraprocesados) antes
  de generar el patch — no hay test runner en el repo, así que quedó como
  verificación manual de esta sesión, no como archivo de test agregado.

## 2026-09-13 — "Un día tipo" en el resultado de cada plan de nutrición

- Punto 4 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.3): cada uno
  de los 4 planes de `NUTRI_PLANES` (`js/nutricion-planes.js`) ahora tiene
  un campo `diaTipo` (4 entradas: Desayuno, Snack, Almuerzo, Cena) que se
  arma solo con alimentos que ya estaban en `priorizar`/`moderar` de ese
  mismo plan, organizados por momento del día — sin agregar ningún
  nutriente ni alimento nuevo. Se armó a partir del contenido ya
  existente en el repo (no había un documento de origen con el detalle
  por comida disponible en esta sesión).
- `nutriBuildResumenHTML` renderiza un cuarto bloque "Un día tipo" por
  plan (después de "Moderar"), como una grilla `.nutri-dia-tipo` en vez
  de una lista más — se envuelve sola con `grid-template-columns:
  repeat(auto-fit,minmax(130px,1fr))`, sin JS de resize. Si el objetivo es
  "No estoy seguro" y hay empate entre 2 planes, cada uno muestra su
  propio "día tipo" por separado.
- CSS nuevo: `.nutri-dia-tipo`, `.dia-tipo-item`, `.dia-tipo-momento`,
  `.dia-tipo-detalle`.
- Aprovechando el cambio, se corrigió una referencia desactualizada en
  `memoria.md` que decía que `NUTRI_PLANES` vivía en `js/script.js` (se
  había movido a `js/nutricion-planes.js` en una sesión anterior, la
  memoria no se había actualizado en ese punto puntual).
- Probado con un script de Node (`vm` + `nutriBuildResumenHTML`) en dos
  escenarios: un plan único (4 `diaTipo` items) y un empate "No estoy
  seguro" con 2 planes (8 items en total, 4 por plan) — ambos arman el
  HTML esperado. Sigue pendiente una revisión visual en navegador real
  (Playwright no se pudo instalar en este entorno, ver entradas
  anteriores del changelog).

## 2026-09-13 — Paso 2 del wizard: resumen + "Actualizar" en vez de reingresar peso/talla ya guardados

- Punto 3 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.2): si ya hay
  peso y talla guardados en `sinaptix_antropometria` ("Registrar datos
  antropométricos"), el paso 2 de la encuesta de nutrición ya no muestra
  los dos inputs vacíos-para-reeditar — muestra una frase ("Ya tenemos tu
  peso y talla registrados (fecha) — 70 kg, 175 cm.") y un botón
  "Actualizar peso y talla" que revela los inputs si se quieren cambiar.
  Sin datos guardados (o con antropometría que no incluye peso/talla), se
  ve exactamente igual que antes. Edad y sexo biológico no cambiaron: se
  siguen prellenando pero mostrando como campos normales.
- `index.html` y `mi-plan.html` (paso 2, idéntico en ambos): nuevo
  `id="nutriAntroInputs"` en el `.modal-row` de Peso/Talla y nuevo bloque
  `#nutriAntroResumen` (texto + botón `#btnNutriAntroEditar`), en
  reemplazo del viejo `<p id="nutriAntroHint">`.
- `js/nutricion-wizard.js` (`resetNutriWizard`): arma el texto del resumen
  reutilizando `gaugeFechaCorta` (de `js/nutricion-planes.js`) y alterna
  `.hidden` entre inputs y resumen según si hay peso+talla guardados. Los
  inputs se siguen prellenando aunque queden ocultos, así que si el
  usuario no toca nada se manda el mismo dato que ya tenía — no hubo que
  tocar `nutriCollectData` ni el submit del formulario.
- CSS: `.nutri-antro-resumen`, `.nutri-antro-texto` y un ajuste de tamaño
  para `#btnNutriAntroEditar` (mismo `.btn.btn-ghost` que el resto del
  sitio, un poco más chico para no dominar el paso).
- Probado con Node + `jsdom` (instalado en un directorio temporal fuera
  del repo, no se agregó como dependencia): se cargó el `#formNutricion`
  real de `index.html` junto con `nutricion-planes.js` y
  `nutricion-wizard.js`, y se corrió `resetNutriWizard()` en 3 escenarios
  (sin antropometría, con peso+talla, con antropometría incompleta) — los
  tres muestran/ocultan lo esperado y el botón "Actualizar" funciona.
  Sigue pendiente una revisión visual en navegador real (Playwright no se
  pudo instalar en este entorno, ver entrada anterior del changelog).

## 2026-09-13 — Gráfico de barras de "Mi plan" ahora compara antes/después con la reevaluación de "Método"

- Punto 2 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.2): el gráfico
  "Tu estado actual" (Foco/Memoria/Energía/Calma) de `mi-plan.html` era una
  sola foto fija de la encuesta inicial. Ahora, si existe una reevaluación
  guardada (`sinaptix_reevaluacion`, ya se generaba desde el modal de
  "Método" en `index.html` pero no se usaba acá), cada barra muestra el
  valor más reciente y debajo un texto "Antes: X% (+/- N pts)" — mismo
  criterio visual que ya usan los anillos de "Método". Sin reevaluación
  guardada, el gráfico se ve exactamente igual que antes.
- `nutriBuildBarChartHTML` (en `js/nutricion-planes.js`) cambió de firma:
  `nutriBuildBarChartHTML(encuesta)` → `nutriBuildBarChartHTML(objetivo,
  reeval)` (recibe el objeto `sinaptix_objetivo` completo, no solo
  `.encuesta`, porque ahora necesita `.fecha` para la leyenda). `js/mi-
  plan.js` (`pintarMiPlan`) actualizado para leer `sinaptix_reevaluacion` de
  `localStorage` y pasarlo.
- `gaugeFechaCorta` y `gaugeDeltaHtml` se movieron de `js/script.js` a
  `js/nutricion-planes.js` (compartidas), ya que ahora las usan tanto los
  anillos de "Método" como el gráfico de barras de "Mi plan", con el mismo
  criterio de color/formato de fecha.
- CSS: nuevo wrapper `.bar-item` por fila (antes el margen entre filas
  vivía en `.bar-row`, ahora en `.bar-item` para poder meter el delta
  debajo sin romper el espaciado), `.bar-item .gauge-delta` (indentado
  para alinear bajo el track) y `.bar-chart-dates` (reusa `.gauge-dates`).
- Paso 6 del wizard ("Cómo te sentís día a día", `index.html` y `mi-
  plan.html`): se agregó una frase al `.nutri-hint` explicando que esas 4
  preguntas alimentan este gráfico y se podrán comparar más adelante —
  responde a por qué se siguen preguntando aunque ya se eligió un
  objetivo (sección 4.2 del mismo documento).
- Verificado con un script de Node que carga `js/nutricion-planes.js` en un
  contexto `vm` y llama `nutriBuildBarChartHTML` con datos de prueba, con y
  sin reevaluación (deltas y colores correctos en ambos casos) — no se
  pudo hacer una verificación visual con Playwright en esta sesión porque
  la descarga del navegador (`deb.nodesource.com`) no está en la lista de
  dominios permitidos del entorno; queda pendiente una revisión visual
  rápida cuando el usuario aplique el patch.

## 2026-09-13 — Asterisco rojo en campos obligatorios de la encuesta de nutrición (se saca la palabra "opcional")

- El usuario pidió reemplazar la palabra "(opcional)" (que aparecía en el
  placeholder de 4 campos: Peso, Talla, Otra alergia, Alimentos que no te
  gustan) por un asterisco rojo en las preguntas obligatorias, dejando las
  opcionales sin ninguna marca — según referencia visual que compartió
  ("Teléfono \*").
- Antes de tocar código se armó un documento de investigación
  (`plan-mejoras-mi-plan-y-encuesta.md`, entregado al usuario, no vive en
  el repo) sobre buenas prácticas de formularios (marcar obligatorios vs.
  opcionales) y oportunidades de mejora para la encuesta y "Mi plan" en
  general — este patch implementa solo el punto 1 de ese documento (el de
  menor costo/mayor impacto), el resto queda pendiente de decidir.
- Hallazgo técnico clave: un asterisco no se puede pintar de rojo dentro
  de un `placeholder` (es un solo string, un solo color) — hacía falta
  una etiqueta visible de verdad. La mayoría de los campos de
  `#formNutricion` (Objetivo, Nombre, Email, Edad, Sexo, Peso, Talla,
  Comidas, Agua, Cafeína, Alcohol, Ultraprocesados, Tiempo de cocina,
  Otra alergia, Restricción, Medicación, las 4 escalas de percepción,
  Disgustos, Presupuesto) usaban el patrón `<label class="sr-only">` +
  texto solo en el `placeholder` — se convirtieron todas esas etiquetas a
  visibles, reusando el estilo ya existente `.nutri-field-label` (no se
  inventó un estilo nuevo). De paso corrige una práctica de accesibilidad
  poco recomendable (depender del placeholder como única etiqueta).
- Nueva clase `.req` en `css/styles.css` (asterisco rojo, `aria-hidden`
  porque el atributo HTML `required` ya alcanza para lectores de
  pantalla) y nueva variable `--red:#B3261E` en `:root` — es el mismo
  rojo que ya usaba `.nutri-error`, que se actualizó para usar la
  variable en vez del hex suelto (sin cambio visual).
- Se agregó una frase aclaratoria una sola vez, debajo del párrafo de
  introducción del formulario (en el modal de `index.html` y en la
  encuesta inline de `mi-plan.html`): *"Los campos marcados con \* son
  obligatorios."*
- Los 4 campos opcionales (Peso, Talla, Otra alergia, Alimentos que no te
  gustan) quedaron con etiqueta visible pero sin asterisco y sin ninguna
  palabra — de paso corrige una inconsistencia que ya existía: "Horas de
  pantalla" tampoco es obligatorio (no tiene `required`) pero nunca dijo
  "opcional" en ningún lado; ahora, al no llevar asterisco, queda
  consistente con el resto de los campos opcionales.
- Cambio duplicado en `index.html` (modal) y `mi-plan.html` (encuesta
  inline) porque comparten el mismo `#formNutricion` — se verificó que
  ambos archivos terminan con la misma cantidad de asteriscos (24) y sin
  ningún resto de `sr-only` u "opcional" dentro del formulario.
- No se tocó `js/nutricion-wizard.js` ni `js/nutricion-planes.js`: el
  cambio es puramente de HTML/CSS, no afecta la validación (los mismos
  atributos `required` siguen intactos) ni la lógica de armado del plan.

## 2026-09-13 — Gráfico de barras (Foco/Memoria/Energía/Calma) en "Mi plan"

- El usuario preguntó si valía la pena agregar un gráfico a "Mi plan"; se
  le ofrecieron 3 opciones (barras reemplazando los anillos de Método,
  barras nuevas en Mi Plan con datos ya existentes, o no agregar nada) y
  eligió: 1 gráfico de barras con su estado actual (Foco/Memoria/Energía/
  Calma), sin comparación antes/después.
- Se movieron `gaugeComputeAreas`, `gaugeColorForPercent` y sus helpers de
  color de `js/script.js` a `js/nutricion-planes.js` (compartido) — son
  funciones puras de cálculo (sin DOM), las mismas que ya usaban los
  anillos de "Método" en `index.html`, así que el gráfico de barras y los
  anillos parten del mismo cálculo y la misma escala de color.
- Nueva función `nutriBuildBarChartHTML(encuesta)` en
  `js/nutricion-planes.js`, llamada desde `pintarMiPlan(user)` en
  `js/mi-plan.js`.
- Nuevo contenedor `#miPlanBarras` en `mi-plan.html`, entre el `stat-grid`
  (IMC/objetivo) y el detalle del plan. Nuevos estilos en
  `css/styles.css` (`.bar-chart-card`, `.bar-row`, `.bar-track`,
  `.bar-fill`, etc.) — barras simples con `<div>`+CSS, sin librería de
  gráficos externa.
- Probado con Playwright: con una encuesta guardada de ejemplo
  (estrés=4, fatiga=3, concentración=2, olvidos=3), el gráfico de barras
  en `mi-plan.html` muestra Foco 80%, Memoria 60%, Energía 60%, Calma 40%
  — y los anillos de "Método" en `index.html`, con la misma encuesta,
  muestran exactamente los mismos porcentajes. Cero errores de consola en
  ambas páginas.

## 2026-09-13 — "Generar mi plan" ahora es inline en mi-plan.html (no redirige a index.html)

- Feedback del usuario sobre el patch anterior: al tocar "Generar mi plan"
  no quería que lo mandara a `index.html`, sino que la encuesta apareciera
  ahí mismo, "como una sección que ocupe la pantalla normal para que haya
  más visión" (en vez del modal chico de antes).
- **Nuevo `js/nutricion-wizard.js`** (compartido): se extrajo de
  `js/script.js` el motor de navegación del wizard (pasos, validación,
  recolección de datos, render del resumen) — sin el manejo de `submit` ni
  de apertura/cierre, que sigue siendo distinto por página. Se carga
  después de `js/nutricion-planes.js` y antes de `js/script.js` /
  `js/mi-plan.js`, en ambas páginas.
- **`mi-plan.html`**: se agregó `#nutriInline`, un duplicado del formulario
  de 8 pasos del modal de `index.html` (mismos `id`), pero SIN el
  contenedor `.modal-card` — vive suelto dentro de la página (`.wrap`,
  `max-width:640px` en el form) para que se vea como una sección normal del
  sitio y no como un popup chico. "Generar mi plan" ahora es un `<button>`
  que oculta `#miPlanConSesion` y muestra `#nutriInline` (antes era un link
  a `index.html?generarPlan=1`). Se agregó "← Volver a Mi plan"
  (`#nutriInlineVolver`) para cancelar sin guardar.
- **`js/mi-plan.js`**: nuevo submit handler para el `#formNutricion` de esta
  página — como solo se llega a este botón con sesión ya iniciada, siempre
  guarda en `localStorage` y vuelve a pintar "Mi plan" en el momento
  (`pintarMiPlan(user)` de nuevo) sin recargar ni redirigir.
- **`index.html` / `js/script.js`**: se quitó el bloque que abría el modal
  automáticamente vía `?generarPlan=1` (ya no hace falta, `mi-plan.html` no
  redirige más para esto). El modal de nutrición de `index.html` sigue
  funcionando exactamente igual que antes (mismo botón "Generar nutrición
  especializada", mismo modal).
- Probado con Playwright: en `mi-plan.html`, con sesión simulada, se
  completó la encuesta de punta a punta (los 8 pasos) sin salir nunca de
  `mi-plan.html` ni recargar la página, y al guardar se vuelve a "Mi plan"
  con el objetivo y el detalle del plan ya actualizados. También se
  verificó que `index.html` sigue abriendo su modal de nutrición sin
  cambios. Cero errores de consola en ambos flujos.

## 2026-09-13 — "Mi plan" pasa a ser una pantalla propia (`mi-plan.html`)

- El usuario pidió que la sección "Mi plan" (antes visible/oculta dentro de
  `index.html` con sesión iniciada) apareciera "en otra pantalla" — se
  confirmó con el usuario que se refería a una página HTML separada con su
  propia URL, no a un modal ni a un overlay dentro de `index.html`.
- **Nuevo archivo `mi-plan.html`**: página independiente con su propio nav
  (marca + "Volver al sitio" + "Cerrar sesión"), que reemplaza a la antigua
  `<section id="miPlan">` de `index.html`. Tiene dos estados propios:
  - **Sin sesión** (`#miPlanSinSesion`): mensaje + botón "Iniciar sesión"
    (abre el widget de Netlify Identity ahí mismo) — cubre tanto a quien
    entra directo por la URL como a quien recién cerró sesión.
  - **Con sesión** (`#miPlanConSesion`): mismo contenido que tenía la
    sección vieja (IMC, objetivo, detalle del plan, CTA), sin cambios de
    copy ni de lógica de negocio.
- **Nuevo archivo `js/nutricion-planes.js`**: se extrajeron de `js/script.js`
  las piezas que NO dependen del DOM del wizard — `NUTRI_PLANES`,
  `nutriResolverObjetivo`, `nutriConstruirAjustes`, `nutriConstruirAvisos` y
  `nutriBuildResumenHTML` — a un archivo compartido, porque ahora dos
  páginas (`index.html` y `mi-plan.html`) necesitan reconstruir el mismo
  plan a partir de lo guardado en `localStorage` sin repetir la encuesta.
  Se carga antes que `js/script.js` / `js/mi-plan.js` en ambas páginas.
- **Nuevo archivo `js/mi-plan.js`**: toda la lógica específica de la nueva
  pantalla (`netlifyIdentity.init`, pintar el plan guardado, togglear los
  dos estados, botones de logout). No se reutilizó `js/script.js` tal cual
  porque tiene varios `getElementById(...).addEventListener(...)` sin
  guarda de `null` pensados para elementos que solo existen en
  `index.html` (el modal/wizard de nutrición, el formulario de contacto,
  etc.) — meterlo en `mi-plan.html` tal cual habría roto la página.
- **`index.html`**:
  - Se eliminó la sección `#miPlan` (ahora vive en `mi-plan.html`).
  - Nuevo link de nav `#btnMiPlanNav` ("Mi plan" → `mi-plan.html`), oculto
    por defecto y visible solo con sesión iniciada (mismo mecanismo de
    `classList.toggle('hidden', !user)` que ya usaba `#btnAcceder`, pero
    invertido).
  - `js/script.js` simplificado: ya no pinta/oculta "Mi plan" in-place
    (`pintarMiPlan`/`mostrarMiPlan`/`ocultarMiPlan` se eliminaron); al
    hacer login (`netlifyIdentity.on('login', ...)`) ahora redirige directo
    a `mi-plan.html` con `window.location.href`. Al enviar la encuesta de
    nutrición con sesión ya iniciada, en vez de pintar la vieja sección
    local, redirige a `mi-plan.html` (que la lee sola desde
    `localStorage`).
  - Nuevo bloque al final del wizard: si la URL trae `?generarPlan=1`
    (llega desde el botón "Generar mi plan" de `mi-plan.html`, que no tiene
    el modal/wizard propio), se abre el modal de nutrición automáticamente
    y se limpia el parámetro de la URL con `history.replaceState` para que
    un refresh no lo reabra solo.
- Probado con Playwright (servidor local): `index.html` sin sesión no
  muestra "Mi plan" en el nav y no tira errores de consola;
  `mi-plan.html` muestra el estado "sin sesión" por defecto y, simulando
  sesión + plan guardado en `localStorage`, renderiza igual que antes en la
  vieja sección; `index.html?generarPlan=1` abre el modal solo y limpia la
  URL. Los únicos errores de consola observados son 403 de recursos
  externos (Google Fonts, el widget de Netlify Identity) bloqueados por la
  red del sandbox de pruebas, no del código del sitio.

## 2026-09-13 — Trazos naranjas reemplazados por espiga de trigo real vectorizada (excepto Método/Pilares)

- El usuario mostró una captura del hero con los trazos tipo "marcador"
  naranjas (`.deco-scribble`) y una búsqueda de imágenes de granos,
  preguntando si convenía cambiar esos trazos por algo con esa temática,
  **menos en las secciones 3 y 4** (Método y Pilares, `lam-03`/`lam-04`),
  que ya estaban validadas. Se acordó estilo lineal/outline y color
  dorado más "trigo" (`#D9A441`, más amarillo que el `#EDA23A` original)
  antes de tocar código.
- **Iteración 1** (descartada): SVG hecho a mano, un trazo curvo +
  "aristas" cortas tipo espina de pescado. El usuario lo rechazó: "se ve
  horrible jaja".
- **Iteración 2** (descartada): espiga vertical generada por script
  (granos tipo almendra en herringbone sobre un tallo). El usuario
  prefirió pedirle la imagen a un generador externo (Gemini) en vez de
  seguir iterando a mano.
- Se le dio al usuario un prompt (en español e inglés) para pedir una
  espiga de trigo en line art, dorada, aislada en fondo blanco, sin
  sombras/degradados, pensada para recortar y adaptar fácil.
- El usuario subió la imagen generada por Gemini (espiga muy detallada y
  limpia). Se instaló `potrace` (`apt-get install -y potrace`) y se
  vectorizó: recorte al bounding box del dibujo con PIL, umbral a
  blanco/negro, `potrace -s`, y recoloreado del `fill` resultante a
  `#D9A441`. Resultado: `svg/deco-espiga.svg` (viewBox `0 0 163 669`),
  fiel al dibujo de Gemini pero como SVG vectorial liviano.
- En `index.html` se reemplazó `src="svg/deco-scribble.svg"` por
  `src="svg/deco-espiga.svg"` en las 12 instancias `.deco .deco-scribble`
  de `lam-01` (Hero, 6), `lam-02` (Visión, 2), `lam-05` (Para quién es, 2)
  y `lam-06` (Contacto, 2). **No se tocó** `lam-03` ni `lam-04` (siguen
  con `deco-scribble.svg`, incluidos sus `.title-scribble`).
- **Ajuste de posición/ángulo** (feedback del usuario tras ver el primer
  montaje: "la ubicación las veo mal... deberían estar inclinadas...
  revueltas o saliendo de la pantalla como cortadas"): se re-hicieron los
  `style` inline de las 12 instancias con rotaciones bien variadas
  (18°–42°, alternando signo, en vez de la leve inclinación pareja de
  antes) y varias con offset negativo grande (`right:-25px` a `-35px`,
  `left:-15px` a `-35px`) para que queden cortadas por el borde real de
  la pantalla, aprovechando que `.hero` tiene `overflow:hidden` y
  `body`/`html` tiene `overflow-x:hidden` (no hizo falta el truco
  `var(--vw100, 100vw)` de `lam-03`/`lam-04` porque estas instancias son
  hijas directas de la `<section>`, ya a ancho completo de viewport).
- `svg/deco-scribble.svg` no se borró: sigue existiendo y en uso en
  `lam-03`/`lam-04` y en `.title-mark`/`.title-scribble`.
- Verificado con Playwright (servidor local + capturas) en 4 versiones
  sucesivas (dos descartadas + espiga de Gemini con posición inicial +
  posición final "revuelta") en Hero, Visión, Para quién es, Contacto, y
  confirmando en cada iteración que Método/Pilares seguían sin cambios.

## 2026-09-13 — Imagen del Hero reemplazada por ilustración de cerebro con chispas de neuronas

- El usuario pidió reemplazar el logotipo flotante del Hero (`lam-01`,
  `.synapse-art`) por una imagen que subió: un cerebro dividido a la
  mitad entre frutas/verduras y una red de neuronas iluminada. También
  pidió mantener algún efecto como el que tenía el logo, o que las luces
  de las neuronas de la imagen parpadeen.
- Se agregó `img/hero-cerebro-nutricion.png` (1024×1024, fondo
  transparente) y se reemplazó `<img class="logo-badge">` por un
  `div.brain-art` con la nueva imagen (`.brain-art-img`, conserva la
  animación `float` que ya tenía el logo) + 8 `<span class="brain-spark">`
  posicionados sobre los puntos de luz más brillantes de la imagen
  (detectados analizando los píxeles del PNG), cada uno con una animación
  de parpadeo (`@keyframes spark-twinkle`) con duración/retraso distintos
  para que no parpadeen sincronizados.
- El SVG de fondo de `.synapse-art` (líneas + puntos viajando) no se
  tocó. La clase `.logo-badge` se deja sin usar en el HTML pero se
  mantiene en `css/styles.css` por si se necesita revertir.
- Se actualizó la regla de `prefers-reduced-motion` para incluir los
  nuevos elementos (`.brain-art-img` sin flotar, `.brain-spark` sin
  parpadeo, opacidad fija).
- Verificado con Playwright en desktop (1600px) y mobile (390px), y
  forzando el parpadeo a su punto máximo para confirmar que los sparks
  quedan alineados sobre las luces de la imagen.
- Ver `memoria.md` → "Imagen principal del Hero" para el detalle y cómo
  reposicionar los sparks si se cambia la imagen a futuro.

## 2026-09-13 — Grosor y cruce corregido en los rayones de Pilares (lam-04)

- El usuario mostró una captura de referencia externa (mock de otra
  sección, título "Optimizado para mejorar la productividad") con el
  patrón de rayones deseado y pidió que Pilares (`lam-04`) quedara igual
  en cantidad y posición. Comparando contra el sitio, se detectaron dos
  problemas:
  1. **Grosor invertido**: los 2 rayones "flotantes" (no sangran al
     borde, `width:300px`/`320px`) se veían gruesos, y los 5 rayones
     cortos (sangrado + acento chico, `width:90-190px`) se veían finos —
     al revés de la referencia (flotantes finos, cortos gruesos). Causa:
     los `<img class="deco-scribble">` solo llevaban `width` en el
     `style` inline, así que el navegador escalaba el grosor del trazo
     proporcional al ancho (SVG con aspect-ratio natural 400:30).
  2. **Cruce en el cluster superior derecho**: las dos rayas que sangran
     al borde tenían `rotate` de signo opuesto (`-4deg`/`6deg`) y se
     cruzaban formando una V, en vez de quedar paralelas.
  3. La raya chica del cluster inferior central quedaba pegada/solapada
     con la raya larga de al lado, sin el hueco que muestra la
     referencia.
- **Fix** (`index.html`, los 7 `<img class="deco-scribble">` dentro de
  `#lam-04 .lam-title-frame`): se agregó `height` explícito en px a cada
  una (desacoplado del `width`) — los 2 flotantes bajaron a
  `height:10px` (más finos), los 5 cortos subieron a `height:14-15px`
  (más gruesos). Se unificó el `rotate` de las dos rayas del cluster
  superior derecho a `-3deg` en ambas para que queden paralelas. Se
  separó la raya chica inferior (`right:70px→right:-10px`) para dejar un
  hueco claro respecto a la raya larga de al lado.
- No se tocó `lam-03`, que usa el mismo esquema de 7 rayones — el usuario
  solo pidió el ajuste en Pilares. Ver `memoria.md` para el patrón a
  seguir si se replica ahí.
- Verificado con Playwright (servidor local, captura a 1600px de ancho)
  comparando contra la imagen de referencia del usuario.

## 2026-09-13 — Fix robusto de sangrado + segundo rayón superior que faltaba

- El usuario volvió a comparar contra una captura de referencia distinta
  (título "Optimizado para mejorar la productividad") y señaló dos
  problemas en `lam-03`/`lam-04`:
  1. Faltaba un rayón: en la referencia, el cluster superior derecho
     tiene **dos** rayones que sangran al borde real (uno grande arriba,
     uno chico debajo), pero en el sitio solo el grande sangraba — el
     chico (`right:-4px;top:-10px;width:110px`) se quedaba cerca del
     borde del `.lam-title-frame`, lejos del borde real de la pantalla.
  2. El truco `calc(50% - 50vw)` que ya se usaba para sangrar al borde no
     llegaba al borde real en un navegador con scrollbar clásica (no
     overlay, ej. Windows/Chrome): la unidad `vw` se calcula sobre el
     ancho **total** del viewport (incluye el hueco del scrollbar),
     mientras que `.wrap{margin:0 auto}` centra usando el ancho
     **visible** del documento (`clientWidth`, sin el scrollbar). Esa
     diferencia (~15-17px) hacía que sobre todo el lado derecho se
     quedara corto.
- **Fix del sangrado** (robusto, independiente del navegador): se agregó
  en `js/script.js` una función `setViewportWidthVar()` que fija una
  variable CSS `--vw100` con `document.documentElement.clientWidth` (el
  mismo ancho que usa `.wrap` para centrarse), actualizada al cargar y en
  cada `resize`. En `index.html`, los 6 rayones que sangraban con
  `calc(50% - 50vw)` ahora usan
  `calc(50% - (var(--vw100, 100vw) / 2))` — con `100vw` como fallback
  antes de que corra el JS. Al usar la misma base (`clientWidth`) que el
  centrado de `.wrap`, el cálculo coincide siempre, con o sin scrollbar
  visible.
- **Rayón superior chico que faltaba**: se reemplazó
  `right:-4px;top:-10px;width:110px;transform:rotate(5deg)` por
  `right:calc(50% - (var(--vw100, 100vw) / 2));top:-6px;width:100px;
  transform:rotate(6deg)` en `lam-03` y `lam-04` — ahora es un segundo
  rayón que sangra al borde real, debajo del rayón grande existente,
  igual que en la referencia.
- Verificado con Playwright en 1920px: los 3 rayones del cluster superior
  derecho y el rayón inferior izquierdo llegan exactamente al borde real
  del viewport (`x=0` / `x=ancho de pantalla`).

## 2026-09-13 — Rayones del lado derecho también sangran al borde real + aguacate reubicado

- El usuario volvió a comparar contra la captura de referencia y avisó
  que todavía no se veía la diferencia: el fix anterior solo cubría el
  rayón inferior izquierdo, pero en la referencia el rayón más externo
  de cada cluster (arriba a la derecha y abajo a la derecha) también
  nace del borde real de la pantalla.
- Se aplicó el mismo truco `calc(50% - 50vw)` (esta vez en `right`) a los
  dos rayones más externos de `.lam-title-frame` en `lam-03` y `lam-04`
  (los que tenían `right:-10px`), subiendo un poco su `width` para que
  se noten más. Los rayones centrales/largos del cluster se dejaron
  igual, como en la referencia.
- Al sangrar hasta el borde real, el rayón superior derecho de `lam-04`
  quedaba cruzando el aguacate decorativo (`deco-blob-avocado.svg`,
  pegado a la esquina superior derecha de la sección). Se movió esa
  fruta a la esquina superior izquierda (`right:-20px` → `left:-20px`,
  rotación espejada) siguiendo la sugerencia del usuario. `lam-03` no
  tiene fruta arriba, así que no necesitó este ajuste.
- Verificado con Playwright en 1917px, 1600px y 1280px de ancho.

## 2026-09-13 — Título de Pilares entra en una sola línea en desktop

- El usuario mandó una captura de `lam-04` (Pilares) donde el título
  "Cuatro frentes de trabajo" se partía en dos líneas aunque a ese ancho
  de pantalla entraba de sobra en una.
- Causa: el `h2.lam-title` de `lam-04` no tenía `style` propio y
  heredaba el `max-width:12ch` base de `.lam-title`, pensado para
  títulos más cortos. Se agregó `style="max-width:26ch"` en
  `index.html`, igual que ya tiene `lam-03` con `32ch`.
- Verificado con Playwright en 1917px, 1600px, 1280px y 900px (título en
  una línea) y en 380px (sigue partiéndose en dos líneas de forma
  natural, sin cortes raros, como corresponde en mobile).

## 2026-09-13 — Rayón izquierdo de Método/Pilares ahora sangra hasta el borde real

- El usuario mandó una captura de referencia (título "Optimizado para
  mejorar la productividad") donde los rayones nacen del borde real de
  la pantalla, y una captura propia de `lam-04` (Pilares) donde dijo que
  "faltaba" el rayón izquierdo.
- El rayón ya existía en el markup (uno de los 7 de `.lam-title-frame`
  en `lam-03` y `lam-04`), pero estaba posicionado con `left:6px` —
  relativo a `.lam-title-frame`, que hereda el ancho centrado de `.wrap`
  (`max-width:1180px`), así que nacía a ~200-250px del borde real en vez
  de desde ahí. Por eso se veía "ausente" comparado con la referencia.
- Se cambió ese rayón a `left:calc(50% - 50vw)` en `index.html` (mismo
  cambio en `lam-03` y `lam-04`) — truco de CSS que aprovecha que
  `.lam-title-frame` está centrado igual que el viewport, así el borde
  izquierdo del rayón cae siempre en `x=0` real sin depender de un valor
  fijo en px que se rompería en otras resoluciones. Se subió el `width`
  de 140px a 170px para que se note más.
- No se tocó ningún otro rayón del frame (el cluster superior derecho ni
  los inferiores derechos) — el pedido era puntual sobre el izquierdo.
- Verificado con Playwright en 1600px y 1280px de ancho: el rayón nace
  del borde real del viewport en ambos casos.

## 2026-09-13 — Párrafo de Pilares movido debajo de la ola

- El usuario probó el patch anterior en local (Live Server) y mandó una
  captura de `lam-04` (Pilares): el párrafo debajo del título quedaba
  apretado justo encima del `.signal-wave` (la línea celeste ondulada),
  con uno de los rayones del `.lam-title-frame` cruzándole el texto por
  encima, y preguntó si convenía bajar el párrafo debajo de esa línea.
- Se sacó el `<p class="lam-text">` de Pilares de dentro de
  `.sec-head-center`/`.lam-title-frame` y se movió como bloque
  independiente entre `.signal-wave` y `.pillar-grid`. Se agregó la
  clase `.lam-text-center` en `css/styles.css`
  (`text-align:center;margin:-16px auto 44px`) para que siga centrado
  igual que antes.
- Efecto colateral esperado: al salir el párrafo de `.lam-title-frame`,
  ese contenedor bajó de altura y los rayones inferiores quedaron más
  pegados al subrayado del título (ya no tienen que "saltar" la altura
  del párrafo) — coincide ahora con cómo se ven en `lam-03`, que nunca
  tuvo párrafo ahí.
- `lam-03` (Método) no tiene este párrafo, así que no se tocó.
- Verificado con Playwright (inyectando `Caveat` temporalmente, igual
  que en las sesiones anteriores) en 1600px: la ola queda libre de
  texto y rayones, el párrafo se lee centrado y con espacio antes de
  las tarjetas de pilares.

## 2026-09-13 — Rayones reagrupados junto al título (Método y Pilares)

- El usuario mandó una captura del resultado de la sesión anterior y
  señaló dos problemas comparando contra la referencia visual original:
  el título de Método (`lam-03`) se veía partido en 3 líneas en vez de
  2, y "faltaban rayas" cerca del título (los rayones existentes
  quedaban lejos, cerca del CTA final, porque estaban posicionados
  respecto a toda la sección, que es muy alta).
- **Título en 2 líneas**: se agregó un `<br>` explícito en el `h2` de
  `lam-03` después de "fases," (mismo patrón que el `<br>` del H1 del
  Hero), en vez de depender del wrap automático por `max-width` en
  `ch`, que partía el texto en 3 líneas desparejas. Se ajustó también
  el `max-width` inline de ese `h2` a `32ch` para que la primera mitad
  del título no vuelva a wrapear sola antes del `<br>`.
- **Rayones pegados al título**: se creó un contenedor nuevo,
  `.lam-title-frame` (`position:relative`, en `css/styles.css`), que
  envuelve solo el `.sec-head-center` de cada sección (eyebrow + h2 +
  `.title-scribble` + `.lam-text` si existe). Los 7 `deco-scribble` de
  cada sección — antes hijos directos de `<section>` — pasaron a ser
  hijos de este contenedor, con sus `top`/`bottom` reajustados para
  quedar pegados arriba y abajo del bloque de título en vez de
  relativos a la altura total de la sección. Aplicado igual en
  `lam-03` y `lam-04` para mantenerlas idénticas, como ya establecía
  `memoria.md`. Ver `memoria.md` → "Títulos manuscritos tipo
  'marcador'..." para el detalle vigente (la descripción vieja de
  "Rayones 'marco' de la sección" quedó reemplazada por esta).
- **Verificado con Playwright** en este entorno: como
  `fonts.googleapis.com` no es accesible acá, se inyectó temporalmente
  el archivo de `Caveat` (bajado desde el repo de Google Fonts en
  GitHub) solo para las capturas de verificación, igual que en la
  sesión anterior. Se confirmaron 2 líneas en el título y la posición
  de los rayones en desktop (1600px, 1280px), tablet (900px) y un
  ancho intermedio (480px) — en mobile real (`≤720px`) los
  `deco-scribble` ya se ocultaban de antes y no aplica.

## 2026-09-13 — Títulos estilo "marcador manuscrito" en Método y Pilares

- El usuario mostró una referencia visual (título en fuente manuscrita
  tipo marcador, color casi negro, con un subrayado de rayón bajo la
  última palabra y un "marco" de 6 rayones sueltos repartidos en las
  esquinas de la sección) y pidió replicarla en los títulos de Método
  (`lam-03`) y Pilares (`lam-04`), respetando primero tipografía/saltos
  de línea y agregando los rayones al final.
- **Tipografía**: se agregó la fuente `Caveat` (pesos 600/700) al enlace
  de Google Fonts en `index.html`, y una variable nueva
  `--font-hand:'Caveat',cursive` en `css/styles.css`. Se creó una regla
  con scope solo a esas dos secciones (`#lam-03 .lam-title, #lam-04
  .lam-title`) que cambia `font-family` a la manuscrita, quita el
  `letter-spacing` negativo que tienen el resto de títulos (Fraunces) y
  sube el tamaño (`clamp(40px,6vw,68px)`) porque una fuente cursiva se ve
  más chica que una serif al mismo tamaño de fuente. El resto de
  secciones (Hero, Visión, Beneficios, Contacto) no se tocó y sigue en
  Fraunces.
- **Subrayado de la última palabra** (`.title-mark`, ya existía): se
  ajustó solo para estas dos secciones (`background-position`/
  `background-size`) para que el rayón quede pegado a la línea base del
  texto manuscrito en vez de flotar más abajo como con Fraunces.
- **Rayones "marco"**: se reemplazaron los 2 `deco-scribble` sueltos que
  ya tenía cada sección por 6 rayones (reusando el mismo
  `svg/deco-scribble.svg`, solo cambia tamaño/rotación/posición vía
  `style` inline, mismo patrón `.deco` de siempre) distribuidos así en
  ambas secciones (idéntico en `lam-03` y `lam-04`): un trazo largo +
  dos trazos cortos apilados en la esquina superior derecha, y en la
  parte inferior un trazo corto a la izquierda, uno largo y dos cortos
  hacia la derecha — imitando la composición de la referencia. Sin
  cambios en `svg/deco-scribble.svg` en sí (mismo color `#EDA23A` que ya
  se usaba).
- El contenido/copy de los títulos **no cambió** (`"Un método en cuatro
  fases, no una dieta genérica"` y `"Cuatro frentes de trabajo"`), solo
  el tratamiento visual.
- Verificado con Playwright en este entorno: como `fonts.googleapis.com`
  no es un dominio accesible desde este sandbox (ver
  `network_configuration`), para la captura de verificación se inyectó
  temporalmente el archivo de la fuente Caveat descargado desde el repo
  público de Google Fonts en GitHub (dominio sí permitido) vía
  `@font-face` con `data:` URI — solo para confirmar visualmente el
  resultado en este entorno; el `index.html` entregado sigue apuntando
  a Google Fonts normalmente, que sí cargará en un deploy real. Se
  confirmó el resultado en desktop (1280px) y mobile (390px, donde los
  rayones ya se ocultan como el resto de `.deco-scribble`).

## 2026-09-13 — Corregido: un solo anillo por área en vez de doble anillo pegado

- El usuario mandó una captura real de la tarjeta de progreso: con dos
  anillos concéntricos por área (externo = estado actual, interno =
  diagnóstico inicial), al tamaño real de la tarjeta quedaban demasiado
  pegados entre sí — cuando el valor inicial era bajo (rojo/dorado) se
  veía como un glitch pegado al anillo externo verde, no como una
  comparación clara antes/después.
- Se simplifica a **un solo anillo por área** (el valor más reciente:
  reevaluación si existe, si no el diagnóstico inicial), coloreado según
  su propio porcentaje igual que antes. Cuando hay reevaluación, se
  agrega debajo del anillo una línea de texto (`gaugeDeltaHtml`, clase
  `.gauge-delta`) con el valor inicial y la diferencia en puntos
  porcentuales (verde si mejoró, rojo si empeoró, gris si sin cambios),
  en vez de un segundo anillo.
- Leyenda simplificada: ya no explica anillo externo/interno
  (`.gauge-legend-ring*`, eliminadas); ahora una sola línea con las fechas
  (`.gauge-dates`) y se mantiene la leyenda de escala de color
  (`.gauge-scale`) sin cambios.
- Aclaración de dato, no de código: si las 4 áreas muestran 100% a la vez
  (como en la captura del usuario), es el resultado esperado si se
  contestó la opción "mejor" en las 4 preguntas de esa medición — no es
  un bug de cálculo, se verificó con casos de prueba en Node.
- Sin verificación en navegador real en esta sesión (mismo motivo que la
  entrada anterior: no se pudo instalar Playwright/Chromium en este
  entorno); el diagnóstico y el ajuste se basaron en la captura de
  pantalla que aportó el usuario, no en una revisión visual propia.

## 2026-09-13 — Reemplazo del radar por anillos de progreso con color dinámico

- El usuario pidió reemplazar el radar/spider chart de la tarjeta de
  progreso en Método por algo más llamativo. Se propusieron 3 mockups
  (dumbbell antes/después, anillos tipo gauge, barras agrupadas); eligió
  los **anillos**, con el pedido explícito de que el color de cada anillo
  cambie según su propio porcentaje.
- Tarjeta renombrada de `#methodRadar`/`.method-radar` a
  `#methodGauges`/`.method-gauges` (junto con todas las funciones y
  variables internas en `js/script.js`: `renderMethodGauges`,
  `gaugeComputeAreas`, `gaugeColorForPercent`, `gaugeArc`,
  `gaugeBuildItem`, etc.) para que el código no siga hablando de "radar"
  sin que exista ningún spider chart.
- Nuevo layout: grilla 2×2 (`.gauge-grid`) con un anillo SVG por área
  (Foco, Memoria, Energía, Calma), dibujado con `<circle>` +
  `stroke-dasharray` (sin librerías). Con diagnóstico + reevaluación, cada
  gauge dibuja un anillo externo grueso (estado actual) y uno interno fino
  (diagnóstico inicial), ambos coloreados según su propio valor — la
  distinción antes/después pasa a ser por grosor/posición del anillo, no
  por color como en el radar (que usaba morado/verde fijos por serie).
- Color por porcentaje (`gaugeColorForPercent`): interpolación RGB continua
  rojo `#B3261E` (0%, reutiliza el rojo de validación que ya existía en el
  sitio) → dorado `var(--gold)` (50%) → verde `var(--green)` (100%). Se
  agregó `.gauge-scale`, una leyenda que explica los 3 tramos de color.
- Mismos 3 estados de la tarjeta que el radar (vacío / solo diagnóstico /
  diagnóstico + reevaluación), mismo origen de datos (paso 6 del wizard +
  `sinaptix_reevaluacion`), y el modal `#modalReevaluacion` /
  `#btnReevaluar` no cambiaron.
- **Sin verificación visual con Playwright en esta sesión**: el `install`
  de Chromium no completó porque la descarga del navegador sale de un
  dominio no permitido en la configuración de red de este entorno
  (timeout). Se validó por separado en Node.js la interpolación de color
  (transición correcta y continua en los cortes 0/20/40/50/60/80/100%) y
  la conversión de escala 1-5 a porcentaje (siempre 20/40/60/80/100%, sin
  decimales). Falta confirmar visualmente (desktop + móvil 380px) en una
  sesión con acceso a Playwright, o con una captura que aporte el usuario.

## 2026-09-13 — Radar de progreso (antes/después) en Método, con reevaluación

- Sección 03 (Método): el `.timeline` ahora comparte fila con una tarjeta
  nueva a la derecha, `.method-radar` (`#methodRadar`), dentro de un grid
  de dos columnas (`.method-body`, se apila en móvil ≤900px). La tarjeta
  muestra un radar/spider SVG (generado en `js/script.js`, sin librerías)
  con 4 ejes: **Foco**, **Memoria**, **Energía** y **Calma**.
- **Origen de los datos y por qué se renombraron los ejes**: los 4 ejes
  vienen de las escalas 1-5 ya recolectadas en el paso 6 del wizard de
  nutrición (estrés, fatiga, dificultad de concentración, olvidos), pero
  **invertidas** (`6 - valor`) para que en el radar "más afuera" sea
  siempre "mejor" en las 4 áreas — de ahí que "dificultad de
  concentración" pase a llamarse "Foco", "olvidos" a "Memoria", "fatiga"
  a "Energía" y "estrés" a "Calma" (`radarComputeAreas` en
  `js/script.js`). Si se prefieren los nombres literales de las
  preguntas, es un cambio menor de labels, no de datos.
- **Estados de la tarjeta** (`renderMethodRadar`):
  - Sin ningún `sinaptix_objetivo.encuesta` guardado: estado vacío con
    texto explicativo y botón "Generar mi diagnóstico" que abre el mismo
    wizard de nutrición (`#btnNutricion`).
  - Con diagnóstico inicial guardado: dibuja el polígono "Antes" (morado)
    con la fecha del diagnóstico, y un botón "Actualizar mi estado".
  - Con una reevaluación posterior guardada: agrega un segundo polígono
    "Después" (verde) superpuesto, leyenda con las dos fechas, y el botón
    pasa a decir "Actualizar mi estado otra vez".
- **Reevaluación (dato nuevo, no existía antes)**: como no había ninguna
  segunda medición real para comparar contra el diagnóstico inicial, se
  agregó el botón "Actualizar mi estado" (`#btnReevaluar`, dentro de la
  tarjeta del radar) que abre un modal nuevo, `#modalReevaluacion`, con
  las mismas 4 preguntas de escala 1-5 del paso 6 (mismo componente
  `.scale-row`/`.scale-opt`, distinto `name` con prefijo `reeval` para no
  chocar con el wizard). Al guardar (`#formReevaluacion`), se escribe en
  `localStorage` bajo la key nueva **`sinaptix_reevaluacion`**
  (`{estres, fatiga, concentracion, olvidos, fecha}`, se sobrescribe cada
  vez — no guarda historial de más de una reevaluación por ahora), se
  vuelve a renderizar el radar, y se cierra el modal con scroll de vuelta
  a la tarjeta.
- El radar también se refresca apenas se guarda un diagnóstico nuevo
  desde el wizard (`nutriForm` submit, con y sin sesión iniciada), sin
  esperar a recargar la página.
- Verificado con Playwright en este entorno (servidor local + capturas):
  los 3 estados de la tarjeta (vacío, solo "antes", "antes" + "después"),
  apertura del wizard desde el botón del estado vacío, apertura y envío
  completo del modal de reevaluación (guarda en `localStorage`, cierra el
  modal), y layout en viewport móvil (380px, se apila debajo del
  timeline). Sin errores de JS propios (los únicos errores de consola
  observados son 403 del widget de Netlify Identity al intentar salir a
  la red, no relacionados con este cambio).
## 2026-09-13 — Reemplazo del correo por login: el plan se guarda en "Mi plan"

- El paso final del wizard de nutrición (`#modalNutricion`) ya no envía
  el plan por correo (`mailto:`) — como el sistema ya genera y muestra el
  plan al instante en el paso 8, pedirlo por correo era redundante. Botón
  del paso 8 renombrado de "Solicitar plan" a **"Guardar mi plan"**, y el
  texto de intro del modal se actualizó para reflejar que el plan se
  genera al instante (ya no dice que "el equipo de SINAPTIX arma la
  propuesta").
- Al enviar el paso 8: se guarda igual en `localStorage`
  (`sinaptix_objetivo`, sin cambios en el formato) y:
  - con sesión de Netlify Identity ya iniciada, se pinta el plan de
    inmediato en "Mi plan", se cierra el modal y se hace scroll hasta ahí;
  - sin sesión, se avisa que quedó guardado en el navegador y se invita a
    iniciar sesión (se abre el login de Netlify Identity automáticamente
    a los ~900ms) para verlo completo y no perderlo.
- La sección **"Mi plan"** (`#miPlan`) deja de mostrar el mensaje de
  espera ("tu plan está siendo preparado por el equipo, te escribimos a
  tu correo") y en su lugar muestra el plan completo (nutrientes clave,
  priorizar, moderar, ajustes y avisos), reconstruido desde la encuesta
  guardada en `localStorage`. Si todavía no hay ningún plan guardado,
  muestra un botón "Generar mi plan" que abre el mismo wizard.
- Se extrajo la lógica de armado del HTML del plan a una función
  compartida (`nutriBuildResumenHTML` en `js/script.js`), usada tanto por
  el paso 8 del wizard como por "Mi plan", para no duplicar la tabla de
  conexiones.
- Verificado con Playwright (servidor local): flujo sin sesión (guarda +
  ofrece login), estado vacío de "Mi plan" con su CTA, y flujo completo
  con sesión simulada (plan se pinta al instante, cierre de modal, scroll,
  contenido visible) — usando un stub de `window.netlifyIdentity` ya que
  el widget real no puede autenticar sin salir a la red en este entorno.
  Sin errores de JS y confirmado también en viewport móvil (380px).

## 2026-09-13 — Encuesta de nutrición especializada (wizard de 8 pasos)

- Se reemplaza el formulario de una sola pantalla de `#modalNutricion`
  (objetivo + email) por un wizard de 8 pasos con barra de progreso,
  que recolecta objetivo, datos personales/antropométricos, rutina y
  exigencia mental, hábitos alimentarios, salud/alergias/restricciones,
  percepción actual (4 escalas 1-5) y preferencias/presupuesto, antes de
  mostrar el plan resuelto.
- Los 4 planes de nutrición especializada que ya existían en el select
  (concentración, fatiga mental, memoria de trabajo, estrés) se
  mantienen sin cambios de fondo; se les agrega contenido real (enfoque,
  nutrientes clave, alimentos a priorizar/moderar) en un objeto
  `NUTRI_PLANES` en `js/script.js`. Se agrega una quinta opción al
  select, "No estoy seguro / varios objetivos", que resuelve
  automáticamente cuál de los 4 planes existentes mostrar según las 4
  escalas del paso 6 (`nutriResolverObjetivo`), sin crear un plan nuevo.
- Se agrega una tabla de conexiones (`nutriConstruirAjustes` /
  `nutriConstruirAvisos`) que ajusta el texto del plan según alergias,
  restricción alimentaria, presupuesto, tiempo para cocinar, alimentos
  que no le gustan al usuario y hora de mayor exigencia mental, y agrega
  avisos de derivación (condición de salud/medicación, sueño
  insuficiente, cafeína alta, ultraprocesados a diario) sin bloquear el
  envío.
- El paso 2 se prellena automáticamente con los datos ya guardados en
  `sinaptix_antropometria` si el usuario los registró antes, para no
  pedirlos dos veces.
- El envío final guarda todo en `localStorage` (`sinaptix_objetivo`, con
  un campo `encuesta` nuevo con todas las respuestas) y arma un
  `mailto:` a `hola@sinaptix.com` con el resumen completo, igual que el
  resto de formularios del sitio — sigue sin haber backend real.
- Se agregan los estilos nuevos del wizard en `css/styles.css`: barra de
  progreso por puntos, checkboxes en grilla, escalas 1-5 tipo píldora,
  tarjeta de resumen (`.nutri-summary`) y avisos (`.nutri-note`).
- Verificado con Playwright headless + servidor local: navegación y
  validación por paso, resolución automática de "No estoy seguro",
  aplicación de ajustes/avisos según distintas combinaciones de
  respuestas, prellenado desde antropometría, y layout en viewport móvil
  (380px).

## 2026-09-12 — Rayón pegado al título en Método y Pilares (subrayado + línea debajo)

- El usuario aclara (con nueva captura) que no quería solo rayones sueltos
  de fondo cerca del título: quería el mismo tratamiento que la
  referencia visual del usuario, con un rayón subrayando la palabra final del
  título y una línea completa justo debajo de todo el título.
- Se agregan dos clases en `css/styles.css`: `.title-mark` (subrayado vía
  `background-image` sobre un `<span>`, se adapta al ancho real de la
  palabra) y `.title-scribble` (imagen de `deco-scribble.svg` en flujo
  normal del documento, `display:block;margin:auto`, debajo del `h2`, para
  que no dependa de coordenadas fijas ni de en cuántas líneas se parta el
  título).
- Se envuelve la última palabra del título en `lam-03` ("genérica") y
  `lam-04` ("trabajo") en `<span class="title-mark">`, y se agrega el
  `<img class="title-scribble">` como hermano del `h2` en ambas
  secciones.
- A diferencia del intento que se revirtió, estos `h2` no son
  `display:flex`, así que envolver la palabra en un `span` no rompe el
  wrapping del título — verificado con capturas Playwright (scrolleando
  la página completa para disparar las animaciones `reveal` antes de la
  captura, y confirmando visualmente el resultado final).
- Archivos tocados: `index.html`, `css/styles.css`, `memoria.md`,
  `changelog.md`.

## 2026-09-12 — Trazos de marcador: rectos en vez de ondulados (corrección de forma)

- El usuario manda su captura de referencia otra vez junto con la del
  sitio, señalando que el trazo tiene que quedar "tal cual" la referencia
  y pide explícitamente que no sea "tembleсoso" (con varias ondas/curvas)
  como venía saliendo.
- Se cambia el `path` de `svg/deco-scribble.svg` de una curva con tres
  segmentos en "C" (varias jorobas, efecto garabato) a una sola curva
  Bézier cuadrática `M8,17 Q200,9 392,13`: prácticamente una línea recta
  con una leve inclinación, igual a como se ven los trazos en la
  referencia visual del usuario.
- No se tocan tamaños, posiciones, color ni opacidad (eso ya había
  quedado bien en el ajuste anterior); solo la forma del trazo.
- Verificado con capturas Playwright headless antes de generar el patch.
- Archivos tocados: `svg/deco-scribble.svg`, `memoria.md`, `changelog.md`.

## 2026-09-12 — Centrar títulos de Método y Pilares (lam-03, lam-04)

- El usuario pide que los títulos de las secciones 03 (Método) y 04
  (Pilares) queden centrados en vez de alineados a la izquierda.
- Se agrega la clase `.sec-head-center` en `css/styles.css`
  (`text-align:center`, más `margin:auto` para `.lam-title`/`.lam-text`
  dentro de ella, ya que ambas tienen `max-width` propio y no se centran
  solas con `text-align` del padre).
- Se envuelve `eyebrow + h2` en `lam-03`, y `eyebrow + h2 + p` en `lam-04`,
  dentro de un `<div class="sec-head-center">`. El timeline (03) y el
  `signal-wave` + `pillar-grid` (04) quedan fuera de ese div y no cambian.
- Verificado con capturas de pantalla (Playwright headless) antes de
  generar el patch.
- Archivos tocados: `index.html`, `css/styles.css`, `memoria.md`,
  `changelog.md`.

## 2026-09-12 — Corrección de los trazos de marcador: más gruesos, grandes y visibles

- El usuario manda una captura de pantalla del sitio ya con el patch
  anterior aplicado, señalando "te pedí que sea igual pero tú hiciste otra
  cosa": los trazos se veían demasiado finos y tenues comparados con la
  referencia visual del usuario.
- Se detecta la causa revisando con capturas reales (Playwright headless +
  servidor local): el SVG usaba un viewBox chico con `stroke-width:6` y
  varias instancias tenían `opacity` baja (.35–.4) y tamaños pequeños
  (90–220px), lo que resultaba en líneas de ~2-4px efectivos en pantalla.
- Se rehace `svg/deco-scribble.svg` con un viewBox más grande (400×36) y
  `stroke-width:11`, se sube la opacidad base de `.deco-scribble` a `.85`
  en `css/styles.css`, y se reposicionan/agrandan las instancias (150 a
  340px, antes 90 a 220px), agregando más densidad en el Hero (6 en vez de
  4) para imitar el clúster de la referencia.
- Se corrige además un trazo que quedaba cruzando el texto del footer del
  Hero ("Guayaquil, Ecuador — Consultas online y presenciales").
- Se verifica el resultado con capturas de pantalla reales (Chromium vía
  Playwright, ya instalado en el entorno) antes de generar el patch, en
  vez de asumir el resultado solo por el código.
- Archivos tocados: `svg/deco-scribble.svg`, `css/styles.css`,
  `index.html`, `memoria.md`, `changelog.md`.

## 2026-09-12 — Trazos tipo marcador de fondo (nueva versión, sin tocar títulos)

- El usuario pide recuperar el look de rayones de fondo,
  mostrando una captura de referencia (clúster de trazos amarillo/naranja
  dispersos, incluyendo uno de subrayado bajo texto).
- Se crea `svg/deco-scribble.svg`: un trazo único ondulado tipo marcador
  (path con curvas Bézier, `stroke-linecap:round`, color `#E3A23B`, sin
  relleno) pensado para reutilizarse muchas veces con distinto tamaño,
  rotación y opacidad vía `style` inline, igual que los blobs de fruta.
- Se agrega la clase `.deco-scribble` en `css/styles.css` (opacidad base
  `.55`, oculta en móvil `max-width:720px`).
- Se colocan 4 instancias en el Hero (imitando el clúster superior de la
  referencia) y 2 en cada una de las otras 5 secciones (`lam-02` a
  `lam-06`), como hijos directos de cada `<section>` con
  `position:absolute` y `z-index:0` (mismo patrón que los `.deco`
  existentes), por lo que quedan detrás del `.wrap` y no interfieren con
  ningún título ni texto.
- A propósito, **no** se repite el patrón que causó la reversión anterior
  (envolver una palabra en un `<span>` dentro de un `h2` con
  `display:flex`): esta vez son solo decoraciones de fondo sueltas, sin
  ninguna relación con el markup del texto.
- Archivos tocados: `index.html`, `css/styles.css`, `svg/deco-scribble.svg`
  (nuevo), `memoria.md`, `changelog.md`.

## 2026-09-12 — Revertidos los trazos tipo marcador (rompían el layout y no convencieron)

- Se habían probado trazos tipo "marcador" en dos
  iteraciones (trazos sueltos + subrayado bajo palabra clave en cada
  título; luego una corrección con trazos más finos en pareja). El
  usuario prueba ambas versiones en el navegador y decide revertir todo:
  además de no convencer visualmente ("está horrible"), envolver la
  palabra "alimenta" en un `<span>` dentro del `h2` de Visión (que usa
  `display:flex`) rompía el layout — el texto se apilaba una palabra por
  línea, gigante, en vez de fluir normal.
- Se revierten con `git revert` los dos commits de esa sesión
  (`9f01a59` y `bfaade2`), sin conflictos.
- Se conserva el único fix de esa sesión que sí era correcto y no tenía
  relación con el problema: `.hero h1 em` se mantiene en
  `font-style:italic` (no se revierte a `normal`), para que "claridad"
  se siga viendo en Fraunces itálica.
- Se eliminan `svg/deco-mark.svg`, `svg/deco-mark-sm.svg` y
  `svg/deco-underline.svg`.
- Estado resultante: equivalente al commit "Cambiar tipografia de
  titulos a Fraunces", sin ninguna decoración tipo marcador.
- Archivos tocados: `index.html`, `css/styles.css`, `memoria.md`,
  `changelog.md` (además de borrar los 3 SVG mencionados).

## 2026-09-12 — Tipografía de títulos: Fraunces (editorial y cálida)

- Se evalúan 3 combinaciones de tipografía para títulos (manteniendo Inter
  en el cuerpo): Fraunces (editorial/cálida), Sora (moderna/tech) y
  Manrope (cercana/amigable). El usuario elige **Fraunces**.
- Se agrega `Fraunces` (peso 800, normal e itálica) al `<link>` de Google
  Fonts en `index.html`, junto a `Inter`.
- Se cambia `--font-d` en `css/styles.css` de `'Inter',sans-serif` a
  `'Fraunces',serif`. Este token ya se usaba en `h1`/`h2`/`h3`, la marca
  del nav, los números de `.stat-box` y el valor de "Mi plan", así que el
  cambio se propaga automáticamente sin tocar más selectores.
- El `<em>` de "con *claridad*" en el H1 del Hero hereda `--font-d` y
  queda en Fraunces itálica, efecto buscado deliberadamente.
- Inter se mantiene sin cambios en cuerpo de texto, nav, botones,
  eyebrows y demás UI (`--font-b`, `--font-m`).
- Archivos tocados: `index.html`, `css/styles.css`, `memoria.md`,
  `changelog.md`.

## 2026-09-12 — Pulido visual de los 6 íconos de fruta (degradados + sombra + nuez rediseñada)

- El usuario reporta (con captura) que el ícono de nuez no se reconocía
  como fruta ("ese café que está a la izquierda no parece una fruta") y
  pide que en general se vean "más bonitos".
- Se rediseña `svg/deco-blob-walnut.svg` con un contorno lobulado tipo
  cerebro (en vez de un óvalo liso) para que se lea de inmediato como nuez
  partida.
- Se aplica un pase de pulido a los 6 SVG (`berries`, `avocado`, `orange`,
  `almonds`, `kiwi`, `walnut`): rellenos con degradado (`linearGradient` /
  `radialGradient`) en vez de color plano, más un óvalo de sombra
  semitransparente debajo de cada fruta para dar sensación de volumen y
  apoyo sobre el blob.
- Archivos tocados: `svg/deco-blob-walnut.svg`, `svg/deco-blob-berries.svg`,
  `svg/deco-blob-avocado.svg`, `svg/deco-blob-orange.svg`,
  `svg/deco-blob-almonds.svg`, `svg/deco-blob-kiwi.svg`, `memoria.md`,
  `changelog.md`.

## 2026-09-12 — Posiciones estratégicas para los blobs con frutas (patrón Z / puntos de atención)

- Se investigan patrones de lectura visual en landing pages (Z-pattern,
  F-pattern, jerarquía por color/contraste/escala — Nielsen Norman Group y
  fuentes de diseño de landing pages) y se reposicionan los blobs con fruta
  para que queden junto a puntos de atención reales en vez de solo detrás
  de títulos:
  - Hero: nuez movida junto al botón "Solicitar asesoría"; se agrega un
    acento pequeño de arándanos arriba-derecha como cierre visual del
    recorrido en Z.
  - Visión: arándanos junto al título + una versión mini junto al
    stat-grid (para llevar el ojo hacia las cifras).
  - Método: se agregan **almendras** (`svg/deco-blob-almonds.svg`, nuevo)
    junto a los botones CTA ("Generar nutrición especializada" /
    "Registrar datos antropométricos").
  - Pilares: aguacate se mantiene junto al título.
  - Beneficios: naranja se mantiene junto a las tarjetas de testimonios.
  - Contacto: se agrega **kiwi** (`svg/deco-blob-kiwi.svg`, nuevo) junto al
    formulario de contacto, el CTA final de toda la página.
- Archivos tocados: `index.html`, `memoria.md`, `changelog.md`,
  `svg/deco-blob-almonds.svg`, `svg/deco-blob-kiwi.svg`.

## 2026-09-12 — Blobs con frutas detrás de los títulos (más "vida" ilustrada)

- Se agregan 4 ilustraciones nuevas (`svg/deco-blob-berries.svg`,
  `svg/deco-blob-avocado.svg`, `svg/deco-blob-orange.svg`,
  `svg/deco-blob-walnut.svg`): un blob tipo brochazo en color de marca con
  una fruta/fruto seco flat-illustration encima (arándanos, aguacate,
  naranja, nuez), buscando un look más vivo y menos corporativo, en línea
  con un estilo ilustrado y cálido.
- Se colocan detrás del título del Hero (nuez), Visión/02 (arándanos),
  Pilares/04 (aguacate) y Beneficios/05 (naranja).
- Nueva clase `.deco-fruit` en `css/styles.css`: flotación suave
  (reutiliza el keyframe `float` del hero) con `animation-delay`
  escalonado (`.d2`, `.d3`) y se ocultan en móvil (`max-width:720px`) para
  no saturar el layout angosto.
- Archivos tocados: `index.html`, `css/styles.css`,
  `svg/deco-blob-berries.svg`, `svg/deco-blob-avocado.svg`,
  `svg/deco-blob-orange.svg`, `svg/deco-blob-walnut.svg`.

## Sin fecha (sesión en curso) — Aclaración de ramas main/master

- Se documenta en `memoria.md` que `main` es la rama de trabajo (recibe los
  patches de cada sesión) y `master` es la rama de **producción**
  desplegada en Netlify.
- Se confirma con el usuario que `master` sigue atrasada respecto a `main`
  (le falta el rediseño visual y la creación de memoria/changelog) y que la
  sincronización `git push origin main:master` es un paso manual del
  usuario, no algo que requiera un patch.

## Sesión anterior — Memoria y changelog

- Se crean `memoria.md` y `changelog.md` para que futuras sesiones retomen
  el trabajo sin contexto adicional.
- Se documenta el flujo de trabajo fijo: entrega de parches `git am`,
  autoría `isra16class-byte <isra16class@gmail.com>`, actualización
  obligatoria de estos dos archivos en cada patch.

## 2026-09-12 — Rediseño visual del sitio (`afec65e`)

- Se adapta todo el sistema visual del sitio a un nuevo look de referencia:
  paleta clara con morado de marca (`#714B67`),
  tipografía unificada en Inter, botones tipo píldora, tarjetas redondeadas
  con sombra para stats/pilares/testimonios, nav blanco fijo con blur y
  barra de progreso de scroll.
- Se elimina el "rail" lateral de navegación (hilo sináptico) de HTML, CSS
  y JS.
- Se recolorean los SVG decorativos y el arte del hero para fondo claro.
- El contenido/copy no cambia, solo el sistema visual.
- Archivos tocados: `css/styles.css`, `index.html`, `js/script.js`,
  `svg/deco-circles-vision.svg`, `svg/deco-dots-contacto.svg`,
  `svg/deco-leaf-beneficios.svg`, `svg/signal-wave.svg`.

