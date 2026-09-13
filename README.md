# SINAPTIX — Neuroalimentación aplicada

Sitio web de SINAPTIX, un servicio de asesoría en neuroalimentación (nutrición
enfocada en rendimiento cognitivo: memoria, foco y energía mental).

Sitio 100% estático (HTML/CSS/JS puro, sin build step), desplegado en Netlify.

## Estructura del proyecto

```
.
├── index.html                 # Todo el markup del sitio (una sola página, secciones "lam-01" a "lam-06")
├── mi-plan.html                # Página propia de "Mi plan" (ver más abajo)
├── css/styles.css              # Estilos
├── js/script.js                # Lógica de index.html: modales, formularios, scroll, Netlify Identity
├── js/mi-plan.js                # Lógica de mi-plan.html
├── js/nutricion-planes.js       # Funciones puras del plan de nutrición, compartidas entre páginas
├── js/nutricion-wizard.js       # Wizard de 8 pasos de la encuesta de nutrición
├── js/plan-sync.js              # Sincronización de "Mi plan" con el backend (ver abajo)
├── netlify/functions/plan.js    # Netlify Function: lee/escribe "Mi plan" en Netlify Database
├── netlify/database/migrations/ # Migración SQL de la tabla mi_plan (la aplica el deploy, no la función)
├── package.json                 # Solo declara la dependencia @netlify/database (sitio sin build step propio)
├── img/                         # Logos e íconos (PNG/WebP)
├── svg/                         # Ilustraciones decorativas de fondo
└── netlify.toml                 # Configuración de build/despliegue/functions en Netlify
```

## Funcionalidad actual

- **Landing de una sola página** con secciones: Inicio, Visión, Método, Pilares,
  Beneficios y Contacto, navegables desde el riel lateral (visible en desktop).
- **Formularios** (`js/script.js`):
  - `formContacto` (contacto general) y `formAntro` (modal "Datos
    antropométricos") envían un correo real vía `mailto:` a
    `hola@sinaptix.com`.
  - `formNutricion` (modal "Nutrición especializada") es un wizard de 8
    pasos que genera el plan de neuroalimentación al instante (ya no
    manda correo): guarda la respuesta en `localStorage`
    (`sinaptix_objetivo`, con el detalle completo de la encuesta) y, si
    hay sesión iniciada, lo muestra de una en "Mi plan"; si no hay
    sesión, invita a iniciar sesión para guardarlo y verlo completo.
- **Login con Netlify Identity**:
  - Botón "Iniciar sesión" en el nav abre el modal de Identity (login/registro).
  - Con sesión iniciada, el botón cambia a mostrar el nombre del usuario (o
    "Mi cuenta"), y el botón "Acceder" se oculta.
  - Al iniciar sesión aparece la sección **"Mi plan"**, que muestra el correo
    del usuario, el último IMC guardado (si existe) y, si ya se completó la
    encuesta de nutrición, el plan de neuroalimentación completo (nutrientes
    clave, alimentos a priorizar/moderar, ajustes y avisos) reconstruido
    desde `localStorage`. Si todavía no se completó, muestra un botón para
    generarlo ahí mismo.

### Backend de "Mi plan" (Netlify DB + Netlify Functions)

Los 3 bloques de datos de "Mi plan" (antropometría, objetivo/plan de
nutrición, reevaluación) se guardan **tanto en `localStorage` como en el
servidor** cuando hay sesión iniciada:

- `localStorage` sigue siendo lo único que lee el resto del sitio para
  pintar la pantalla (no cambió nada de esa lectura) — sirve también como
  caché si no hay red o si se entra sin sesión.
- `js/plan-sync.js` (compartido entre `index.html` y `mi-plan.html`) manda
  una copia de cada guardado a `netlify/functions/plan.js`, que la escribe
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

## Requisitos en el dashboard de Netlify (no son código)

Para que el login funcione en un deploy dado, hay que activar esto una vez
desde el dashboard de Netlify, **por sitio**:

1. **Site configuration → Identity → Enable Identity.**
2. **Identity → Registration → Open** (para permitir que cualquiera se
   registre; SINAPTIX busca captar leads nuevos).

Sin esto, el botón "Iniciar sesión" muestra el error
`Failed to load settings from /.netlify/identity`.

## Desarrollo local

No hay build step. Basta con abrir `index.html` directamente o servirlo con
cualquier servidor estático (por ejemplo, la extensión Live Server de VS Code).
El login con Netlify Identity solo funciona en un dominio real desplegado en
Netlify con Identity activado (no funciona abriendo el archivo local ni en
`localhost` sin configurar el sitio).

## Flujo de contribución en este repo

Este repo se ha trabajado en sesiones donde el entorno de trabajo no tiene
credenciales propias de GitHub para hacer push directo. Por eso los cambios se
entregan como parches (`.patch`, generados con `git format-patch`) para
aplicarlos con:

```bash
git checkout main
git am 000X-nombre-del-parche.patch
git push origin main
```

Las ramas `main` y `master` se han mantenido sincronizadas manualmente con:

```bash
git push origin main:master
```

Si mantienes ambas ramas, confirma en el dashboard de Netlify cuál está
configurada como rama de producción para no perder de vista cuál desplegar.

## Próximos pasos (plan en curso)

1. ~~Provisionar **Netlify Database** (Postgres)~~ — resuelto:
   `package.json` declara `@netlify/database`, que auto-provisiona la base
   en el próximo build/deploy y aplica la migración de
   `netlify/database/migrations/` (ver sección "Backend de Mi plan"
   arriba). Nota: la primera implementación usó el paquete equivocado,
   `@netlify/neon` (extensión deprecada por Netlify) — corregido en una
   sesión posterior, ver `memoria.md`.
2. ~~Crear **Netlify Functions** para leer y escribir esos datos de forma
   segura~~ — resuelto: `netlify/functions/plan.js`, verifica la sesión vía
   `context.clientContext.user` (Netlify decodifica el JWT de Identity
   automáticamente a partir del header `Authorization`).
3. ~~Conectar los formularios existentes a esas funciones cuando haya
   sesión iniciada~~ — resuelto: `js/plan-sync.js`, enganchado en los 3
   puntos de guardado (`formAntro`, `formNutricion` en ambas páginas,
   `formReevaluacion`).
4. ~~Cargar los datos guardados en el servidor al iniciar sesión~~ —
   resuelto: `planSyncCargar()` se llama al mostrar el estado "con sesión"
   de `mi-plan.html`.
5. **Pendiente de verificación real** (no se pudo probar en un deploy de
   Netlify real desde esta sesión, ver `memoria.md`): confirmar en un sitio
   desplegado que la base se provisiona sola, que el login manda un JWT que
   la función decodifica correctamente, y que "Mi plan" efectivamente
   persiste entre dos navegadores/dispositivos distintos con la misma
   cuenta.
6. Monitorear el uso de créditos en el dashboard de Netlify (plan Free: 300
   créditos/mes, ahora sumando invocaciones de Functions) durante las
   primeras semanas tras el lanzamiento.

## Aviso legal

El contenido del sitio es informativo y no reemplaza diagnóstico médico ni
nutricional certificado (ver pie de página del sitio).
