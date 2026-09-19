# SINAPTIX — Neuroalimentación aplicada

Sitio web de SINAPTIX, un servicio de asesoría en neuroalimentación (nutrición
enfocada en rendimiento cognitivo: memoria, foco y energía mental).

Sitio 100% estático (HTML/CSS/JS puro, sin build step propio salvo las
Netlify Functions del backend), desplegado en Netlify.

## Estructura del proyecto

```
.
├── index.html                          # Landing principal, secciones "lam-01" a "lam-07"
├── mi-plan.html                        # Página propia de "Mi plan" (login/registro y dashboard)
├── css/styles.css                      # Toda la hoja de estilos
├── js/script.js                        # Lógica de index.html (modales, wizard, Identity, anillos de Método)
├── js/mi-plan.js                       # Lógica propia de mi-plan.html (login/registro/recuperación, dashboard)
├── js/nutricion-planes.js              # Funciones puras (planes, cálculo de IMC/gauges), compartido
├── js/nutricion-wizard.js              # Motor del wizard de 8 pasos, compartido
├── js/mi-plan-pdf.js                   # Genera el PDF de "Mi plan" con jsPDF (lazy load, sin html2canvas)
├── js/nav-menu.js                      # Menú hamburguesa del nav en mobile, compartido
├── js/plan-sync.js                     # Sincroniza localStorage con el backend cuando hay sesión
├── netlify/functions/plan.mjs          # Netlify Function (formato moderno): lee/escribe "Mi plan" en Netlify Database
├── netlify/functions/plan-validacion.mjs # Validación de tipos, sin dependencias de Identity/Database (testeable solo)
├── netlify/database/migrations/        # Migración SQL de la tabla mi_plan (la aplica el deploy, no la función)
├── tests/                              # Tests unitarios (node --test) y un e2e con Playwright, ver abajo
├── package.json                        # Declara @netlify/database y @netlify/identity (sitio sin build step propio)
├── img/, svg/                          # Assets: logos, íconos, decoraciones, ilustraciones
├── scripts/                            # Scripts Python que reproducen por código algunos assets (fondo/íconos de Visión, etc.)
├── docs/                               # Documentación visual que no se publica (mockups de referencia)
├── historico/                          # Archivo de memoria.md/changelog.md de sesiones anteriores, por fecha
├── memoria.md, changelog.md            # Memoria de trabajo para retomar sesiones (ver ambos antes de tocar código)
└── netlify.toml                        # Configuración de build/despliegue/functions en Netlify
```

## Funcionalidad actual

- **Landing de una sola página** (`index.html`) con secciones: Hero, Visión,
  Método, Pilares, Beneficios, Conócenos y un mini-hero de Cierre, navegables
  desde el nav superior (en mobile, ≤720px, con menú hamburguesa).
- **Encuesta de nutrición — wizard de 8 pasos** (`#formNutricion`, motor en
  `js/nutricion-wizard.js`): objetivo, datos personales, rutina, hábitos,
  salud, percepción actual, preferencias. Al terminar genera el plan de
  neuroalimentación al instante (sin enviar ningún correo): lo guarda en
  `localStorage` (`sinaptix_objetivo`, con el detalle completo) y, si hay
  sesión iniciada, lo sincroniza también con el servidor (ver más abajo). Es
  el mismo wizard, cargado como modal en `index.html` o inline en
  `mi-plan.html`.
- **"Mi plan" (`mi-plan.html`)**: página propia con login/registro/
  recuperación de contraseña **propios** (formularios a medida sobre
  Netlify Identity, no el widget de Identity). Con sesión iniciada muestra
  un dashboard con:
  - IMC y objetivo cognitivo, con medidor y anillos de progreso (Foco,
    Memoria, Energía, Calma) — comparables contra una reevaluación
    posterior (`#formReevaluacion`, mismas 4 preguntas, botón "Actualizar").
  - Detalle completo del plan (nutrientes clave, alimentos a priorizar/
    moderar, ajustes y avisos personalizados).
  - Descarga del plan como **PDF** (`js/mi-plan-pdf.js`, jsPDF 3.0.1 vía
    `<script>` de cdnjs en lazy load): documento vectorial (texto
    seleccionable, sin `html2canvas`) generado 100% en el navegador de quien
    hace click, sin tocar ninguna Netlify Function.
- **Login con Netlify Identity**: en `index.html` solo se usa para saber si
  hay sesión (mostrar "Mi plan" en el nav en vez de "Iniciar sesión"); el
  login/registro real ocurre en `mi-plan.html`.

### Backend de "Mi plan" (Netlify DB + Netlify Functions)

Los 3 bloques de datos de "Mi plan" (antropometría, objetivo/plan de
nutrición, reevaluación) se guardan **tanto en `localStorage` como en el
servidor** cuando hay sesión iniciada:

- `localStorage` sigue siendo lo único que lee el resto del sitio para
  pintar la pantalla (no cambió nada de esa lectura) — sirve también como
  caché si no hay red o si se entra sin sesión.
- `js/plan-sync.js` (compartido entre `index.html` y `mi-plan.html`) manda
  una copia de cada guardado a `netlify/functions/plan.mjs`, que la escribe
  en Netlify Database (Postgres, GA) asociada al usuario autenticado. Al
  entrar a "Mi plan" con sesión iniciada, primero trae lo que haya en el
  servidor y lo mezcla en `localStorage` (el servidor manda) — así el plan
  generado en un dispositivo aparece también en otro, con la misma cuenta.
- Si la sincronización falla (sin red, función caída, etc.) nunca bloquea
  ni rompe el formulario que la disparó: solo queda un `console.warn` y el
  dato sigue guardado en este navegador, como pasaba antes de este backend.

Ver `memoria.md`, sección "Backend real para Mi plan", para el detalle
completo de la implementación y lo que falta verificar (incluye la
corrección de una sesión posterior: el paquete original, `@netlify/neon`,
quedó deprecado por Netlify y se reemplazó por `@netlify/database`).

**Provisionamiento de la base de datos**: no requiere nada manual en el
dashboard de Netlify — al tener `@netlify/database` en `package.json`,
Netlify provisiona la base (Netlify Database) y aplica automáticamente la
migración de `netlify/database/migrations/` en el próximo build/deploy, sin
que haga falta configurar ninguna variable de entorno a mano. Ver
[docs de Netlify Database](https://docs.netlify.com/build/data-and-storage/netlify-database/getting-started/).

## Tests

El proyecto tiene tests unitarios con `node --test` (nativo de Node, sin
dependencias nuevas) sobre la lógica de cálculo puro, más un e2e opcional
con Playwright:

```bash
npm test
```

- `tests/nutricion-planes.test.js` — cálculo de plan/IMC/gauges/validación.
- `tests/plan-validacion.test.mjs` — validación de tipos de `plan.mjs`.
- `tests/mi-plan-pdf.test.js` — modelo de datos del PDF (compara siempre
  contra las mismas funciones que usa el dashboard, no valores a mano).
- `tests/mi-plan-pdf.e2e.test.mjs` — e2e con Playwright sobre el botón de
  descarga del PDF. **Playwright y jsPDF no están en `package.json` a
  propósito** (para que Netlify no los instale en cada deploy): si faltan,
  este archivo se saltea con un mensaje en vez de fallar. Para correrlo:
  `npm i -D playwright jspdf && npx playwright install chromium`.

No hay CI (`netlify.toml` con `command=""`): correr `npm test` es manual
antes de generar cualquier patch que toque `js/nutricion-planes.js` o
`netlify/functions/plan.mjs`/`plan-validacion.mjs`. El diseño/layout no se
testea con una suite fija (se verifica con Playwright ad hoc en cada patch
de UI). Ver `memoria.md`, sección "Tests", para el detalle de qué cubre
cada archivo y qué queda fuera a propósito.

## Requisitos en el dashboard de Netlify (no son código)

Para que el login funcione en un deploy dado, hay que activar esto una vez
desde el dashboard de Netlify, **por sitio**:

1. **Site configuration → Identity → Enable Identity.**
2. **Identity → Registration → Open** (para permitir que cualquiera se
   registre; SINAPTIX busca captar leads nuevos).

Sin esto, el login en `mi-plan.html` no funciona.

## Desarrollo local

No hay build step propio. Basta con abrir `index.html`/`mi-plan.html`
directamente o servirlos con cualquier servidor estático (por ejemplo, la
extensión Live Server de VS Code). El login con Netlify Identity solo
funciona en un dominio real desplegado en Netlify con Identity activado (no
funciona abriendo el archivo local ni en `localhost` sin configurar el
sitio).

## Aviso legal

El contenido del sitio es informativo y no reemplaza diagnóstico médico ni
nutricional certificado (ver pie de página del sitio).
