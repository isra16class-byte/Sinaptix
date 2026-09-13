# Changelog

Historial de cambios de este repo, un patch por entrada, orden cronológico
inverso (lo más nuevo arriba). No se borran entradas viejas. Ver
`memoria.md` para el estado actual del proyecto y las reglas de este
archivo.

## 2026-09-12 — Corrección de los trazos tipo marcador (finos, en pareja, anclados)

- El usuario prueba el patch anterior en el navegador y reporta que "no
  quedó bien": en el Hero un trazo quedaba flotando solo, sin nada cerca
  (el Hero es `100vh` con el contenido centrado por flex, así que un
  `%` de posición no cae junto a ningún elemento real como sí pasa en las
  demás secciones), y en general los trazos se veían gruesos/redondeados
  tipo "mancha" en vez de finos como en odoo.com.
- Se rehace `svg/deco-mark.svg` más fino (`stroke-width` de 9 a 5, menos
  amplitud de onda) y se crea `svg/deco-mark-sm.svg`, una versión corta
  para usar en pareja (un trazo largo + uno corto, como hace odoo.com).
- Se reposicionan **todos** los trazos de las 6 secciones en parejas,
  pegados a un punto de contenido real (eyebrow, título, botones, pie del
  hero) — se elimina el trazo huérfano del Hero y se reemplaza por un
  trazo corto anclado a la leyenda del pie del hero.
- Se adelgaza también `svg/deco-underline.svg` (`stroke-width` de 14 a
  11) para que combine mejor con los trazos más finos.
- Archivos tocados: `index.html`, `svg/deco-mark.svg`,
  `svg/deco-underline.svg`, `svg/deco-mark-sm.svg` (nuevo), `memoria.md`,
  `changelog.md`.

## 2026-09-12 — Trazos tipo marcador inspirados en odoo.com (verde de marca)

- El usuario muestra una captura de odoo.com con trazos hechos a mano
  (rayas sueltas + subrayado ondulado bajo una palabra del título) y pide
  replicar ese recurso. Se define con el usuario: color **verde**
  (`#2E7D5B`) y aplicación **en todo el sitio, densidad similar a Odoo**.
- Se crean 2 SVG nuevos, ambos en `#2E7D5B`:
  - `svg/deco-mark.svg`: trazo suelto ondulado (acento de fondo).
  - `svg/deco-underline.svg`: subrayado ondulado más grueso, pensado para
    ir debajo de una palabra.
- Se agrega clase `.deco-mark` en `css/styles.css` (mismo patrón que
  `.deco-fruit`: oculta en móvil bajo `max-width:720px`, pero sin
  animación de flotación) y se colocan 1–2 `<img class="deco deco-mark">`
  por sección (Hero, Visión, Método, Pilares, Beneficios, Contacto).
- Se agrega clase `.title-mark` (`position:relative` + `::after` con
  `background:url('../svg/deco-underline.svg')`) y se envuelve una
  palabra clave por título de sección: "claridad" (Hero), "alimenta"
  (Visión), "cuatro fases" (Método), "trabajo" (Pilares), "carga alta"
  (Beneficios), "asesoría" (Contacto).
- **Fix de paso**: se corrige `.hero h1 em`, que tenía `font-style:normal`
  heredado de antes del cambio a Fraunces — por eso "claridad" nunca se
  veía en itálica pese a que la memoria ya lo daba por hecho. Ahora es
  `font-style:italic` de verdad.
- Archivos tocados: `index.html`, `css/styles.css`, `memoria.md`,
  `changelog.md`, `svg/deco-mark.svg` (nuevo), `svg/deco-underline.svg`
  (nuevo).

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

## 2026-09-12 — Blobs con frutas detrás de los títulos (más "vida" tipo odoo.com)

- Se agregan 4 ilustraciones nuevas (`svg/deco-blob-berries.svg`,
  `svg/deco-blob-avocado.svg`, `svg/deco-blob-orange.svg`,
  `svg/deco-blob-walnut.svg`): un blob tipo brochazo en color de marca con
  una fruta/fruto seco flat-illustration encima (arándanos, aguacate,
  naranja, nuez), buscando un look más vivo y menos corporativo, en línea
  con el estilo ilustrado de odoo.com.
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
  (le faltan el rediseño Odoo y la creación de memoria/changelog) y que la
  sincronización `git push origin main:master` es un paso manual del
  usuario, no algo que requiera un patch.

## Sesión anterior — Memoria y changelog

- Se crean `memoria.md` y `changelog.md` para que futuras sesiones retomen
  el trabajo sin contexto adicional.
- Se documenta el flujo de trabajo fijo: entrega de parches `git am`,
  autoría `isra16class-byte <isra16class@gmail.com>`, actualización
  obligatoria de estos dos archivos en cada patch.

## 2026-09-12 — Rediseño visual al estilo Odoo (`afec65e`)

- Se adapta todo el sistema visual del sitio al look de
  `https://www.odoo.com/es`: paleta clara con morado de marca (`#714B67`),
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
