// Tests unitarios de netlify/functions/plan-validacion.mjs — Prioridad 2
// de plan-tests-sinaptix.md. Corre con `npm test` (= `node --test`), sin
// dependencias nuevas. Solo cubre esTipoValido(), la única parte de
// netlify/functions/plan.mjs que se pudo extraer como función pura: el
// resto del handler depende de @netlify/identity (getUser) y
// @netlify/database (getDatabase), que requieren un deploy real de
// Netlify para probarse de verdad (ver memoria.md, pendientes conocidos).
import test from 'node:test';
import assert from 'node:assert/strict';

import { esTipoValido, TIPOS_VALIDOS } from '../netlify/functions/plan-validacion.mjs';

test('esTipoValido - los 3 valores válidos devuelven true', () => {
  assert.equal(TIPOS_VALIDOS.length, 3);
  for(const tipo of TIPOS_VALIDOS){
    assert.equal(esTipoValido(tipo), true, `esperaba true para "${tipo}"`);
  }
});

test('esTipoValido - valor inválido devuelve false', () => {
  assert.equal(esTipoValido('otro'), false);
  assert.equal(esTipoValido('Antropometria'), false); // mayúscula no matchea
});

test('esTipoValido - string vacío devuelve false', () => {
  assert.equal(esTipoValido(''), false);
});

test('esTipoValido - undefined devuelve false', () => {
  assert.equal(esTipoValido(undefined), false);
});

test('esTipoValido - null devuelve false', () => {
  assert.equal(esTipoValido(null), false);
});
