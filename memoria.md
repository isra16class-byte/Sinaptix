# Memoria del proyecto — SINAPTIX

> Este archivo existe para que **cualquier sesión nueva** (de Claude o de
> quien sea) pueda retomar el trabajo en este repo sin que el usuario tenga
> que volver a explicar el contexto. Léelo completo antes de tocar código.
> Actualízalo en cada patch que generes (ver "Reglas de esta memoria" al
> final).

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
   `https://github.com/isra16class-byte/Sinaptix.git`.
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
   git push origin main   # o master, ver nota de ramas en README.md
   ```
7. Nunca se le pide al usuario que pegue código a mano ni que copie/pegue
   diffs: siempre se entrega el `.patch` descargable.

## Reglas de esta memoria (obligatorio en cada patch)

- **`memoria.md`** (este archivo): actualizar la sección "Estado actual del
  diseño / producto" cada vez que cambie algo estructural (paleta, stack,
  secciones, integraciones, decisiones de arquitectura). Es el "estado
  presente", no un historial — se reescribe, no se acumula.
- **`changelog.md`**: cada patch agrega **una entrada nueva arriba del
  todo** (orden cronológico inverso) con: fecha de la sesión, resumen corto
  del cambio, y el hash del commit una vez generado el patch (si se conoce).
  Es el "historial", ahí sí se acumula y no se borra nada viejo.
- Si un patch no cambia memoria/changelog, revisar si realmente no hacía
  falta (cambios triviales tipo un typo pueden no requerirlo, pero ante la
  duda, documentar).

## Estado actual del diseño / producto

**Producto**: SINAPTIX, landing de una sola página para un servicio de
asesoría en neuroalimentación (nutrición para rendimiento cognitivo). Sitio
100% estático (HTML/CSS/JS sin build step), desplegado en Netlify. Ver
`README.md` para detalle de funcionalidad (formularios, login con Netlify
Identity, sección "Mi plan", limitación de `localStorage`, próximos pasos de
backend).

**Estilo visual (vigente desde el rediseño visual del sitio)**: el sitio se
rediseñó a partir de una referencia visual clara y editorial. Antes tenía un
tema oscuro/navy con tipografía editorial (Space Grotesk + IBM Plex Mono).
Ahora:

- **Paleta** (definida en `css/styles.css`, bloque `:root`): fondo blanco
  (`--paper:#FFFFFF`) / lavanda muy claro para secciones alternadas
  (`--panel:#F7F1F5`), morado de marca `--purple:#714B67` (y
  `--purple-dark:#4B2E45`) como color estructural principal (botones, nav,
  eyebrows, iconos), más acentos secundarios: verde `--green:#2E7D5B`,
  terracota `--gold:#C1703B`, azul `--navy-bright:#3B6EA5`. Texto en
  `--ink:#26161F` y variantes con opacidad.
- **Tipografía**: `Inter` (Google Fonts) en cuerpo de texto, navegación,
  eyebrows y elementos de UI (`--font-b` / `--font-m`). Los títulos y
  elementos de display (`h1`, `h2`, `h3`, marca del nav, números de
  stat-box, valor de "Mi plan") usan `Fraunces` en peso 800, normal e
  itálica (`--font-d`), elegida para dar un aire editorial/cálido que
  conecte con lo nutricional sin perder seriedad — incluye el `<em>` de
  "con *claridad*" en el H1 del Hero, que queda en Fraunces itálica. Sin
  mayúsculas ni tracking tipo monoespaciado en los eyebrows.
- **Componentes**: botones tipo píldora (`border-radius: 999px`), tarjetas
  redondeadas con sombra suave (`--radius`, `--shadow`, `--shadow-lg`) para
  stats, pilares nutricionales y testimonios, nav fijo blanco con blur y una
  barra de progreso de scroll (`.nav-progress`) que reemplazó al "rail"
  lateral (hilo sináptico) que existía antes — ese rail se eliminó de HTML,
  CSS y JS.
- El contenido/copy en español **no cambió**, solo el sistema visual.
- Los SVG decorativos (`svg/*.svg`) y el ícono del hero se recolorearon para
  funcionar sobre fondo claro (antes estaban pensados para fondo oscuro).
- **Trazos tipo "marcador" de fondo (recuperados, versión distinta a la
  revertida — ajustados dos veces tras feedback)**: hay un
  `svg/deco-scribble.svg` — un único trazo tipo marcador (`stroke:#EDA23A`,
  `stroke-width:11`) que se reutiliza como `<img>` varias veces por
  sección con distinto tamaño (150–340px), rotación y posición (clase
  `.deco-scribble`, opacidad base `.85` en `css/styles.css`), siguiendo el
  mismo patrón `.deco` (position:absolute, z-index:0, detrás del `.wrap`)
  que ya usan los blobs de fruta. **Forma del trazo (2do ajuste)**: la
  referencia visual que dio el usuario usa líneas prácticamente
  rectas con una sola curva suave, no un garabato ondulado con varias
  jorobas — el primer path (`C ... C ... C ...`, tres curvas) se veía
  "tembleque" y el usuario lo rechazó explícitamente ("no se los hagas
  temblecosos"). El path actual es una sola curva Bézier cuadrática
  (`M8,17 Q200,9 392,13`), casi recta con una leve inclinación, que es la
  que hay que seguir usando como base para este elemento — no volver a un
  path con múltiples curvas/ondas. A diferencia del intento anterior que sí
  se revirtió (ver `changelog.md`, "Revertidos los trazos tipo marcador"),
  **no** envuelve palabras dentro de títulos ni toca ningún `h2`/`span` —
  son solo rayones de fondo sueltos, sin relación con el texto. Se ocultan
  en móvil (`max-width:720px`) igual que `.deco-fruit`. Distribución: 6 en
  el Hero (clúster arriba-derecha + acentos sueltos) y 2 por cada una de
  las otras 5 secciones (`lam-02` a `lam-06`), reposicionados para no
  quedar detrás de tarjetas opacas ni cruzar texto.
  - **Verificación visual**: en este entorno hay Chromium + Playwright
    instalados; antes de entregar un patch de este tipo (decoración visual
    de fondo/tamaños/posiciones/forma de un trazo) conviene levantar un
    servidor local (`python3 -m http.server` sobre el repo) y tomar
    capturas con Playwright para confirmar cómo se ve realmente, en vez de
    asumir por el código.
- **Capa de "vida" ilustrada (sesión posterior al rediseño visual)**: hay 6
  ilustraciones en `svg/deco-blob-*.svg` — un blob suave en color de marca
  (opacity baja) con una fruta/fruto seco flat-illustration encima
  (arándanos, aguacate, naranja, nuez, almendras, kiwi). Clase CSS
  `.deco-fruit` (en `css/styles.css`) les da flotación suave
  (`animation:float`, reusa el keyframe del hero) con distintos
  `animation-delay` (`.d2`, `.d3`) para que no floten sincronizadas, y se
  ocultan en móvil (`max-width:720px`) para no saturar el layout angosto.
  Siguen el mismo patrón que los `.deco` existentes: hijos directos de la
  `<section>`, `position:absolute`, `z-index:0`, por lo que quedan detrás
  del `.wrap` (que tiene `z-index:1`).
  - **Posicionamiento** (ajustado siguiendo patrón de lectura en Z de
    landing pages — ver `changelog.md` sesión "posiciones estratégicas"):
    nuez cerca del botón "Solicitar asesoría" del Hero, arándanos chico
    arriba-derecha del Hero (framing), arándanos grande junto al título de
    Visión + arándanos mini junto al stat-grid, almendras junto a los
    botones CTA de Método, aguacate junto al título de Pilares, naranja
    junto a las tarjetas de testimonios en Beneficios, kiwi junto al
    formulario de contacto (CTA final). La idea es que cada fruta viva
    cerca de un punto de atención real (título, CTA, dato clave), no solo
    decorativa al azar.
  - **Nivel de acabado**: los 6 SVG usan degradados (`linearGradient` /
    `radialGradient`) en vez de rellenos planos, y una sombra de apoyo
    (`ellipse` semitransparente) debajo de cada fruta para que no se vean
    "pegadas" sino con volumen. La nuez en particular tiene un contorno
    lobulado (no un óvalo liso) para que se lea de inmediato como nuez —
    el usuario reportó que la primera versión (óvalo tostado simple) no se
    reconocía como fruta/fruto seco.

**Estructura de archivos** (sin cambios respecto al README): `index.html`
(todo el markup, secciones `lam-01` a `lam-06`), `css/styles.css`,
`js/script.js`, `img/`, `svg/`, `netlify.toml`.

**Encabezados centrados en Método y Pilares (lam-03, lam-04)**: el usuario
pidió que los títulos de esas dos secciones (antes alineados a la
izquierda, como el resto) quedaran centrados. Se envolvió el bloque
`eyebrow + h2` (y también el `<p class="lam-text">` en el caso de
Pilares) en un `<div class="sec-head-center">` nuevo, con la clase
`.sec-head-center{text-align:center}` en `css/styles.css` (más
`margin-left/right:auto` en `.lam-title`/`.lam-text` dentro de ese
contenedor, porque son bloques con `max-width` propio y necesitan margen
automático para centrarse). El timeline de Método y el `pillar-grid` /
`signal-wave` de Pilares quedan **fuera** de ese contenedor y siguen su
layout de grilla normal, sin cambios. El resto de secciones (02, 05, 06)
no se tocó y sigue con sus títulos alineados a la izquierda.

**Rayón pegado al título en Método y Pilares**: además del centrado, el
usuario pidió (mostrando de nuevo su referencia visual) que el
título tuviera un rayón subrayando la última palabra clave + una línea
completa debajo de todo el título, no solo rayones sueltos de fondo. Se
resolvió con dos piezas nuevas en `css/styles.css`, pensadas para ser
robustas ante cambios de texto (no usan coordenadas absolutas):
- `.title-mark`: se aplica a un `<span>` que envuelve la última palabra
  del `h2` (p.ej. `<span class="title-mark">genérica</span>`), con
  `background-image:url(../svg/deco-scribble.svg)` en
  `background-position:left bottom` y `background-size:100% 32%` — el
  subrayado se estira automáticamente al ancho real de la palabra, sea
  cual sea, sin depender de un pixel fijo.
- `.title-scribble`: un `<img>` de `svg/deco-scribble.svg` colocado como
  **hermano normal del `h2`** (no absoluto), con `display:block;
  margin:6px auto 0`, así que queda centrado y fluye justo debajo del
  título sin importar en cuántas líneas se parta el texto (evita el
  problema de coordenadas fijas que rompió el intento revertido de
  "trazos tipo marcador" original).
- Se aplicó envolviendo la última palabra en `lam-03` ("genérica") y en
  `lam-04` ("trabajo"). **Nota importante**: esto sí envuelve una palabra
  en un `<span>` dentro de un `h2`, pero a diferencia del intento que se
  revirtió, estos `h2` **no** son `display:flex` (son bloques de texto
  normales), así que el span no rompe el wrapping — se verificó con
  capturas Playwright que el texto sigue fluyendo bien. Si se repite este
  patrón en otro título, confirmar primero que ese `h2` no use
  `display:flex`.

## Pendientes conocidos (ver README.md → "Próximos pasos" para el detalle)

- Backend real para "Mi plan" (Netlify Database + Functions) — hoy los datos
  antropométricos y el objetivo cognitivo solo viven en `localStorage`.
- **Descartado**: trazos tipo "marcador" dispersos por el sitio (estilo
  ilustrado, en verde de marca). Se probó en una sesión, se revirtió por no
  convencer visualmente y por romper el layout del título de Visión al
  envolver una palabra en un `<span>` dentro de un `h2` con
  `display:flex` (ver `changelog.md`, entrada "Revertidos los trazos tipo
  marcador"). Si se retoma la idea, evitar envolver palabras sueltas
  dentro de contenedores `display:flex` sin antes revisar cómo se
  comporta el wrapping, y validar el estilo visual con el usuario antes
  de aplicarlo a las 6 secciones de una vez.
- No hay más tareas de diseño pendientes anotadas por el usuario a la
  fecha de esta entrada; si pide más ajustes de estilo, este documento
  debe actualizarse con las nuevas decisiones tomadas.
