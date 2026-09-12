# Memoria del proyecto — SINAPTIX

> Este archivo existe para que **cualquier sesión nueva** (de Claude o de
> quien sea) pueda retomar el trabajo en este repo sin que el usuario tenga
> que volver a explicar el contexto. Léelo completo antes de tocar código.
> Actualízalo en cada patch que generes (ver "Reglas de esta memoria" al
> final).

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

**Estilo visual (vigente desde el commit "Adaptar el estilo visual al look
de la página pública de Odoo")**: el sitio se rediseñó a partir del look de
`https://www.odoo.com/es`. Antes tenía un tema oscuro/navy con tipografía
editorial (Space Grotesk + IBM Plex Mono). Ahora:

- **Paleta** (definida en `css/styles.css`, bloque `:root`): fondo blanco
  (`--paper:#FFFFFF`) / lavanda muy claro para secciones alternadas
  (`--panel:#F7F1F5`), morado de marca `--purple:#714B67` (y
  `--purple-dark:#4B2E45`) como color estructural principal (botones, nav,
  eyebrows, iconos), más acentos secundarios: verde `--green:#2E7D5B`,
  terracota `--gold:#C1703B`, azul `--navy-bright:#3B6EA5`. Texto en
  `--ink:#26161F` y variantes con opacidad.
- **Tipografía**: una sola familia, `Inter` (Google Fonts), en vez de las
  tres fuentes anteriores. Sin mayúsculas ni tracking tipo monoespaciado en
  los eyebrows.
- **Componentes**: botones tipo píldora (`border-radius: 999px`), tarjetas
  redondeadas con sombra suave (`--radius`, `--shadow`, `--shadow-lg`) para
  stats, pilares nutricionales y testimonios, nav fijo blanco con blur y una
  barra de progreso de scroll (`.nav-progress`) que reemplazó al "rail"
  lateral (hilo sináptico) que existía antes — ese rail se eliminó de HTML,
  CSS y JS.
- El contenido/copy en español **no cambió**, solo el sistema visual.
- Los SVG decorativos (`svg/*.svg`) y el ícono del hero se recolorearon para
  funcionar sobre fondo claro (antes estaban pensados para fondo oscuro).

**Estructura de archivos** (sin cambios respecto al README): `index.html`
(todo el markup, secciones `lam-01` a `lam-06`), `css/styles.css`,
`js/script.js`, `img/`, `svg/`, `netlify.toml`.

## Pendientes conocidos (ver README.md → "Próximos pasos" para el detalle)

- Backend real para "Mi plan" (Netlify Database + Functions) — hoy los datos
  antropométricos y el objetivo cognitivo solo viven en `localStorage`.
- No hay tareas de diseño pendientes anotadas por el usuario a la fecha de
  esta entrada; si pide más ajustes de estilo, este documento debe
  actualizarse con las nuevas decisiones tomadas.
