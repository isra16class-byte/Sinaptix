# Changelog

Historial de cambios de este repo, un patch por entrada, orden cronológico
inverso (lo más nuevo arriba). No se borran entradas viejas. Ver
`memoria.md` para el estado actual del proyecto y las reglas de este
archivo.

## 2026-09-13 — Avisos graduados y ejes combinados (estrés+sueño, estrés+fatiga)

- Punto 5 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.2, "Ajustes
  más graduales, no binarios"). `nutriConstruirAvisos` (`js/nutricion-planes.js`)
  ahora devuelve objetos `{nivel, texto}` en vez de strings — `nivel` es
  `'moderado'` o `'alto'`, usado por `nutriBuildResumenHTML` para pintar
  cada aviso con `.nutri-note` (moderado, dorado, sin cambios) o
  `.nutri-note.nutri-note--alto` (alto, rojo, clase nueva en
  `css/styles.css`).
- **Decisiones tomadas con el usuario para esta sesión** (el documento
  original dejaba esto abierto a decidir):
  - El aviso de sueño **ya no es independiente**: antes disparaba solo con
    `d.sueno`/`d.calidadSueno` malos; ahora exige además estrés alto
    (`d.estres >= 4`). Alguien con mal sueño pero estrés bajo/medio ya no
    ve ningún aviso de sueño — es un cambio de comportamiento intencional,
    no un bug, si en el futuro se quiere revertir a que sea independiente
    otra vez.
  - Nuevo aviso de **eje combinado**: `d.estres >= 4` y `d.fatiga >= 4` a
    la vez dispara un aviso propio (magnesio/complejo B), que antes no
    existía — el documento original lo mencionaba como "Plan 4" pero no
    estaba implementado.
  - Cafeína y ultraprocesados pasan de binario a **2 niveles**: el nivel
    superior (`'4 o más al día'` / `'A diario'`) mantiene el texto y
    nivel `'alto'` de antes; se agregó un nivel `'moderado'` nuevo para
    el escalón intermedio (`'2 a 3 al día'` / `'Algunas veces por
    semana'`), que antes no generaba ningún aviso.
  - El aviso médico/medicación se marcó como `'alto'` (ya existía, no
    cambió el texto ni la condición para mostrarlo).
- `.nutri-summary` ya tenía `gap:12px` en su `display:flex`, así que
  varios avisos seguidos (ahora es común, ver caso de prueba con 4 avisos
  a la vez) quedan espaciados sin tocar ese contenedor.
- Verificado con un script de Node que ejecuta `nutriConstruirAvisos` /
  `nutriBuildResumenHTML` contra casos sintéticos (sueño malo con y sin
  estrés alto, eje combinado, cada nivel de cafeína/ultraprocesados) antes
  de generar el patch — no hay test runner en el repo, así que quedó como
  verificación manual de esta sesión, no como archivo de test agregado.

## 2026-09-13 — "Un día tipo" en el resultado de cada plan de nutrición

- Punto 4 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.3): cada uno
  de los 4 planes de `NUTRI_PLANES` (`js/nutricion-planes.js`) ahora tiene
  un campo `diaTipo` (4 entradas: Desayuno, Snack, Almuerzo, Cena) que se
  arma solo con alimentos que ya estaban en `priorizar`/`moderar` de ese
  mismo plan, organizados por momento del día — sin agregar ningún
  nutriente ni alimento nuevo. Se armó a partir del contenido ya
  existente en el repo (no había un documento de origen con el detalle
  por comida disponible en esta sesión).
- `nutriBuildResumenHTML` renderiza un cuarto bloque "Un día tipo" por
  plan (después de "Moderar"), como una grilla `.nutri-dia-tipo` en vez
  de una lista más — se envuelve sola con `grid-template-columns:
  repeat(auto-fit,minmax(130px,1fr))`, sin JS de resize. Si el objetivo es
  "No estoy seguro" y hay empate entre 2 planes, cada uno muestra su
  propio "día tipo" por separado.
- CSS nuevo: `.nutri-dia-tipo`, `.dia-tipo-item`, `.dia-tipo-momento`,
  `.dia-tipo-detalle`.
- Aprovechando el cambio, se corrigió una referencia desactualizada en
  `memoria.md` que decía que `NUTRI_PLANES` vivía en `js/script.js` (se
  había movido a `js/nutricion-planes.js` en una sesión anterior, la
  memoria no se había actualizado en ese punto puntual).
- Probado con un script de Node (`vm` + `nutriBuildResumenHTML`) en dos
  escenarios: un plan único (4 `diaTipo` items) y un empate "No estoy
  seguro" con 2 planes (8 items en total, 4 por plan) — ambos arman el
  HTML esperado. Sigue pendiente una revisión visual en navegador real
  (Playwright no se pudo instalar en este entorno, ver entradas
  anteriores del changelog).

## 2026-09-13 — Paso 2 del wizard: resumen + "Actualizar" en vez de reingresar peso/talla ya guardados

- Punto 3 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.2): si ya hay
  peso y talla guardados en `sinaptix_antropometria` ("Registrar datos
  antropométricos"), el paso 2 de la encuesta de nutrición ya no muestra
  los dos inputs vacíos-para-reeditar — muestra una frase ("Ya tenemos tu
  peso y talla registrados (fecha) — 70 kg, 175 cm.") y un botón
  "Actualizar peso y talla" que revela los inputs si se quieren cambiar.
  Sin datos guardados (o con antropometría que no incluye peso/talla), se
  ve exactamente igual que antes. Edad y sexo biológico no cambiaron: se
  siguen prellenando pero mostrando como campos normales.
- `index.html` y `mi-plan.html` (paso 2, idéntico en ambos): nuevo
  `id="nutriAntroInputs"` en el `.modal-row` de Peso/Talla y nuevo bloque
  `#nutriAntroResumen` (texto + botón `#btnNutriAntroEditar`), en
  reemplazo del viejo `<p id="nutriAntroHint">`.
- `js/nutricion-wizard.js` (`resetNutriWizard`): arma el texto del resumen
  reutilizando `gaugeFechaCorta` (de `js/nutricion-planes.js`) y alterna
  `.hidden` entre inputs y resumen según si hay peso+talla guardados. Los
  inputs se siguen prellenando aunque queden ocultos, así que si el
  usuario no toca nada se manda el mismo dato que ya tenía — no hubo que
  tocar `nutriCollectData` ni el submit del formulario.
- CSS: `.nutri-antro-resumen`, `.nutri-antro-texto` y un ajuste de tamaño
  para `#btnNutriAntroEditar` (mismo `.btn.btn-ghost` que el resto del
  sitio, un poco más chico para no dominar el paso).
- Probado con Node + `jsdom` (instalado en un directorio temporal fuera
  del repo, no se agregó como dependencia): se cargó el `#formNutricion`
  real de `index.html` junto con `nutricion-planes.js` y
  `nutricion-wizard.js`, y se corrió `resetNutriWizard()` en 3 escenarios
  (sin antropometría, con peso+talla, con antropometría incompleta) — los
  tres muestran/ocultan lo esperado y el botón "Actualizar" funciona.
  Sigue pendiente una revisión visual en navegador real (Playwright no se
  pudo instalar en este entorno, ver entrada anterior del changelog).

## 2026-09-13 — Gráfico de barras de "Mi plan" ahora compara antes/después con la reevaluación de "Método"

- Punto 2 de `plan-mejoras-mi-plan-y-encuesta.md` (sección 4.2): el gráfico
  "Tu estado actual" (Foco/Memoria/Energía/Calma) de `mi-plan.html` era una
  sola foto fija de la encuesta inicial. Ahora, si existe una reevaluación
  guardada (`sinaptix_reevaluacion`, ya se generaba desde el modal de
  "Método" en `index.html` pero no se usaba acá), cada barra muestra el
  valor más reciente y debajo un texto "Antes: X% (+/- N pts)" — mismo
  criterio visual que ya usan los anillos de "Método". Sin reevaluación
  guardada, el gráfico se ve exactamente igual que antes.
- `nutriBuildBarChartHTML` (en `js/nutricion-planes.js`) cambió de firma:
  `nutriBuildBarChartHTML(encuesta)` → `nutriBuildBarChartHTML(objetivo,
  reeval)` (recibe el objeto `sinaptix_objetivo` completo, no solo
  `.encuesta`, porque ahora necesita `.fecha` para la leyenda). `js/mi-
  plan.js` (`pintarMiPlan`) actualizado para leer `sinaptix_reevaluacion` de
  `localStorage` y pasarlo.
- `gaugeFechaCorta` y `gaugeDeltaHtml` se movieron de `js/script.js` a
  `js/nutricion-planes.js` (compartidas), ya que ahora las usan tanto los
  anillos de "Método" como el gráfico de barras de "Mi plan", con el mismo
  criterio de color/formato de fecha.
- CSS: nuevo wrapper `.bar-item` por fila (antes el margen entre filas
  vivía en `.bar-row`, ahora en `.bar-item` para poder meter el delta
  debajo sin romper el espaciado), `.bar-item .gauge-delta` (indentado
  para alinear bajo el track) y `.bar-chart-dates` (reusa `.gauge-dates`).
- Paso 6 del wizard ("Cómo te sentís día a día", `index.html` y `mi-
  plan.html`): se agregó una frase al `.nutri-hint` explicando que esas 4
  preguntas alimentan este gráfico y se podrán comparar más adelante —
  responde a por qué se siguen preguntando aunque ya se eligió un
  objetivo (sección 4.2 del mismo documento).
- Verificado con un script de Node que carga `js/nutricion-planes.js` en un
  contexto `vm` y llama `nutriBuildBarChartHTML` con datos de prueba, con y
  sin reevaluación (deltas y colores correctos en ambos casos) — no se
  pudo hacer una verificación visual con Playwright en esta sesión porque
  la descarga del navegador (`deb.nodesource.com`) no está en la lista de
  dominios permitidos del entorno; queda pendiente una revisión visual
  rápida cuando el usuario aplique el patch.

## 2026-09-13 — Asterisco rojo en campos obligatorios de la encuesta de nutrición (se saca la palabra "opcional")

- El usuario pidió reemplazar la palabra "(opcional)" (que aparecía en el
  placeholder de 4 campos: Peso, Talla, Otra alergia, Alimentos que no te
  gustan) por un asterisco rojo en las preguntas obligatorias, dejando las
  opcionales sin ninguna marca — según referencia visual que compartió
  ("Teléfono \*").
- Antes de tocar código se armó un documento de investigación
  (`plan-mejoras-mi-plan-y-encuesta.md`, entregado al usuario, no vive en
  el repo) sobre buenas prácticas de formularios (marcar obligatorios vs.
  opcionales) y oportunidades de mejora para la encuesta y "Mi plan" en
  general — este patch implementa solo el punto 1 de ese documento (el de
  menor costo/mayor impacto), el resto queda pendiente de decidir.
- Hallazgo técnico clave: un asterisco no se puede pintar de rojo dentro
  de un `placeholder` (es un solo string, un solo color) — hacía falta
  una etiqueta visible de verdad. La mayoría de los campos de
  `#formNutricion` (Objetivo, Nombre, Email, Edad, Sexo, Peso, Talla,
  Comidas, Agua, Cafeína, Alcohol, Ultraprocesados, Tiempo de cocina,
  Otra alergia, Restricción, Medicación, las 4 escalas de percepción,
  Disgustos, Presupuesto) usaban el patrón `<label class="sr-only">` +
  texto solo en el `placeholder` — se convirtieron todas esas etiquetas a
  visibles, reusando el estilo ya existente `.nutri-field-label` (no se
  inventó un estilo nuevo). De paso corrige una práctica de accesibilidad
  poco recomendable (depender del placeholder como única etiqueta).
- Nueva clase `.req` en `css/styles.css` (asterisco rojo, `aria-hidden`
  porque el atributo HTML `required` ya alcanza para lectores de
  pantalla) y nueva variable `--red:#B3261E` en `:root` — es el mismo
  rojo que ya usaba `.nutri-error`, que se actualizó para usar la
  variable en vez del hex suelto (sin cambio visual).
- Se agregó una frase aclaratoria una sola vez, debajo del párrafo de
  introducción del formulario (en el modal de `index.html` y en la
  encuesta inline de `mi-plan.html`): *"Los campos marcados con \* son
  obligatorios."*
- Los 4 campos opcionales (Peso, Talla, Otra alergia, Alimentos que no te
  gustan) quedaron con etiqueta visible pero sin asterisco y sin ninguna
  palabra — de paso corrige una inconsistencia que ya existía: "Horas de
  pantalla" tampoco es obligatorio (no tiene `required`) pero nunca dijo
  "opcional" en ningún lado; ahora, al no llevar asterisco, queda
  consistente con el resto de los campos opcionales.
- Cambio duplicado en `index.html` (modal) y `mi-plan.html` (encuesta
  inline) porque comparten el mismo `#formNutricion` — se verificó que
  ambos archivos terminan con la misma cantidad de asteriscos (24) y sin
  ningún resto de `sr-only` u "opcional" dentro del formulario.
- No se tocó `js/nutricion-wizard.js` ni `js/nutricion-planes.js`: el
  cambio es puramente de HTML/CSS, no afecta la validación (los mismos
  atributos `required` siguen intactos) ni la lógica de armado del plan.

## 2026-09-13 — Gráfico de barras (Foco/Memoria/Energía/Calma) en "Mi plan"

- El usuario preguntó si valía la pena agregar un gráfico a "Mi plan"; se
  le ofrecieron 3 opciones (barras reemplazando los anillos de Método,
  barras nuevas en Mi Plan con datos ya existentes, o no agregar nada) y
  eligió: 1 gráfico de barras con su estado actual (Foco/Memoria/Energía/
  Calma), sin comparación antes/después.
- Se movieron `gaugeComputeAreas`, `gaugeColorForPercent` y sus helpers de
  color de `js/script.js` a `js/nutricion-planes.js` (compartido) — son
  funciones puras de cálculo (sin DOM), las mismas que ya usaban los
  anillos de "Método" en `index.html`, así que el gráfico de barras y los
  anillos parten del mismo cálculo y la misma escala de color.
- Nueva función `nutriBuildBarChartHTML(encuesta)` en
  `js/nutricion-planes.js`, llamada desde `pintarMiPlan(user)` en
  `js/mi-plan.js`.
- Nuevo contenedor `#miPlanBarras` en `mi-plan.html`, entre el `stat-grid`
  (IMC/objetivo) y el detalle del plan. Nuevos estilos en
  `css/styles.css` (`.bar-chart-card`, `.bar-row`, `.bar-track`,
  `.bar-fill`, etc.) — barras simples con `<div>`+CSS, sin librería de
  gráficos externa.
- Probado con Playwright: con una encuesta guardada de ejemplo
  (estrés=4, fatiga=3, concentración=2, olvidos=3), el gráfico de barras
  en `mi-plan.html` muestra Foco 80%, Memoria 60%, Energía 60%, Calma 40%
  — y los anillos de "Método" en `index.html`, con la misma encuesta,
  muestran exactamente los mismos porcentajes. Cero errores de consola en
  ambas páginas.

## 2026-09-13 — "Generar mi plan" ahora es inline en mi-plan.html (no redirige a index.html)

- Feedback del usuario sobre el patch anterior: al tocar "Generar mi plan"
  no quería que lo mandara a `index.html`, sino que la encuesta apareciera
  ahí mismo, "como una sección que ocupe la pantalla normal para que haya
  más visión" (en vez del modal chico de antes).
- **Nuevo `js/nutricion-wizard.js`** (compartido): se extrajo de
  `js/script.js` el motor de navegación del wizard (pasos, validación,
  recolección de datos, render del resumen) — sin el manejo de `submit` ni
  de apertura/cierre, que sigue siendo distinto por página. Se carga
  después de `js/nutricion-planes.js` y antes de `js/script.js` /
  `js/mi-plan.js`, en ambas páginas.
- **`mi-plan.html`**: se agregó `#nutriInline`, un duplicado del formulario
  de 8 pasos del modal de `index.html` (mismos `id`), pero SIN el
  contenedor `.modal-card` — vive suelto dentro de la página (`.wrap`,
  `max-width:640px` en el form) para que se vea como una sección normal del
  sitio y no como un popup chico. "Generar mi plan" ahora es un `<button>`
  que oculta `#miPlanConSesion` y muestra `#nutriInline` (antes era un link
  a `index.html?generarPlan=1`). Se agregó "← Volver a Mi plan"
  (`#nutriInlineVolver`) para cancelar sin guardar.
- **`js/mi-plan.js`**: nuevo submit handler para el `#formNutricion` de esta
  página — como solo se llega a este botón con sesión ya iniciada, siempre
  guarda en `localStorage` y vuelve a pintar "Mi plan" en el momento
  (`pintarMiPlan(user)` de nuevo) sin recargar ni redirigir.
- **`index.html` / `js/script.js`**: se quitó el bloque que abría el modal
  automáticamente vía `?generarPlan=1` (ya no hace falta, `mi-plan.html` no
  redirige más para esto). El modal de nutrición de `index.html` sigue
  funcionando exactamente igual que antes (mismo botón "Generar nutrición
  especializada", mismo modal).
- Probado con Playwright: en `mi-plan.html`, con sesión simulada, se
  completó la encuesta de punta a punta (los 8 pasos) sin salir nunca de
  `mi-plan.html` ni recargar la página, y al guardar se vuelve a "Mi plan"
  con el objetivo y el detalle del plan ya actualizados. También se
  verificó que `index.html` sigue abriendo su modal de nutrición sin
  cambios. Cero errores de consola en ambos flujos.

## 2026-09-13 — "Mi plan" pasa a ser una pantalla propia (`mi-plan.html`)

- El usuario pidió que la sección "Mi plan" (antes visible/oculta dentro de
  `index.html` con sesión iniciada) apareciera "en otra pantalla" — se
  confirmó con el usuario que se refería a una página HTML separada con su
  propia URL, no a un modal ni a un overlay dentro de `index.html`.
- **Nuevo archivo `mi-plan.html`**: página independiente con su propio nav
  (marca + "Volver al sitio" + "Cerrar sesión"), que reemplaza a la antigua
  `<section id="miPlan">` de `index.html`. Tiene dos estados propios:
  - **Sin sesión** (`#miPlanSinSesion`): mensaje + botón "Iniciar sesión"
    (abre el widget de Netlify Identity ahí mismo) — cubre tanto a quien
    entra directo por la URL como a quien recién cerró sesión.
  - **Con sesión** (`#miPlanConSesion`): mismo contenido que tenía la
    sección vieja (IMC, objetivo, detalle del plan, CTA), sin cambios de
    copy ni de lógica de negocio.
- **Nuevo archivo `js/nutricion-planes.js`**: se extrajeron de `js/script.js`
  las piezas que NO dependen del DOM del wizard — `NUTRI_PLANES`,
  `nutriResolverObjetivo`, `nutriConstruirAjustes`, `nutriConstruirAvisos` y
  `nutriBuildResumenHTML` — a un archivo compartido, porque ahora dos
  páginas (`index.html` y `mi-plan.html`) necesitan reconstruir el mismo
  plan a partir de lo guardado en `localStorage` sin repetir la encuesta.
  Se carga antes que `js/script.js` / `js/mi-plan.js` en ambas páginas.
- **Nuevo archivo `js/mi-plan.js`**: toda la lógica específica de la nueva
  pantalla (`netlifyIdentity.init`, pintar el plan guardado, togglear los
  dos estados, botones de logout). No se reutilizó `js/script.js` tal cual
  porque tiene varios `getElementById(...).addEventListener(...)` sin
  guarda de `null` pensados para elementos que solo existen en
  `index.html` (el modal/wizard de nutrición, el formulario de contacto,
  etc.) — meterlo en `mi-plan.html` tal cual habría roto la página.
- **`index.html`**:
  - Se eliminó la sección `#miPlan` (ahora vive en `mi-plan.html`).
  - Nuevo link de nav `#btnMiPlanNav` ("Mi plan" → `mi-plan.html`), oculto
    por defecto y visible solo con sesión iniciada (mismo mecanismo de
    `classList.toggle('hidden', !user)` que ya usaba `#btnAcceder`, pero
    invertido).
  - `js/script.js` simplificado: ya no pinta/oculta "Mi plan" in-place
    (`pintarMiPlan`/`mostrarMiPlan`/`ocultarMiPlan` se eliminaron); al
    hacer login (`netlifyIdentity.on('login', ...)`) ahora redirige directo
    a `mi-plan.html` con `window.location.href`. Al enviar la encuesta de
    nutrición con sesión ya iniciada, en vez de pintar la vieja sección
    local, redirige a `mi-plan.html` (que la lee sola desde
    `localStorage`).
  - Nuevo bloque al final del wizard: si la URL trae `?generarPlan=1`
    (llega desde el botón "Generar mi plan" de `mi-plan.html`, que no tiene
    el modal/wizard propio), se abre el modal de nutrición automáticamente
    y se limpia el parámetro de la URL con `history.replaceState` para que
    un refresh no lo reabra solo.
- Probado con Playwright (servidor local): `index.html` sin sesión no
  muestra "Mi plan" en el nav y no tira errores de consola;
  `mi-plan.html` muestra el estado "sin sesión" por defecto y, simulando
  sesión + plan guardado en `localStorage`, renderiza igual que antes en la
  vieja sección; `index.html?generarPlan=1` abre el modal solo y limpia la
  URL. Los únicos errores de consola observados son 403 de recursos
  externos (Google Fonts, el widget de Netlify Identity) bloqueados por la
  red del sandbox de pruebas, no del código del sitio.

## 2026-09-13 — Trazos naranjas reemplazados por espiga de trigo real vectorizada (excepto Método/Pilares)

- El usuario mostró una captura del hero con los trazos tipo "marcador"
  naranjas (`.deco-scribble`) y una búsqueda de imágenes de granos,
  preguntando si convenía cambiar esos trazos por algo con esa temática,
  **menos en las secciones 3 y 4** (Método y Pilares, `lam-03`/`lam-04`),
  que ya estaban validadas. Se acordó estilo lineal/outline y color
  dorado más "trigo" (`#D9A441`, más amarillo que el `#EDA23A` original)
  antes de tocar código.
- **Iteración 1** (descartada): SVG hecho a mano, un trazo curvo +
  "aristas" cortas tipo espina de pescado. El usuario lo rechazó: "se ve
  horrible jaja".
- **Iteración 2** (descartada): espiga vertical generada por script
  (granos tipo almendra en herringbone sobre un tallo). El usuario
  prefirió pedirle la imagen a un generador externo (Gemini) en vez de
  seguir iterando a mano.
- Se le dio al usuario un prompt (en español e inglés) para pedir una
  espiga de trigo en line art, dorada, aislada en fondo blanco, sin
  sombras/degradados, pensada para recortar y adaptar fácil.
- El usuario subió la imagen generada por Gemini (espiga muy detallada y
  limpia). Se instaló `potrace` (`apt-get install -y potrace`) y se
  vectorizó: recorte al bounding box del dibujo con PIL, umbral a
  blanco/negro, `potrace -s`, y recoloreado del `fill` resultante a
  `#D9A441`. Resultado: `svg/deco-espiga.svg` (viewBox `0 0 163 669`),
  fiel al dibujo de Gemini pero como SVG vectorial liviano.
- En `index.html` se reemplazó `src="svg/deco-scribble.svg"` por
  `src="svg/deco-espiga.svg"` en las 12 instancias `.deco .deco-scribble`
  de `lam-01` (Hero, 6), `lam-02` (Visión, 2), `lam-05` (Para quién es, 2)
  y `lam-06` (Contacto, 2). **No se tocó** `lam-03` ni `lam-04` (siguen
  con `deco-scribble.svg`, incluidos sus `.title-scribble`).
- **Ajuste de posición/ángulo** (feedback del usuario tras ver el primer
  montaje: "la ubicación las veo mal... deberían estar inclinadas...
  revueltas o saliendo de la pantalla como cortadas"): se re-hicieron los
  `style` inline de las 12 instancias con rotaciones bien variadas
  (18°–42°, alternando signo, en vez de la leve inclinación pareja de
  antes) y varias con offset negativo grande (`right:-25px` a `-35px`,
  `left:-15px` a `-35px`) para que queden cortadas por el borde real de
  la pantalla, aprovechando que `.hero` tiene `overflow:hidden` y
  `body`/`html` tiene `overflow-x:hidden` (no hizo falta el truco
  `var(--vw100, 100vw)` de `lam-03`/`lam-04` porque estas instancias son
  hijas directas de la `<section>`, ya a ancho completo de viewport).
- `svg/deco-scribble.svg` no se borró: sigue existiendo y en uso en
  `lam-03`/`lam-04` y en `.title-mark`/`.title-scribble`.
- Verificado con Playwright (servidor local + capturas) en 4 versiones
  sucesivas (dos descartadas + espiga de Gemini con posición inicial +
  posición final "revuelta") en Hero, Visión, Para quién es, Contacto, y
  confirmando en cada iteración que Método/Pilares seguían sin cambios.

## 2026-09-13 — Imagen del Hero reemplazada por ilustración de cerebro con chispas de neuronas

- El usuario pidió reemplazar el logotipo flotante del Hero (`lam-01`,
  `.synapse-art`) por una imagen que subió: un cerebro dividido a la
  mitad entre frutas/verduras y una red de neuronas iluminada. También
  pidió mantener algún efecto como el que tenía el logo, o que las luces
  de las neuronas de la imagen parpadeen.
- Se agregó `img/hero-cerebro-nutricion.png` (1024×1024, fondo
  transparente) y se reemplazó `<img class="logo-badge">` por un
  `div.brain-art` con la nueva imagen (`.brain-art-img`, conserva la
  animación `float` que ya tenía el logo) + 8 `<span class="brain-spark">`
  posicionados sobre los puntos de luz más brillantes de la imagen
  (detectados analizando los píxeles del PNG), cada uno con una animación
  de parpadeo (`@keyframes spark-twinkle`) con duración/retraso distintos
  para que no parpadeen sincronizados.
- El SVG de fondo de `.synapse-art` (líneas + puntos viajando) no se
  tocó. La clase `.logo-badge` se deja sin usar en el HTML pero se
  mantiene en `css/styles.css` por si se necesita revertir.
- Se actualizó la regla de `prefers-reduced-motion` para incluir los
  nuevos elementos (`.brain-art-img` sin flotar, `.brain-spark` sin
  parpadeo, opacidad fija).
- Verificado con Playwright en desktop (1600px) y mobile (390px), y
  forzando el parpadeo a su punto máximo para confirmar que los sparks
  quedan alineados sobre las luces de la imagen.
- Ver `memoria.md` → "Imagen principal del Hero" para el detalle y cómo
  reposicionar los sparks si se cambia la imagen a futuro.

## 2026-09-13 — Grosor y cruce corregido en los rayones de Pilares (lam-04)

- El usuario mostró una captura de referencia externa (mock de otra
  sección, título "Optimizado para mejorar la productividad") con el
  patrón de rayones deseado y pidió que Pilares (`lam-04`) quedara igual
  en cantidad y posición. Comparando contra el sitio, se detectaron dos
  problemas:
  1. **Grosor invertido**: los 2 rayones "flotantes" (no sangran al
     borde, `width:300px`/`320px`) se veían gruesos, y los 5 rayones
     cortos (sangrado + acento chico, `width:90-190px`) se veían finos —
     al revés de la referencia (flotantes finos, cortos gruesos). Causa:
     los `<img class="deco-scribble">` solo llevaban `width` en el
     `style` inline, así que el navegador escalaba el grosor del trazo
     proporcional al ancho (SVG con aspect-ratio natural 400:30).
  2. **Cruce en el cluster superior derecho**: las dos rayas que sangran
     al borde tenían `rotate` de signo opuesto (`-4deg`/`6deg`) y se
     cruzaban formando una V, en vez de quedar paralelas.
  3. La raya chica del cluster inferior central quedaba pegada/solapada
     con la raya larga de al lado, sin el hueco que muestra la
     referencia.
- **Fix** (`index.html`, los 7 `<img class="deco-scribble">` dentro de
  `#lam-04 .lam-title-frame`): se agregó `height` explícito en px a cada
  una (desacoplado del `width`) — los 2 flotantes bajaron a
  `height:10px` (más finos), los 5 cortos subieron a `height:14-15px`
  (más gruesos). Se unificó el `rotate` de las dos rayas del cluster
  superior derecho a `-3deg` en ambas para que queden paralelas. Se
  separó la raya chica inferior (`right:70px→right:-10px`) para dejar un
  hueco claro respecto a la raya larga de al lado.
- No se tocó `lam-03`, que usa el mismo esquema de 7 rayones — el usuario
  solo pidió el ajuste en Pilares. Ver `memoria.md` para el patrón a
  seguir si se replica ahí.
- Verificado con Playwright (servidor local, captura a 1600px de ancho)
  comparando contra la imagen de referencia del usuario.

## 2026-09-13 — Fix robusto de sangrado + segundo rayón superior que faltaba

- El usuario volvió a comparar contra una captura de referencia distinta
  (título "Optimizado para mejorar la productividad") y señaló dos
  problemas en `lam-03`/`lam-04`:
  1. Faltaba un rayón: en la referencia, el cluster superior derecho
     tiene **dos** rayones que sangran al borde real (uno grande arriba,
     uno chico debajo), pero en el sitio solo el grande sangraba — el
     chico (`right:-4px;top:-10px;width:110px`) se quedaba cerca del
     borde del `.lam-title-frame`, lejos del borde real de la pantalla.
  2. El truco `calc(50% - 50vw)` que ya se usaba para sangrar al borde no
     llegaba al borde real en un navegador con scrollbar clásica (no
     overlay, ej. Windows/Chrome): la unidad `vw` se calcula sobre el
     ancho **total** del viewport (incluye el hueco del scrollbar),
     mientras que `.wrap{margin:0 auto}` centra usando el ancho
     **visible** del documento (`clientWidth`, sin el scrollbar). Esa
     diferencia (~15-17px) hacía que sobre todo el lado derecho se
     quedara corto.
- **Fix del sangrado** (robusto, independiente del navegador): se agregó
  en `js/script.js` una función `setViewportWidthVar()` que fija una
  variable CSS `--vw100` con `document.documentElement.clientWidth` (el
  mismo ancho que usa `.wrap` para centrarse), actualizada al cargar y en
  cada `resize`. En `index.html`, los 6 rayones que sangraban con
  `calc(50% - 50vw)` ahora usan
  `calc(50% - (var(--vw100, 100vw) / 2))` — con `100vw` como fallback
  antes de que corra el JS. Al usar la misma base (`clientWidth`) que el
  centrado de `.wrap`, el cálculo coincide siempre, con o sin scrollbar
  visible.
- **Rayón superior chico que faltaba**: se reemplazó
  `right:-4px;top:-10px;width:110px;transform:rotate(5deg)` por
  `right:calc(50% - (var(--vw100, 100vw) / 2));top:-6px;width:100px;
  transform:rotate(6deg)` en `lam-03` y `lam-04` — ahora es un segundo
  rayón que sangra al borde real, debajo del rayón grande existente,
  igual que en la referencia.
- Verificado con Playwright en 1920px: los 3 rayones del cluster superior
  derecho y el rayón inferior izquierdo llegan exactamente al borde real
  del viewport (`x=0` / `x=ancho de pantalla`).

## 2026-09-13 — Rayones del lado derecho también sangran al borde real + aguacate reubicado

- El usuario volvió a comparar contra la captura de referencia y avisó
  que todavía no se veía la diferencia: el fix anterior solo cubría el
  rayón inferior izquierdo, pero en la referencia el rayón más externo
  de cada cluster (arriba a la derecha y abajo a la derecha) también
  nace del borde real de la pantalla.
- Se aplicó el mismo truco `calc(50% - 50vw)` (esta vez en `right`) a los
  dos rayones más externos de `.lam-title-frame` en `lam-03` y `lam-04`
  (los que tenían `right:-10px`), subiendo un poco su `width` para que
  se noten más. Los rayones centrales/largos del cluster se dejaron
  igual, como en la referencia.
- Al sangrar hasta el borde real, el rayón superior derecho de `lam-04`
  quedaba cruzando el aguacate decorativo (`deco-blob-avocado.svg`,
  pegado a la esquina superior derecha de la sección). Se movió esa
  fruta a la esquina superior izquierda (`right:-20px` → `left:-20px`,
  rotación espejada) siguiendo la sugerencia del usuario. `lam-03` no
  tiene fruta arriba, así que no necesitó este ajuste.
- Verificado con Playwright en 1917px, 1600px y 1280px de ancho.

## 2026-09-13 — Título de Pilares entra en una sola línea en desktop

- El usuario mandó una captura de `lam-04` (Pilares) donde el título
  "Cuatro frentes de trabajo" se partía en dos líneas aunque a ese ancho
  de pantalla entraba de sobra en una.
- Causa: el `h2.lam-title` de `lam-04` no tenía `style` propio y
  heredaba el `max-width:12ch` base de `.lam-title`, pensado para
  títulos más cortos. Se agregó `style="max-width:26ch"` en
  `index.html`, igual que ya tiene `lam-03` con `32ch`.
- Verificado con Playwright en 1917px, 1600px, 1280px y 900px (título en
  una línea) y en 380px (sigue partiéndose en dos líneas de forma
  natural, sin cortes raros, como corresponde en mobile).

## 2026-09-13 — Rayón izquierdo de Método/Pilares ahora sangra hasta el borde real

- El usuario mandó una captura de referencia (título "Optimizado para
  mejorar la productividad") donde los rayones nacen del borde real de
  la pantalla, y una captura propia de `lam-04` (Pilares) donde dijo que
  "faltaba" el rayón izquierdo.
- El rayón ya existía en el markup (uno de los 7 de `.lam-title-frame`
  en `lam-03` y `lam-04`), pero estaba posicionado con `left:6px` —
  relativo a `.lam-title-frame`, que hereda el ancho centrado de `.wrap`
  (`max-width:1180px`), así que nacía a ~200-250px del borde real en vez
  de desde ahí. Por eso se veía "ausente" comparado con la referencia.
- Se cambió ese rayón a `left:calc(50% - 50vw)` en `index.html` (mismo
  cambio en `lam-03` y `lam-04`) — truco de CSS que aprovecha que
  `.lam-title-frame` está centrado igual que el viewport, así el borde
  izquierdo del rayón cae siempre en `x=0` real sin depender de un valor
  fijo en px que se rompería en otras resoluciones. Se subió el `width`
  de 140px a 170px para que se note más.
- No se tocó ningún otro rayón del frame (el cluster superior derecho ni
  los inferiores derechos) — el pedido era puntual sobre el izquierdo.
- Verificado con Playwright en 1600px y 1280px de ancho: el rayón nace
  del borde real del viewport en ambos casos.

## 2026-09-13 — Párrafo de Pilares movido debajo de la ola

- El usuario probó el patch anterior en local (Live Server) y mandó una
  captura de `lam-04` (Pilares): el párrafo debajo del título quedaba
  apretado justo encima del `.signal-wave` (la línea celeste ondulada),
  con uno de los rayones del `.lam-title-frame` cruzándole el texto por
  encima, y preguntó si convenía bajar el párrafo debajo de esa línea.
- Se sacó el `<p class="lam-text">` de Pilares de dentro de
  `.sec-head-center`/`.lam-title-frame` y se movió como bloque
  independiente entre `.signal-wave` y `.pillar-grid`. Se agregó la
  clase `.lam-text-center` en `css/styles.css`
  (`text-align:center;margin:-16px auto 44px`) para que siga centrado
  igual que antes.
- Efecto colateral esperado: al salir el párrafo de `.lam-title-frame`,
  ese contenedor bajó de altura y los rayones inferiores quedaron más
  pegados al subrayado del título (ya no tienen que "saltar" la altura
  del párrafo) — coincide ahora con cómo se ven en `lam-03`, que nunca
  tuvo párrafo ahí.
- `lam-03` (Método) no tiene este párrafo, así que no se tocó.
- Verificado con Playwright (inyectando `Caveat` temporalmente, igual
  que en las sesiones anteriores) en 1600px: la ola queda libre de
  texto y rayones, el párrafo se lee centrado y con espacio antes de
  las tarjetas de pilares.

## 2026-09-13 — Rayones reagrupados junto al título (Método y Pilares)

- El usuario mandó una captura del resultado de la sesión anterior y
  señaló dos problemas comparando contra la referencia visual original:
  el título de Método (`lam-03`) se veía partido en 3 líneas en vez de
  2, y "faltaban rayas" cerca del título (los rayones existentes
  quedaban lejos, cerca del CTA final, porque estaban posicionados
  respecto a toda la sección, que es muy alta).
- **Título en 2 líneas**: se agregó un `<br>` explícito en el `h2` de
  `lam-03` después de "fases," (mismo patrón que el `<br>` del H1 del
  Hero), en vez de depender del wrap automático por `max-width` en
  `ch`, que partía el texto en 3 líneas desparejas. Se ajustó también
  el `max-width` inline de ese `h2` a `32ch` para que la primera mitad
  del título no vuelva a wrapear sola antes del `<br>`.
- **Rayones pegados al título**: se creó un contenedor nuevo,
  `.lam-title-frame` (`position:relative`, en `css/styles.css`), que
  envuelve solo el `.sec-head-center` de cada sección (eyebrow + h2 +
  `.title-scribble` + `.lam-text` si existe). Los 7 `deco-scribble` de
  cada sección — antes hijos directos de `<section>` — pasaron a ser
  hijos de este contenedor, con sus `top`/`bottom` reajustados para
  quedar pegados arriba y abajo del bloque de título en vez de
  relativos a la altura total de la sección. Aplicado igual en
  `lam-03` y `lam-04` para mantenerlas idénticas, como ya establecía
  `memoria.md`. Ver `memoria.md` → "Títulos manuscritos tipo
  'marcador'..." para el detalle vigente (la descripción vieja de
  "Rayones 'marco' de la sección" quedó reemplazada por esta).
- **Verificado con Playwright** en este entorno: como
  `fonts.googleapis.com` no es accesible acá, se inyectó temporalmente
  el archivo de `Caveat` (bajado desde el repo de Google Fonts en
  GitHub) solo para las capturas de verificación, igual que en la
  sesión anterior. Se confirmaron 2 líneas en el título y la posición
  de los rayones en desktop (1600px, 1280px), tablet (900px) y un
  ancho intermedio (480px) — en mobile real (`≤720px`) los
  `deco-scribble` ya se ocultaban de antes y no aplica.

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

