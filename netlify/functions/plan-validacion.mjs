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

// `datos: null` es cómo el cliente pide "borrar" un bloque (ver
// js/plan-sync.js): al generar un plan nuevo, la reevaluación anterior ya
// no corresponde y hay que sacarla también del servidor, no solo del
// localStorage — si no, planSyncCargar la trae de vuelta al iniciar sesión
// en otro dispositivo o después de borrar el localStorage local (ver
// memoria.md, FALLO 2 de la sesión 2026-09-19).
//
// Ese `null` solo tiene sentido para 'reevaluacion': 'antropometria' y
// 'objetivo' no tienen ningún flujo que los borre, así que un `datos: null`
// ahí es casi seguro un bug del cliente (o un body armado a mano) — se
// rechaza para no pisar sin querer un dato real con un null accidental.
// Para el resto de los casos, `datos` tiene que ser un objeto real (lo que
// ya mandan hoy los 3 formularios que llaman a planSyncGuardar).
export function esDatosValido(tipo, datos){
  if(datos === null) return tipo === 'reevaluacion';
  return datos !== undefined && typeof datos === 'object' && !Array.isArray(datos);
}
