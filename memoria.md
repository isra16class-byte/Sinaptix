# Memoria del proyecto — SINAPTIX

> Este archivo existe para que **cualquier sesión nueva** (de Claude o de
> quien sea) pueda retomar el trabajo en este repo sin que el usuario tenga
> que volver a explicar el contexto. Léelo completo antes de tocar código.
> Actualízalo en cada patch que generes (ver "Reglas de esta memoria" al
> final).

## Histórico (archivos anteriores de memoria/changelog)

El **14/09/2026** este archivo y `changelog.md` se archivaron por tamaño
(habían crecido a ~2200 y ~1960 líneas respectivamente, con el detalle
completo de cada sesión de diseño) y se reiniciaron con una versión
condensada. Los archivos completos quedaron en:

- `historico/memoria-2026-09-14.md` — todo el detalle de decisiones de
  diseño/arquitectura tomadas hasta esa fecha (paleta, tipografía,
  wizard de nutrición, backend, ilustraciones, ajustes pixel-a-pixel de
  cada sección, etc.).
- `historico/changelog-2026-09-14.md` — historial cronológico completo de
  patches hasta esa fecha.

**Si vas a tocar algo que ya existe en el sitio y esta memoria condensada
no trae el detalle suficiente (por qué se hizo así, qué se probó y se
descartó, ajustes finos de posición/color/tamaño), buscá primero en
`historico/memoria-2026-09-14.md`** (tiene índice de secciones con `##`,
es fácil de grepear por palabra clave: sección, componente, archivo) antes
de asumir o rehacer algo que ya se resolvió. No se repite ese contenido
acá para no volver a inflar este archivo.

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
  plan": nav propio, estado sin sesión (login de Identity inline) y estado
  con sesión (dashboard con IMC, objetivo, gráfico de barras, detalle del
  plan).
- `css/styles.css` — toda la hoja de estilos (paleta, tipografía, layout).
- `js/script.js` — lógica específica de `index.html` (wizard modal de
  nutrición, formularios, Netlify Identity, anillos de progreso de
  Método).
- `js/mi-plan.js` — lógica propia de `mi-plan.html` (init de Identity,
  pintar el plan, logout, encuesta inline).
- `js/nutricion-planes.js` — **compartido** entre `index.html` y
  `mi-plan.html`: `NUTRI_PLANES`, funciones puras de cálculo/render (plan
  resuelto, gráfico de barras, medidor de IMC). Debe cargarse **antes**
  que `js/script.js`/`js/mi-plan.js`.
- `js/nutricion-wizard.js` — **compartido**: motor de navegación/validación
  del wizard de 8 pasos (`#formNutricion`), usado tanto por el modal de
  `index.html` como por la encuesta inline de `mi-plan.html`. Se carga
  después de `nutricion-planes.js` y antes de `script.js`/`mi-plan.js`.
- `js/plan-sync.js` — **compartido**: sincroniza `localStorage` con el
  backend (Netlify Functions) cuando hay sesión iniciada. Se carga después
  de `nutricion-wizard.js` y antes de `script.js`/`mi-plan.js`.
- `netlify/functions/plan.mjs` — única función serverless, `GET`/`POST`
  de los 3 bloques de datos de "Mi plan" contra Netlify Database.
  **Formato moderno** (`export default`, Web Request/Response) — no usar
  el formato clásico (`exports.handler`), rompe la inyección de la
  connection string.
- `netlify/database/migrations/` — esquema de la tabla `mi_plan` (Postgres,
  vía Netlify Database/`@netlify/database`). El esquema se maneja **solo**
  con migraciones nuevas, nunca editando ni recreando en runtime.
- `svg/`, `img/` — assets (decoraciones SVG tipo `deco-*`, frutas
  `deco-blob-*`, iconos ilustrados en `img/Iconos/`, fotos generadas en
  `img/generadas*`). `svg/icon-*.svg` (calendario-check, red-nodos,
  conversacion, bateria-rayo): set de 4 iconos de línea (un solo `fill`,
  sin `stroke`, hardcodeado en el propio archivo `.svg` como
  `#714B67` — mismo tono que `--purple`; no puede ser la variable CSS
  porque se cargan como `<img src="...">`, no inline, así que no leen
  `:root` — antes `#26161F`/`--ink`, cambiado a pedido del usuario, ver
  `changelog.md`), usados como `.stat-icon` en las 4 tarjetas de
  `#lam-02` (Visión) a 70×70px (`#lam-02 .stat-icon`; el de
  `icon-conversacion.svg`, tarjeta "1:1", va más grande —96×96px— porque
  a igual tamaño se veía más chico que los otros 3, ver "Estado actual
  del diseño" → "Visión" para el detalle). Ver `changelog.md` para el
  porqué de `icon-conversacion.svg` tener un `viewBox` recortado distinto
  a los otros 3. Antes usaban los `.webp`
  ilustrados de `img/Iconos/` (`icon-energia-cerebral`, `icon-neuronas`,
  `icon-semanas`, `icon-acompanamiento`); esos archivos siguen en el
  repo por si se necesitan en otro lado, pero ya no están referenciados
  en `index.html`.
- `tests/` — tests unitarios (ver sección "Tests" abajo).

## Tests

Sesión 2026-09-15: se armó `plan-tests-sinaptix.md` (entregado al
usuario, no vive en el repo) y se implementaron su Prioridad 1 y
Prioridad 2.

- **Qué cubre**: `tests/nutricion-planes.test.js` — 54 tests con
  `node --test` (nativo de Node, sin dependencias nuevas) sobre las
  funciones de cálculo puro de `js/nutricion-planes.js`
  (`nutriResolverObjetivo`, `nutriConstruirAjustes`,
  `nutriConstruirAvisos`, `nutriGuardarAntropometriaSiFalta`,
  `imcCategoria`, `imcGaugeAngulo`, `imcGaugeAgujaDeg`,
  `imcGaugeAgujaDegInicial`, `imcGaugeMarkerPos`, `imcGaugeGradientStops`,
  `imcGaugeGradientDefsHtml`, `gaugeComputeAreas`,
  `gaugeColorForPercent`, `gaugeDeltaHtml`). No cubre las que arman HTML
  (`nutriBuildResumenHTML`, `nutriBuildBarChartHTML`) ni el contenido de
  `NUTRI_PLANES` — no son cálculo, quedan fuera de esta tanda a propósito.
- **Cómo correrlos**: `npm test` (= `node --test`, sin ruta — pasarle
  `tests/` como argumento posicional lo resuelve como *módulo* a
  requerir, no como carpeta a explorar, y falla con `MODULE_NOT_FOUND`;
  sin argumentos, Node descubre solo los `*.test.js` bajo `tests/`).
- **Por qué corre en Node sin romper el navegador**:
  `js/nutricion-planes.js` se carga como `<script>` plano en
  `index.html`/`mi-plan.html` (sin `export`/`import`), así que al final
  del archivo se agregó un bloque guardado
  `if(typeof module !== 'undefined' && module.exports){...}` que solo se
  ejecuta cuando Node lo `require()`; en el navegador `module` no existe,
  así que ese bloque no hace nada ahí.
- **Mock de `localStorage`**: `nutriGuardarAntropometriaSiFalta` usa
  `localStorage` como variable global (asume navegador). El test file
  define un mock in-memory (`crearLocalStorageMock()`) y lo asigna a
  `global.localStorage` **antes** de requerir el módulo, para que esa
  referencia libre la encuentre.
- **Prioridad 2 — `esTipoValido` de `netlify/functions/plan.mjs`**:
  `plan.mjs` valida el campo `tipo` del POST contra
  `TIPOS_VALIDOS.includes(tipo)`; esa constante y la validación se
  extrajeron a un módulo nuevo, **`netlify/functions/plan-validacion.mjs`**
  (`export const TIPOS_VALIDOS`, `export function esTipoValido(tipo)`),
  sin ningún import de `@netlify/identity` ni `@netlify/database`.
  `plan.mjs` ahora importa `{ TIPOS_VALIDOS, esTipoValido }` de ese
  archivo en vez de declarar la constante y usa `esTipoValido(tipo)` en
  el POST; el resto del handler (GET/POST, auth, SQL) no cambió. Se
  separó en un módulo aparte (y no se agregó `export` directo en
  `plan.mjs`) porque `plan.mjs` importa `@netlify/identity` y
  `@netlify/database` a nivel de módulo — esos paquetes solo están
  declarados en `package.json` para que Netlify los instale en el
  deploy, no viven en `node_modules` en este entorno de trabajo, así que
  importar `plan.mjs` directo desde un test rompería con
  `ERR_MODULE_NOT_FOUND` aunque lo único que se quisiera testear sea la
  validación.
  Test: `tests/plan-validacion.test.mjs` (5 tests, ESM — `.mjs` porque
  `plan-validacion.mjs` usa `export`/`import`, a diferencia de
  `nutricion-planes.test.js` que es CommonJS): los 3 tipos válidos dan
  `true`; inválido, vacío, `undefined` y `null` dan `false`. No requiere
  ningún mock.
  El resto de `plan.mjs` (auth real vía `getUser()`, SQL real vía
  `getDatabase()`) sigue **sin testear**, a propósito: solo se puede
  verificar contra un deploy real de Netlify (ver "Pendientes
  conocidos"), no es alcanzable desde este entorno.
- **No se testea (a propósito, ver `plan-tests-sinaptix.md`)**: el
  diseño/layout del sitio (cambia cada sesión, se sigue verificando con
  Playwright ad hoc en cada patch de UI, no en una suite fija).
- **CI**: no hay pipeline configurado — `netlify.toml` tiene
  `command = ""`, así que Netlify no corre `npm test` en el deploy. Correr
  los tests es manual (`npm test`) antes de generar cada patch que toque
  `js/nutricion-planes.js` o `netlify/functions/plan.mjs`/
  `plan-validacion.mjs`.

## Estado actual del diseño (resumen)

- **Paleta** (`css/styles.css`, bloque `:root`): fondo blanco `--paper`,
  panel lavanda claro `--panel`, morado de marca `--purple`/`--purple-dark`
  como color estructural, acentos `--green`, `--gold` (terracota),
  `--navy-bright`. Texto `--ink`. Método (`lam-03`) tenía una paleta
  cálida crema+café propia superpuesta (mockup de referencia); se
  descartó en sesión 2026-09-15 y ahora usa el mismo `--panel`/`--purple`
  estándar que el resto de las secciones "dark" (Beneficios, Contacto).
- **Tipografía**: `Inter` para cuerpo/UI, `Fraunces` (800, normal+itálica)
  para títulos, `Caveat` (`--font-hand`, clase `.title-hand`) para títulos
  con look manuscrito (Método, Pilares, título de "Mi plan").
- **Títulos de sección — mismo color combinado que el Hero**: el Hero
  combina `--ink` (grueso del título) + `--purple` (la palabra `<em>`,
  "claridad") vía `.hero h1 em{color:var(--purple)}`. El resto de
  `<h2 class="lam-title">` ahora sigue el mismo patrón vía
  `.title-mark{color:var(--purple)}` (además del subrayado marcador que
  ya tenía) — cubre "genérica" (`#lam-03`), "trabajo" (`#lam-04`), "carga
  alta" (`#lam-05`) y "asesoría" (`#lam-06`). `#lam-02` no tenía ninguna
  palabra remarcada (llevaba un ícono svg inline en vez de
  `.title-mark`); se le agregó `<span class="title-mark">` sobre
  "alimenta" en `index.html` para que las 6 secciones compartan el mismo
  lenguaje. No aplica a `mi-plan.html`: sus `<h2 class="lam-title">` no
  usan `.title-mark`, siguen 100% `--ink`.
- **Títulos de sección — trazos "marcador" (subrayado ± curva) en morado
  oscuro** (sesión 2026-09-16, con ajuste a continuación): las rayas que
  acompañan los títulos eran naranja/dorado y pasaron a un único asset
  `svg/deco-scribble-purple.svg` (`stroke="#4B2E45"`, `--purple-dark` —
  primer intento con `--purple` #714B67 quedó muy claro/poco contraste
  a criterio del usuario, se oscureció) que reemplaza a `deco-scribble.svg`
  y `deco-scribble-gold.svg` en todo el sitio. Estado final por sección:
  - `#lam-03` (Método) y `#lam-04` (Pilares): título centrado, con
    **ambos** elementos — subrayado `.title-mark` (detrás de "genérica"/
    "trabajo") + curva `.title-scribble` centrada debajo del `<h2>` (en
    Pilares también el `<img class="deco deco-scribble">` suelto de
    `.lam-title-frame`, ver entrada de abajo) — se ven bien distinguidos
    porque la curva queda centrada bajo todo el título, no pegada a una
    sola palabra.
  - `#lam-05` (Beneficios) y `#lam-06` (Contacto): título alineado a la
    izquierda. Acá **se sacó** el `.title-scribble` (quedaba como una
    segunda raya redundante pegada justo debajo del subrayado de
    `.title-mark`, mismo color — el usuario lo marcó como "repetida"/
    "sobrante"). Queda solo el subrayado de `.title-mark` sobre "carga
    alta"/"asesoría". CSS: se sacó la regla `#lam-05 .title-scribble,
    #lam-06 .title-scribble{margin:6px 0 0}` (ya no aplica a nada).
  - `#lam-02` (Visión): sin curva ni subrayado, sin cambios (ya estaba
    así a propósito).
  Los `deco-espiga.svg` (motivo de espigas sueltas, no relacionado) no se
  tocaron. Solo CSS + `index.html` (atributos `src`/markup), nada de JS.
  Verificado con Playwright, desktop 1440px, las 4 secciones con acento.
- **Pilares (`#lam-04`) — trazos "marcador" del título**: dentro de
  `.lam-title-frame` quedó **un solo** `<img class="deco deco-scribble">`
  suelto (`style="right:110px;bottom:14px;width:320px..."`), más los 2
  elementos fijos que ya existían aparte del array — `<img
  class="title-scribble">` (centrado debajo del `<h2>`) y el subrayado
  de la palabra "trabajo" vía `.title-mark` (CSS `background-image` en
  el `<span>`, no es un `<img>`) — total 3 trazos visibles pegados al
  título. Se sacaron los otros 6 `<img class="deco deco-scribble">` que
  estaban dispersos más lejos del título (3 arriba a la derecha, 1 a la
  izquierda, 2 abajo a la derecha) a pedido del usuario, que los marcó
  con círculos sobre una captura del deploy real (ver `changelog.md`,
  décima tanda, para el detalle de cómo se identificó cada uno). No se
  tocó `#lam-03` (Método), que usa el mismo patrón de trazos sueltos y
  sigue con los suyos intactos.
- **Beneficios (`#lam-05`) y Contacto (`#lam-06`) — títulos sin acento,
  ahora con marker+scribble+chispa**: eran los 2 únicos `<h2 class="lam-title">`
  del sitio sin ninguna decoración (a diferencia de `#lam-02` que ya tenía
  un ícono svg inline, y `#lam-03`/`#lam-04` con `.title-mark`+
  `.title-scribble` centrados). Se les sumó el mismo lenguaje visual pero
  **sin centrar** (quedan alineados a la izquierda, como estaban): `<span
  class="title-mark">` sobre "carga alta" (`lam-05`) y "asesoría"
  (`lam-06`), `<img class="title-scribble" src="svg/deco-scribble.svg">`
  suelto después del `<h2>` (mismo asset, `margin:6px 0 0` en vez de
  `auto` — override en CSS por `#lam-05 .title-scribble,#lam-06
  .title-scribble` porque la regla base lo centra), y 1-2 `<span
  class="brain-spark">` (mismo asset que las chispas del hero,
  `keyframes spark-twinkle`) posicionados con `position:relative` en el
  propio `<h2>` — width/height reducidos a 7px vía `#lam-05 .lam-title
  .brain-spark,#lam-06 .lam-title .brain-spark` para que no compitan con
  el texto. **No se tocó la tipografía** (`--font-hand`/Caveat intacta,
  pedido explícito del usuario) ni ningún otro título del sitio.
  `.title-scribble` se sigue ocultando en mobile (`<720px`) por la regla
  general ya existente, mismo comportamiento que `lam-03`/`lam-04`.
  Verificado con Playwright, desktop 1440px y mobile 390px — no rompe el
  layout de las columnas (`.ben-grid`, `.contact-wrap`) ni el ancho del
  `<h2>` (`max-width:14ch` sin cambios).
- **Método (`#lam-03`) — frutas pequeñas**: la sección tiene 3
  `deco-fruit` chicas de fruta real (fresa, arándanos, cereza, de
  `img/imagenes-frutas/`) scatterizadas detrás del contenido. (Las 2
  rayas del título de esta sección pasaron de naranja a dorado en su
  momento — `changelog.md`, diecisieteava tanda — y luego, junto con el
  resto del sitio, de dorado a `--purple`; ver la entrada de "Títulos de
  sección" más arriba para el estado actual.)
- **Método (`#lam-03`) — tarjeta "Tu progreso" con jerarquía**: la tarjeta
  de anillos (`.method-gauges`, generada en `js/script.js`) ya no muestra
  4 anillos idénticos. Ahora: una frase de insight arriba (mayor avance /
  área con más margen de mejora), el área que peor está destacada aparte
  (más grande, con borde e ícono + badge de nivel), las otras 3 en grilla
  de 3 columnas, delta como badge con flecha (verde arriba / rojo abajo),
  e ícono lineal por área. Paleta propia de esta tarjeta (morado oscuro →
  dorado → verde salvia, `METHOD_GAUGE_LOW/MID/HIGH` en `js/script.js`) —
  el semáforo genérico (`GAUGE_LOW/MID/HIGH` de `js/nutricion-planes.js`)
  sigue intacto para el gráfico de barras de "Mi plan", que no se tocó.
  Detalle completo, incluyendo el bug de especificidad CSS que se
  encontró y corrigió (`.gauge-item svg` → `.gauge-ring svg`), en
  `changelog.md`, dieciochoava tanda.
- **Método (`#lam-03`) — neuronas decorativas laterales reemplazadas**
  (sesión 2026-09-15): los 2 `<img class="deco deco-fruit">` sueltos a
  los costados del título (`neurona-izquierda.webp` a la izquierda,
  `neurona-derecha.webp` a la derecha — mismos nombres de archivo, mismo
  `style` inline con `left`/`right`/`top`/`width`, sin tocar
  `index.html`) ahora usan una sola ilustración nueva provista por el
  usuario: neurona completa vista de frente (cuerpo dorado/violeta
  brillante al centro, dendritas azul/violeta/dorado irradiando en
  círculo), a diferencia de los assets anteriores que eran **medias
  neuronas** recortadas (cuerpo cortado en el borde de la página,
  pensadas para la posición de bleed). Se le quitó el fondo blanco
  (conversión a alpha por canal, blanco puro → transparente) para que
  siga flotando sobre el fondo de `#lam-03` igual que antes (crema en su
  momento, morado/lila desde la sesión 2026-09-15 que revirtió la
  paleta — ver bullet de "vuelta al morado estándar" más abajo), y se
  reexportó a `.webp` (~640px de ancho, calidad 82) — ambos archivos
  quedaron con el mismo contenido (no hay versión espejada). Como la
  posición/tamaño no cambiaron, el resultado visual es la misma
  ilustración completa "sangrando" en las mismas esquinas donde antes
  solo se veía la mitad de la neurona. Verificado con Playwright,
  desktop 1440px (visible) y mobile 390px (sigue oculto por la regla
  general `@media(max-width:720px){.deco-fruit{display:none}}`, sin
  cambios).
- **Método (`#lam-03`) — vuelta al morado estándar del sitio** (sesión
  2026-09-15, a continuación de las neuronas decorativas): se borraron
  las custom properties que `#lam-03` sobreescribía para su paleta propia
  crema+café (`--panel`, `--panel-line`, `--panel-text`, `--purple`,
  `--purple-dark`, `--purple-soft`, `--gauge-card`, `--shadow`), así que
  ahora hereda el mismo morado/lila de `:root` que usan Beneficios y
  Contacto (fondo, texto, línea de tiempo, tarjeta "Mi progreso"/"Mi
  IMC", botones). El difuminado de fondo (`background:linear-gradient`
  en `#lam-03`, blanco → panel → blanco para no cortar en seco contra
  lam-02/lam-04) se mantuvo igual, solo cambia el color al que funde.
  Colores semánticos de gauges sin cambios. Verificado con Playwright,
  desktop 1440px.
- **Método (`#lam-03`) — botones pegados al final del timeline en vez de
  a la fila completa** (sesión 2026-09-15, continuación): `.method-cta`
  (los 2 botones "Generar nutrición especializada"/"Registrar datos
  antropométricos") vivía como hermano de `.method-body` (la grilla de 2
  columnas timeline/`.method-gauges`), así que se ubicaba debajo de la
  fila entera, a la altura de la columna más alta. Cuando `.method-gauges`
  crece mucho (caso real: diagnóstico + reevaluación con los 4 anillos +
  insight + leyenda, como en la captura que mandó el usuario), el timeline
  queda mucho más corto y dejaba un hueco vacío entre el paso 04 y los
  botones. Fix: nuevo wrapper `.method-left` (flex-column, sin estilos de
  layout propios más que eso) envuelve `.timeline` + `.method-cta` como
  primer hijo de `.method-body`; `.method-gauges` sigue siendo el segundo
  hijo/columna. Con esto los botones quedan siempre pegados al final del
  timeline sin importar cuánto crezca la tarjeta de la derecha, que ahora
  vive en su propia columna independiente. No se tocó ningún `id` ni la
  lógica de `js/script.js` (que solo usa `getElementById`, no depende de
  la jerarquía del DOM). Verificado con Playwright reproduciendo el mismo
  estado de la captura (objetivo + reevaluación en `localStorage`),
  desktop 1600px y mobile 390px — en mobile el orden visual (timeline →
  botones → tarjeta de progreso) tampoco cambió.
- **Método (`#lam-03`) — círculos numerados del timeline con degradado y
  sombra** (sesión 2026-09-16): `.tl-num` (los círculos 01-04 de
  `.timeline`, `css/styles.css`) pasó de círculo blanco liso con borde
  fino (`1px solid var(--panel-line)`, número en `--purple`) a círculo
  con relleno `linear-gradient(135deg,var(--purple),var(--purple-dark))`,
  número en blanco, y `box-shadow` de dos capas: sombra difusa
  (`0 8px 20px rgba(75,46,69,.28)`) + un anillo sólido del color de fondo
  de la sección (`0 0 0 4px var(--panel)`) que separa visualmente el
  círculo de `.tl-line` (la línea vertical que pasa detrás, ahora también
  en degradado `var(--purple)` → transparente en vez de color plano, para
  que se note más arriba y se vaya diluyendo hacia abajo). Solo CSS, no
  se tocó el HTML (`.tl-item`/`.tl-num` en `index.html`) ni JS. Elegido
  por el usuario entre 3 propuestas (esta opción "A"; las otras eran una
  línea curva tipo trazo a mano y números tipográficos grandes sin
  círculo). Verificado con Playwright, desktop 1440px y mobile 390px.
- **Método (`#lam-03`) — pestaña "Mi IMC" con la misma jerarquía que "Mi
  progreso"** (sesión 2026-09-15, continuación; a pedido del usuario, que
  la vio "simple, no resalta" al lado de la tarjeta de progreso ya
  rediseñada). `renderMethodImc()` en `js/script.js` gana 3 piezas nuevas,
  mismo lenguaje visual que `renderMethodGauges()`:
  1. **Frase de insight** (`methodImcInsightHtml(zona)`, nueva función):
     mensaje fijo por zona (bajo/saludable/sobrepeso/vigilar), mismo
     `.gauge-insight` (ícono + texto) que ya usaba "Mi progreso" — no hay
     comparación antes/después para IMC, así que el texto es fijo, no
     calculado a partir de una medición previa.
  2. **Zona destacada con borde propio** (`.method-imc-featured`, nueva
     clase, escopada a `#methodGaugesImc`): agrupa el medidor + número +
     label + categoría en una tarjeta con `border:1.5px solid
     var(--purple-dark)`, mismo tratamiento que `.gauge-item.is-featured`
     de la otra pestaña, en vez de dejar el número suelto sobre el fondo
     general. La categoría pasa de texto plano (`.imc-cat`) a un badge
     (`.gauge-tier-badge`, reusa la clase de "Mi progreso") con una
     variante de color por zona (`.imc-tier-bajo/-sobrepeso` dorado,
     `-saludable` verde, `-vigilar` rojo — mismos colores que ya usaban
     las zonas del arco, ahora también en el badge).
  3. **Rango de peso saludable** (`.method-imc-range`, nuevo párrafo):
     "Peso saludable estimado para tu talla: X–Y kg", calculado con
     IMC 18.5–24.9 sobre `antro.tallaCm` (dato ya guardado, no pide nada
     nuevo). Solo se muestra si hay `tallaCm` en el registro.
  De paso se corrigió un bug menor: el eyebrow de esta pestaña decía "Tu
  progreso" (copiado sin querer del header de la otra pestaña) — ahora
  dice "Antropometría".
  **Nada de esto toca `mi-plan.html`**: la tarjeta "Antropometría" de "Mi
  plan" sigue usando `.imc-gauge`/`.imc-cat`/`.imc-legend` con su CSS
  original sin cambios (esas reglas de base no se tocaron); las clases
  nuevas (`.method-imc-featured`, `.method-imc-range`, `.imc-tier-*`) o
  están escopadas con el selector `#methodGaugesImc` o son clases que
  simplemente no existen en el markup de `mi-plan.html`.
  Verificado con Playwright: las 4 categorías (bajo peso IMC 16.9,
  saludable 22.0, sobrepeso 26.4, a vigilar 32.1) con el color del badge
  coincidiendo con la zona del arco, y el estado vacío (sin datos
  antropométricos) sin cambios.
- **"Mi plan"** es el flujo más complejo del sitio: página propia,
  dashboard de 2 columnas (`.miplan-grid`/`.miplan-detalle-grid`), medidor
  de IMC tipo velocímetro, gráfico de barras Foco/Memoria/Energía/Calma
  (con comparación antes/después si hay reevaluación), encuesta de
  nutrición inline (mismo `#formNutricion` que el modal de `index.html`).
- **Medidor de IMC tipo velocímetro (`.imc-gauge`) — degradado continuo +
  barrido de la aguja (sesión 2026-09-16, décimoprimera tanda).**
  Componente compartido entre `mi-plan.html` (markup estático,
  `#miPlanImcGauge`) y el switch "Mi IMC" de Método
  (`renderMethodImc`/`#methodGaugesImc`, `js/script.js`, arma el mismo
  SVG como string). Antes: 4 `<path>` con `stroke` sólido fijo por zona
  y la aguja apareciendo directo en su posición final. Ahora:
  - Los 4 `<path>` (mismos umbrales de IMC 18.5/25/30, sin cambios)
    comparten un único `<linearGradient id="imcGaugeGradient">` en vez
    de tener cada uno su color fijo — degradado continuo dorado→
    verde→dorado→rojo. Los 3 colores de anclaje son los mismos hex que
    devuelve `gaugeColorForPercent` (compartida con los anillos de
    Método): `imcGaugeGradientStops()` (`js/nutricion-planes.js`) los
    pide llamando a esa función en vez de hardcodearlos de nuevo, con
    anclas en el centro de cada zona de IMC (no en el umbral exacto).
    `imcGaugeGradientDefsHtml(id)` arma el `<defs>` como string (lo usa
    `renderMethodImc`); en `mi-plan.html` (HTML estático) el `<defs>`
    equivalente está escrito a mano con los mismos offsets
    (7%/27%/50%/80%) vía clases `.imc-stop-gold/-green/-red` → mismas
    `var(--gold)/--green/--red`.
  - La aguja (`.imc-aguja`) ahora tiene `transition:transform .7s
    cubic-bezier(.16,.84,.44,1)` (CSS). En `pintarMiPlan`
    (`js/mi-plan.js`) arranca en `imcGaugeAgujaDegInicial()` (extremo
    mínimo del arco) y, tras un doble `requestAnimationFrame` (mismo
    truco que `gaugeAnimateArcs` para los anillos de Método), se le
    asigna la rotación final `imcGaugeAgujaDeg(imc)`. `renderMethodImc`
    (Método) sigue sin barrido — pinta directo en la posición final,
    como siempre; el pedido de animación era específico de "Mi plan".
    `prefers-reduced-motion: reduce` lo desactiva en dos capas: JS
    (`pintarMiPlan` detecta `matchMedia` y salta la secuencia de rAF) y
    CSS (`@media(prefers-reduced-motion:reduce){.imc-aguja{transition:
    none}}` como red adicional).
  - Marcador fijo nuevo (`.imc-gauge-marker`, círculo blanco con
    contorno oscuro) sobre el arco en el valor exacto del IMC,
    independiente de la aguja — usa `imcGaugeMarkerPos(imc)` (mismo
    centro/radio que el arco, recortado al mismo rango `[15,40]` que la
    aguja). Siempre en su posición final sin animar, así sigue siendo
    útil durante el barrido o con `prefers-reduced-motion` activo (por
    ejemplo, para capturas). Presente en ambos lugares (`mi-plan.html` y
    `renderMethodImc`).
  - `imcGaugeAgujaDeg(imc)` (= `90 - imcGaugeAngulo(imc)`) reemplaza la
    misma fórmula que antes estaba duplicada tal cual en `js/mi-plan.js`
    y `js/script.js`.
  - No cambió: el número mostrado sigue siendo el IMC real sin recortar
    (solo la posición de aguja/marcador se recorta a `[15,40]`); el
    estado "sin datos" sigue con `class="hidden"` en `#miPlanImcGauge`
    hasta que existe `sinaptix_antropometria`; sin dependencias nuevas
    (SVG + CSS + JS vanilla).
  - Verificado con Playwright (sí hubo acceso a Chromium en esta
    sesión): las 4 zonas de prueba (16.8/22.1/27.4/33.9), barrido
    confirmado (captura a mitad de camino ≠ captura final), marcador en
    la posición correcta en las 4, estado sin datos sin romperse,
    `prefers-reduced-motion: reduce` saltando la animación, y el switch
    "Mi IMC" de Método con el mismo degradado/marcador funcionando sin
    tocar nada más de esa tarjeta.
- **"Mi plan" — estado sin sesión (`#miPlanSinSesion`, clase
  `.miplan-locked`)**: rediseño visual (no toca `js/mi-plan.js`, siguen
  existiendo `#miPlanSinSesion` y `#btnLoginMiPlan` con el mismo
  comportamiento). Combina dos referencias: candado ilustrado + tarjeta
  crema (variante A) y un cerebro ilustrado de fondo (variante B, hoy
  imagen real, ver abajo — reemplaza la maraña SVG de la sesión anterior).
  Estructura: `.miplan-locked` (flex centrado) con 3 capas —
  1. 1 `<img class="deco miplan-locked-brain is-right">` con el asset
     `img/decoraciones-neurona/cerebro-mi-plan.webp` (imagen provista por
     el usuario, no generada acá: cerebro con dendritas, línea fina
     terracota/dorada), grande, sangrando sobre el borde derecho
     (`width:clamp(420px,48vw,560px);right:-300px;top:-30px`), mismo
     criterio de bleed que `neurona-derecha`/`vision-brain-bg`. La copia
     chica junto al aguacate (`.is-left`) se quitó (HTML + CSS) a pedido
     del usuario. El `right` de `.is-right` pasó por `-60px` → `-140px` →
     `-300px`: los primeros dos valores parecían suficientes probando
     local, pero en producción a anchos grandes (~1600px) la tarjeta
     seguía tapando ~100px del cerebro (el gap tarjeta↔cerebro es
     **constante en todo el rango de anchos** porque ambos elementos
     escalan igual al centrarse, así que no alcanza con probar un solo
     ancho: medir `getBoundingClientRect()` de `.miplan-locked-card` y
     `.miplan-locked-brain.is-right` con Playwright en varios anchos
     — 900/1024/1280/1440/1600/1920 — es la forma confiable de confirmar
     que no se solapan, no alcanza con una sola captura visual). Con
     `-300px` el gap real es de ~48-60px en todo ese rango.
     `opacity:.92` sin filtros (el fondo de la imagen, `~#F6F0F4`, ya
     matchea `--panel` de esta sección, no hizo falta `mix-blend-mode`).
     Oculto en mobile (`<900px`, mismo breakpoint que
     `#lam-02 .vision-brain-bg`). El diseño anterior (SVG inline
     `svg.miplan-locked-web`/`.bw-*` dibujado a mano con curvas
     Catmull-Rom) quedó descartado — detalle en `historico/` si hace falta.
  2. 3 `<img class="deco deco-fruit miplan-locked-fruit is-*">` reusando
     `svg/deco-blob-avocado.svg`, `deco-blob-kiwi.svg`,
     `deco-blob-almonds.svg` (mismos assets de siempre, clase
     `.deco-fruit` ya trae animación float + ocultamiento `<720px`) —
     posicionadas con clases `is-avocado`/`is-kiwi`/`is-almonds` propias
     de este bloque, no confundir con las frutas a nivel de sección
     `#miPlan` (esas son otro grupo de `<img>`, anteriores al `.wrap`, no
     se tocaron).
  3. `.miplan-locked-card`: tarjeta blanca (`--paper`) redondeada, con
     candado inline SVG a mano (`.miplan-locked-lock`, trazo `--purple`)
     arriba del `eyebrow`/`h2.lam-title`/`p.lam-text` — estos no
     cambiaron de texto ni de id/clase. Debajo, `.miplan-auth`: los
     **formularios propios de login/registro** (ver su propio punto más
     abajo) — reemplazaron a los 2 botones `#btnLoginMiPlan`/
     `#btnRegistrarseMiPlan` que abrían el widget nativo de Netlify
     Identity, que **ya no existen** ni en el HTML ni en `js/mi-plan.js`.
     "Volver al sitio" bajó de `btn-row` a link de texto simple debajo
     (`.miplan-locked-back`, subrayado, `var(--panel-text)`) para no
     competir visualmente con las 2 acciones reales — con 3 `.btn` en la
     misma fila quedaba sobrecargado.
  CSS nuevo todo bajo selectores propios (`.miplan-locked*`, `.lock-*`) en
  `css/styles.css`, no se tocó ninguna regla que afecte `#miPlanConSesion`
  (el dashboard con datos — su propio rediseño se hizo en una sesión
  posterior, ver más abajo).
  **Verificado con Playwright** (esta sesión sí tuvo acceso a
  Chromium/Playwright): capturas a 1280px/1440px calzan contra la
  referencia del usuario, mobile (390px) oculta los 2 cerebros
  correctamente, y `window.scrollX===0` tras forzar scroll horizontal —
  no rompe el criterio de `overflow-x` de más abajo pese al bleed de
  `.is-right`. Altura total: `#miPlan{padding:88px 0 40px;min-height:100vh;overflow:hidden}`
  (antes `104px 0 56px`, sin min-height/overflow; **afecta a ambos
  estados** de "Mi plan"), `#miPlan footer{margin-top:28px}` (antes
  `48px`), `.miplan-locked{min-height:clamp(380px,48vh,460px);padding:20px 0}`
  (antes `clamp(460px,58vh,600px);28px 0`), `.miplan-locked-card{padding:30px 40px 28px}`
  (antes `44px 46px 40px`, después `36px 40px 32px`). El título de la tarjeta **sigue heredando**
  el tamaño de `.lam-title` (`clamp(40px,6vw,68px)`, wrap a 3 líneas,
  tarjeta angosta/alta) — se probó achicarlo pero el usuario prefirió la
  forma original, así que esa parte quedó revertida. `min-height:100vh` +
  `overflow:hidden` en `#miPlan` evita una franja blanca del `body` por
  debajo del footer en viewports altos (el `overflow:hidden` es acotado a
  esta sección, no toca `html`/`body`). Resultado: entra sin scroll hasta
  ~1024px de alto de viewport (medido con Playwright a 1440px de ancho;
  eran ~986px antes de sumar el link "¿Olvidaste tu contraseña?").
  **Ese número era ~825px antes de los formularios propios de
  login/registro**: la tarjeta pasó de 618px a 841px de alto al cambiar 2
  botones por pestañas + campos, y se recuperaron ~98px compactando
  paddings (`.miplan-locked`, `.miplan-locked-card`) y ocultando los
  `<label>` con `.sr-only`. La única palanca grande que queda para bajar
  más es achicar el título, que el usuario ya evaluó y descartó en una
  sesión anterior — no rehacerlo sin preguntarle.
- **"Mi plan" — login/registro propios (`.miplan-auth`, reemplazan al
  widget nativo de Netlify Identity)**: dentro de `.miplan-locked-card`,
  layout "variante A" confirmado con el usuario: 2 pestañas
  (`#tabLoginMiPlan`/`#tabRegistroMiPlan`, clase `.miplan-auth-tab`,
  activa con `.is-active`) y un solo formulario visible por vez
  (`#formLoginMiPlan` / `#formRegistroMiPlan`, se alternan con la clase
  `.hidden` de siempre). Login pide correo + contraseña; registro pide
  **nombre (`required`)** + correo + contraseña (`minlength=8`). Los
  `<label>` existen pero van con `.sr-only` (el layout aprobado muestra
  solo placeholders). Los inputs (`.miplan-auth-input`) reusan el mismo
  tratamiento visual que `.contact-form`, no se inventó un segundo estilo
  de campo. Mensajes inline por formulario
  (`#loginMsgMiPlan`/`#registroMsgMiPlan`, `.miplan-auth-msg`, rojo
  `--red`; con `.is-ok` pasan a verde para el aviso de "revisá tu
  correo").
  **Estrategia: híbrida, no 100% API.** `js/mi-plan.js` usa el cliente
  GoTrue que el widget ya expone (`netlifyIdentity.gotrue`) —
  `.login(email, pass, true)` y `.signup(email, pass, {full_name})` — en
  vez de hacer `fetch` a mano contra `/.netlify/identity`. El motivo
  concreto (verificado leyendo el fuente del widget, no asumido):
  `netlifyIdentity.currentUser()` **no** devuelve un estado interno del
  widget, devuelve `gotrue.currentUser()`, que lee la sesión de
  `localStorage` — así que logueando por esta vía `js/plan-sync.js` (que
  arma el header `Authorization` con `currentUser()`) sigue funcionando
  **sin tocarlo y sin recargar la página**, igual que `user.update()` y
  `user.jwt()`. El `true` del 3er argumento de `login()` (remember) es lo
  que persiste la sesión; sin él no habría sesión en la próxima carga.
  Dos consecuencias de saltear el widget, ya resueltas en el código:
  1. El evento `netlifyIdentity.on('login')` **no se dispara** (el widget
     lo emite al cambiar su estado interno, que acá no se toca), así que
     `mostrarEstadoConSesion(user)` se llama a mano desde el `.then()`.
  2. `netlifyIdentity.logout()` **no cierra la sesión** si esta se creó
     por esta vía en la misma carga de página (su implementación no hace
     nada cuando su estado interno está vacío). Por eso `doLogout()` usa
     `netlifyIdentity.currentUser().logout()` (el `User` de gotrue-js, que
     sí hace `POST /logout` y limpia `localStorage` en ambos casos) y
     hace el `window.location.href='index.html'` explícito, porque
     tampoco se dispara el evento `logout` del widget.
  **API de GoTrue (confirmada contra el fuente de `gotrue-js`, no
  adivinada)**: `POST /.netlify/identity/signup` es JSON
  `{email, password, data}` y `data` es lo que el servidor guarda como
  `user_metadata` (por eso `full_name` es la misma clave que ya leía
  `pintarMiPlan()`); `POST /.netlify/identity/token` es
  `application/x-www-form-urlencoded` con
  `grant_type=password&username=…&password=…` (no JSON); los errores
  llegan en `err.message` en inglés (`Invalid Password`,
  `No user found with this email`, `Email not confirmed`,
  `…already been registered`, `Signups not allowed for this instance`) y
  `authMensajeError()` los mapea a castellano por substring, con
  fallback genérico para no dejar el formulario mudo.
  **Confirmación por correo: desactivada** por el usuario desde el panel
  de Netlify (Identity → plantilla de confirmación → "Allow users to sign
  up without verifying their email address"). Por eso, tras un signup
  exitoso el código hace login automático y entra directo al dashboard,
  sin pedir los datos dos veces. Igual **hay fallback**: si esa opción se
  volviera a activar, el login post-signup falla con `Email not
  confirmed`, y en vez de un error se vuelve a la pestaña de login con el
  aviso verde de revisar el correo. Se eligió intentar el login en vez de
  consultar `gotrue.settings()` aparte para no sumar un request más.
  **Nota de desarrollo local**: si se abre el sitio en `localhost` sin
  haberle cargado antes la Site URL de Netlify, `netlifyIdentity.gotrue`
  es `null` y el widget abre su propio modal para pedirla; en el sitio
  desplegado no pasa. El código lo contempla mostrando un mensaje de
  error en vez de romper.
  **Recuperación de contraseña (`#formRecuperarMiPlan` /
  `#formNuevaPassMiPlan`)**: reemplaza al "Forgot password?" del widget.
  Son 2 paneles más dentro del mismo `.miplan-auth`, sin pestaña propia
  (se llega desde el link `#linkOlvideMiPlan` debajo del login, o desde
  el correo) — cuando están visibles, `mostrarPanelAuth()` oculta la fila
  de pestañas y agrega `.is-recuperando` a la tarjeta, que esconde el
  `.lam-text` (el párrafo "Iniciá sesión (o creá una cuenta)" ya no
  describe lo que la persona está haciendo; el título sí se mantiene).
  Flujo: `gotrue.requestPasswordRecovery(email)` (POST
  `/.netlify/identity/recover` con `{email}`) manda el correo; la
  respuesta al usuario es **la misma exista o no la cuenta**, a propósito
  — responder distinto permitiría averiguar qué correos están
  registrados. El enlace del correo vuelve con `#recovery_token=…`, y
  `gotrue.recover(token, true)` lo canjea por una **sesión real**: a
  partir de ahí la persona ya está logueada aunque no haya elegido
  contraseña, así que el paso final es un `user.update({password})`
  normal (mismo comportamiento que tenía el widget). Si `recover()` falla
  (token vencido o ya usado) se vuelve al panel de pedir el enlace con el
  aviso, en vez de dejarla escribir una contraseña que no se va a poder
  guardar.
  **El token se intercepta antes de que el widget lo vea**, con scripts
  inline en el `<head>` de las dos páginas, ubicados **antes** del
  `<script>` de `identity.netlify.com` (si el widget ve ese fragmento,
  abre su modal nativo, que es justo lo que este flujo reemplaza):
  `index.html` reenvía a `mi-plan.html#recovery_token=…` (el correo
  apunta a la raíz del sitio, no a "Mi plan"), y `mi-plan.html` guarda el
  valor en `window.SINAPTIX_RECOVERY_TOKEN` y limpia el hash con
  `history.replaceState`. El handler de `on('init')` le da prioridad a
  ese flujo por sobre una sesión ya abierta en el navegador.
  **Verificado con Playwright** (`netlifyIdentity` mockeado, sin red
  real): toggle entre pestañas, registro → llamada a `signup` con
  `{full_name}` → login automático → dashboard con avatar "A" y nombre
  "Ana Pérez" pintados, credenciales inválidas, email ya registrado,
  fallback de email sin confirmar, botón que se restaura tras el error,
  mobile 390px, y `window.scrollX===0` tras forzar scroll horizontal. El
  gap tarjeta↔cerebro (criterio de más arriba) se remidió en
  900/1024/1280/1440/1600/1920: idéntico al de antes del cambio
  (50-60px), porque la tarjeta creció en alto y no en ancho. La
  recuperación de contraseña se verificó aparte: link con el correo
  precargado desde el login, pedido del enlace, vuelta desde el correo
  (hash capturado y limpiado), contraseñas que no coinciden, token
  vencido, prioridad sobre una sesión previa, y el reenvío de
  `index.html` a `mi-plan.html`.
- **Nav de `index.html` — "Iniciar sesión"/"Acceder"**: ambos son ahora
  links normales (`href="mi-plan.html"`), llevan a la pantalla de login
  propia del sitio. Antes `#btnLogin` abría el widget de Netlify Identity
  inline (`netlifyIdentity.open('login'/'user')`, con `e.preventDefault()`)
  y `#btnAcceder` hacía scroll a `#lam-06` (contacto) — se sacó ese
  comportamiento de `js/script.js` a pedido del usuario, para unificar
  todo el flujo de login/registro en `mi-plan.html`. `setLoginButton()`
  sigue cambiando el texto de `#btnLogin` a "Mi cuenta"/nombre cuando hay
  sesión (esa parte no se tocó), solo cambió qué pasa al hacer click.
- **Backend real**: Netlify Database (Postgres) + Netlify Functions
  (`plan.mjs`) espejando `localStorage` al servidor cuando hay sesión.
  Verificado funcionando en producción (`master@94d6ba4`).
- **Encuesta de nutrición**: wizard de 8 pasos en `#formNutricion`
  (compartido entre modal de `index.html` y sección inline de
  `mi-plan.html`), 4 planes con "día tipo" cada uno + resolución
  automática si el usuario no está seguro de su objetivo.
- **Visión (`lam-02`)**: el `stat-grid` de 4 tarjetas tiene ahora un fondo
  ilustrado (`img/decoraciones-neurona/fondo-vision-red.webp` — cerebro,
  red neuronal, rompecabezas) grande (`clamp(880px,84vw,1480px)`) y
  pegado/recortado contra el borde derecho real de la pantalla (bleed
  `-160px`, para que parezca que "sale" del costado), igual criterio que
  las neuronas de Método. El fondo va nítido y sin filtros
  (`opacity:.92`, sin blur/brightness/saturate ni transform) con bleed
  `-160px` (mismo criterio que `neurona-derecha` de Método) para que
  parezca que sale del borde derecho real. La columna de tarjetas (`.reveal.d2` de esta
  sección) baja `margin-top:90px` y el fondo arranca en `top:230px` para
  repartir el arte a lo largo de todo el hueco vertical que deja la
  columna de texto, más alta. Las 4 tarjetas (`#lam-02 .stat-box`,
  incluida la destacada `.is-featured`) son translúcidas, **todas en el
  mismo tono blanco** (`rgba(255,255,255,.72)`, destacada `.7`) con blur
  suave para dejar ver el arte detrás y texto (`.num`/`.lab`) en
  `var(--purple-dark)` (`.lab` en `font-weight:600` y `opacity:1` — antes
  `.85`/normal, se subió el contraste a pedido del usuario en sesión
  2026-09-16 porque el label casi no se leía contra el fondo translúcido
  con el arte de fondo detrás; el fondo de la tarjeta también subió de
  `.55` a `.72` como parte del mismo ajuste); sin `text-shadow` (ya no
  hace falta, el fondo es claro). El borde de las 4 tarjetas (`border`,
  antes `rgba(255,255,255,.7)` casi invisible sobre fondo claro) es `1px
  solid var(--purple)` (sesión 2026-09-15, a pedido del usuario, para que
  las tarjetas se distingan del fondo blanco de la sección aunque no
  tengan la ilustración detrás). El texto de `.lab` pasó de `13px` a
  `15px` (sesión 2026-09-15, mismo pedido) para que se lea con más
  facilidad.
  **Tarjetas más bajas/horizontales (sesión 2026-09-16):** a pedido del
  usuario (se veían "muy verticales"), `#lam-02 .stat-box` bajó el
  padding de `28px 26px` (heredado de `.stat-box` base) a
  `20px 22px 18px`, y `.num` bajó de `36px` a `32px`. El padding-right
  que reservaba el hueco del ícono (antes aplicado también a `.lab`) se
  saca de `.lab` y queda solo en `.num` (`66px`, antes `74px` en ambos);
  `.lab` en cambio usa `margin-top:16px` (antes `8px`) para arrancar ya
  despejado por debajo del ícono, así que ocupa el ancho completo de la
  tarjeta — menos líneas de wrap, tarjetas más bajas. El ícono
  (`#lam-02 .stat-icon`) bajó de `60×60px` a `56×56px` (`top`/`right`
  `20px`→`18px`) para acompañar el padding más chico.
  **Ícono de la tarjeta "1:1" (`icon-conversacion.svg`) agrandado**
  (mismo pedido): a igual tamaño de caja que los otros 3, este ícono se
  veía visiblemente más chico (su dibujo — dos personas hablando + iconos
  sueltos alrededor — deja mucho aire dentro del `viewBox`, ver línea de
  `svg/` en "Estructura de archivos"). Se targetea solo esa tarjeta con
  `#lam-02 .stat-box:nth-child(4)` (es la 4ª/última del `stat-grid`):
  ícono a `78×78px` (`top`/`right` `10px`), `.num` con `padding-right:88px`
  y `.lab` con `margin-top:20px` (en vez de los valores base de arriba)
  para que el número y el label sigan sin pisarse con el ícono más
  grande.
  **Posición vertical de la columna de tarjetas (sesión 2026-09-16,
  continuación):** con las tarjetas más bajas de arriba, la columna
  quedaba muy arriba respecto del párrafo de la columna de texto — a
  pedido del usuario se bajó, casi a la altura de ese párrafo. El
  `margin-top:90px` que tenía **inline** en `index.html` (en el
  `<div class="reveal d2">` que envuelve el `.stat-grid`) se sacó y pasó
  a CSS con una clase (`vision-stats-col`): se probó primero `300px`
  (quedaba pegada al párrafo) y después `250px` (ajuste fino a pedido
  del usuario), pero en vez de seguir afinando un valor fijo a ojo, el
  usuario pidió centrarla de verdad respecto a la columna de texto. La
  solución final es `#lam-02 .split{align-items:center}` (el grid de
  `.split` usa `align-items:start` en el resto del sitio, acá se
  sobreescribe solo para esta sección) — `vision-stats-col` quedó en
  `margin-top:0` en desktop (el centrado ya lo resuelve el grid), pero se mantiene el valor original `90px` en mobile
  (`max-width:900px`, mismo breakpoint que `.split`) para no dejar un
  hueco enorme cuando las columnas se apilan — ahí las tarjetas van
  justo debajo de los bullets, no tienen por qué bajar tanto.
  **Corrida a la derecha y centrada en su espacio (misma sesión,
  continuación):** el usuario sintió la columna de tarjetas "muy cerca"
  del texto y pidió correrla más a la derecha y centrarla. El `gap` de
  `#lam-02 .split` sube de `70px` (heredado de `.split` base) a `130px`
  en desktop (en mobile, dentro de `max-width:900px`, se fija de nuevo
  en `44px`, el valor original de `.split` en esa media query, para que
  `#lam-02 .split` no herede el `130px` de desktop). Además
  `#lam-02 .vision-stats-col` deja de estirarse a todo el ancho de su
  columna del grid: `max-width:400px` (antes ~515px, todo el ancho de la
  columna) con `margin-left:auto;margin-right:auto` para centrarla
  dentro de esa columna — solo en desktop (`min-width:901px`; en mobile
  no hay "columna de al lado" de la que alejarse, sigue a ancho
  completo). Efecto combinado: las tarjetas quedan notoriamente más
  lejos del texto y con aire de los dos lados en vez de pegadas al borde
  izquierdo de su columna.
  **Tarjetas más grandes (sesión 2026-09-16, quinta y sexta tanda):** a
  pedido del usuario, en dos pasadas (la segunda "un poco más grandes"
  sobre la primera). Todo scopeado a `#lam-02` y dentro de
  `@media(min-width:901px)` (mobile sin cambios: ahí las tarjetas ya
  ocupan todo el ancho de columna y `.stat-box`/`.stat-grid` son clases
  compartidas con `#miPlan`, que no debe verse afectado). Valores
  **actuales** (ya con las dos pasadas aplicadas; no quedan valores
  intermedios en ningún lado): `#lam-02 .vision-stats-col{max-width:
  520px}` (venía de `400px`), `#lam-02 .stat-grid{gap:24px}` (venía de
  heredar `16px` de `.stat-grid` base), `#lam-02 .stat-box{padding:34px
  32px 30px}` (venía de `20px 22px 18px`), `.num{font-size:44px}` (venía
  de `32px`), `.lab{font-size:17px}` (venía de `15px`), `#lam-02
  .stat-icon{width/height:70px;top/right:20px}` (venía de `56px`/`18px`),
  `.num{padding-right:82px}` (venía de `66px`, hueco para el ícono más
  grande). La 4ª tarjeta ("1:1", `icon-conversacion.svg`) sigue con su
  propio ícono más grande que las otras 3 (mismo criterio de siempre):
  `96×96px` (venía de `78px`), `top/right:10px` (venía de `12px` en la
  primera pasada), `.num{padding-right:106px}` (venía de `88px`). No se tocó
  `.lab{margin-top}` de la 4ª tarjeta (`20px`) ni el resto de valores no
  listados acá. **Color de los 4 íconos:** pasaron de `--ink` (casi
  negro) al morado de marca (`--purple`, `#714B67`) a pedido del
  usuario — hardcodeado dentro de cada `.svg` (no vía CSS: son `<img>`,
  no inline, no leen variables de `:root`), ver "Estructura de archivos"
  más arriba para el detalle de por qué y dónde. Verificado con
  Playwright en 1920px (desktop) y 390px (mobile, sin cambios). Antes
  el fondo era morado oscuro (`rgba(75,46,69,.6)`) con texto blanco +
  glow — se cambió a pedido del usuario (13ª tanda, 2026-09-15, ver
  `changelog.md`). El título de esta sección (`El cerebro también se
  alimenta`) es un `<h2 class="lam-title">` normal, **sin** `display:flex`
  inline (se sacó en la misma tanda: causaba que el texto se envolviera
  letra por letra en vez de fluir normal — ver `changelog.md` para el
  detalle del bug); el ícono svg de puntitos decorativo va con la clase
  `.lam-title-deco` (`inline-block`, no flex-item) para seguir pegado a
  "alimenta". El `<span class="title-mark">` de "alimenta" tampoco tiene
  ya la raya naranja tipo marcador (`#lam-02 .title-mark{background-image:
  none}`, scopeado solo acá — `lam-03` a `lam-06` siguen con su trazo),
  solo queda el color `var(--purple)` de la palabra. Se sacaron las
  decoraciones viejas de esa esquina (círculos, huevo, aceite de oliva)
  que competían con el arte nuevo. Ancho responsive con `clamp()`, oculto
  en mobile (`<900px`, mismo criterio que el resto de `.deco-fruit`).
- **Visión (`#lam-02`) — subtítulos de los 3 bullets en morado** (sesión
  2026-09-16): `.vision-bullets strong` ("Atención individualizada.",
  "No más dietas genéricas.", "Rendimiento cognitivo.") pasó de
  `var(--ink)` (casi negro) a `var(--purple)`, el mismo morado que ya
  usa la palabra "alimenta" del título (`.title-mark{color:var(--purple)}`),
  a pedido del usuario, para que combinen. El resto del texto de cada
  bullet (`.vision-bullets span`, sin `<strong>`) sigue en `var(--ink-soft)`
  sin cambios; los íconos de línea siguen en `var(--gold)`.
- **Visión (`#lam-02`) — ícono de las 4 tarjetas movido a la esquina
  superior derecha** (sesión 2026-09-16): `.stat-icon` (el `<img>` de
  40x40, antes arriba a la izquierda en flujo normal, empujando `.num`/
  `.lab` hacia abajo con `margin-bottom:14px`) pasa a
  `position:absolute;top:22px;right:22px` dentro de `#lam-02 .stat-box`
  (que ahora necesita `position:relative`, agregado a la regla que ya
  existía para fondo/borde/blur de esta sección). Efecto: el ícono queda
  fijo como un sello/badge en la esquina, y `.num`/`.lab` arrancan arriba
  a la izquierda de la tarjeta (ya no hay hueco donde estaba el ícono).
  Se sumó `padding-right:50px` a `.num`/`.lab` (solo `#lam-02`) para que
  el texto no quede pegado al ícono si algún número/label fuera más
  ancho. Cambio scopeado 100% a `#lam-02` — el resto del sitio que
  reusa `.stat-box`/`.stat-icon` (Método con sus gauges, "Mi plan") no se
  toca. Verificado con Playwright, desktop 1440px y mobile 390px, sin
  superposición en ninguna de las 4 tarjetas.
- **"Mi plan" — estado con sesión (`#miPlanConSesion`, dashboard "Tu
  progreso con SINAPTIX")**: rediseño visual sobre los mismos componentes
  de datos de siempre (medidor de IMC tipo velocímetro, tarjeta de
  objetivo, gráfico de barras, resumen de nutrición, `.miplan-cierre`) —
  no se tocó `js/mi-plan.js` en su lógica de qué pinta cada dato, solo se
  agregaron 4 líneas aditivas (ver abajo) y no se tocó `js/nutricion-planes.js`.
  Referencia: mockup IA con sidebar + tarjetas "Datos clave" (silueta
  corporal / brújula) + tarjeta ancha "Detalle del plan". **La sidebar no
  se implementó** — a pedido explícito del usuario (afectaría el `<nav>`
  fijo compartido por `index.html` y ambos estados de `mi-plan.html`,
  fuera del alcance de esta sesión que solo tocaba `#miPlanConSesion`):
  se adaptó a una sola columna con el nav superior existente, sin tocar
  `<nav>`/`#miPlanSinSesion`.
  0. **Las 3 tarjetas del dashboard tienen fondo de color sólido +
     ilustración propia** (sesión 2026-09-15, sexta y séptima tanda — reemplaza el
     punto anterior de "misma cabecera", que sigue documentado abajo por
     el contexto de por qué existe `.miplan-card-head`/`.miplan-ring`).
     El usuario mostró una referencia nueva: 3 tarjetas con fondo sólido
     (verde/dorado/lila) y su propia ilustración, y pidió ir hacia ese
     estilo. Decisiones tomadas con el usuario antes de construir (se le
     mostró una maqueta con 2 opciones en el visualizador):
     - Fondo sólido de color (no blanco con acento) — 3 variables nuevas
       en `:root`, `--miplan-card-verde`/`--miplan-card-dorado`/
       `--miplan-card-lila` (tintes opacos, no rgba, para leer como
       tarjeta de color, no como estado hover). Aplicadas con
       `#miPlan .miplan-grid > .stat-box` (Antropometría, verde),
       `#miPlan .stat-box.miplan-objetivo` (dorado) y
       `#miPlan .miplan-cierre` (lila) — necesitan más especificidad que
       la regla general `#miPlan .stat-box,.bar-chart-card{background:
       var(--paper)}` que ya existía.
     - El ícono de línea morado de la cabecera **se reemplazó** (no
       convive) por la ilustración en Antropometría y Objetivo cognitivo:
       `<img class="miplan-card-illustration">` en el mismo lugar del
       `<svg class="miplan-card-icon">` que tenían antes. "Cierre" **no**
       tiene ilustración de cabecera (de las 3 imágenes que dio el
       usuario, ninguna era para ese lugar) — conserva su ícono de línea
       (clipboard con check) sin cambios.
     - El anillo de progreso (`.miplan-ring`) se mantuvo igual, arriba a
       la derecha de la cabecera — no se tocó su CSS ni posición.
     - La tira de 5 íconos nueva **reemplazó** (no convive) a la fila de
       íconos redondos sueltos que ya existía en "Cierre"
       (`.miplan-cierre-icons`, antes 5 `<img>` de `img/Iconos/` sin
       relación temática). Ahora es un único `<img class="miplan-cierre-
       icons-strip">` — la pieza ya viene diseñada como una tira
       (plato/cubiertos/cerebro/bowl/hueso, cada uno en su recuadro), no
       se recorta en íconos sueltos. Sigue el mismo criterio de
       visibilidad que antes (`#miPlanCta.hidden + .miplan-cierre-icons
       {display:none}`, CSS puro, sin tocar JS).
     Assets: las 3 imágenes que dio el usuario (generadas con Gemini) NO
     tenían transparencia real pese a decir "fondo transparente" — eran
     JPEG con un patrón de cuadros gris/blanco **dibujado como píxeles
     reales** (falsa transparencia, típico de algunos generadores). Se
     procesaron (`Pillow`: máscara por saturación/valor para detectar el
     patrón de cuadros y convertirlo a alpha real, recorte al bounding
     box, exportadas como PNG) antes de copiarlas a
     `img/ilustraciones-mi-plan/` (`antropometria-cuerpo.png`,
     `objetivo-cerebro.png`, `cierre-iconos-plan.png`). Si en el futuro
     el usuario sube más imágenes de Gemini para este sitio, revisar
     primero si el "fondo transparente" es real (`Image.open(...).mode`)
     antes de asumirlo.
     Nota sobre el pedido original: el cerebro de "Objetivo cognitivo" se
     describió como "tonos dorados, low-poly" pero la imagen real
     entregada es un dibujo de línea fina morado/berenjena (no dorado, no
     low-poly relleno) — se usó la imagen tal como se recibió, no la
     descripción; el fondo dorado de la tarjeta le da contraste igual.
     **Verificado con Playwright**: dashboard sin datos (CTA + tira de
     íconos visibles, 3 tarjetas con su color), con datos seedeados
     (gauge de IMC, objetivo y anillos completos no rompen el layout de
     color) y mobile 390px (tarjetas apiladas, ilustraciones escalan
     bien). `window.scrollX===0` tras forzar scroll horizontal — el
     bleed de las ilustraciones no rompe el criterio de `overflow-x` de
     más abajo. Se confirmó que `index.html` sigue cargando normalmente
     (no se tocó nada fuera de `mi-plan.html`/`css/styles.css`).
     **Séptima tanda (mismo día):** el usuario reportó (con captura del
     sitio real desplegado) que Antropometría y Objetivo cognitivo
     quedaban con alturas distintas en desktop — el motivo era
     `.miplan-grid{align-items:start}`, que hace que cada columna del
     grid tome solo la altura de su propio contenido en vez de la altura
     de la fila. Fix: `align-items:stretch` en `.miplan-grid` +
     `flex:1` en `.miplan-objetivo` (sin el `flex:1`, solo se estira el
     wrapper invisible `.miplan-col`, no la tarjeta de color en sí, que
     seguía corta — Antropometría no necesitó cambios porque es un ítem
     directo del grid, sin wrapper de por medio). Verificado con
     Playwright midiendo `getBoundingClientRect().height` de ambas
     tarjetas en desktop (1440px): quedan exactamente iguales tanto sin
     datos (266px) como con datos (403px). En mobile (<900px) el grid
     pasa a 1 columna (regla ya existente) así que ahí no aplica — cada
     tarjeta apilada mantiene su alto natural, que es lo esperable.
  0.1 **Las 3 tarjetas del dashboard (Antropometría / Objetivo cognitivo /
     Cierre) tienen la misma cabecera** (sesión 2026-09-15, quinta tanda —
     a pedido del usuario, con una captura de la referencia original al
     lado del estado real del sitio, mostrando que "Cierre" se veía como
     un componente distinto). Fondo, padding y `border-radius` ya eran
     idénticos entre las 3 desde antes (`#miPlan .stat-box, .bar-chart-card,
     .miplan-cierre{padding:20px 20px}`, más arriba en este archivo) — lo
     que las diferenciaba era la cabecera: las 2 primeras llevan
     `.miplan-card-head` (ícono a la izquierda + anillo de progreso a la
     derecha) y el título en `.miplan-card-title` (15px, `--ink`) debajo;
     "Cierre" no tenía ícono y el título iba inline con el avatar, en su
     propia clase `.miplan-cierre-title` (18px, `--purple-dark`) — **esa
     clase ya no existe**, se quitó del CSS. Ahora `.miplan-cierre-head`
     tiene un ícono nuevo (clipboard con check, dibujado a mano con
     `<path>` para heredar el mismo estilo de trazo que los otros 2 —
     `rect` no hereda esa regla) en el lugar donde las otras 2 tienen su
     ícono propio, y el avatar+nombre (`#miPlanCierreUser`) sigue del lado
     derecho, en el mismo lugar donde ellas tienen el anillo (no es un
     anillo real: "Cierre" no tiene un dato de progreso propio, es la
     identidad de la cuenta). El título "Cierre" pasó a usar directamente
     la clase `.miplan-card-title` (no una copia con los mismos valores)
     para que quede garantizado que las 3 tarjetas usan la tipografía
     exacta, con `.miplan-cierre .miplan-card-title{margin-bottom:0}`
     porque esa clase trae `margin-bottom:12px` pensado para bloques
     sueltos, y acá el padre ya es flex column con `gap:14px` — sin
     cancelarlo el espaciado quedaba más grande que el del resto de los
     hijos de `.miplan-cierre`.
     **Verificado con Playwright**: dashboard sin datos (avatar+ícono+
     título alineados igual en las 3 tarjetas), con plan generado
     (gauge de IMC, objetivo y barras de estado ya pintados no rompen el
     layout), y mobile 390px (las 3 tarjetas apiladas mantienen la misma
     cabecera). Tipografía/fondo/padding/radio confirmados iguales por
     `getComputedStyle` entre `.miplan-grid .stat-box` y `.miplan-cierre`.
     No se tocó el estado sin sesión (`#miPlanSinSesion`) ni los
     formularios de login/registro/recuperación de las tandas anteriores
     — se re-verificó que siguen intactos.
  1. Cada una de las 2 tarjetas de "Datos clave" (`.stat-box.miplan-card`)
     suma un header (`.miplan-card-head`): ícono SVG inline a mano, trazo
     fino `stroke:var(--purple)` (silueta corporal para Antropometría,
     círculos concéntricos tipo "objetivo/diana" para Objetivo cognitivo
     — no existen como asset en `img/Iconos/`, se descartó inventar una
     ruta de imagen) + un anillo de progreso (`.miplan-ring`, SVG puro:
     `<circle>` de fondo + `<circle>` con `stroke-dasharray`/
     `stroke-dashoffset`, sin imagen ni librería). El anillo es un
     indicador de **2 estados** (vacío/completo), no un medidor real: no
     hay un dato continuo de "% de progreso" para IMC u objetivo, solo
     presente/ausente. `.miplan-ring.is-complete` (verde `--green` para
     `#miPlanAntroRing`, azul `--navy-bright` para `#miPlanObjetivoRing`)
     rellena el círculo y muestra un check — la clase la agrega
     `js/mi-plan.js` dentro de los mismos bloques `try` que ya parsean
     `sinaptix_antropometria`/`sinaptix_objetivo` en `pintarMiPlan()`
     (2 líneas nuevas por bloque, no se modificó nada de lo que ya
     existía ahí). Debajo de cada tarjeta, un CTA propio
     (`.miplan-card-cta`, `btn-ghost` chico) — como no existe un flujo
     para cargar *solo* antropometría o *solo* objetivo por separado (los
     dos salen de la misma encuesta de 8 pasos), el CTA es un simple
     `<a href="#miplanCierreAnchor">` que hace scroll (nativo,
     `scroll-behavior:smooth` ya en `html`) hasta el botón real
     "Generar mi plan" — cero JS nuevo para esto. `.stat-box:has(.miplan-ring.is-complete)
     .miplan-card-cta{display:none}` oculta el CTA de la tarjeta una vez
     completa (evita 2 botones que abren la misma encuesta).
  2. `.miplan-cierre` (tarjeta ancha "Detalle del plan de nutrición", ya
     existía) suma una fila de íconos decorativos
     (`.miplan-cierre-icons`, reusa los mismos `img/Iconos/icon-*.webp`
     que ya usa el resto del sitio: omega3, neuronas, antioxidantes,
     hidratación, complejo B — no se generó ningún ícono nuevo para esto)
     entre el texto de `#miPlanCta` y los botones. Solo visible mientras
     no hay plan generado: `#miPlanCta.hidden + .miplan-cierre-icons{display:none}`,
     resuelto con CSS puro (hermano inmediato de `#miPlanCta`, que
     `js/mi-plan.js` ya ocultaba/mostraba sin cambios) — no hizo falta
     tocar JS para esto.
  3. `#miPlan .stat-box`/`.miplan-grid`/etc. (paddings, gaps, fondo
     `--paper` sobre `.dark`) no cambiaron — son las reglas ya
     documentadas más arriba, compartidas con el resto de "Mi plan".
- **"Detalle del plan de nutrición" — 3 columnas (Plan / Prioridades y
  Moderación / columna derecha apilada)**: `nutriBuildResumenHTML(d, opts)`
  (`js/nutricion-planes.js`, compartida entre `#nutriResumen` del wizard en
  `index.html` y `#miPlanDetalle` en `mi-plan.html`) arma, por cada plan
  resuelto, un `.nutri-plan-block` con 2 hijos: `.nutri-plan-main` (ícono
  SVG de cerebro `NUTRI_ICON_BRAIN` + título, enfoque, nutrientes clave,
  día tipo) y `.nutri-plan-side` (cajas `.nutri-side-box--priorizar`/
  `--moderar`, íconos `NUTRI_ICON_CHECK`/`NUTRI_ICON_WARN`, mismo
  criterio de línea fina que `.miplan-card-icon`). Por defecto
  (`.nutri-plan-block{flex-direction:column}`) los 2 sub-bloques se
  apilan — así el modal angosto de `index.html` sigue en una sola columna
  sin CSS especial; el grid de 2 columnas
  (`grid-template-columns:1.6fr 1fr`) solo se activa dentro de `#miPlan`
  desde 680px de ancho. **Esto reemplazó el viejo `column-count:2` de
  `#miPlan .nutri-summary`** (repartía los `<div>` sueltos del resumen
  en 2 columnas tipo "diario") — ya no existe ese mecanismo, ahora cada
  plan arma sus propias 2 columnas explícitas.
  "Ajustado a tu caso" (de `nutriConstruirAjustes(d)`, es de toda la
  encuesta, no de un plan en particular) tiene **tratamiento distinto
  según el contexto** (sesión 2026-09-16, décimosegunda tanda): en el
  wizard de `index.html` sigue colgado del `.nutri-plan-side` del
  **último** plan resuelto, como `.nutri-side-box--ajustes` con fondo
  sólido `--gold` (llamado sin el 2do parámetro de
  `nutriBuildResumenHTML`, que por default lo embebe ahí — sin cambios,
  ese modal angosto no tenía el problema de tarjeta desbalanceada). En
  `mi-plan.html` en cambio pasó a tarjeta propia (`.miplan-ajustes`,
  mismo fondo `--gold`/texto blanco): con muchos ajustes, el bloque
  embebido dejaba "Prioridades y Moderación" mucho más alta que el plan
  de al lado. `js/mi-plan.js` (`pintarMiPlan()`) llama
  `nutriBuildResumenHTML(o.encuesta,{incluirAjustesEnSide:false})` para
  que no se duplique, y pinta `#miPlanAjustesList` aparte llamando
  directo a `nutriConstruirAjustes(o.encuesta)`; la tarjeta
  (`#miPlanAjustes`) se oculta si no hay ajustes o no hay objetivo
  guardado. Si ningún plan resolvió pero sí hay ajustes (caso borde que
  no debería darse en la práctica), el fallback que los muestra sueltos
  sigue existiendo pero solo aplica cuando `incluirAjustesEnSide` es
  `true` (o sea, en el wizard).
  La columna derecha de `.miplan-detalle-grid` (antes solo `.miplan-cierre`)
  ahora es un wrapper `.miplan-detalle-side` (flex-column, mismo gap que
  el resto de "Mi plan") con `.miplan-ajustes` arriba y `.miplan-cierre`
  debajo, sin cambios de contenido en esta última.
  **Ojo con `min-width:0` y `overflow-wrap`** (bug reportado por el
  usuario en la tanda siguiente, décimotercera, con captura: un texto
  largo sin espacios en "disgustos" comprimía la columna del plan a una
  tira vertical y hacía desbordar `.miplan-ajustes` fuera del viewport):
  `.miplan-ajustes` necesita `overflow-wrap:anywhere;word-break:break-word`
  (mismo motivo que ya tenía `.nutri-side-box`) y las 2 grillas de esta
  pantalla (`.miplan-detalle-grid` y, dentro de `#miPlan`,
  `.nutri-plan-block`) necesitan `min-width:0` en sus hijos directos —
  si se agrega alguna tarjeta/columna nueva a este layout con texto libre
  del usuario adentro, revisar que tenga las 2 protecciones o puede volver
  a pasar lo mismo.
  `.miplan-cierre` suma `.miplan-cierre-head` con avatar (inicial, círculo
  `.miplan-avatar`) + nombre: `js/mi-plan.js` (`pintarMiPlan()`) lo arma
  desde `user.user_metadata.full_name`, o el prefijo del email antes de
  la `@` como fallback si la persona no cargó nombre al registrarse en
  Netlify Identity. Este fallback quedó **superado**: desde que existe el
  registro propio (`.miplan-auth`, ver más abajo) el nombre es un campo
  obligatorio, así que toda cuenta nueva trae `full_name`. El fallback
  **se deja igual** como red de seguridad para las cuentas creadas antes
  de este cambio (y para las creadas a mano desde el panel de Netlify),
  que sí pueden no tener nombre — no es código muerto, pero ya no debería
  activarse en el flujo normal.
  El texto "Sesión iniciada como {email}" (antes debajo del título
  "Tu progreso con SINAPTIX", `<p id="miPlanEmail">`) se movió dentro de
  esta misma tarjeta, pegado a los botones "Generar mi plan"/"Cerrar
  sesión" (`.miplan-cierre-session`, a pedido del usuario, sesión
  2026-09-15 continuación) — mismo `id` y misma lógica de
  `pintarMiPlan()`, solo cambió dónde vive el `<p>` en el HTML.
  Verificado con Playwright (mock de `netlifyIdentity`, sin red real):
  desktop 1440px, mobile 390px (apila todo en 1 columna) y el modal de
  `index.html` (paso 8 del wizard, sigue apilado, no se rompió).
- **Título "Tu progreso con SINAPTIX" — palabra "SINAPTIX" encerrada**
  (sesión 2026-09-16, décimocuarta tanda): solo esa palabra vive en
  `<span class="miplan-brand-circled">`, con texto en `--purple-dark` y
  un círculo dibujado a mano (`svg/deco-circle-brand.svg`, color fijo
  `#0FD8C4` turquesa — **no** es una variable de `:root`, es un color de
  esta referencia puntual del usuario, no de la paleta de marca) como
  `::after` con `background-image`. Si algún día cambia el texto de este
  título o su tamaño de fuente, revisar los offsets de
  `.miplan-brand-circled::after` (`left/right/top/bottom`, en `%`
  relativos al propio `<span>`) — están ajustados a ojo para "SINAPTIX"
  en `Caveat` 700, no son un cálculo genérico.
- Para el detalle completo de esta sesión (íconos SVG exactos, capturas
  de verificación) ver la entrada 2026-09-15 en `changelog.md`.
- Para el detalle completo del resto de estos puntos (por qué se
  diseñó así, decisiones descartadas, valores exactos de CSS, capturas
  de verificación) ver `historico/memoria-2026-09-14.md`.
- **Overflow horizontal: NO poner `overflow-x` en `html`, solo en `body`**.
  Historial de esto (para no repetir el error): se creyó en una sesión
  anterior que el bleed grande de `vision-brain-bg` (`right:-160px`)
  rompía el layout con scroll horizontal real, y se "corrigió" agregando
  `overflow-x:hidden` también a `html`. **Ese diagnóstico era incorrecto**:
  verificado con Playwright forzando scroll horizontal (`mouse.wheel` +
  leer `window.scrollX`) en versiones con y sin el bleed grande, **nunca**
  hubo scroll horizontal real — `body{overflow-x:hidden}` (que ya existía
  desde antes) sola es suficiente para contener cualquier desborde de
  decoraciones `position:absolute` dentro de `section`s `position:relative`,
  sin importar cuánto "bleed" tengan.
  El agregado de `overflow-x:hidden` en `html` sí tuvo un efecto secundario
  real y visible: al fijar `overflow-x` sin fijar también `overflow-y`,
  la spec de CSS fuerza `overflow-y` de `visible` a `auto` en el elemento
  raíz. En Chrome/Windows, en cuanto `<html>` tiene **cualquier**
  `overflow` explícito, el navegador dejar de usar el scrollbar nativo
  "moderno" de la ventana y renderiza `<html>` como una caja de scroll
  normal con el scrollbar **clásico** (gris sólido, con flechas
  arriba/abajo) — eso es lo que el usuario reportó como "doble scroll"/
  "se ve gris". Se revirtió: `html` vuelve a llevar solo
  `scroll-behavior:smooth` (sin overflow), `body` sigue con
  `overflow-x:hidden` (eso no se toca, es lo que realmente contiene el
  desborde). **No volver a agregar `overflow-x`/`overflow-y` a `html`** ni
  a `body` "para estar seguros": si aparece un desborde nuevo, verificar
  primero con Playwright (`window.scrollX` tras forzar scroll, no solo
  comparar `scrollWidth` vs `clientWidth` — `scrollWidth` no baja aunque
  el contenido esté bien clippeado, así que no sirve para diagnosticar
  esto) antes de tocar `overflow` en el elemento raíz.
- **Tarjeta "Objetivo cognitivo" (`.miplan-objetivo`): orden de textos y
  anillo alineados con Antropometría** (sesión 2026-09-15, quinta tanda
  continuación — a pedido del usuario con captura de referencia).
  Dos ajustes en `mi-plan.html`/`css/styles.css`, sin tocar JS:
  - **Orden del texto**: en `mi-plan.html` el bloque de esta tarjeta
    mostraba primero `.lab` ("Objetivo cognitivo principal", itálica) y
    debajo `.num` (`#miPlanObjetivo`, el valor real o el placeholder
    `—`) — al revés que Antropometría, que muestra primero `.num`
    (`#miPlanImc`) y debajo su `.lab`. Se invirtió el orden de los 2
    `<div>` (mismos `id`/clases, nada de JS depende del orden en el DOM)
    para que quede igual: título → `.num` (`—` o el objetivo resuelto) →
    `.lab` en itálica.
  - **Anillo pegado al ícono en vez de ir al borde derecho**: causa real,
    no visual — `.miplan-objetivo{display:flex;flex-direction:column;
    align-items:flex-start}` hace que sus hijos block (incluido
    `.miplan-card-head`) se achiquen al ancho de su contenido en vez de
    ocupar el ancho completo de la tarjeta, así que el
    `justify-content:space-between` de `.miplan-card-head` no tenía
    espacio para repartir. En Antropometría no pasaba porque `.stat-box`
    no es flex, así que su `.miplan-card-head` ya ocupaba el 100% por
    comportamiento default de bloque. Fix: `width:100%` agregado a la
    regla general de `.miplan-card-head` (afecta a las 2 tarjetas que la
    usan, no rompe Antropometría porque ahí ya se comportaba así).
  Verificado con Playwright (mock de `netlifyIdentity`): estado sin
  datos (placeholder `—` arriba, texto itálico abajo, anillo vacío a la
  derecha) y con plan generado (objetivo real arriba, anillo relleno
  a la derecha, igual que el check de Antropometría), desktop 1440px y
  mobile 390px.
- **Tarjeta "Tu estado actual" (`#miPlanBarras`/`.bar-chart-card`,
  gráfico de barras foco/memoria/energía/calma) pasa a fondo dorado**
  (mismo pedido/sesión que el punto anterior). Vive en la misma columna
  que "Objetivo cognitivo" y depende del mismo dato (la encuesta de
  objetivo), así que ahora comparte su color: `#miPlan .bar-chart-card`
  pasó de `background:var(--paper)` (blanco) a
  `background:var(--miplan-card-dorado)` (el mismo `#F6E7D6` que ya usa
  `.miplan-objetivo`). No se tocó su padding/radius/tipografía, ni la
  tarjeta blanca del wizard en `index.html` (esa no pasa por
  `#miPlan .bar-chart-card`, sigue con el fondo genérico de
  `.bar-chart-card` sin el override de esta página).
  Verificado con Playwright: dashboard con plan generado, desktop y
  mobile — las 2 tarjetas de la columna derecha ("Objetivo cognitivo" y
  "Tu estado actual") quedan del mismo tono, sin afectar la tarjeta
  verde de Antropometría ni la lila de "Cierre".
- **Botón de "Datos clave" desnivelado entre las 2 tarjetas — anclado al
  borde inferior** (misma sesión, sexta tanda — el usuario mandó captura
  del deploy real mostrando el problema apenas se aplicó el punto
  anterior). Causa: `.num` usa `font-size:36px` en Antropometría pero
  `22px` en Objetivo cognitivo (a propósito, para que un objetivo largo
  tipo "Mejorar el foco y la memoria" no desborde) — esa diferencia de
  alto entre los dos bloques de arriba hacía que el botón
  (`.miplan-card-cta`) quedara a distinta altura en cada tarjeta en el
  estado "sin datos" (con datos cargados el botón se oculta vía
  `.stat-box:has(.miplan-ring.is-complete) .miplan-card-cta{display:none}`,
  así que ahí no se notaba). Se igualaron fuentes en vez de forzar el
  mismo tamaño (rompería el objetivo largo) anclando el botón siempre al
  fondo de la tarjeta: `.stat-box.miplan-card` (clase que comparten las 2
  tarjetas) pasa a `display:flex;flex-direction:column` — sin fijar
  `align-items` en esa regla a propósito, así Antropometría (gobernada
  solo por esta regla) hereda el valor inicial `normal` → se comporta
  como `stretch` (igual que el bloque normal que tenía antes, necesario
  para que `.imc-gauge{margin:0 auto}` se siga centrando sobre el ancho
  completo) y Objetivo cognitivo sigue con su propio
  `align-items:flex-start` (`.miplan-objetivo`, sin cambios, ya tenía el
  fix de `.miplan-card-head{width:100%}` de la tanda anterior). Con la
  tarjeta en flex-column, `.miplan-card-cta` suma `margin-top:auto`
  (empuja el botón al fondo sin importar cuánto mida el contenido de
  arriba) y `align-self:flex-start` (para que no se estire a todo el
  ancho, efecto por default de un flex-column sin `align-items:flex-start`
  — reemplaza el `margin-top:14px` fijo que tenía antes).
  Verificado con Playwright: estado sin datos (los 2 botones ahora a la
  misma altura, desktop 1440px y mobile 390px) y con plan generado (sigue
  igual que antes, el botón no se ve porque está oculto). No se tocó
  `index.html`: `.miplan-card`/`.miplan-card-cta` son clases exclusivas
  de `mi-plan.html`.
- **"—" placeholder de Antropometría desparejo contra el de Objetivo
  cognitivo** (sesión 2026-09-15, continuación — el usuario mandó captura del estado
  sin datos mostrando el problema; el botón ya quedaba anclado al fondo
  por el punto anterior, pero el "—" en sí seguía viéndose más grande y
  más abajo en la tarjeta verde). Causa: igual que el punto anterior,
  `.num` es 36px en Antropometría y 22px en Objetivo cognitivo — eso no
  se tocó (sigue haciendo falta para el objetivo largo), pero antes de
  cargar un dato real ambos elementos muestran el mismo placeholder "—",
  así que no había motivo para que se vieran distintos en ese estado.
  Fix: el `<div class="num">` de Antropometría (`#miPlanImc`) suma la
  clase `is-placeholder` en el HTML; `.stat-box.miplan-card
  .num.is-placeholder{font-size:22px}` (`css/styles.css`) lo iguala al
  tamaño de Objetivo cognitivo mientras no hay dato. En
  `js/mi-plan.js` (`pintarMiPlan()`), al pintar el IMC real se agrega
  `imcEl.classList.remove('is-placeholder')` — así el número real (ej.
  "24.2") vuelve a mostrarse grande (36px), que es lo que se quiere para
  un dato protagonista; solo el placeholder debía igualarse. Objetivo
  cognitivo no se tocó (ya usaba 22px siempre, con o sin dato).
  Verificado con Playwright: estado sin datos (los 2 "—" al mismo
  tamaño y altura, desktop 1440px y mobile 390px, botones siguen
  parejos) y estado con IMC cargado (vuelve a 36px, sin afectar
  Objetivo cognitivo).
- **Wizard de nutrición (`#modalNutricion`) — botón "Iniciar sesión" real
  en el último paso, en vez de depender del widget nativo automático**
  (sesión 2026-09-15, continuación — el usuario mandó captura del deploy
  real mostrando el mensaje final sin ningún botón visible). Antes, sin
  sesión, al guardar el plan se llamaba a `setTimeout(() =>
  netlifyIdentity.open('login'), 900)`: abría el widget **nativo** de
  Netlify Identity automáticamente — inconsistente con el resto del
  sitio, que ya reemplazó ese widget por pantallas propias de
  login/registro en `mi-plan.html` (`#btnLogin`/`#btnAcceder` del header
  ya apuntan ahí, no al widget). En el deploy real tampoco se veía ningún
  botón en ese paso. Fix: `index.html` agrega
  `<a href="mi-plan.html" class="btn btn-ghost nutri-login-btn hidden"
  id="nutriLoginBtn">Iniciar sesión</a>` justo debajo de
  `#nutriResultado`; `js/script.js` (handler de submit del wizard) sacó
  el `setTimeout`/`netlifyIdentity.open('login')` y en su lugar hace
  `loginBtn.classList.remove('hidden')` cuando no hay sesión — mismo
  destino (`mi-plan.html`) que el resto de los accesos de login del
  sitio. `js/nutricion-wizard.js` (`resetNutriWizard()`) vuelve a ocultar
  el botón (`classList.add('hidden')`) al reabrir el wizard, igual que ya
  hacía con `#nutriResultado`, para que no quede visible de una sesión
  anterior del wizard. El caso con sesión iniciada no cambió (sigue
  redirigiendo directo a "Mi plan" a los 900ms).
  **Tamaño y estilo del botón** (misma sesión, ajuste siguiente — el
  usuario mandó captura mostrando el botón `btn-solid` estirado a todo
  el ancho del modal, "feo"/pesado al lado de "Guardar mi plan"). Causa:
  `.modal-form` es `display:flex;flex-direction:column` sin
  `align-items` propio → default `stretch`, y a diferencia de
  "Atrás"/"Guardar mi plan" (que viven adentro de `.nutri-nav`, una fila
  flex aparte con `.btn{flex:none}`), `#nutriLoginBtn` cuelga directo del
  `.modal-form`, así que heredaba ese stretch y ocupaba el 100% del
  ancho. Fix: nueva clase `.nutri-login-btn{align-self:flex-start;
  margin-top:10px;padding:11px 24px;font-size:13.5px}` (`css/styles.css`)
  le da tamaño natural de contenido y lo alinea a la izquierda; además
  pasó de `btn-solid` a `btn-ghost` (outline, no relleno) para bajarle
  jerarquía visual frente al solid morado de "Guardar mi plan", que ya
  fue la acción principal de este paso.
  Verificado con Playwright (mock del DOM en vez del widget real, no
  alcanzable desde este entorno): botón chico, alineado a la izquierda,
  estilo `.btn-ghost`, desktop 1440px y mobile 390px.
  **Auto-scroll a mensaje + botón al guardar (sesión 2026-09-16)**: el
  usuario reportó, ya con el patch anterior aplicado, no ver el botón
  aunque funcionaba — el modal (`.modal-card`, `max-height:88vh;
  overflow:auto` en `css/styles.css`) es su propio contenedor con scroll,
  y con todos los avisos nutricionales del último paso, el mensaje de
  éxito (`#nutriResultado`) + `#nutriLoginBtn` quedan por debajo del
  fold sin que se note que hay más para scrollear. Fix en `js/script.js`
  (handler de submit, rama sin sesión): al mostrar el botón se hace
  `modalCard.scrollTo({top: modalCard.scrollHeight, behavior:'smooth'})`
  dentro de un `requestAnimationFrame` (para que el botón ya esté
  visible — no `display:none` — antes de medir `scrollHeight`). Solo se
  aplica a la rama sin sesión (el caso con sesión ya redirige solo a los
  900ms, no hace falta). **No se pudo verificar con Playwright en esta
  sesión** (no hay acceso de red a los dominios de descarga del browser
  de Playwright desde este entorno); la lógica se revisó a mano y por
  sintaxis (`node --check`), pero falta confirmación visual — si en el
  deploy real el scroll no llega justo al fondo o se ve brusco, revisar
  acá primero.
  **Nombre/correo del paso 1 — ocultos/prellenados si ya hay sesión, y
  usados para precargar login/registro (sesión 2026-09-16, continuación)**:
  a raíz de una pregunta del usuario ("¿para qué pido nombre/correo si no
  se usan?"), se confirmó que `nutriNombre`/`nutriEmail` (paso 1) hoy no
  alimentan nada aguas abajo (`nutriBuildResumenHTML` no los toca) — solo
  quedan guardados en `sinaptix_objetivo`. Se decidió dejarlos (no
  quitarlos) pero con dos mejoras:
  1. **Ocultar/prellenar si hay sesión** (`js/nutricion-wizard.js`,
     `resetNutriWizard()`): mismo patrón visual que peso/talla
     (`#nutriAntroInputs`/`#nutriAntroResumen`) — nuevos
     `#nutriContactoInputs` (envuelve el `.modal-row` de nombre/correo,
     agregado en `index.html` y `mi-plan.html`) y
     `#nutriContactoResumen`/`#nutriContactoResumenTexto` +
     `#btnNutriContactoEditar` ("Usar otro nombre o correo", mismo
     listener que `btnNutriAntroEditar` para volver a mostrar los
     inputs). Con `netlifyIdentity.currentUser()` disponible: si hay
     `email` **y** `user_metadata.full_name`, se prellenan ambos inputs
     (por debajo, ocultos) y se muestra el resumen; si solo hay `email`
     (cuentas viejas sin `full_name`, previas a que el registro propio lo
     pidiera obligatorio), se dejan los inputs **visibles pero
     prellenados** — no se oculta con el campo `required` de nombre
     vacío. Sin sesión, comportamiento sin cambios (inputs vacíos,
     visibles).
  2. **Precargar login/registro en "Mi plan" con esos datos** (sin
     sesión): cuando el wizard guarda sin sesión, `sinaptix_objetivo` ya
     tenía `email` y `encuesta.nombre` (paso 1). `js/mi-plan.js` agrega
     `prefillAuthDesdeEncuesta()`, llamada solo en la rama sin sesión de
     `netlifyIdentity.on('init', …)` (no en el flujo de recuperación de
     contraseña, que muestra otro panel) — lee `sinaptix_objetivo` de
     localStorage y, si hay `email`, completa `#loginEmailMiPlan` y
     `#registroEmailMiPlan`; si hay `encuesta.nombre`, completa
     `#registroNombreMiPlan`; nunca pisa un campo que la persona ya haya
     escrito a mano (`if(!el.value)`). Si se completó el email, además
     pone el foco en `#loginPassMiPlan` (pestaña de login, activa por
     defecto) — asume que quien llega así ya tiene cuenta y solo le falta
     escribir la contraseña; si en realidad quiere registrarse, el nombre
     también quedó cargado en esa otra pestaña.
  Verificado con Playwright (mock de `netlifyIdentity`, igual que el
  resto de esta memoria — el script real no es alcanzable desde este
  entorno): paso 1 sin sesión (inputs visibles y vacíos), con sesión
  full_name+email (ocultos + resumen con el texto correcto + botón
  "editar" los vuelve a mostrar sin perder el valor), con sesión solo
  email (visibles y prellenados, no ocultos); y en `mi-plan.html` sin
  sesión, con `sinaptix_objetivo` guardado (login/registro precargados,
  foco en contraseña) y sin ese dato guardado (no rompe nada, campos
  vacíos como antes) y sin pisar un valor ya tipeado por el usuario.

- **Método (`#lam-03`) — interruptor "Mi progreso"/"Mi IMC" movido al pie,
  al lado del botón de acción** (sesión 2026-09-15, continuación): antes
  `.gauges-switch` vivía arriba de todo en `.method-gauges`, suelto. Ahora
  vive en un footer nuevo (`.gauges-footer`, al final del `<aside
  id="methodGauges">`) junto al botón de la pestaña activa (`id`
  `gaugesFooterCtaProgreso`/`gaugesFooterCtaImc`, spans `display:contents`
  para que el botón que insertan sea un ítem flex más del footer). Los
  botones "Generar mi diagnóstico", "Actualizar" (antes "Actualizar mi
  estado"/"Actualizar mi estado otra vez" — se simplificó el texto, ahora
  es siempre "Actualizar") y "Registrar datos antropométricos" se
  renderizan ahí en vez de adentro de cada panel (`js/script.js`,
  `renderMethodGauges()`/`renderMethodImc()`). `setGaugesView()` togglea
  `.hidden` en el slot de CTA correspondiente junto con su panel. Los 3
  listeners de click (antes repartidos entre `#methodGauges` y
  `#methodGaugesImc`) quedaron unificados por delegación sobre
  `#methodGauges`. Verificado con Playwright: sin datos/con datos, ambas
  pestañas, desktop 1440px y mobile 390px (el footer envuelve en 2 líneas
  si no entran en una fila).

**Anillos de progreso de Método — animación de llenado + marcador de
"antes" (sesión 2026-09-16).** Sobre la base descrita en
`historico/memoria-2026-09-14.md` ("Anillos de progreso en Método": un
solo anillo por área, sin doble anillo concéntrico — esa opción quedó
descartada, no se reintrodujo):
- **Animación de llenado** (`gaugeArc`/`gaugeAnimateArcs`,
  `js/script.js`): cada anillo arranca "vacío" y se llena hasta su
  porcentaje real con `stroke-dashoffset` animado por CSS
  (`.gauge-arc-value{transition:stroke-dashoffset .7s
  cubic-bezier(.16,.84,.44,1)}` en `css/styles.css`), ~0.7s ease-out.
  Técnica: `stroke-dasharray` fijo a la circunferencia completa
  (`"C C"`) y el offset va de `C` (anillo vacío) a `C - largoDelArco`
  (valor final) — reemplaza el `dasharray="largo circunferencia"` de
  antes, que dibujaba el arco ya resuelto y no se podía animar sin
  recalcularlo en cada frame. `gaugeAnimateArcs(el)` se llama justo
  después de pintar el `innerHTML` en `renderMethodGauges` y usa un
  doble `requestAnimationFrame` para forzar que el navegador pinte el
  estado "vacío" antes de disparar la transición al valor final (si se
  cambia en el mismo frame que el `innerHTML`, varios navegadores saltan
  directo al valor final sin barrido).
  - **Escalonado**: el anillo destacado arranca en 0ms; los 3 chicos
    ~90ms después (delay pedido por el usuario para que no se sientan
    como 4 anillos disparando a la vez), con 30ms de diferencia extra
    entre ellos. El delay es inline (`transition-delay`, en el propio
    `<circle>`) porque cada anillo necesita un valor distinto — la
    duración/easing viven en CSS.
  - **`prefers-reduced-motion: reduce`**: `gaugeArc` arranca esos
    anillos directo en su valor final (sin barrido, sin `transition`
    inline) y `gaugeAnimateArcs` no hace nada; además hay una regla CSS
    `@media(prefers-reduced-motion:reduce){.gauge-arc-value{transition:none}}`
    como red adicional. La lectura de la preferencia
    (`gaugePrefersReducedMotion`, `matchMedia`) es una sola vez al cargar
    el script, no reactiva a cambios en caliente de la config del SO
    (recargar la página sí la vuelve a leer).
  - **No se reinicia sola con el scroll**: `renderMethodGauges` solo se
    llama al cargar la página y después de guardar un diagnóstico o una
    reevaluación (ver los `renderMethodGauges()` en `js/script.js`) — no
    hay ningún listener de scroll/`IntersectionObserver` que la
    dispare, así que la animación no se re-ejecuta al pasar la sección
    por el viewport más de una vez.
  - Los `aria-label` de cada `<svg>` (`gaugeBuildItem`) siguen
    reflejando siempre el valor final real, nunca un valor intermedio
    de la animación — no dependen del estado visual del arco.
- **Marcador de "antes" sobre el propio anillo** (`gaugeArcMarker`,
  `js/script.js`; estilo `.gauge-arc-marker`, `css/styles.css`): un
  punto chico (círculo blanco `var(--paper)` con contorno gris
  `var(--ink-soft)`), no un segundo anillo, ubicado sobre el mismo radio
  del arco en el ángulo correspondiente a `area.antesPct`. Se dibuja
  solo cuando `area.despuesPct != null` (mismo criterio que ya usaba el
  badge de texto `methodDeltaBadge`/la línea "Antes: X%"). El color
  blanco+gris es deliberado para no confundirse con el extremo actual
  del arco (que usa la paleta `METHOD_GAUGE_LOW/MID/HIGH`) mientras
  anima. `size.marker` (5px en el destacado `r:46`, 3.5px en los chicos
  `r:34`) mantiene el punto legible sin pisar el ícono/porcentaje del
  centro en ningún tamaño. El badge de texto (`methodDeltaBadge`) y la
  línea "Antes: X%" **no se tocaron** — el marcador es un refuerzo
  visual adicional, el dato accesible en texto sigue igual.
- **Sin dependencias nuevas**: sigue siendo SVG + CSS + JS vanilla, sin
  build step, igual que el resto de la tarjeta.
- **Pendiente de verificación visual real**: no se pudo correr
  Playwright en esta sesión (mismo problema de siempre en este
  entorno — sin acceso de red al dominio de descarga del browser,
  `cdn.playwright.dev` no está en la allowlist). Revisado a mano y por
  sintaxis únicamente (incluye chequeo de sintaxis con `node --check` y
  la suite de `node --test`, 46/46 ok — no cambia lógica de cálculo,
  así que no hacía falta un test nuevo). Falta confirmar en un navegador
  real: el barrido de llenado se ve fluido y escalonado como se espera
  (desktop y mobile ≤900px, donde `.method-body` se apila), el marcador
  de "antes" se lee claramente distinto del extremo del arco en el
  anillo destacado y en al menos un anillo chico, y que
  `prefers-reduced-motion: reduce` efectivamente salta la animación.

## Validación de respuestas irracionales en la encuesta (sesión 2026-09-16)

A pedido del usuario, se agregó validación de rango/formato a los **7
campos libres** del wizard de nutrición (el resto son selects/radios de
opciones fijas, ahí no hace falta nada). Plan completo entregado al
usuario en `plan-validacion-encuesta-nutricion.md` (no vive en el
repo, mismo criterio que otros planes de sesión).

- **Rangos numéricos** (`NUTRI_RANGOS` en `js/nutricion-planes.js`,
  **fuente única** compartida por los 3 lugares que antes tenían sus
  propios límites, desalineados entre sí): edad 14–120 (el máximo cubre
  casos reales documentados de longevidad extrema, no es "típico"),
  peso 30–250 kg, talla 100–230 cm, horas de pantalla/estudio seguido
  0–18 h. `nutriValidarRango(campo, valor)` devuelve `null` si es válido
  (vacío incluido, en campos opcionales) o un mensaje de error. Se
  aplican en dos capas: atributos `min`/`max` en `index.html` y
  `mi-plan.html` (los 4 inputs numéricos del wizard) + el mismo
  `min`/`max` en `#antroPeso`/`#antroTalla`/`#antroEdad`; y en JS, en
  `#formAntro` (`js/script.js`) y en `nutriGuardarAntropometriaSiFalta`
  (`js/nutricion-planes.js`), que antes tenían cada uno sus propios
  números hardcodeados (peso hasta 400, talla hasta 250, sin mínimo de
  edad) — ahora los tres usan `nutriValidarRango`.
- **`nutriNombre`**: `minlength="2"` + `pattern=".*[A-Za-zÀ-ÿ].*"` (al
  menos una letra, rechaza vacío-con-espacios/solo-números/solo-símbolos)
  + `maxlength="60"`, resuelto con validación nativa del navegador — no
  hizo falta JS nuevo, `nutriValidateStep()` (`js/nutricion-wizard.js`)
  ya usaba `:invalid` para el chequeo de cada paso, así que estos
  atributos ya quedan cubiertos por ese mismo mecanismo. Se ajustó el
  mensaje de `nutriValidateStep` para distinguir "fuera de rango"/
  "nombre inválido" de "campo obligatorio" (antes un solo mensaje
  genérico para los tres casos).
- **`nutriAlergiaOtra`/`nutriDisgustos`** (`maxlength="80"`/`"200"`)
  además tenían un **XSS real**: `nutriConstruirAjustes` los concatenaba
  tal cual en strings que `nutriBuildResumenHTML` mete con `innerHTML`
  (wizard paso 8 y "Mi plan"). Se agregó `nutriEscaparHTML(texto)` y se
  aplica a los dos en `nutriConstruirAjustes`, antes de que entren al
  HTML.
- **`nutriCondicion` — "Prefiero no decir"** ya no convive con el resto
  de checkboxes del grupo (antes se podía tildar "Prefiero no decir" y
  "Diabetes" a la vez): listener de `change` en
  `js/nutricion-wizard.js` que destilda la rama contraria.
- **Fuera de alcance de esta pasada** (a propósito, ver el plan): el
  formulario de contacto (mismo tipo de problema, no tocado); y
  coherencia cruzada peso/talla → IMC imposible (cada campo por
  separado queda dentro de rango, pero la combinación podría dar un IMC
  inviable) — no se bloquea, para no generar falsos positivos con casos
  reales atípicos.
- Tests nuevos en `tests/nutricion-planes.test.js` (16 casos) para
  `nutriValidarRango`, `nutriValidarNombre`, `nutriEscaparHTML` y el
  escapado dentro de `nutriConstruirAjustes`. Suite completa: 46/46 ok.

**Cadenas sin espacios en texto libre de la encuesta desbordan el modal
(sesión 2026-09-16, cuarta tanda) — corregido.** El usuario probó
pegar una cadena larga sin espacios (ej. 200 "c" seguidas) en
"Alimentos que no te gustan" (paso 7) para ver si rompía algo: rompía —
`.nutri-summary`/`.nutri-side-box`/`.nutri-note` (paso 8, donde
`nutriConstruirAjustes`/`nutriConstruirAvisos` insertan ese texto vía
`innerHTML`, ver `js/nutricion-planes.js`) no tenían
`overflow-wrap`/`word-break`, así que una cadena sin espacios no tenía
dónde cortar y estiraba `.modal-card` entero — como ese es el
contenedor con scroll propio (`max-height:88vh;overflow:auto`), el
resultado visual era **todo el modal** ensanchado con scroll horizontal
Y vertical a la vez, no solo el texto desbordado. Confirmado con
Playwright que el bug ya existía antes de este patch (mismo
`scrollWidth`/`clientWidth` en el commit anterior). Fix en
`css/styles.css`: `overflow-wrap:anywhere;word-break:break-word` en
`.nutri-summary`, `.nutri-side-box` y `.nutri-note` (los 3 contenedores
que pueden recibir texto libre de la encuesta — `disgustos` y
`alergiaOtra`, ambos ya escapados con `nutriEscaparHTML` desde el
patch de validación anterior, esto es aparte, es un tema de layout no
de seguridad). Mismas clases se reusan en `#miPlan` (`mi-plan.html`),
así que el fix aplica ahí también sin tocar nada más. Verificado con
Playwright: con la cadena de 200 caracteres sin espacios,
`modal-card.scrollWidth === clientWidth` (antes: 1456 vs 560) y
captura visual confirmando que el texto se corta en varias líneas
dentro del ancho normal de la caja "Ajustado a tu caso". Suite de unit
tests sin cambios (46/46 ok, este fix es puro CSS).

## Pendientes conocidos

**Animación de llenado + marcador de "antes" en los anillos de Método
(sesión 2026-09-16) — falta verificación visual.** Implementado (ver
"Estado actual del diseño" → "Anillos de progreso de Método") pero no
se pudo correr Playwright en esta sesión (sin acceso de red al dominio
de descarga del browser desde este entorno). Revisado a mano y por
sintaxis únicamente. Falta confirmar en un navegador real, en desktop y
mobile ≤900px: que el barrido se vea fluido y escalonado (destacado vs.
los 3 chicos), que el marcador de "antes" se lea claramente distinto
del extremo del arco en el estado "con reevaluación", y que
`prefers-reduced-motion: reduce` salte la animación correctamente.

**Auto-scroll del wizard al mensaje final (sesión 2026-09-16) — falta
verificación visual.** Se implementó (ver "Estado actual del diseño" →
entrada del botón "Iniciar sesión" del wizard) pero no se pudo correr
Playwright en esta sesión (sin acceso de red a los dominios de descarga
del browser desde este entorno). Revisado a mano y por sintaxis
únicamente. Falta confirmar en un navegador real: que el scroll llegue
justo al fondo del modal (mensaje + botón completamente visibles, no
cortados) y que no se vea brusco, en desktop y mobile.

**Login/registro propios — IMPLEMENTADO** (sesión 2026-09-15, tercera
tanda). El plan que vivía acá como "a futuro" (reemplazar el widget
nativo de Netlify Identity por pantallas propias en `mi-plan.html`) ya
está hecho: ver "Estado actual del diseño" → "Mi plan — login/registro
propios" para el detalle de qué se construyó, qué API se usa y por qué
la estrategia quedó híbrida. Con esto quedaron **cerrados** los dos
pendientes que este plan absorbía: el criterio de fallback del avatar
(el nombre ahora es obligatorio en el registro) y la "Opción B" de un
signup propio contra GoTrue.

Lo que quedó abierto de este cambio, para una próxima sesión:
- **Falta probarlo contra Netlify de verdad.** Toda la verificación se
  hizo con `netlifyIdentity` mockeado y Playwright: el script real de
  `identity.netlify.com` no es alcanzable desde el entorno de trabajo, y
  no hay credenciales de Netlify. Falta confirmar en el sitio desplegado:
  (a) que el signup con la confirmación por correo desactivada
  efectivamente entra directo al dashboard, (b) los textos exactos que
  devuelve el servidor para credenciales inválidas y email repetido — si
  alguno no coincide con las expresiones de `authMensajeError()` en
  `js/mi-plan.js`, se cae al mensaje genérico y hay que agregar el caso,
  y (c) que `plan-sync.js` sigue sincronizando con el backend después de
  un login hecho por esta vía.
- **La pantalla volvió a necesitar scroll en viewports bajos** (entra sin
  scroll desde ~986px de alto, antes ~825px). Ver el detalle y las
  palancas que quedan en "Estado actual del diseño"; la única grande es
  achicar el título, que el usuario ya descartó antes.
- **La recuperación de contraseña ya está implementada** (sesión
  2026-09-15, cuarta tanda; ver "Estado actual del diseño"), pero
  **tampoco se probó contra Netlify de verdad**. Lo que más conviene
  mirar en el deploy: que la plantilla del correo de recuperación apunte
  a `{{ .SiteURL }}/#recovery_token={{ .Token }}` (con eso, el script
  inline de `index.html` reenvía solo a "Mi plan"); si el usuario le
  cambió el destino desde el panel de Netlify, hay que ajustar el
  intercepto. También falta confirmar que el token vencido devuelva un
  error y no un 200.
- **Cambio de correo**: el widget atendía también `#email_change_token=…`
  y eso no se reemplazó. Hoy ese fragmento llegaría a `index.html`, donde
  el widget seguiría abriendo su modal nativo — el intercepto del
  `<head>` solo mira `recovery_token`. No hay ninguna parte del sitio que
  ofrezca cambiar el correo, así que no es alcanzable en la práctica,
  pero si algún día se agrega hay que cubrir ese caso.
- **Login con Google/GitHub**: sigue sin existir (tampoco existía antes).
  `gotrue.loginExternalUrl(provider)` lo haría, pero requiere habilitar
  el proveedor en el panel de Netlify primero.

**Sesión 2026-09-15 (continuación) — email de sesión movido a la tarjeta
"Cierre":** resuelto y commiteado en esta misma sesión (ver
`changelog.md`). El `<p id="miPlanEmail">` que decía "Sesión iniciada
como X" debajo del título de `#miPlanConSesion` se sacó de ahí y ahora
vive dentro de `.miplan-cierre`, pegado a los botones "Generar mi
plan"/"Cerrar sesión" — mismo `id` y misma lógica de `js/mi-plan.js`
(`pintarMiPlan()`), no se tocó JS, solo el HTML/CSS.

**Verificación visual de "Mi plan" con Playwright — hecha en la sesión
2026-09-15 (continuación):** se pudo levantar Chromium en este entorno
(a diferencia de sesiones anteriores). Se revisó con `netlifyIdentity`
mockeado (el script real de `identity.netlify.com` no es alcanzable
desde este entorno, se bloquea la request) + datos válidos seedeados en
`localStorage`: dashboard con sesión (desktop 1440px y mobile 390px),
fallback de avatar sin `full_name`, y el modal del wizard (paso 8) en
`index.html`. **No se encontró ninguna rotura** — todo coincide con lo
documentado en "Estado actual del diseño". No se llegó a revisar cada
ícono/decoración suelta de otras secciones, solo el bloque que estaba
marcado como pendiente de verificar.

- Ver `README.md` → "Próximos pasos" para el detalle funcional. El único
  punto realmente accionable ahí (punto 5, verificación en un deploy
  real) **no se puede hacer desde este entorno**: no hay credenciales de
  Netlify ni acceso de red a dominios `netlify.app`/`netlify.com`.
- Descartado: trazos tipo "marcador" dispersos por el sitio (rompía el
  wrapping de títulos con `display:flex`). Si se retoma, ver el detalle
  en `historico/memoria-2026-09-14.md` antes de repetir el mismo error.
  (No confundir con los trazos manuscritos naranjas de Método/Pilares,
  que son una función distinta y sí siguen vigentes en el sitio.)
