# Changelog

Historial de cambios de este repo, un patch por entrada, orden cronológico
inverso (lo más nuevo arriba). No se borran entradas viejas. Ver
`memoria.md` para el estado actual del proyecto y las reglas de este
archivo.

## Sin fecha (sesión en curso) — Memoria y changelog

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
