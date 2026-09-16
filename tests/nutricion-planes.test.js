// Tests unitarios de js/nutricion-planes.js — Prioridad 1 de
// plan-tests-sinaptix.md. Corre con `npm test` (= `node --test tests/`),
// sin dependencias nuevas. Solo cubre las funciones de cálculo puro
// (ver el `module.exports` guardado al final de nutricion-planes.js);
// no cubre las que arman HTML (nutriBuildResumenHTML,
// nutriBuildBarChartHTML) ni el contenido de NUTRI_PLANES.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// nutriGuardarAntropometriaSiFalta usa `localStorage` como variable
// global (pensado para el navegador) — se mockea acá antes de requerir
// el módulo para que la referencia libre a `localStorage` la encuentre
// en el scope global de Node.
function crearLocalStorageMock(){
  let store = {};
  return {
    getItem(key){ return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value){ store[key] = String(value); },
    removeItem(key){ delete store[key]; },
    clear(){ store = {}; }
  };
}
global.localStorage = crearLocalStorageMock();

const {
  nutriResolverObjetivo,
  nutriConstruirAjustes,
  nutriConstruirAvisos,
  nutriGuardarAntropometriaSiFalta,
  imcCategoria,
  imcGaugeAngulo,
  gaugeComputeAreas,
  gaugeColorForPercent,
  gaugeDeltaHtml,
  NUTRI_RANGOS,
  nutriValidarRango,
  nutriValidarNombre,
  nutriEscaparHTML
} = require(path.join('..', 'js', 'nutricion-planes.js'));

// ===================== nutriResolverObjetivo =====================

test('nutriResolverObjetivo — objetivo explícito se devuelve tal cual', () => {
  const resultado = nutriResolverObjetivo({ objetivo: 'Mejorar concentración' });
  assert.deepStrictEqual(resultado, ['Mejorar concentración']);
});

test('nutriResolverObjetivo — "No estoy seguro" resuelve por la escala más alta', () => {
  const resultado = nutriResolverObjetivo({
    objetivo: 'No estoy seguro',
    concentracion: 5, fatiga: 2, olvidos: 3, estres: 1
  });
  assert.deepStrictEqual(resultado, ['Mejorar concentración']);
});

test('nutriResolverObjetivo — empate entre escalas devuelve todos los empatados', () => {
  const resultado = nutriResolverObjetivo({
    objetivo: 'No estoy seguro',
    concentracion: 4, fatiga: 4, olvidos: 2, estres: 1
  });
  assert.deepStrictEqual(resultado, ['Mejorar concentración', 'Reducir fatiga mental']);
});

// ===================== nutriConstruirAjustes =====================

function baseAjustes(overrides){
  return Object.assign({
    alergias: [], alergiaOtra: '', restriccion: '', presupuesto: '',
    tiempoCocina: '', disgustos: '', horaExigencia: 'Variable'
  }, overrides);
}

test('nutriConstruirAjustes — sin datos que disparen ajustes devuelve vacío', () => {
  assert.deepStrictEqual(nutriConstruirAjustes(baseAjustes()), []);
});

test('nutriConstruirAjustes — alergias + alergiaOtra combinadas en un solo texto', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({ alergias: ['Maní'], alergiaOtra: 'Kiwi' }));
  assert.strictEqual(ajustes.length, 1);
  assert.match(ajustes[0], /Maní, Kiwi/);
});

test('nutriConstruirAjustes — Vegetariano/Vegano sustituye fuentes animales', () => {
  const veg = nutriConstruirAjustes(baseAjustes({ restriccion: 'Vegetariano' }));
  const vegano = nutriConstruirAjustes(baseAjustes({ restriccion: 'Vegano' }));
  assert.match(veg[0], /equivalentes vegetales/);
  assert.match(vegano[0], /equivalentes vegetales/);
});

test('nutriConstruirAjustes — Sin gluten sustituye cereales', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({ restriccion: 'Sin gluten' }));
  assert.match(ajustes[0], /sin gluten/);
});

test('nutriConstruirAjustes — presupuesto ajustado suma alternativas económicas', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({ presupuesto: 'Ajustado' }));
  assert.match(ajustes[0], /económicas/);
});

test('nutriConstruirAjustes — poco tiempo o come afuera simplifica preparaciones', () => {
  const pocoTiempo = nutriConstruirAjustes(baseAjustes({ tiempoCocina: 'Cocino yo con poco tiempo' }));
  const comeAfuera = nutriConstruirAjustes(baseAjustes({ tiempoCocina: 'Como afuera la mayoría de días' }));
  assert.match(pocoTiempo[0], /preparaciones rápidas/);
  assert.match(comeAfuera[0], /preparaciones rápidas/);
});

test('nutriConstruirAjustes — disgustos se excluyen', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({ disgustos: 'Brócoli' }));
  assert.match(ajustes[0], /Brócoli/);
});

test('nutriConstruirAjustes — hora de exigencia distinta de Variable ubica el snack', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({ horaExigencia: 'Mañana' }));
  assert.match(ajustes[0], /mañana/);
});

test('nutriConstruirAjustes — combina varios ajustes a la vez sin pisarse', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({
    alergias: ['Maní'], restriccion: 'Vegano', presupuesto: 'Ajustado'
  }));
  assert.strictEqual(ajustes.length, 3);
});

// ===================== nutriConstruirAvisos =====================

function baseAvisos(overrides){
  return Object.assign({
    condiciones: [], medicacion: 'No', sueno: '7 a 8', calidadSueno: 5,
    estres: '2', fatiga: '2', cafeina: 'No tomo', ultraprocesados: 'Rara vez'
  }, overrides);
}

test('nutriConstruirAvisos — datos "todo bien" no dispara ningún aviso', () => {
  assert.deepStrictEqual(nutriConstruirAvisos(baseAvisos()), []);
});

test('nutriConstruirAvisos — condición de salud o medicación dispara aviso alto', () => {
  const porCondicion = nutriConstruirAvisos(baseAvisos({ condiciones: ['Diabetes'] }));
  const porMedicacion = nutriConstruirAvisos(baseAvisos({ medicacion: 'Sí' }));
  assert.strictEqual(porCondicion.some(a => a.nivel === 'alto'), true);
  assert.strictEqual(porMedicacion.some(a => a.nivel === 'alto'), true);
});

test('nutriConstruirAvisos — sueño malo por sí solo NO dispara el aviso combinado', () => {
  const avisos = nutriConstruirAvisos(baseAvisos({ sueno: 'Menos de 5' }));
  assert.strictEqual(avisos.some(a => /Dormir poco/.test(a.texto)), false);
});

test('nutriConstruirAvisos — sueño malo + estrés alto sí dispara el aviso combinado', () => {
  const avisos = nutriConstruirAvisos(baseAvisos({ sueno: 'Menos de 5', estres: '5' }));
  assert.strictEqual(avisos.some(a => /Dormir poco/.test(a.texto)), true);
});

test('nutriConstruirAvisos — estrés + fatiga altos a la vez dispara aviso propio', () => {
  const avisos = nutriConstruirAvisos(baseAvisos({ estres: '4', fatiga: '4' }));
  assert.strictEqual(avisos.some(a => /magnesio y complejo B/.test(a.texto)), true);
});

test('nutriConstruirAvisos — cafeína alta (4 o más) vs moderada (2 a 3)', () => {
  const alta = nutriConstruirAvisos(baseAvisos({ cafeina: '4 o más al día' }));
  const moderada = nutriConstruirAvisos(baseAvisos({ cafeina: '2 a 3 al día' }));
  assert.strictEqual(alta.find(a => /cafeína/.test(a.texto)).nivel, 'alto');
  assert.strictEqual(moderada.find(a => /cafeína/.test(a.texto)).nivel, 'moderado');
});

test('nutriConstruirAvisos — ultraprocesados a diario vs algunas veces por semana', () => {
  const diario = nutriConstruirAvisos(baseAvisos({ ultraprocesados: 'A diario' }));
  const algunas = nutriConstruirAvisos(baseAvisos({ ultraprocesados: 'Algunas veces por semana' }));
  assert.strictEqual(diario.find(a => /ultraprocesados/.test(a.texto)).nivel, 'alto');
  assert.strictEqual(algunas.find(a => /ultraprocesados/.test(a.texto)).nivel, 'moderado');
});

// ===================== imcCategoria =====================

test('imcCategoria — bordes exactos de cada rango', () => {
  assert.strictEqual(imcCategoria(18.49).zona, 'bajo');
  assert.strictEqual(imcCategoria(18.5).zona, 'saludable');
  assert.strictEqual(imcCategoria(24.99).zona, 'saludable');
  assert.strictEqual(imcCategoria(25).zona, 'sobrepeso');
  assert.strictEqual(imcCategoria(29.99).zona, 'sobrepeso');
  assert.strictEqual(imcCategoria(30).zona, 'vigilar');
});

// ===================== imcGaugeAngulo =====================

test('imcGaugeAngulo — mínimo, máximo, punto medio y recorte fuera de rango', () => {
  assert.strictEqual(imcGaugeAngulo(15), 180);
  assert.strictEqual(imcGaugeAngulo(40), 0);
  assert.strictEqual(imcGaugeAngulo(27.5), 90);
  assert.strictEqual(imcGaugeAngulo(5), imcGaugeAngulo(15));   // se recorta al mínimo
  assert.strictEqual(imcGaugeAngulo(60), imcGaugeAngulo(40));  // se recorta al máximo
});

// ===================== gaugeComputeAreas =====================

test('gaugeComputeAreas — invierte la escala 1-5 correctamente', () => {
  const areas = gaugeComputeAreas({ concentracion: 1, olvidos: 5, fatiga: 3, estres: 2 });
  assert.deepStrictEqual(areas, { foco: 5, memoria: 1, energia: 3, calma: 4 });
});

test('gaugeComputeAreas — valores faltantes caen al default (3)', () => {
  const areas = gaugeComputeAreas({});
  assert.deepStrictEqual(areas, { foco: 3, memoria: 3, energia: 3, calma: 3 });
});

// ===================== gaugeColorForPercent =====================

test('gaugeColorForPercent — 0%/50%/100% dan los 3 colores exactos', () => {
  assert.strictEqual(gaugeColorForPercent(0), '#b3261e');
  assert.strictEqual(gaugeColorForPercent(50), '#c1703b');
  assert.strictEqual(gaugeColorForPercent(100), '#2e7d5b');
});

test('gaugeColorForPercent — valores fuera de 0-100 se recortan', () => {
  assert.strictEqual(gaugeColorForPercent(-10), gaugeColorForPercent(0));
  assert.strictEqual(gaugeColorForPercent(150), gaugeColorForPercent(100));
});

// ===================== gaugeDeltaHtml =====================

test('gaugeDeltaHtml — sin "después" devuelve string vacío', () => {
  assert.strictEqual(gaugeDeltaHtml(40, null), '');
});

test('gaugeDeltaHtml — delta positivo, negativo y cero', () => {
  assert.match(gaugeDeltaHtml(40, 60), /\+20 pts/);
  assert.match(gaugeDeltaHtml(40, 60), /var\(--green\)/);
  assert.match(gaugeDeltaHtml(60, 40), /-20 pts/);
  assert.match(gaugeDeltaHtml(60, 40), /#B3261E/);
  assert.match(gaugeDeltaHtml(50, 50), /sin cambios/);
});

// ===================== nutriGuardarAntropometriaSiFalta =====================

test('nutriGuardarAntropometriaSiFalta — no pisa un dato ya guardado', () => {
  global.localStorage.clear();
  global.localStorage.setItem('sinaptix_antropometria', JSON.stringify({ imc: 1 }));
  const resultado = nutriGuardarAntropometriaSiFalta({ peso: 70, talla: 175, edad: 30, sexo: 'Masculino' });
  assert.strictEqual(resultado, false);
  assert.strictEqual(JSON.parse(global.localStorage.getItem('sinaptix_antropometria')).imc, 1);
});

test('nutriGuardarAntropometriaSiFalta — datos fuera de rango no guardan nada', () => {
  global.localStorage.clear();
  assert.strictEqual(nutriGuardarAntropometriaSiFalta({ peso: 0, talla: 175, edad: 30, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarAntropometriaSiFalta({ peso: 70, talla: 300, edad: 30, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarAntropometriaSiFalta({ peso: 70, talla: 175, edad: 150, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarAntropometriaSiFalta({ peso: 70, talla: 175, edad: 30, sexo: '' }), false);
  assert.strictEqual(global.localStorage.getItem('sinaptix_antropometria'), null);
});

test('nutriGuardarAntropometriaSiFalta — datos válidos guardan el IMC calculado', () => {
  global.localStorage.clear();
  const resultado = nutriGuardarAntropometriaSiFalta({ peso: 70, talla: 175, edad: 30, sexo: 'Masculino' });
  assert.strictEqual(resultado, true);
  const guardado = JSON.parse(global.localStorage.getItem('sinaptix_antropometria'));
  const imcEsperado = 70 / (1.75 * 1.75);
  assert.ok(Math.abs(guardado.imc - imcEsperado) < 0.0001);
});

// ===================== NUTRI_RANGOS / nutriValidarRango =====================
test('nutriValidarRango — dentro del rango devuelve null', () => {
  assert.strictEqual(nutriValidarRango('edad', 30), null);
  assert.strictEqual(nutriValidarRango('edad', 14), null); // límite inferior inclusive
  assert.strictEqual(nutriValidarRango('edad', 120), null); // límite superior inclusive
  assert.strictEqual(nutriValidarRango('peso', 70), null);
  assert.strictEqual(nutriValidarRango('talla', 175), null);
  assert.strictEqual(nutriValidarRango('pantallas', 8), null);
});

test('nutriValidarRango — fuera de rango devuelve un mensaje', () => {
  assert.ok(nutriValidarRango('edad', 13)); // por debajo del mínimo
  assert.ok(nutriValidarRango('edad', 121)); // por encima del máximo (incluye longevidad extrema real)
  assert.ok(nutriValidarRango('edad', -5));
  assert.ok(nutriValidarRango('peso', 0));
  assert.ok(nutriValidarRango('peso', 251));
  assert.ok(nutriValidarRango('talla', 99));
  assert.ok(nutriValidarRango('talla', 999));
  assert.ok(nutriValidarRango('pantallas', -1));
  assert.ok(nutriValidarRango('pantallas', 19));
});

test('nutriValidarRango — valor vacío no es "irracional", es opcional', () => {
  assert.strictEqual(nutriValidarRango('peso', ''), null);
  assert.strictEqual(nutriValidarRango('talla', undefined), null);
});

test('nutriValidarRango — no numérico devuelve mensaje', () => {
  assert.ok(nutriValidarRango('edad', 'abc'));
});

test('nutriValidarRango — campo sin rango definido no valida (no rompe)', () => {
  assert.strictEqual(nutriValidarRango('objetivo', 'cualquier cosa'), null);
});

// ===================== nutriValidarNombre =====================
test('nutriValidarNombre — nombre válido devuelve null', () => {
  assert.strictEqual(nutriValidarNombre('Ana'), null);
  assert.strictEqual(nutriValidarNombre('María José'), null);
  assert.strictEqual(nutriValidarNombre("O'Higgins"), null);
});

test('nutriValidarNombre — vacío, solo espacios o muy corto devuelve mensaje', () => {
  assert.ok(nutriValidarNombre(''));
  assert.ok(nutriValidarNombre('   '));
  assert.ok(nutriValidarNombre('A'));
});

test('nutriValidarNombre — solo números o símbolos devuelve mensaje', () => {
  assert.ok(nutriValidarNombre('12345'));
  assert.ok(nutriValidarNombre('....'));
});

// ===================== nutriEscaparHTML =====================
test('nutriEscaparHTML — neutraliza tags y atributos de evento', () => {
  const resultado = nutriEscaparHTML('<img src=x onerror="alert(1)">');
  assert.ok(!resultado.includes('<img'));
  assert.ok(resultado.includes('&lt;img'));
});

test('nutriEscaparHTML — texto normal no cambia de significado', () => {
  assert.strictEqual(nutriEscaparHTML('Maní y kiwi'), 'Maní y kiwi');
});

test('nutriConstruirAjustes — alergiaOtra y disgustos con HTML quedan escapados', () => {
  const ajustes = nutriConstruirAjustes(baseAjustes({
    alergiaOtra: '<b>test</b>',
    disgustos: '<script>x</script>'
  }));
  const texto = ajustes.join(' ');
  assert.ok(!texto.includes('<b>'));
  assert.ok(!texto.includes('<script>'));
  assert.ok(texto.includes('&lt;b&gt;'));
  assert.ok(texto.includes('&lt;script&gt;'));
});
