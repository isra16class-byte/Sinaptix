# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha quedó archivado completo en
> `historico/changelog-2026-09-14.md` (hasta el 14/09/2026) y
> `historico/changelog-2026-09-17.md` (14/09/2026 al 17/09/2026 —
> incluye toda la etapa de login/registro propios de "Mi plan", el
> rediseño del dashboard, la animación de los anillos de Método, y el
> proceso completo de Visión).

## 2026-09-18 — `#lam-06` Conócenos: halo oscuro difuso detrás del collage

Pedido del usuario: "una especie de difuminado transparente oscuro por los
bordes del collage", aclarando después que **no debe alterar el collage ni
la imagen** — tiene que ir "atrás" o solo por los bordes. Tras verlo, pidió
"más aún" y aprobó ("bien ahora sí").

- **`css/styles.css`**: regla nueva en `.stage` (debajo de `.stage svg`):
  `filter:drop-shadow(0 0 var(--collage-halo-blur) rgba(38,22,31,var(--collage-halo-alpha)))`
  con `--collage-halo-alpha:.62` y `--collage-halo-blur:calc(var(--u)*46)`.
  Como `drop-shadow` se pinta debajo del contenido y sigue la silueta real
  de las tarjetas/teléfono, no hay overlay ni máscara sobre el collage. El
  color es `--ink` (#26161F) con alfa, el mismo ciruela de las sombras de
  las tarjetas. Valores iniciales `.42`/`38u`, subidos a `.62`/`46u` a
  pedido.
- **Intentos descartados en la misma sesión** (no reintentar):
  1. Viñeta rectangular encima (4 `linear-gradient` en `::after`): se veía
     como un rectángulo oscuro con borde duro sobre el fondo lavanda.
  2. Anillo `radial-gradient` elíptico encima: "se ve un óvalo oscuro".
  3. `mask-image` en `.conocenos-collage` (desvanecer los bordes a
     transparente): difuminaba el propio collage, no lo que el usuario
     quería.
- **Verificación** (Playwright/Chromium, 1425px, 1911px y 390px,
  `reducedMotion:'reduce'`): diff pixel a pixel contra la versión sin halo
  — el contenido interior de las piezas (fotos, tarjetas, colores) no
  cambia; solo varía el antialiasing de los bordes del texto, porque el
  navegador lo pinta distinto bajo un `filter`. Sin desborde horizontal en
  390px. El `scrollWidth` de 1625px a 1425px de ventana y la franja blanca
  a la derecha en captura headless ya existían antes (sangrado del collage
  contenido por `overflow-x` de `body`), no son de este cambio.
- No se tocó JS, HTML ni el layout del collage.

Actualiza memoria.md y changelog.md.

## 2026-09-18 — `#lam-06` Conócenos: collage un poco más pequeño

Pedido del usuario: "quiero que el collage lo hagas un poco más pequeño",
ya sobre la versión integrada en HTML/CSS (no la imagen de IA).

- **`css/styles.css`**: `--collage-bleed` (definido en `.conocenos-grid`)
  pasa de `clamp(0px,calc((100vw - 1180px)/2 + 140px),340px)` a
  `clamp(0px,calc((100vw - 1180px)/2 + 100px),280px)`. Es el único knob
  que hace falta: como `.stage` define `--u:calc(100cqw/1000)` y todas las
  medidas de las piezas salen de esa unidad, bajar el sangrado encoge el
  collage completo (texto incluido) en proporción, sin media queries ni
  tocar la grilla. No se tocó la grilla, ni `left:20px`, ni el breakpoint
  de `≤900px`.
- **Medido** en el navegador integrado de VS Code (Playwright, 1425px de
  viewport): wrapper/`.collage` **906px → 866px** de ancho y 550px → 525px
  de alto, con el borde izquierdo en el mismo píxel (646px) y el corte por
  el borde derecho bajando de 127px a 87px.
- `npm test`: 75 pass / 1 skipped (el e2e de Playwright del PDF, no
  instalado), 0 fail.

Actualiza memoria.md y changelog.md.

## 2026-09-18 — Collage de redes de #lam-06 integrado en HTML/CSS (reemplaza la imagen de IA)

El usuario vio la maqueta (`docs/mockup-collage-redes.html`, entrada
anterior de este changelog) y confirmó que le gustaba. Se integró
reemplazando por completo la imagen generada por IA que estaba en
`#lam-06` "Conócenos".

- **`index.html`**: el `<img class="conocenos-collage-img"
  src="img/generadas-cutout/collage-redes-miplan.webp">` de
  `.conocenos-collage` se reemplazó por el markup completo de las 4
  piezas (TikTok, teléfono con Instagram, correo, dashboard de "Mi
  plan"), portado de la maqueta con las rutas de imagen ajustadas
  (`img/...` en vez de `../img/...`, ya que ahora vive en la raíz del
  sitio y no en `docs/`).
- **`css/styles.css`**: se agregó el bloque `.collage`/`.stage`/`.mk-*`
  (portado de la maqueta) inmediatamente después de las reglas de
  `.conocenos-collage`, en reemplazo de la regla `.conocenos-collage-img`
  (borrada — ya no hay `<img>` único, la animación `float` pasó al
  wrapper `.collage`). El tamaño/posición del wrapper `.conocenos-collage`
  (sangrado, `left`, breakpoint `≤900px`) no se tocó.
- **`js/script.js`**: nueva función `renderConocenosImcGauge()` (llamada
  junto con `renderMethodGauges()`/`renderMethodImc()`), dibuja el
  medidor de IMC de ejemplo del dashboard (`#conocenosImcGauge`, IMC fijo
  24,5) con las mismas funciones de `js/nutricion-planes.js` que ya usan
  Método y "Mi plan" — sin marcas numeradas ni animación de barrido.
- **Bug encontrado y corregido durante la verificación**: `.collage`
  tenía `width:970px;max-width:100%` (igual que en la maqueta suelta).
  Puesto dentro de `.conocenos-collage` (grid item con sizing
  automático), ese `width` fijo se filtraba al cálculo de tamaño
  intrínseco (`max-content`) de los contenedores padre — los navegadores
  ignoran el `max-width` en porcentaje durante ese cálculo — y producía
  overflow horizontal real en mobile (~190px, `scrollWidth` 582 vs
  `clientWidth` 390 a 390px de viewport), aunque las capturas a simple
  vista no lo dejaban tan claro (el contenido se veía "dentro" pero el
  layout de la página sí se corría). Se corrigió sacando el `width:970px`
  y dejando `width:100%` a secas. Detalle y advertencia para no repetir
  el error en `memoria.md`.
- **Archivo borrado**: `img/generadas-cutout/collage-redes-miplan.webp`
  (la imagen de IA, sin más usos en el repo tras este cambio).
- **Verificado con Playwright** en este entorno (Chromium disponible
  esta sesión) a 1440px y 390px: sin overflow horizontal
  (`document.documentElement.scrollWidth === clientWidth` en mobile tras
  el fix), sin imágenes rotas (los únicos 404 son scripts externos —
  Netlify Identity, Google Fonts — que ya fallan siempre en este entorno
  sin red), composición visualmente idéntica a la maqueta aprobada.
  `npm test` sigue en 75/76 (1 skip esperado, ver `memoria.md` → Tests).
- ⚠️ **Pendiente, no resuelto en esta sesión** (quedó en `memoria.md` →
  "Pendientes conocidos"): (a) los datos del collage (seguidores,
  correos, IMC, barras) siguen siendo los mismos de ejemplo de la
  maqueta — hay que poner reales o sacarlos antes de un deploy a
  producción; (b) a 390px de viewport el texto del collage renderiza a
  ~3.5–5px de fuente real (nítido pero prácticamente ilegible a simple
  vista) — se dejó así a propósito (mismo criterio que la imagen de IA
  que reemplaza, que tampoco se leía a ese tamaño, y una sesión anterior
  ya había decidido que este bloque se achica en vez de ocultarse en
  mobile), pero queda flagueado por si se pide mejorarlo; (c) falta la
  confirmación de siempre sobre un deploy real de Netlify.

## 2026-09-18 — Maqueta del collage de redes en HTML/CSS (aparte, NO integrada)

El usuario preguntó por qué el collage de `#lam-06` se veía con "esos
efectos" (texto deformado, caras pintadas, bordes sucios). Diagnóstico,
mirando el asset a resolución nativa: los defectos ya venían en
`img/generadas-cutout/collage-redes-miplan.webp` (imagen generada por IA:
texto ilegible tipo "Neuroalimenristion and brote cognitive", caras de
las miniaturas de TikTok con manchas blancas, recorte por distancia de
color con borde grisáceo/punteado) y al agrandarla (~970px sobre un
archivo de 1162px, más el escalado de Windows 125–150%) se notaban más.
Pidió que se armara el collage con código, **aparte y sin integrar**, para
verlo antes de decidir.

- **Archivo nuevo, único cambio**: `docs/mockup-collage-redes.html`. No
  se tocó `index.html` ni `css/styles.css`; el collage de IA sigue siendo
  el que está en el sitio. Misma convención que
  `docs/mockup-pdf-mi-plan.html` (documentación visual, no se carga
  desde ninguna página).
- **Contenido**: 4 piezas — perfil de TikTok (izquierda), teléfono con
  perfil de Instagram (centro), bandeja de correo con
  `hola@sinaptix.com` como título (derecha arriba) y ventana de navegador
  con el dashboard de "Mi plan" (derecha abajo). Sin caras: las portadas
  y la grilla usan las fotos y ilustraciones que ya están en `img/`
  (`imagenes-frutas/`, `generadas-cutout/`, `hero-cerebro-nutricion.webp`,
  `cerebro-mi-plan.webp`, `sinaptix-icon.png`).
- **Escala solo**: `.collage` es un container (`container-type:inline-size`)
  y todas las medidas salen de `--u` = 1/1000 del ancho
  (`calc(100cqw/1000)`), incluido el texto. Cambiar el ancho de `.collage`
  reescala todo sin media queries. La página trae botones para verlo a
  560 / 760 / 970 px / ancho completo. Verificado con Playwright a esos
  tamaños y a 390px de viewport: sin scroll horizontal y con ninguna pieza
  fuera de la caja a 560/970/1100px.
- **Medidor de IMC real**: se dibuja con las mismas funciones que Método y
  "Mi plan" (`imcGaugeAgujaDeg`, `imcGaugeMarkerPos`,
  `imcGaugeGradientDefsHtml`, `imcGaugeTrackHtml`), cargando
  `js/nutricion-planes.js`. Sin las marcas numeradas (a ese tamaño no se
  leen).
- ⚠️ **Datos de ejemplo inventados**: seguidores, publicaciones, vistas,
  remitentes/asuntos del correo, IMC 24,5 y las barras. Un sitio con
  métricas de redes falsas puede jugar en contra: poner las reales o
  sacarlas antes de integrar.
- **Gotcha encontrado**: `.imc-gauge` (`css/styles.css`) trae
  `max-width:220px` y `margin:0 auto -8px` en px reales. Dentro de un
  layout que escala con `--u` no escalan y el `-8px` subía la aguja sobre
  el número; se neutraliza solo dentro de `.mk-mini`.
- **Límite conocido**: por debajo de ~500px de ancho el texto más chico
  (9–10 unidades) choca con el tamaño mínimo de fuente del navegador y
  deja de escalar proporcionalmente; el layout no se rompe.

## 2026-09-18 — `#lam-06` Conócenos: collage reposicionado y reescalado (970px a 1567px)

Sesión de ajuste fino sobre el collage de redes, hecha en varios turnos
incrementales a partir de lo que el usuario veía en el navegador:
"mové la imagen un poco hacia la derecha" → "hacela más grande" → "más
grande" → "un poco a la izquierda" → "más a la izquierda" → "un poco más
pequeña" → "un poco hacia la derecha". Estado final: **`left:20px`** en
`.conocenos-collage` y **`--collage-bleed:clamp(0px,calc((100vw - 1180px)/2
+ 140px),340px)`** en `.conocenos-grid`.

- **Bug encontrado (importante para el futuro)**: el primer intento de
  desplazamiento se hizo con `transform:translateX()` en el wrapper y
  **no funcionaba**. `.conocenos-collage` lleva la clase `.reveal`, y
  `.reveal.in{transform:translateY(0)}` (especificidad 0,2,0) pisa
  cualquier `transform` declarado en `.conocenos-collage` (0,1,0): durante
  la animación de entrada se veía desplazado y, al terminar, la imagen
  volvía a su lugar. Se detectó esperando la animación completa y leyendo
  `getComputedStyle().transform` (`matrix(1,0,0,1,0,0)`) + `getBoundingClientRect()`.
  **Solución**: desplazar con `left` sobre el wrapper (ya es
  `position:relative`), que además no choca con la animación `float` de la
  `<img>`. Regla general: en esta sección no usar `transform` para
  posicionar, está tomado por `.reveal` (wrapper) y `float` (imagen).
- **Desplazamiento horizontal** (`css/styles.css`): `.conocenos-collage`
  pasa a llevar `left:20px` (arrancó en 80px, se bajó a 40, a 0, a −40, a
  −20 y volvió a 20px). En `≤900px` se anula (`left:0`) para no descentrar
  el collage en 1 columna.
- **Tamaño** (`css/styles.css`): `--collage-bleed` pasa de
  `clamp(0px,calc((100vw - 1180px)/2 + 30px),120px)` a
  `clamp(0px,calc((100vw - 1180px)/2 + 140px),340px)` — es decir, el
  collage crece (offset base +140px en vez de +30px) y el tope sube de
  120px a 340px. Durante la iteración se probaron topes de 200px y 460px;
  el usuario terminó pidiendo bajarlo, y el valor final es 340px.
  La grilla (`minmax(0,.8fr) minmax(0,1.2fr)`, `gap:40px`) **no se tocó**:
  se descartó agrandar la columna del collage porque `.contact-info` ya
  desborda su columna (ver más abajo) y se rompería el email grande.
- **Mediciones** (Chromium vía Playwright, `getBoundingClientRect()` del
  `.conocenos-collage-img`, ancho × alto):

  | Viewport | Antes de la sesión | Final |
  |---|---|---|
  | 1000px | 539px | 569px |
  | 1280px | 716px | 826px |
  | 1440px | 796px | 906px |
  | 1567px | 836px | **970px** (alto 588px) |
  | 1920px | 836px | 976px (tope del bleed) |

- **Corte por el borde derecho, aceptado explícitamente**: como el collage
  ya sangraba hasta el borde de la ventana, desplazarlo y agrandarlo hace
  que se salga de pantalla (88px a 1567px). Se midió y se le reportó al
  usuario (tabla de "fuera de pantalla" por ancho), que pidió seguir
  igual: *"no me des avisos solo sigue mis ordenes"*. Queda como decisión
  de diseño aceptada; si en el futuro se quiere "grande y completo", la
  vía es ensanchar la columna del collage en la grilla (y antes arreglar
  el desborde de `.contact-info`).
- **Efectos secundarios medidos y NO tocados** (preexistentes, no los
  introduce este patch): (a) en ventanas de ~1000px `.contact-info`
  desborda su columna **113px** (el `big-email` a 40px + su botón de
  copiar); con `left:-20px` eso se solapaba 26px con el collage — con el
  `left:20px` final quedan ~40px de hueco, sin solape; (b) el documento
  tiene ~200px de overflow horizontal por las `.deco` de la sección
  (`.deco-scribble`), presente desde antes de esta sesión.
- **Verificado en el navegador integrado de VS Code** (Live Server,
  `http://127.0.0.1:5500/`) con la página compartida: recargas forzadas
  sin caché, mediciones a 1000/1100/1280/1366/1440/1567/1920px y capturas
  de la sección. Falta la confirmación de siempre en un deploy real.
- `npm test`: 75 pass / 1 skipped (el e2e de Playwright del PDF, no
  instalado), 0 fail.

Actualiza memoria.md y changelog.md.

## 2026-09-18 — `#lam-06` Conócenos: collage mucho más grande, sin Facebook, tarjetas en columna

Pedido del usuario a partir de una captura de la sección (1600px):
"hacela mucho más grande, sacá la tarjeta de Facebook y que las tarjetas
estén en columna".

- **Collage más grande** (`css/styles.css`): `.conocenos-grid` pasa de
  `1fr .95fr` (~480px de collage en desktop) a `minmax(0,.8fr)
  minmax(0,1.2fr)` con `gap:40px` — ahora ~756px a 1440/1600px (~+55%),
  ~588px a 1100px, ~346px en mobile. Además `.conocenos-collage` sangra
  hacia la derecha fuera del padding de `.wrap` con
  `margin-right:calc(-1 * var(--collage-bleed))`, donde
  `--collage-bleed:clamp(0px,calc((100vw - 1180px)/2 + 30px),120px)`
  (0 cuando el viewport ya no tiene margen lateral, tope de 120px). Se
  hizo con margen negativo y NO con `transform:scale` porque la
  animación `float` de la imagen ya usa `transform`. En `≤900px` el
  collage queda centrado con `max-width:560px` (antes 520px).
- **Facebook fuera**: se borró la tarjeta del markup de `index.html` y la
  regla `.social-card-icon--facebook` de `css/styles.css` (cierra el
  pendiente que venía de la sesión anterior).
- **Tarjetas en columna**: `.social-cards` pasa de grilla 2x2 a
  `flex-direction:column` (`gap:12px`), y quedan 3 tarjetas: Instagram,
  TikTok, Teléfono. Como la tarjeta vertical vieja (ícono arriba, nombre,
  handle) quedaba muy alta y ancha a una sola columna, cada `.social-card`
  pasa a fila con `grid-template-areas` ("icon name" / "icon handle"):
  ícono a la izquierda (38px, antes 34px), nombre + handle apilados a la
  derecha. Se eliminó la media query de `≤480px` que ya no hace falta.
- **Verificado con Playwright** a 1600, 1440, 1100 y 390px: `scrollX` = 0
  en todos, 3 tarjetas, 0 íconos de Facebook, el collage no choca con las
  frutas de fondo (granada, kiwi, salmón). Falta confirmar en deploy real.

## 2026-09-18 — Collage de redes integrado en `#lam-06` "Conócenos", verificado con Playwright

Se retoma la sesión anterior (que había dejado listo el asset recortado
pero sin integrar) — el usuario pidió avanzar con la integración real en
el mismo turno.

- `index.html`: `.contact-info` (columna de texto/redes que ya existía) se
  envolvió junto a una nueva `.conocenos-collage` dentro de un contenedor
  `.conocenos-grid`, para pasar de 1 a 2 columnas en desktop. La nueva
  columna es una sola `<img>` apuntando a
  `img/generadas-cutout/collage-redes-miplan.webp` (el asset ya recortado
  en la sesión anterior), `alt=""` + `aria-hidden="true"` (decorativa/
  prueba social, el contacto accesible real sigue en `.social-cards`).
- `css/styles.css`: `.conocenos-grid{grid-template-columns:1fr .95fr}`,
  colapsa a 1 columna en `≤900px` (mismo breakpoint que `.hero-grid`/
  `.ben-grid`). A diferencia de las `.deco-fruit` de esta sección
  (decoración pura, ocultas en mobile), esta imagen se sigue mostrando en
  `≤900px`, solo se centra y achica (`max-width:520px`) — tiene valor de
  contenido, no es decoración de fondo. `.conocenos-collage-img` reusa
  `@keyframes float` del sitio + `drop-shadow`, respeta
  `prefers-reduced-motion`.
- **Novedad de entorno, importante para sesiones futuras**: esta sesión
  **sí tenía Chromium/Playwright disponible**
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), a diferencia de lo que
  asumían sesiones anteriores ("no hay browser en este entorno" aparece
  varias veces en pendientes viejos). Se pudo abrir `index.html` con
  `file://` directo (sitio estático) y sacar screenshots reales de
  `#lam-06` a 1440px y 390px — primera vez que se verifica esta sección
  visualmente en vez de "a ojo" leyendo el CSS. En ambos anchos: el
  collage no se superpone de forma problemática con las `deco-fruit` de
  fondo existentes (granada, kiwi, salmón), no hay overflow horizontal,
  y en mobile queda centrado debajo de las tarjetas de redes. Se agregó
  una nota en `memoria.md` → "Pendientes conocidos" pidiendo que
  cualquier sesión futura con pendientes de verificación visual
  **pruebe primero si Playwright está disponible** en vez de asumir que
  no (el entorno se resetea entre sesiones, así que puede o no estarlo).
- Sigue pendiente (sin tocar en esta sesión): decidir si se saca la
  tarjeta de Facebook de `.social-cards` — el usuario mencionó que
  "Facebook pidió que lo eliminemos" pero fue un comentario al pasar, no
  un pedido explícito.

## 2026-09-18 — Asset listo para collage de redes en `#lam-06` "Conócenos" (integración pendiente)

Sesión enfocada solo en preparar un asset de imagen, no en tocar código de
la web todavía — el usuario pidió explícitamente dejar el terreno listo
para que otra sesión haga la integración real.

- El usuario quiere sumar del lado derecho de "Conócenos" un collage tipo
  "app showcase" (capturas del perfil de SINAPTIX en Instagram, TikTok,
  Gmail y el dashboard "Mi plan", superpuestas con leve inclinación, estilo
  landing de SaaS). Se iteró varias rondas de prompts para Gemini
  (composición de 3 y luego 4 pantallas, ajuste de orden, intento fallido
  de edición puntual de una imagen ya generada — Gemini no pudo hacer
  ediciones parciales, hubo que regenerar la escena completa de nuevo cada
  vez —, y finalmente un fondo sólido morado `#4B2E45` en vez de las
  decoraciones de fondo, pedido a propósito para poder recortarlo).
- Con el resultado final del usuario, se hizo el recorte de fondo **en este
  entorno** (no con Gemini, que no genera transparencia): máscara por
  distancia de color en Python/Pillow/numpy contra el morado sólido de
  fondo (umbral suave 14→40 sobre la distancia RGB, sin IA de segmentación
  — alcanzaba por ser un fondo plano), recorte al bounding box del
  contenido no transparente, y export a webp lossy calidad 88 (mismo
  criterio que `hero-cerebro-nutricion.webp`).
- **Nuevo archivo**: `img/generadas-cutout/collage-redes-miplan.webp`
  (1162×705, fondo transparente, ~135 KB). Ver `memoria.md` →
  "Pendientes conocidos" para el detalle completo de qué contiene la
  imagen, los dos bordes cortados que se aceptaron a propósito (TikTok a
  la izquierda, ventana de "Mi plan" a la derecha — límite del render de
  Gemini, no del recorte de fondo), y qué falta decidir para integrarlo
  (layout de 2 columnas en `#lam-06`, comportamiento responsive/mobile,
  si lleva animación `float`).
- De paso, el usuario mencionó que "Facebook pidió que lo eliminemos"
  (la tarjeta de Facebook en `.social-cards` de esta misma sección) — no
  se tocó el código en esta sesión por ser un comentario al pasar, no un
  pedido explícito, pero queda anotado en `memoria.md` para preguntar
  cuando se retome esta sección.

## 2026-09-18 — Cierre `#lam-07`: el texto entra en los destellos, bloque ~15% más grande, flecha turquesa más gruesa

2ª pasada sobre la sección de cierre recién creada. Es la primera vez
que se puede **ver la sección renderizada** (browser disponible), así que
el usuario fue guiando el resultado a ojo, en pasos: subir el texto,
bajarlo, agrandarlo, subirlo otra vez, cambiar el color de una línea y
engrosar la flecha.

- **El bloque de texto sube en conjunto, los destellos no se mueven**
  (pedido explícito del usuario). Nueva variable local `--closing-lift` en
  `#lam-07`: `calc(.4 * min(620px,100%) / 1.9185)` = ~40% de la altura
  del deco, expresado como fracción de su **ancho** porque un `margin-top`
  en `%` resuelve contra el ancho del contenedor (así también escala solo
  en mobile). Se aplica como `margin-top` negativo al `.closing-title`,
  que al ser el primer elemento después de la decoración **arrastra
  título + botón + flecha + pie** hacia arriba, metiéndolos dentro del
  racimo de destellos. Se agregó `z-index` (deco `0`, título `1`) para
  que el texto quede por encima de los destellos. El número se ajustó dos
  veces a pedido del usuario (`.45` → `.38` → `.32` → `.4`).
- **Bloque ~15% más grande, uniforme**: `.closing-title-line1`
  `clamp(46px,6.4vw,76px)`→`clamp(60px,8.3vw,98px)` (con un extra de
  ~13% aparte, pedido solo para la palabra "Potencia"),
  `.closing-title-line2` `clamp(52px,7.6vw,92px)`→`clamp(60px,8.7vw,106px)`,
  flecha `26px`→`30px`, `.closing-sub` `15px`→`17px`. El botón se agranda
  con un override **local** `.closing-btn`
  (`font-size:16.5px;padding:17px 35px`) para no tocar el `.btn` global
  del sitio, que se usa en nav, hero y modales.
- **Color `#00CEB3`**: verde azulado **muestreado del dominante no-blanco
  de la imagen de referencia** que mandó el usuario (929×134, muestreo con
  `System.Drawing`). Se aplica solo a "tu claridad mental y enfoque" y a
  la flecha, vía la variable local `--closing-teal`. **No se tocó el
  `--green` global** (`#2E7D5B`), que usan otras secciones.
- **Flecha más robusta**: `stroke-width` del `<path>` en `index.html` de
  `2` a `3.25` (~4px efectivos sobre los 30px que ocupa el SVG), en dos
  pasos a pedido del usuario (`2` → `2.75` → `3.25`).

`npm test`: 75 pass / 1 skipped (el e2e de Playwright, mismo estado que
antes — el cambio es CSS/HTML de presentación, sin JS). Verificado con
browser en escritorio 1440px y móvil 390px, sin desborde horizontal; en
mobile la 2ª línea del título pasa a 3 líneas.

Actualiza memoria.md y changelog.md (el pendiente "sin browser para
verlo renderizado" de la entrada anterior queda resuelto, ver
"Pendientes conocidos" en `memoria.md`).

## 2026-09-18 — Conócenos + Cierre: nueva sección final con CTA al wizard, se saca el formulario de contacto

Segundo intento (el primero fue el panel `.contact-cta`, revertido, ver
entrada de abajo) para resolver que el usuario no quiere responder correos
manualmente: en vez de un panel dentro de Contacto, se creó una sección
nueva y propia al final del sitio, a partir de una imagen de referencia que
mandó el usuario (mini-hero de cierre centrado, con destellos decorativos,
título en 2 colores, botón sólido al wizard, flecha y texto chico).

- **`#lam-06` renombrada "Conócenos" (antes "Contacto")**: eyebrow y título
  actualizados, copy del párrafo reescrito. Se saca `<form id="formContacto">`
  completo (nombre/correo/mensaje + su envío por `mailto:` en
  `js/script.js`) — la sección queda solo con la franja de confianza, el
  email grande con botón de copiar, y las tarjetas de redes sociales.
  `.contact-wrap` (grid de 2 columnas) pasa a `.contact-info` (una sola
  columna, `max-width:640px`), ya no hace falta grid con una sola columna.
- **`#lam-07` (sección nueva) "Cierre"**: `svg/deco-sparkle-burst.svg`
  (destellos dorados + 2 corazones) como decoración — **calcado por visión
  por computadora** de la imagen de referencia del usuario (OpenCV:
  threshold + `findContours` + `approxPolyDP` + conversión Catmull-Rom→
  Bézier a los contornos reales, no dibujado a mano — un primer intento a
  mano no se pareció al original, se rehizo con este método). Título de 2
  líneas en `--font-hand`: "Potencia" en `--ink`, "tu claridad mental y
  enfoque" en `--green` y más grande. Botón `.btn.btn-solid` "Descubrir mi
  plan personalizado" (`#btnNutricionCierre`) con un segundo
  `addEventListener` en `js/script.js` que dispara exactamente lo mismo que
  `#btnNutricion` (`resetNutriWizard()` + `openModal('modalNutricion')`) —
  id propio porque no se puede repetir `#btnNutricion` en el documento.
  Flecha SVG hacia arriba en `--green` con rebote suave propio
  (`closing-arrow-bounce`). El `<footer>` del sitio se movió desde `#lam-06`
  a esta sección — ahora es el cierre real del `<body>`.
- El botón "Solicitar asesoría" del nav pasa de `href="#lam-06"` a
  `href="#lam-07"` (la intención es "empezar", tiene que llevar al wizard).
  El link "Contacto" del nav se deja igual, sigue apuntando a `#lam-06`
  (ahí vive el email/redes, sigue siendo correcto).

`npm test`: 75 pass / 1 skipped (el e2e de Playwright del PDF de "Mi plan",
se saltea porque Playwright no está instalado en este entorno — esperado,
no relacionado a este cambio). No hay suite de Playwright para `#lam-07`
todavía.

⚠️ Sin browser en este entorno para verlo renderizado — pendiente de
verificación visual real, ver "Pendientes conocidos" en `memoria.md`.

## 2026-09-18 — Contacto: CTA al wizard, implementado y revertido

Se implementó un panel `.contact-cta` arriba de `.contact-wrap` (botón para
abrir el wizard como acción principal, con el bloque de email/redes/
formulario pasado a alternativa secundaria atenuada), a pedido del usuario
de dejar de depender de responder correos manualmente. Se generó el patch,
el usuario lo vio y no le gustó, pidió sacarlo.

Revertido con `git revert` (commit `855efb5`, revierte `233b5c4`):
`index.html`/`css/styles.css`/`js/script.js` vuelven exactamente al estado
anterior (CTA propio afuera, sin envoltorio secundario en `.contact-wrap`,
ítem "Respondemos en menos de 24h" de vuelta, "Enviar mensaje" otra vez
`.btn-solid`).

El problema de fondo (evitar responder correos uno por uno) sigue sin
resolver — pendiente decidir con el usuario un enfoque distinto antes de
tocar Contacto de nuevo. Ver "Descartado" en `memoria.md`.

## 2026-09-18 — PDF de "Mi plan": paleta neutra (fuera el morado) y trazos más finos

El usuario revisó el PDF de la entrega anterior y marcó tres cosas: que se
veía "como estirado", que los gráficos estaban "muy gruesos", y que el
morado no funcionaba en ese documento — pidiendo explícitamente acercarse al
PDF de referencia que había mandado, "más limpio, profesional y ordenado".

### Paleta: se descarta el morado de marca

⚠️ **Decisión a no revertir sin que el usuario lo pida**: el PDF ya no usa
`--purple`/`--purple-dark`. En papel y en visores de PDF ese morado lee como
un lila apagado y le da al documento aire de folleto, no de informe. La
paleta del PDF pasa a ser neutra:

- Azul noche `#1A2542` — títulos de sección, nombre de marca, reglas.
- Azul acero `#3B6EA5` — rótulos y barras de acento.
- Grises pizarra (`#1F2937` / `#4B5563` / `#94A3B8` / `#CBD5E1`) — texto,
  escalas y bordes.

La marca sigue presente por el logo real y por el par tipográfico. **Esto es
una divergencia deliberada respecto de `css/styles.css`, no un descuido.**

También se estrena una **rampa semántica propia del PDF**
(`RAMPA` / `pdfColorPorcentaje`): rosa `#BE123C` → ámbar `#D97706` →
esmeralda `#059669`, para las barras de estado y las zonas del IMC. Antes
salían de `gaugeColorForPercent` (los terracotas del sitio), que sobre la
paleta neutra se veían embarrados. Es el mismo criterio —rojo/ámbar/verde
según el porcentaje— con otros tonos. Los 4 momentos del día tipo usan
ámbar / esmeralda / azul acero / gris pizarra, 4 tonos que también se
distinguen impresos en blanco y negro.

### "Muy gruesos": todo el trazo a dieta

- Barras de estado: 3,4 mm → **2,4 mm**; línea de meta de 0,4 → 0,3 mm;
  marca de "antes" de 0,5 → 0,35 mm.
- Barra de IMC: 3,6 mm → **2,4 mm**; puntero más chico.
- Anillo de la dona: grosor de 7,5 mm → **4,5 mm** (radios 16/11,5). Antes
  leía como un gráfico de torta pesado, no como un dato.
- Círculos del timeline: r=3,2 → **2,5 mm**; riel de 0,8 → 0,4 mm.
- Bordes de tarjetas y cajas: 0,3 → **0,25 mm**; radios de 2,5 → 1,5 mm.
- Las barras de acento de las cajas (objetivo, Priorizar/Moderar, ajustes,
  avisos) pasan de ser rectángulos redondeados despegados del borde a
  **filetes de 1 mm a sangre** contra el canto de la caja.
- La píldora de categoría del IMC pasa de relleno macizo a **contorno**: en
  un bloque tan chico el bloque de color se comía al número, que es el dato.

### "Estirado": densidad y jerarquía

- **Títulos de sección**: eran serif de 12,5 pt con el número dentro de un
  círculo relleno; ahora son **versalitas de 9 pt sobre una regla**, con el
  número como prefijo. Ese tratamiento competía con el encabezado y le daba
  al documento un aire inflado.
- Encabezado más compacto: marca de 19 → 16 pt, logo de 13 → 11,5 mm, y se
  saca el tramo dorado grueso de la regla (quedaba desbalanceado hacia un
  costado). Queda una sola regla fina en azul noche.
- Título del objetivo 16 → 13,5 pt; número del IMC 24 → 19 pt; chips con
  radio de 3,3 → 1 mm (píldoras redondas → etiquetas rectangulares).
- Interlínea de las barras 9,6 → 8,6 mm y paddings internos más ajustados.

El documento sigue saliendo en 2 páginas con el caso más cargado, con más
aire real al pie de la página 1.

### Verificación

Se rasterizó el PDF con `pdftoppm` y se revisaron las 2 páginas, además de
los casos límite (sin antropometría, con reevaluación, objetivo combinado en
4 planes). `docs/mockup-pdf-mi-plan.html` se actualizó a la paleta y a la
densidad nuevas para no quedar desincronizado. El test que comparaba el
color de las barras contra `gaugeColorForPercent` pasa a verificar la rampa
propia (extremos, punto medio y monotonía). Suite: **80 tests, 80 pass**.

### Archivos tocados

`js/mi-plan-pdf.js`, `docs/mockup-pdf-mi-plan.html`,
`tests/mi-plan-pdf.test.js`, `memoria.md`, `changelog.md`.

## 2026-09-18 — "Descargar mi plan en PDF": generación vectorial client-side con jsPDF

Se agrega un botón **"Descargar mi plan en PDF"** (`#btnDescargarPdf`) en la
tarjeta "Cierre" de `mi-plan.html`, que genera un documento A4 con el plan
completo, con el mismo aspecto que la referencia visual aprobada
(`docs/mockup-pdf-mi-plan.html`).

### Cómo se genera

100% en el navegador de quien hace click: no pasa por Netlify Functions, no
genera cargos y no depende del backend. **Nada de html2canvas ni captura de
pantalla**: el documento entero se dibuja con primitivas vectoriales de jsPDF
3.0.1 (texto, `rect`/`roundedRect`, líneas, `triangle`, y polígonos para los
sectores de la dona). Sale con texto seleccionable y buscable, nítido a
cualquier zoom, y pesa ~138 KB contra el ~1 MB que daría una captura.

jsPDF se carga por `<script>` desde cdnjs **recién al primer click** (lazy
load), así que la carga inicial de `mi-plan.html` no cambia en nada. La
versión va fijada (3.0.1, no `latest`) para que el test pueda servir el mismo
bundle local. El logo real (`img/sinaptix-icon.png`) se embebe con
`addImage()` tras un `fetch` + `FileReader`; si ese fetch falla (offline, 404)
el PDF igual se genera, con un nodo dibujado a mano como fallback.

### De dónde salen los datos

Del mismo plan resuelto que ya usa `nutriBuildResumenHTML`: las 3 claves de
`localStorage` (`sinaptix_objetivo`, `sinaptix_antropometria`,
`sinaptix_reevaluacion`) más las funciones puras de `js/nutricion-planes.js`
(`nutriResolverObjetivo`, `nutriConstruirAjustes`, `nutriConstruirAvisos`,
`gaugeComputeAreas`, `gaugeColorForPercent`, `imcCategoria`). No se creó
ninguna fuente de datos nueva. `nutriPdfModelo()` concentra toda esa
resolución en una función pura (sin DOM, red ni `localStorage`), y el dibujo
vive aparte — por eso se puede testear el contenido sin navegador.

### Bug encontrado en el camino: `const` no se cuelga de `window`

La primera versión buscaba las dependencias en `window` y el PDF salía vacío.
Causa: `nutricion-planes.js` declara `NUTRI_PLANES` con `const` en el tope de
un `<script>` clásico, y los `const`/`let` de nivel superior **no** quedan
como propiedades de `window` (a diferencia de las `function`, que sí). Se
resuelve por identificador léxico —visible entre scripts del mismo
documento— con `typeof` para que en Node no explote. Ver `depsPorDefecto()`.

### Estructura del documento

Encabezado con logo + "Preparado para {nombre}" + fecha → **panel destacado
de objetivo** (fondo lila, barra de acento morada, nombre del plan en
display + enfoque) → fila de 2 tarjetas: **barras de foco/memoria/energía/
calma con marca de meta** punteada (y marca del valor anterior si hubo
reevaluación) y **barra de IMC por zonas** con los umbrales OMS y puntero →
**estrategia nutricional** (chips de nutrientes clave + cajas Priorizar/
Moderar de alto igualado) → **día tipo: timeline numerado + gráfico de dona
con leyenda** → **ajustes** → **avisos** con color según nivel
(`alto`/`moderado`) → **panel legal** → pie con "Página X de Y".

Paginación propia: `ctx.espacio(h)` reserva alto y abre página nueva con un
encabezado compacto, y los títulos de sección reservan también el alto del
bloque que viene abajo, para que nunca quede un título colgado al pie de una
página con su contenido en la siguiente. Con el caso más cargado (6
prioridades, 6 ajustes, 5 avisos) el documento sale en 2 páginas.

### Decisiones tomadas en la sesión (sin consultar, por pedido explícito)

- **Tipografía: Times + Helvetica, no Fraunces + Inter.** jsPDF solo trae las
  14 fuentes estándar del formato PDF; embeber las reales como TTF base64
  sumaba ~300 KB solo para esta feature. Se conserva el par
  serif-display / sans-cuerpo del sitio. Paleta, jerarquía y layout sí son
  idénticos. Como esas fuentes usan WinAnsi, `pdfTextoSeguro()` normaliza los
  símbolos que no cubren (— → “ ” … ✓) y **desescapa** el HTML que
  `nutriConstruirAjustes` escapaba para `innerHTML` (si no, el texto libre de
  la encuesta se vería con `&amp;` literal en el PDF).
- **Meta de las barras: 80% fijo**, igual para las 4 áreas. No sale de la
  encuesta; va rotulada como sugerida en el propio documento.
- **Reparto de la dona: 30/10/35/25** (Desayuno/Snack/Almuerzo/Cena), también
  orientativo y rotulado como tal. Hay un test que falla si algún plan
  estrena un momento nuevo sin su entrada en `REPARTO`.
- **El botón va en su propia fila** dentro de `.miplan-cierre-btns`: la
  tarjeta "Cierre" es la columna angosta del grid y, compartiendo fila con
  "Generar mi plan", la etiqueta se partía en 3 renglones.
- **Sin SRI en el `<script>` de cdnjs**: no se pudo verificar desde el
  entorno de trabajo que el archivo del CDN sea byte a byte el de npm, y un
  hash equivocado rompe la feature en silencio. Queda anotado como pendiente.
- **`NUTRI_PLANES` pasa a exportarse** desde `js/nutricion-planes.js` (antes
  quedaba fuera a propósito) para que el test pueda comparar el modelo del
  PDF contra el contenido real de los planes. Su contenido sigue sin
  testearse: es dato editorial, no cálculo.

### El mockup de referencia

El HTML que mandó el usuario venía con una dirección distinta a la descrita
(anillos radiales y un bloque de QR, en vez del timeline + dona que pedía el
texto) y con varios detalles sin terminar. Se rehízo como
`docs/mockup-pdf-mi-plan.html`: misma paleta y tipografía del sitio, logo
real, y los bloques que efectivamente se construyeron. El QR de "verificación
digital" se descartó — no hay nada contra qué validar, era decorativo. Los
anillos radiales se reemplazaron por las barras con meta, que muestran el
mismo dato pero permiten marcar el objetivo y la comparación con la
reevaluación. Ese archivo es documentación: no se carga desde ninguna página
del sitio.

### Tests

- `tests/mi-plan-pdf.test.js` — 21 tests del modelo de datos. Comparan contra
  las funciones de `nutricion-planes.js` en vez de contra valores escritos a
  mano, para que el PDF no se quede atrás en silencio si esas cambian.
- `tests/mi-plan-pdf.e2e.test.mjs` — 4 subtests de Playwright con
  `netlifyIdentity` mockeado: el botón aparece con sesión + plan, no aparece
  sin plan, el click descarga `mi-plan-sinaptix.pdf`, y el contenido del PDF
  coincide con los datos del plan (se infla el buffer que devuelve jsPDF
  **antes** de la descarga con `zlib` y se leen los literales de texto, sin
  herramientas externas). También verifica el lazy load.
- Playwright y jsPDF **no** se agregaron a `package.json` (el sitio no tiene
  build step y Netlify los instalaría en cada deploy): si faltan, el e2e se
  saltea con un mensaje en vez de fallar.
- Suite completa: **80 tests, 80 pass**.

### Archivos tocados

- `js/mi-plan-pdf.js` (nuevo)
- `docs/mockup-pdf-mi-plan.html` (nuevo)
- `tests/mi-plan-pdf.test.js` (nuevo), `tests/mi-plan-pdf.e2e.test.mjs` (nuevo)
- `mi-plan.html` — botón + `<script>`
- `js/mi-plan.js` — muestra/oculta el botón desde `pintarMiPlan`
- `js/nutricion-planes.js` — exporta `NUTRI_PLANES`
- `css/styles.css` — estado `[disabled]` y fila propia del botón

### Pendiente

Verificar contra un deploy real que el `<script>` de cdnjs carga sin
problemas de CSP y cómo se ve el documento en visores reales
(Acrobat/Preview/Android), no solo rasterizado con `pdftoppm`. Ver
`memoria.md` → "Pendientes conocidos".

## 2026-09-18 — Imagen del Hero: PNG de 1.2 MB → WebP de 232 KB (carga lenta al entrar)

El usuario preguntó por qué la imagen grande del cerebro del Hero
tardaba bastante en cargar al entrar recién a la web. Causa encontrada:
`img/hero-cerebro-nutricion.png` era un PNG sin comprimir de 1.2 MB
(1024×1024 RGBA) — el archivo de imagen más pesado del sitio, cargando
además arriba del pliegue en la primera vista.

- Convertido a `img/hero-cerebro-nutricion.webp` (calidad 85, mismas
  dimensiones 1024×1024) → 232 KB, ~80% menos peso. Sin pérdida de
  calidad perceptible al tamaño real de render (~460px en pantalla,
  `.brain-art` es 82% de `.synapse-art{max-width:560px}`).
- Se borra el `.png` viejo (no tenía otras referencias en el repo).
- `index.html`: el `<img>` pasa a apuntar al `.webp`, suma
  `width="1024" height="1024"` (evita salto de layout mientras carga) y
  `fetchpriority="high"` (probable elemento LCP de la página — que el
  navegador la priorice sobre imágenes con `loading="lazy"` más abajo,
  como los íconos de Pilares).
- Tests (`npm test`, 54/54) siguen pasando (no toca ninguna función
  JS).

## 2026-09-18 — IMC: "obesidad" en vez de "rango a vigilar" (nombre real de la categoría)

Pedido del usuario: verificar que los valores/colores del medidor de
IMC fueran correctos y corregir el texto "a vigilar" por lo que
realmente es. Verificación: los umbrales (18.5/25/30) y los colores
(dorado/verde/dorado/rojo) ya eran correctos — el problema era solo el
texto de la 4ª categoría, que decía "rango a vigilar" por una decisión
de tono de una sesión anterior (documentada en el propio código).
Se cambia en todo el repo a "obesidad" (su nombre real):

- `imcCategoria()` (`js/nutricion-planes.js`): `zona`/`cat` pasan de
  `'vigilar'`/`'rango a vigilar'` a `'obesidad'`/`'obesidad'`.
- Todas las clases CSS con sufijo `-vigilar` renombradas a `-obesidad`
  (`.imc-zone-*`, `.imc-cat-*`, `.imc-dot-*`, `.imc-tier-*`,
  `.imc-gauge-marker-glow-*`) en `css/styles.css`, `js/script.js` y
  `mi-plan.html` (path del arco, leyenda "Obesidad" en vez de
  "A vigilar", insight de la pestaña "Mi IMC" de Método).
- `tests/nutricion-planes.test.js` y `ESTRUCTURA-DEL-CODIGO.txt`
  actualizados para que coincidan.
- Tests (`npm test`, 54/54) siguen pasando.

## 2026-09-18 — Medidor de IMC: segunda pasada estética (riel, marcas chicas, sombras, halo de color)

El usuario pidió mejorarlo más después de ver una captura del patch
anterior ("se sigue viendo simple"). Se agrega, sobre lo ya hecho:

- **Riel gris claro de fondo** detrás del arco de color
  (`.imc-gauge-track`, `imcGaugeTrackHtml()` en
  `js/nutricion-planes.js`) — un único `<path>` más ancho (22 vs 18) que
  el arco de color, con las 2 puntas redondeadas, da sensación de
  "ranura" en la que corre el arco en vez de que flote solo.
- **5 marcas chicas intermedias** sin número (17.5/22.5/27.5/32.5/37.5,
  `.imc-tick-minor`, `imcGaugeMinorTicksHtml()`) entre cada 2 marcas
  principales, para reforzar el look de instrumento real.
- **Sombra suave en la aguja** (`filter:drop-shadow`) para que se sienta
  levantada sobre el arco.
- **Pivote con look de "tuerca"**: antes un único círculo sólido
  (`.imc-pivote`), ahora un anillo claro por debajo
  (`.imc-pivote-outer`) + el punto oscuro encima.
- **Halo de color detrás del marcador** del valor exacto
  (`.imc-gauge-marker-glow` + modificadores `-bajo/-saludable/
  -sobrepeso/-vigilar`, mismos colores que `.imc-dot-*`/`.imc-cat-*`):
  da contexto de categoría al punto blanco sin tener que leer la
  etiqueta de abajo. Nuevo elemento `#miPlanImcMarcadorGlow` en
  `mi-plan.html`, actualizado en `pintarMiPlan()` (`js/mi-plan.js`,
  posición + clase de color) junto con el marcador existente; en
  `renderMethodImc()` (`js/script.js`) se arma directo con la clase de
  color ya resuelta (`info.zona`) porque ahí todo el SVG se regenera de
  cero en cada render.
- Tests (`npm test`, 54/54) siguen pasando.
- **Sin confirmar en navegador real** — mismo motivo que el patch
  anterior (no hay browser en este entorno). Ver "Pendientes conocidos"
  en `memoria.md`.

## 2026-09-18 — Medidor de IMC: escala numerada + puntas redondeadas

Pedido del usuario a partir de una captura: "mejorá el gráfico de IMC,
ponele números y rayitas, que se vea más estético". Cambios:

- **Nueva escala de referencia** alrededor del arco: 6 rayitas + números
  (15/20/25/30/35/40 — los extremos del rango del medidor + pasos de 5),
  `.imc-tick`/`.imc-tick-label` en `css/styles.css`. Geometría calculada
  por función nueva en `js/nutricion-planes.js`
  (`IMC_GAUGE_TICKS`/`imcGaugeTickPoint()`/`imcGaugeTicksHtml()`), no a
  mano — usa el mismo centro/radio (`imcGaugeAngulo`) que ya calculaba
  la posición de la aguja y el marcador, así la escala queda
  perfectamente alineada con el arco sin depender de números "a ojo". Es
  una escala fija (no depende del IMC de la persona), a diferencia de la
  aguja/marcador/degradado.
- `renderMethodImc` (`js/script.js`, pestaña "Mi IMC" de Método) llama a
  `imcGaugeTicksHtml()` para insertar la escala. `mi-plan.html` la tiene
  escrita a mano dentro del `<svg>` estático (mismo criterio que ya
  usaba el `<linearGradient>` de al lado — es HTML que el navegador
  parsea antes de que corra ningún JS).
- El `viewBox` del `<svg>` del medidor pasa de `"0 0 220 140"` a
  `"-10 -2 240 148"` en ambos lugares, para darle aire a los números "15"
  y "40" de los extremos (quedaban pegados/cortados contra el borde del
  lienzo original).
- **Puntas redondeadas** en los 2 tramos extremos del arco
  (`.imc-zone-bajo`/`.imc-zone-vigilar` → `stroke-linecap:round`,
  sobreescribiendo el `butt` general de `.imc-zone`) para un look más de
  velocímetro real — los 2 tramos intermedios siguen en `butt` a
  propósito, si llevaran `round` se verían costuras redondeadas donde un
  color de degradado se cruza con el siguiente.
- Tests (`npm test`, 54/54) siguen pasando — no se tocó ninguna función
  de cálculo existente, solo se agregaron funciones nuevas.
- **Sin confirmar en navegador real** — no hay browser instalado en este
  entorno para capturar ni correr Playwright. Ver "Pendientes conocidos"
  en `memoria.md`.
## 2026-09-18 — Frutas chicas de Beneficios: que se vean "saliendo" de la tarjeta, no como stickers sueltos

- El usuario mandó captura del resultado agrandado y dijo que no lo
  convencía; le pregunté qué exactamente (posición / frutas elegidas /
  se ven como stickers sueltos / sacarlo) y eligió: **se ven como
  stickers sueltos, no como que "salen" de la tarjeta**.
- Causa: el `filter:drop-shadow(...)` que trae `.deco-fruit` de fábrica
  (pensado para las frutas grandes que flotan solas en el fondo) crea
  una sombra propia alrededor de cada fruta chica, dando el efecto de
  "estampita flotando encima" en vez de "asomando desde atrás del
  vidrio". Se agregó `.ben-quote-fruit{filter:none}` para sacarles esa
  sombra.
- También tenían más superficie afuera de la tarjeta que adentro
  (~39% afuera), lo que no dejaba ver casi nada a través del vidrio.
  Se achicó el `top`/`right`/`bottom`/`left` a -14/-16px (antes
  -30/-34px) para que la mayoría quede detrás del `backdrop-filter` y
  solo la punta sobresalga.
- Se separó el contenedor único (`.ben-quotes`) en un `.quote-card-wrap`
  por tarjeta, así cada fruta se ancla a la esquina real de su propia
  tarjeta en vez de a un punto estimado (`top:48%`) del contenedor
  conjunto — ya no depende de adivinar la altura del texto. Quedó:
  arándanos arriba-derecha de la 1ª tarjeta, kiwi arriba-izquierda de
  la 2ª, almendras abajo-derecha de la 2ª.

## 2026-09-18 — Frutas chicas de Beneficios más grandes (quedaron muy chicas)

- El usuario mandó captura del resultado del patch anterior (arándanos/
  kiwi/almendras) señalando que quedaron muy pequeñas.
- Se agrandaron los 3 (`index.html`, dentro de `.ben-quotes`): arándanos
  48px→88px, kiwi 42px→78px, almendras 52px→92px. Se ajustó también el
  offset negativo (`top`/`right`/`bottom`/`left`) proporcional al nuevo
  tamaño para que sigan asomando por el borde de la tarjeta en la misma
  proporción, no solo más grandes en el mismo punto.

## 2026-09-18 — Tarjetas de testimonios de Beneficios con efecto "vidrio esmerilado"

- El usuario mandó una captura de referencia de otro sitio con las
  tarjetas de comentarios semi-transparentes sobre fruta ilustrada de
  fondo, preguntando si algo así se podía aplicar a "Para quién es"
  (`#lam-05`).
- En vez de transparencia total (que hacía perder legibilidad del texto
  con la remolacha/naranja/chocolate/granada de fondo), se aplicó
  `background:rgba(255,255,255,.55)` + `backdrop-filter:blur(10px)`
  (con `-webkit-backdrop-filter` y fallback a fondo sólido `var(--paper)`
  vía `@supports not` para navegadores sin soporte) en `.quote-card`
  (`css/styles.css`). Las frutas se ven difuminadas detrás de las 2
  tarjetas, sin tocar su tamaño/posición/opacidad.
- Ajuste siguiente, mismo pedido: se agregaron 3 frutas chicas
  "saliendo" de las tarjetas para que se note más el efecto vidrio —
  arándanos arriba de la 1ª, kiwi en la costura entre ambas, almendras
  abajo de la 2ª (`index.html`, dentro de `.reveal.d2` → renombrado
  `.ben-quotes` con `position:relative`). Cada fruta va antes de su
  tarjeta en el HTML para quedar detrás por orden de stacking (mismo
  patrón `deco`/`deco-fruit` sin z-index propio que usa el resto del
  sitio) — no hay navegador real en este entorno para confirmar el
  resultado final, la posición de la del medio (kiwi, `top:48%`) es una
  estimación ya que la altura real de las tarjetas depende del texto.

## 2026-09-18 — Íconos de redes con color de marca, tarjetas de Pilares más compactas, fundido entre Pilares y Beneficios

Pedido puntual del usuario a partir de una captura del sitio en vivo:

- **Íconos de redes sociales con su color de marca** (`.social-card-icon`
  en Contacto, `#lam-06`): antes las 4 tarjetas (Instagram, Facebook,
  TikTok, Teléfono) usaban el mismo círculo `--panel-2`/ícono `--purple`
  del sitio. Ahora Instagram lleva el degradado oficial de la marca
  (amarillo→naranja→magenta→violeta→azul), Facebook el azul `#1877F2` y
  TikTok negro (`#010101`), los 3 con ícono blanco encima
  (`.social-card-icon--instagram/--facebook/--tiktok`, nuevas clases
  modificadoras sumadas al `<span>` en `index.html`). Teléfono queda sin
  cambios (no es una red social, no tiene "color oficial" que aplicar).
- **Tarjetas de Pilares (`.pillar`, `#lam-04`) más compactas**: el usuario
  las vio "demasiado grandes y en blanco, como vacías". Se bajó
  `min-height` de 250px a 198px, el padding de 34px a 28px verticales y
  el gap interno de 16px a 14px. Para que la parte de arriba no dependa
  solo del blanco de fondo, cada ícono (antes suelto, 56px) ahora vive
  dentro de un círculo con tinte `--panel-2` (`.pillar-icon-circle`,
  60px) con el ícono más chico adentro (32px) — mismo lenguaje visual que
  ya usan `.social-card-icon`/`.quote-avatar` en otras secciones, no es
  un patrón nuevo.
- **Corte duro entre Pilares y Beneficios** (`#lam-04`→`#lam-05`): el
  usuario señaló una "raya fea" en el cambio de color (blanco→lavanda).
  Es el mismo problema ya resuelto en `#lam-03`, documentado ahí: fondo
  sólido de `section.dark` contra un vecino blanco corta en seco. Se
  aplicó el mismo fix a `#lam-05`: se pisa `background` con un
  `linear-gradient` que arranca en `--paper` y funde a `--panel` en los
  primeros 180px. No hizo falta fundir también el borde inferior de
  `#lam-05` (a diferencia de `#lam-03`, que está rodeada de blanco por
  los dos lados): el vecino de abajo es `#lam-06` (Contacto), que también
  es `section.dark`/`--panel`, mismo color, sin corte que disimular ahí.
- `npm test` corrido antes del patch (54/54 OK) — este cambio es solo
  CSS/HTML, no toca las funciones que cubren los tests, se corrió por la
  regla de "ante la duda, documentar/verificar".
- **Sin verificar en navegador real ni con Playwright** (no hay browser
  instalado en este entorno y no hay acceso de red a los dominios que
  necesitaría para instalarlo) — pendiente que el usuario confirme cómo
  se ve el degradado de Instagram, el tamaño nuevo de las tarjetas de
  Pilares y el fundido de color antes de dar la sesión por buena.

## 2026-09-18 — Contacto: franja de confianza, botón copiar correo y redes como tarjetas

Rediseño de `#lam-06` (Contacto), a partir de una lluvia de ideas
propuesta al usuario (5 opciones) de la que se combinaron 3:

- **Franja de confianza** (`.contact-trust`): 2 ítems cortos con ícono
  ("Respondemos en menos de 24h", "Primera consulta sin costo") arriba
  del email, en `--purple`.
- **Botón "copiar correo"** (`.copy-email-btn`, junto a `.big-email`):
  círculo con ícono de copiar; usa `navigator.clipboard.writeText` (con
  fallback si no está disponible) y muestra un tooltip "Copiado ✓" vía
  `::after` + clase `.is-copied` (handler en `js/script.js`, ~1.6s).
- **Redes sociales como tarjetas** (`.social-cards`/`.social-card`,
  grid 2x2, 1 columna en mobile ≤480px): reemplaza la lista de filas
  anterior (`.social-list`/`.social-row`, eliminada). Cada tarjeta tiene
  ícono en círculo (`.social-card-icon`, mismo tratamiento que
  `.quote-avatar`/íconos de Beneficios), nombre en negrita y
  handle/dato con flecha. Mismos 4 links/íconos de antes (Instagram,
  Facebook, TikTok, Teléfono), sin cambios de contenido.
- El formulario (`.contact-form`) y su lógica de envío por `mailto:` no
  cambiaron.
- Verificado con Playwright en 1440px y 390px, incluido el click real
  del botón de copiar (aparece el tooltip).

## 2026-09-17 (quinta tanda) — Beneficios: "Para quién es" vuelve a ser lista + calificación real en testimonios

Dos ajustes a pedido del usuario sobre el rediseño de la tanda anterior:

- **"Para quién es"**: el grid 2x2 (`.ben-audience-grid`) vuelve a ser una
  lista vertical de 1 columna (ícono a la izquierda + texto a la derecha,
  en fila), sin perder los 4 íconos de línea nuevos. Mismo HTML, solo
  cambió el CSS de `.ben-audience-grid`/`.ben-audience-item` (de grid a
  flex column / flex row).
- **`.quote-stars`**: ahora reflejan una calificación real en vez de estar
  todas outline. Se agregó `.quote-stars svg.is-filled{fill:var(--gold)}`
  y se marcó la clase en el HTML: testimonio de M.R. con 4/5 estrellas,
  testimonio de J.S. con 5/5.
- Verificado con Playwright en 1440px y 390px.

## 2026-09-17 (cuarta tanda) — Beneficios: rediseño de "Para quién es" y de las tarjetas de testimonio

Rediseño visual de `#lam-05` (Beneficios) a pedido del usuario, a partir de
una captura de referencia:

- **"Para quién es"**: los 4 ítems dejaron de ser una lista con checkmarks
  (`.ben-list`) y pasan a un grid 2x2 (`.ben-audience-grid` /
  `.ben-audience-item`), cada uno con ícono de línea propio arriba del
  texto. Se crearon 4 SVG nuevos (no existía nada con ese estilo en el
  repo): `svg/icon-maletin.svg`, `svg/icon-graduacion.svg`,
  `svg/icon-equipo.svg`, `svg/icon-reloj-fatiga.svg` (stroke
  `currentColor`, mismo trazo que los checks que reemplazan).
- **`.quote-card`**: rediseño completo. Ahora tiene: fila superior con 5
  estrellas outline (`.quote-stars`, SVG inline) + badge "Verified Client"
  con ícono de escudo-check (`.quote-verified`); el texto de la cita ya no
  va en cursiva ni con comillas propias; abajo, avatar circular con
  iniciales (`.quote-avatar`) + nombre en negrita y rol en línea aparte
  (`.quote-card-author` / `.quote-author-info`, reemplaza el `<cite>`
  anterior); comilla grande decorativa de fondo (`.quote-mark`, glyph
  `&rdquo;` en Georgia, color `--panel-2`, esquina inferior derecha,
  `overflow:hidden` en la card para recortarla).
- El fondo de la sección no cambió: `section.dark` ya usaba `--panel`
  (lavanda claro), que coincidía con la referencia.
- Verificado con Playwright en 1440px y 390px antes de mostrar captura al
  usuario y recibir confirmación.

## 2026-09-17 (tercera tanda) — Pilares: recortar más la granada del cluster junto al título

Commit: ver hash en el archivo `.patch` generado para esta tanda.

El usuario pidió, sobre el cluster agregado en la tanda anterior, correr
las 3 decoraciones (granada, hoja, naranja) más hacia la derecha para
que la granada se vea "menos de la mitad" en vez de casi completa.

- Se restó 80px al `right` de los 3 elementos del cluster en `#lam-04`
  (granada `-30px→-110px`, hoja `150px→70px`, naranja `30px→-50px`),
  moviendo el grupo entero hacia el borde derecho sin cambiar tamaños,
  opacidades ni el orden vertical entre ellos.
- Con `width:180px` y `right:-110px`, la granada queda con ~70px
  visibles dentro de `.wrap` (≈39%), cumple el pedido de "menos de la
  mitad".
- Verificado con Playwright real, desktop 1440px: la granada se ve
  claramente recortada, la naranja también queda parcialmente cortada
  por el mismo corrimiento (antes estaba completa) — no reportado como
  problema, mismo criterio de "bleed" que el resto del sitio, revisar si
  el usuario lo nota. Mobile no se vuelve a verificar (esta sección se
  sigue ocultando entera por la regla general de `.deco-fruit` en
  `<720px`, sin cambios ahí).
- Sin cambios de CSS/JS, solo los 3 atributos `style` de `index.html`.
- Actualizados `memoria.md` y este archivo.

## 2026-09-17 (segunda tanda) — Pilares: frutas/alimentos grandes difuminados de fondo + cluster con naranja junto al título

Commit: ver hash en el archivo `.patch` generado para esta tanda.

A pedido del usuario ("difuminar frutas grandes de fondo" en `#lam-04`,
que solo tenía 1 `.deco-fruit` suelto):

- Se agregaron 4 `.deco-fruit` grandes (150–230px) en las 4 esquinas del
  `<section>`, con opacidad baja (.4–.5) para que se lean como fondo
  difuminado: aguacate (ya existía, se le bajó la opacidad y se agrandó
  un poco), granada, huevo y té — estos 3 últimos son fotos reales de
  `img/generadas-cutout/` ya usadas en otras secciones (Beneficios,
  Contacto), mismo criterio visual.
- El usuario pidió, con una imagen de referencia, que la parte derecha
  del título tuviera además un cluster de elementos más nítidos
  (opacidad .6–.9, no difuminados) terminando en una naranja. Se agregó
  una hoja fina (`svg/deco-leaf-beneficios.svg`) y una naranja
  (`svg/deco-blob-orange.svg`, ya traía su propio halo suave detrás —
  mismo efecto que la referencia sin CSS nuevo) junto a la granada de la
  esquina superior derecha.
- Verificado con Playwright real (Chromium sí pudo levantar en esta
  sesión) en desktop 1440px: las 6 decoraciones se ven en su lugar, sin
  tapar el título/texto/tarjetas (`z-index:0` de `.deco` vs. `z-index:1`
  de `.wrap`), y en mobile 390px se ocultan todas por la regla general
  `@media(max-width:720px){.deco-fruit{display:none}}`, sin romper el
  layout apilado de las 4 tarjetas. Capturas mostradas al usuario y
  confirmadas antes de generar el patch.
- No se tocó CSS ni JS, solo los 6 `<img class="deco deco-fruit">` de
  `index.html` dentro de `#lam-04`.
- Actualizados `memoria.md` y este archivo.

## 2026-09-17 — re-archivado de memoria.md y changelog.md

Commit: ver hash en el archivo `.patch` generado para esta tanda.

`memoria.md` había vuelto a crecer a ~2060 líneas y `changelog.md` a
~3400 (el umbral que motivó el archivado anterior del 14/09 había sido
~2200/~1960). Se repitió el mismo patrón:

- Copia completa de `memoria.md` → `historico/memoria-2026-09-17.md`.
- Copia completa de `changelog.md` → `historico/changelog-2026-09-17.md`.
- `memoria.md` reescrito condensado: mismas secciones fijas (Ramas,
  Autoría, Flujo de trabajo, Reglas, Producto, Estructura de archivos,
  Tests) sin cambios de fondo, y "Estado actual del diseño" +
  "Pendientes conocidos" resumidos a los hechos vigentes (sin la
  historia de qué se probó/descartó en cada tanda, que queda en el
  histórico).
- `changelog.md` reiniciado con esta única entrada.
- Sección "Histórico" de `memoria.md` actualizada para apuntar también a
  los archivos del 17/09.

No se tocó ningún archivo de producto (`index.html`, `css/styles.css`,
`js/*`, `netlify/*`) en este patch.
