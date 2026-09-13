# Changelog

Historial de cambios de este repo, un patch por entrada, orden cronológico
inverso (lo más nuevo arriba). No se borran entradas viejas. Ver
`memoria.md` para el estado actual del proyecto y las reglas de este
archivo.

## 2026-09-12 — Trazos de marcador: rectos en vez de ondulados (corrección de forma)

- El usuario manda su captura de referencia otra vez junto con la del
  sitio, señalando que el trazo tiene que quedar "tal cual" la referencia
  y pide explícitamente que no sea "tembleсoso" (con varias ondas/curvas)
  como venía saliendo.
- Se cambia el `path` de `svg/deco-scribble.svg` de una curva con tres
  segmentos en "C" (varias jorobas, efecto garabato) a una sola curva
  Bézier cuadrática `M8,17 Q200,9 392,13`: prácticamente una línea recta
  con una leve inclinación, igual a como se ven los trazos en la
  referencia de odoo.com.
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
  referencia de odoo.com.
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

- El usuario pide recuperar el look de rayones de fondo tipo odoo.com,
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

- Se habían probado trazos tipo "marcador" estilo odoo.com en dos
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
