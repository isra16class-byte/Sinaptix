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
