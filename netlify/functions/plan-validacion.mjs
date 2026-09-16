// Validación pura del campo `tipo` que usa netlify/functions/plan.mjs
// (POST de "Mi plan"). Se extrae a este módulo propio, separado de
// plan.mjs y sin imports de @netlify/identity ni @netlify/database, para
// poder testear esTipoValido() con `node --test` sin necesitar
// node_modules instalado — plan.mjs sí depende de esos paquetes a nivel
// de módulo (se ejecutan al importarlo), así que testear la validación
// importando plan.mjs directo rompería si esos paquetes no están
// instalados en el entorno que corre los tests.
// Ver plan-tests-sinaptix.md (Prioridad 2) y tests/plan-validacion.test.mjs.
export const TIPOS_VALIDOS = ['antropometria', 'objetivo', 'reevaluacion'];

export function esTipoValido(tipo){
  return TIPOS_VALIDOS.includes(tipo);
}
