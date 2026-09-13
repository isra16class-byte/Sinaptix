-- Tabla de "Mi plan": una fila por usuario autenticado de Netlify Identity,
-- con los 3 bloques de datos que se sincronizan desde localStorage
-- (antropometria, objetivo, reevaluacion). Ver memoria.md, sección
-- "Backend real para Mi plan", y netlify/functions/plan.js.
--
-- Esta migración se aplica sola durante el deploy (Netlify Database GA) --
-- nunca se corre a mano contra la base hosteada. Una vez aplicada en
-- cualquier entorno, no se edita: los cambios de esquema futuros van en un
-- archivo de migración nuevo.
CREATE TABLE mi_plan (
  user_id text PRIMARY KEY,
  email text,
  antropometria jsonb,
  objetivo jsonb,
  reevaluacion jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
