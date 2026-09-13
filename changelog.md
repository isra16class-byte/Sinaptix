# Changelog

Historial de cambios de este repo, un patch por entrada, orden cronológico
inverso (lo más nuevo arriba). No se borran entradas viejas. Ver
`memoria.md` para el estado actual del proyecto y las reglas de este
archivo.

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
