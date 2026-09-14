# Changelog — SINAPTIX

> Historial cronológico inverso (la entrada más nueva va arriba) de los
> patches aplicados a este repo. Ver `memoria.md` para el "estado
> presente" del producto y las reglas de cómo se actualiza este archivo.
>
> El historial anterior a esta fecha (todas las sesiones de rediseño,
> wizard de nutrición, "Mi plan", backend, ilustraciones, etc.) quedó
> archivado completo en `historico/changelog-2026-09-14.md`.

## 2026-09-14 — Archivar memoria.md y changelog.md, reiniciar condensados

Se movieron los archivos `memoria.md` (2238 líneas) y `changelog.md`
(1960 líneas) a `historico/memoria-2026-09-14.md` y
`historico/changelog-2026-09-14.md` respectivamente, sin editar su
contenido. Se crearon versiones nuevas de ambos archivos en la raíz:

- `memoria.md` nuevo: mantiene íntegras las reglas de proceso (ramas,
  autoría, flujo de patches, reglas de esta memoria) y agrega una sección
  "Estado actual del diseño" condensada (paleta, tipografía, componentes
  principales, backend) con referencias puntuales al histórico para el
  detalle completo de cada decisión.
- `changelog.md` nuevo: arranca vacío salvo esta misma entrada, apuntando
  al histórico para todo lo anterior.

Motivo: ambos archivos habían crecido lo suficiente como para ser
costosos de leer completos al inicio de cada sesión nueva, sin que la
mayor parte de ese detalle (ajustes finos de posición/color en secciones
puntuales) fuera necesaria para retomar trabajo en otra parte del sitio.
