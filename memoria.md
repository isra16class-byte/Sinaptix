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
  `img/generadas*`).

## Estado actual del diseño (resumen)

- **Paleta** (`css/styles.css`, bloque `:root`): fondo blanco `--paper`,
  panel lavanda claro `--panel`, morado de marca `--purple`/`--purple-dark`
  como color estructural, acentos `--green`, `--gold` (terracota),
  `--navy-bright`. Texto `--ink`. Método (`lam-03`) tiene además su propia
  paleta cálida crema+café superpuesta.
- **Tipografía**: `Inter` para cuerpo/UI, `Fraunces` (800, normal+itálica)
  para títulos, `Caveat` (`--font-hand`, clase `.title-hand`) para títulos
  con look manuscrito (Método, Pilares, título de "Mi plan").
- **"Mi plan"** es el flujo más complejo del sitio: página propia,
  dashboard de 2 columnas (`.miplan-grid`/`.miplan-detalle-grid`), medidor
  de IMC tipo velocímetro, gráfico de barras Foco/Memoria/Energía/Calma
  (con comparación antes/después si hay reevaluación), encuesta de
  nutrición inline (mismo `#formNutricion` que el modal de `index.html`).
- **"Mi plan" — estado sin sesión (`#miPlanSinSesion`, clase
  `.miplan-locked`)**: rediseño visual (no toca `js/mi-plan.js`, siguen
  existiendo `#miPlanSinSesion` y `#btnLoginMiPlan` con el mismo
  comportamiento). Combina dos referencias: candado ilustrado + tarjeta
  crema (variante A) y un cerebro ilustrado de fondo (variante B, hoy
  imagen real, ver abajo — reemplaza la maraña SVG de la sesión anterior).
  Estructura: `.miplan-locked` (flex centrado) con 3 capas —
  1. 2 `<img class="deco miplan-locked-brain is-left|is-right">` con el
     mismo asset `img/decoraciones-neurona/cerebro-mi-plan.webp` (imagen
     provista por el usuario, no generada acá: cerebro con dendritas, línea
     fina terracota/dorada) reusado a 2 escalas: `.is-left` chica arriba a
     la par del aguacate (`width:clamp(140px,16vw,190px);left:15%;top:2%`),
     `.is-right` grande sangrando sobre el borde derecho
     (`width:clamp(420px,48vw,560px);right:-60px;top:-30px`), mismo
     criterio de bleed que `neurona-derecha`/`vision-brain-bg`.
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
     arriba del `eyebrow`/`h2.lam-title`/`p.lam-text`/`.btn-row` — estos 4
     elementos **no cambiaron de texto ni de id/clase**, solo quedaron
     centrados dentro de la tarjeta nueva (antes estaban alineados a la
     izquierda, sueltos en el `.wrap`).
  CSS nuevo todo bajo selectores propios (`.miplan-locked*`, `.lock-*`) en
  `css/styles.css`, no se tocó ninguna regla que afecte `#miPlanConSesion`
  (el dashboard con datos, que queda pendiente para otra sesión con otra
  referencia).
  **Verificado con Playwright** (esta sesión sí tuvo acceso a
  Chromium/Playwright): capturas a 1280px/1440px calzan contra la
  referencia del usuario, mobile (390px) oculta los 2 cerebros
  correctamente, y `window.scrollX===0` tras forzar scroll horizontal —
  no rompe el criterio de `overflow-x` de más abajo pese al bleed de
  `.is-right`.
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
  mismo tono morado** (`rgba(75,46,69,.6)`, destacada `.75`) con blur
  suave para dejar ver el arte detrás y texto (`.num`/`.lab`) en blanco;
  los números (`.num`) llevan además un `text-shadow` tipo glow (mismo
  morado oscuro del fondo) para seguir siendo legibles cuando el cerebro
  del fondo cae justo encima (pasa en la tarjeta 86B). Se sacaron las
  decoraciones viejas de esa esquina (círculos, huevo, aceite de oliva)
  que competían con el arte nuevo. Ancho responsive con `clamp()`, oculto
  en mobile (`<900px`, mismo criterio que el resto de `.deco-fruit`).
- Para el detalle completo de cada uno de estos puntos (por qué se
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

## Pendientes conocidos

- Ver `README.md` → "Próximos pasos" para el detalle funcional.
- Varias piezas visuales (dashboard de "Mi plan", iconos ilustrados,
  decoraciones nuevas) quedaron documentadas como "sin verificación
  visual real con Playwright" en `historico/memoria-2026-09-14.md` por
  restricciones de red del entorno de esas sesiones — si en una sesión
  nueva sí hay acceso a Playwright/Chromium, vale la pena revisar esas
  pantallas contra lo documentado antes de asumir que están 100% pulidas.
- Descartado: trazos tipo "marcador" dispersos por el sitio (rompía el
  wrapping de títulos con `display:flex`). Si se retoma, ver el detalle
  en `historico/memoria-2026-09-14.md` antes de repetir el mismo error.
