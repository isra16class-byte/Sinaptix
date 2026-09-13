# SINAPTIX — Neuroalimentación aplicada

Sitio web de SINAPTIX, un servicio de asesoría en neuroalimentación (nutrición
enfocada en rendimiento cognitivo: memoria, foco y energía mental).

Sitio 100% estático (HTML/CSS/JS puro, sin build step), desplegado en Netlify.

## Estructura del proyecto

```
.
├── index.html          # Todo el markup del sitio (una sola página, secciones "lam-01" a "lam-06")
├── css/styles.css       # Estilos
├── js/script.js         # Lógica: modales, formularios, scroll, Netlify Identity
├── img/                  # Logos e íconos (PNG)
├── svg/                  # Ilustraciones decorativas de fondo
└── netlify.toml          # Configuración de build/despliegue en Netlify
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

### Limitación actual conocida

Los datos de "Mi plan" (IMC, objetivo cognitivo) hoy viven en `localStorage`
del navegador, **no en una base de datos**. Esto significa que no persisten
entre dispositivos ni navegadores distintos, aunque el usuario inicie sesión
con la misma cuenta. Ver la sección "Próximos pasos" abajo.

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

1. Provisionar **Netlify Database** (Postgres/Neon) para guardar los datos de
   cada usuario asociados a su cuenta (no solo en `localStorage`).
2. Crear **Netlify Functions** (`netlify/functions/`) para leer y escribir esos
   datos de forma segura, verificando el JWT del usuario autenticado.
3. Conectar los formularios existentes (`formAntro`, `formNutricion`) a esas
   funciones cuando haya sesión iniciada.
4. Cargar los datos guardados en el servidor al iniciar sesión, para que
   "Mi plan" persista entre dispositivos.
5. Monitorear el uso de créditos en el dashboard de Netlify (plan Free: 300
   créditos/mes) durante las primeras semanas tras el lanzamiento.

## Aviso legal

El contenido del sitio es informativo y no reemplaza diagnóstico médico ni
nutricional certificado (ver pie de página del sitio).
