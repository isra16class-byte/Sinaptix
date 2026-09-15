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
  mismo tono morado** (`rgba(75,46,69,.6)`, destacada `.75`) con blur
  suave para dejar ver el arte detrás y texto (`.num`/`.lab`) en blanco;
  los números (`.num`) llevan además un `text-shadow` tipo glow (mismo
  morado oscuro del fondo) para seguir siendo legibles cuando el cerebro
  del fondo cae justo encima (pasa en la tarjeta 86B). Se sacaron las
  decoraciones viejas de esa esquina (círculos, huevo, aceite de oliva)
  que competían con el arte nuevo. Ancho responsive con `clamp()`, oculto
  en mobile (`<900px`, mismo criterio que el resto de `.deco-fruit`).
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
  Moderación / Cierre)**: `nutriBuildResumenHTML()` (`js/nutricion-planes.js`,
  compartida entre `#nutriResumen` del wizard en `index.html` y
  `#miPlanDetalle` en `mi-plan.html`) arma, por cada plan resuelto, un
  `.nutri-plan-block` con 2 hijos: `.nutri-plan-main` (ícono SVG de
  cerebro `NUTRI_ICON_BRAIN` + título, enfoque, nutrientes clave, día
  tipo) y `.nutri-plan-side` (cajas `.nutri-side-box--priorizar`/
  `--moderar`, íconos `NUTRI_ICON_CHECK`/`NUTRI_ICON_WARN`, mismo
  criterio de línea fina que `.miplan-card-icon`). "Ajustado a tu caso"
  (de `nutriConstruirAjustes`, es de toda la encuesta, no de un plan en
  particular) se cuelga del `.nutri-plan-side` del **último** plan
  resuelto, como `.nutri-side-box--ajustes` con fondo sólido `--gold`
  (única caja con color, para que resalte como la personalización real
  — si no resolvió ningún plan pero sí hay ajustes, hay un fallback que
  los muestra sueltos, caso borde que no debería darse en la práctica).
  Por defecto (`.nutri-plan-block{flex-direction:column}`) los 2
  sub-bloques se apilan — así el modal angosto de `index.html` sigue en
  una sola columna sin CSS especial; el grid de 2 columnas
  (`grid-template-columns:1.6fr 1fr`) solo se activa dentro de `#miPlan`
  desde 680px de ancho. **Esto reemplazó el viejo `column-count:2` de
  `#miPlan .nutri-summary`** (repartía los `<div>` sueltos del resumen
  en 2 columnas tipo "diario") — ya no existe ese mecanismo, ahora cada
  plan arma sus propias 2 columnas explícitas.
  La tarjeta `.miplan-cierre` (3ra columna, vía `.miplan-detalle-grid`
  ya existente) suma `.miplan-cierre-head` con avatar (inicial, círculo
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

## Pendientes conocidos

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
