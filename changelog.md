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
