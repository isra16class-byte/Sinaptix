// Tests de js/plan-aviso.js: el criterio de "ya hay un plan guardado" que
// decide si se muestra el aviso antes de volver a generarlo y qué dice el
// botón de Mi plan. El modal en sí (DOM, foco, Esc) se verifica con
// Playwright a ojo; acá solo la parte pura.
const test = require('node:test');
const assert = require('node:assert');
const { hayPlanGuardado, CLAVE_PLAN } = require('../js/plan-aviso.js');

function storageCon(valor){
  return { getItem(k){ return k === CLAVE_PLAN ? valor : null; } };
}

test('sin nada guardado no hay plan', () => {
  assert.strictEqual(hayPlanGuardado(storageCon(null)), false);
});

test('un plan válido (JSON de objeto) cuenta como plan guardado', () => {
  const plan = JSON.stringify({ objetivo: 'Memoria + Foco', encuesta: {}, fecha: '2026-09-19T00:00:00.000Z' });
  assert.strictEqual(hayPlanGuardado(storageCon(plan)), true);
});

test('un dato corrupto se trata como sin plan, igual que el dashboard', () => {
  assert.strictEqual(hayPlanGuardado(storageCon('{no es json')), false);
});

test('valores JSON que no son un objeto no cuentan como plan', () => {
  assert.strictEqual(hayPlanGuardado(storageCon('null')), false);
  assert.strictEqual(hayPlanGuardado(storageCon('123')), false);
  assert.strictEqual(hayPlanGuardado(storageCon('""')), false);
});

test('sin localStorage disponible no revienta', () => {
  assert.strictEqual(hayPlanGuardado({ getItem(){ throw new Error('bloqueado'); } }), false);
});

test('usa la misma clave que el resto del sitio', () => {
  assert.strictEqual(CLAVE_PLAN, 'sinaptix_objetivo');
});
