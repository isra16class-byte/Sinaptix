# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha (todas las sesiones de rediseño,
> wizard de nutrición, "Mi plan", backend, ilustraciones, etc.) quedó
> archivado completo en `historico/changelog-2026-09-14.md`.

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
