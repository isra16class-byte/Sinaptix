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

// nutriGuardarOActualizarAntropometria usa `localStorage` como variable
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
  NUTRI_PLANES,
  nutriResolverObjetivo,
  nutriNutrientesClave,
  nutriCambiosDesdeDiagnostico,
  nutriConstruirAjustes,
  nutriConstruirAvisos,
  nutriGuardarOActualizarAntropometria,
  imcCategoria,
  imcGaugeAngulo,
  imcGaugeAgujaDeg,
  imcGaugeAgujaDegInicial,
  imcGaugeMarkerPos,
  imcGaugeGradientStops,
  imcGaugeGradientDefsHtml,
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

// ===================== nutriNutrientesClave =====================
// Chips de "Nutrientes clave de tu plan" (tarjeta Antropometría de
// mi-plan.html). Se comparan contra NUTRI_PLANES en vez de contra textos
// escritos a mano: si cambia el contenido de un plan, el chip lo sigue.

const LARGO_MAX_CHIP = 26;

test('nutriNutrientesClave — un solo objetivo: los nutrientes de ese plan, sin repetir', () => {
  const objetivo = 'Manejo de estrés mental';
  const chips = nutriNutrientesClave({ objetivo });
  const plan = NUTRI_PLANES[objetivo];
  assert.equal(chips.length, Math.min(plan.nutrientes.length, 6));
  assert.equal(new Set(chips).size, chips.length);
  // Cada chip es el nombre completo o su etiqueta corta: nunca inventa nada.
  const completos = plan.nutrientes.join(' | ').toLowerCase();
  chips.forEach(c => {
    const primeraPalabra = c.split(/[ ,/(]/)[0].toLowerCase();
    assert.ok(completos.includes(primeraPalabra), 'chip fuera del plan: '+c);
  });
});

test('nutriNutrientesClave — cambia según el objetivo de la persona', () => {
  const foco = nutriNutrientesClave({ objetivo: 'Mejorar concentración' });
  const fatiga = nutriNutrientesClave({ objetivo: 'Reducir fatiga mental' });
  const estres = nutriNutrientesClave({ objetivo: 'Manejo de estrés mental' });
  assert.notDeepStrictEqual(foco, fatiga);
  assert.notDeepStrictEqual(foco, estres);
  assert.notDeepStrictEqual(fatiga, estres);
});

test('nutriNutrientesClave — empate entre planes: intercala y no repite (Hierro está en 2)', () => {
  const chips = nutriNutrientesClave({
    objetivo: 'No estoy seguro',
    concentracion: 4, fatiga: 4, olvidos: 2, estres: 1
  }, 20);
  assert.equal(new Set(chips.map(c => c.toLowerCase())).size, chips.length);
  assert.equal(chips.filter(c => c === 'Hierro').length, 1);
  // Intercalado: el 1º nutriente de cada plan abre la lista, antes que el
  // 2º de ninguno (Foco: Omega-3 / Fatiga: B12 y complejo B).
  assert.deepStrictEqual(chips.slice(0, 2), ['Omega-3', 'B12 y complejo B']);
});

test('nutriNutrientesClave — respeta el máximo pedido y el default de 6', () => {
  const d = { objetivo: 'No estoy seguro', concentracion: 4, fatiga: 4, olvidos: 4, estres: 4 };
  assert.equal(nutriNutrientesClave(d, 3).length, 3);
  assert.ok(nutriNutrientesClave(d).length <= 6);
});

test('nutriNutrientesClave — objetivo desconocido devuelve lista vacía (no rompe)', () => {
  assert.deepStrictEqual(nutriNutrientesClave({ objetivo: 'Algo que no existe' }), []);
});

test('nutriNutrientesClave — ninguna etiqueta de ningún plan es demasiado larga para un chip', () => {
  Object.keys(NUTRI_PLANES).forEach(objetivo => {
    nutriNutrientesClave({ objetivo }, 20).forEach(c => {
      assert.ok(c.length <= LARGO_MAX_CHIP, objetivo+': \"'+c+'\" ('+c.length+' caracteres)');
    });
  });
});

// ===================== nutriCambiosDesdeDiagnostico =====================
// Etiquetas "Qué cambió desde tu diagnóstico" (tarjeta Antropometría de
// mi-plan.html). Escalas de la encuesta: 1-5 donde 5 = peor, así que
// bajar la respuesta MEJORA el área (gaugeComputeAreas invierte la escala).

const DIAGNOSTICO = { concentracion: 5, olvidos: 3, fatiga: 3, estres: 5 };

test('nutriCambiosDesdeDiagnostico — sin reevaluación no hay nada que comparar', () => {
  assert.deepStrictEqual(nutriCambiosDesdeDiagnostico({ encuesta: DIAGNOSTICO }, null), []);
  assert.deepStrictEqual(nutriCambiosDesdeDiagnostico({ encuesta: DIAGNOSTICO }, undefined), []);
});

test('nutriCambiosDesdeDiagnostico — sin encuesta inicial devuelve [] (no rompe)', () => {
  assert.deepStrictEqual(nutriCambiosDesdeDiagnostico(null, DIAGNOSTICO), []);
  assert.deepStrictEqual(nutriCambiosDesdeDiagnostico({}, DIAGNOSTICO), []);
});

test('nutriCambiosDesdeDiagnostico — mejora, sin cambios y empeora, en el orden de las barras', () => {
  const reeval = { concentracion: 4, olvidos: 3, fatiga: 4, estres: 4 };
  const r = nutriCambiosDesdeDiagnostico({ encuesta: DIAGNOSTICO }, reeval);
  assert.deepStrictEqual(r.map(x => x.label), ['Foco', 'Memoria', 'Energía', 'Calma']);
  // Foco 20% → 40% (+20), Calma 20% → 40% (+20): mejoran.
  assert.deepStrictEqual([r[0].antesPct, r[0].despuesPct, r[0].delta, r[0].estado, r[0].texto], [20, 40, 20, 'sube', '+20']);
  assert.deepStrictEqual([r[3].delta, r[3].estado, r[3].texto], [20, 'sube', '+20']);
  // Memoria no cambió.
  assert.deepStrictEqual([r[1].delta, r[1].estado, r[1].texto], [0, 'igual', '=']);
  // Energía: fatiga 3 → 4 empeora 20 pts (signo menos real, no guion).
  assert.deepStrictEqual([r[2].delta, r[2].estado, r[2].texto], [-20, 'baja', '\u221220']);
});

test('nutriCambiosDesdeDiagnostico — coincide con lo que dice gaugeDeltaHtml para cada área', () => {
  const reeval = { concentracion: 2, olvidos: 5, fatiga: 1, estres: 3 };
  nutriCambiosDesdeDiagnostico({ encuesta: DIAGNOSTICO }, reeval).forEach(c => {
    const html = gaugeDeltaHtml(c.antesPct, c.despuesPct);
    const esperado = c.delta > 0 ? '+'+c.delta+' pts' : (c.delta < 0 ? c.delta+' pts' : 'sin cambios');
    assert.ok(html.includes(esperado), c.label+': '+html+' no incluye \"'+esperado+'\"');
  });
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
  assert.strictEqual(imcCategoria(30).zona, 'obesidad');
});

// ===================== imcGaugeAngulo =====================

test('imcGaugeAngulo — mínimo, máximo, punto medio y recorte fuera de rango', () => {
  assert.strictEqual(imcGaugeAngulo(15), 180);
  assert.strictEqual(imcGaugeAngulo(40), 0);
  assert.strictEqual(imcGaugeAngulo(27.5), 90);
  assert.strictEqual(imcGaugeAngulo(5), imcGaugeAngulo(15));   // se recorta al mínimo
  assert.strictEqual(imcGaugeAngulo(60), imcGaugeAngulo(40));  // se recorta al máximo
});

// ===================== imcGaugeAgujaDeg / imcGaugeAgujaDegInicial =====================
// (sesión 2026-09-16 — degradado + barrido de la aguja del medidor de IMC)

test('imcGaugeAgujaDeg — mismos grados que la fórmula que reemplaza (90 - imcGaugeAngulo)', () => {
  assert.strictEqual(imcGaugeAgujaDeg(15), 90 - imcGaugeAngulo(15));
  assert.strictEqual(imcGaugeAgujaDeg(27.5), 90 - imcGaugeAngulo(27.5));
  assert.strictEqual(imcGaugeAgujaDeg(40), 90 - imcGaugeAngulo(40));
});

test('imcGaugeAgujaDegInicial — coincide con el extremo mínimo del arco (IMC 15)', () => {
  assert.strictEqual(imcGaugeAgujaDegInicial(), imcGaugeAgujaDeg(15));
  // el mínimo se recorta igual que cualquier valor por debajo de 15
  assert.strictEqual(imcGaugeAgujaDegInicial(), imcGaugeAgujaDeg(5));
});

// ===================== imcGaugeMarkerPos =====================

test('imcGaugeMarkerPos — extremos del arco caen en los mismos puntos que los <path> del arco', () => {
  // Los <path> del arco en mi-plan.html arrancan en (25,115) y terminan
  // en (195,115) — mismos extremos que debe dar el marcador en IMC 15/40.
  const min = imcGaugeMarkerPos(15);
  const max = imcGaugeMarkerPos(40);
  assert.strictEqual(min.x, 25);
  assert.strictEqual(min.y, 115);
  assert.strictEqual(max.x, 195);
  assert.strictEqual(max.y, 115);
});

test('imcGaugeMarkerPos — el centro del rango cae arriba de todo (mismo x que el pivote)', () => {
  const centro = imcGaugeMarkerPos(27.5); // ángulo 90°, tope del semicírculo
  assert.strictEqual(centro.x, 110);
  assert.strictEqual(centro.y, 30); // 115 - 85
});

test('imcGaugeMarkerPos — se recorta al mismo rango [15,40] que la aguja', () => {
  assert.deepStrictEqual(imcGaugeMarkerPos(5), imcGaugeMarkerPos(15));
  assert.deepStrictEqual(imcGaugeMarkerPos(60), imcGaugeMarkerPos(40));
});

// ===================== imcGaugeGradientStops / imcGaugeGradientDefsHtml =====================

test('imcGaugeGradientStops — 4 anclajes en el centro de cada zona, mismos colores que gaugeColorForPercent', () => {
  const stops = imcGaugeGradientStops();
  assert.strictEqual(stops.length, 4);
  // offsets: centro de [15,18.5]=16.75→7%, [18.5,25]=21.75→27%,
  // [25,30]=27.5→50%, [30,40]=35→80% (sobre el rango de display 15-40)
  assert.strictEqual(stops[0].offset, 7);
  assert.strictEqual(stops[1].offset, 27);
  assert.strictEqual(stops[2].offset, 50);
  assert.strictEqual(stops[3].offset, 80);
  assert.strictEqual(stops[0].color, gaugeColorForPercent(50));  // bajo → dorado
  assert.strictEqual(stops[1].color, gaugeColorForPercent(100)); // saludable → verde
  assert.strictEqual(stops[2].color, gaugeColorForPercent(50));  // sobrepeso → dorado
  assert.strictEqual(stops[3].color, gaugeColorForPercent(0));   // obesidad → rojo
});

test('imcGaugeGradientDefsHtml — arma un <linearGradient> con los 4 <stop> y el id pedido', () => {
  const html = imcGaugeGradientDefsHtml('miTestId');
  assert.match(html, /<defs>/);
  assert.match(html, /id="miTestId"/);
  assert.match(html, /gradientUnits="userSpaceOnUse"/);
  const stopCount = (html.match(/<stop /g) || []).length;
  assert.strictEqual(stopCount, 4);
});

test('imcGaugeGradientDefsHtml — usa "imcGaugeGradient" como id por defecto', () => {
  const html = imcGaugeGradientDefsHtml();
  assert.match(html, /id="imcGaugeGradient"/);
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

// ===================== nutriGuardarOActualizarAntropometria =====================

test('nutriGuardarOActualizarAntropometria — sin dato previo, guarda el IMC calculado', () => {
  global.localStorage.clear();
  const resultado = nutriGuardarOActualizarAntropometria({ peso: 70, talla: 175, edad: 30, sexo: 'Masculino' });
  assert.strictEqual(resultado, true);
  const guardado = JSON.parse(global.localStorage.getItem('sinaptix_antropometria'));
  const imcEsperado = 70 / (1.75 * 1.75);
  assert.ok(Math.abs(guardado.imc - imcEsperado) < 0.0001);
});

test('nutriGuardarOActualizarAntropometria — datos fuera de rango no guardan nada', () => {
  global.localStorage.clear();
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 0, talla: 175, edad: 30, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 70, talla: 300, edad: 30, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 70, talla: 175, edad: 150, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 70, talla: 175, edad: 30, sexo: '' }), false);
  assert.strictEqual(global.localStorage.getItem('sinaptix_antropometria'), null);
});

test('nutriGuardarOActualizarAntropometria — peso/talla distintos ACTUALIZAN el registro existente (FALLO 1)', () => {
  global.localStorage.clear();
  global.localStorage.setItem('sinaptix_antropometria', JSON.stringify({
    peso: 250, tallaCm: 181, edad: 40, sexo: 'Masculino', imc: 76.31, fecha: '2026-01-01T00:00:00.000Z'
  }));
  const resultado = nutriGuardarOActualizarAntropometria({ peso: 70, talla: 170, edad: 40, sexo: 'Masculino' });
  assert.strictEqual(resultado, true);
  const guardado = JSON.parse(global.localStorage.getItem('sinaptix_antropometria'));
  assert.strictEqual(guardado.peso, 70);
  assert.strictEqual(guardado.tallaCm, 170);
  const imcEsperado = 70 / (1.70 * 1.70);
  assert.ok(Math.abs(guardado.imc - imcEsperado) < 0.0001);
  assert.notStrictEqual(guardado.fecha, '2026-01-01T00:00:00.000Z');
});

test('nutriGuardarOActualizarAntropometria — mismos peso/talla/edad/sexo NO tocan el registro (no corre la fecha)', () => {
  global.localStorage.clear();
  const original = { peso: 70, tallaCm: 175, edad: 30, sexo: 'Masculino', imc: 22.86, fecha: '2026-01-01T00:00:00.000Z' };
  global.localStorage.setItem('sinaptix_antropometria', JSON.stringify(original));
  // La encuesta prellena estos mismos valores (ver nutricion-wizard.js): no
  // deben tocar ni el IMC ni la fecha guardados.
  const resultado = nutriGuardarOActualizarAntropometria({ peso: 70, talla: 175, edad: 30, sexo: 'Masculino' });
  assert.strictEqual(resultado, false);
  assert.deepStrictEqual(JSON.parse(global.localStorage.getItem('sinaptix_antropometria')), original);
});

test('nutriGuardarOActualizarAntropometria — datos inválidos no pisan un registro existente', () => {
  global.localStorage.clear();
  const original = { peso: 70, tallaCm: 175, edad: 30, sexo: 'Masculino', imc: 22.86, fecha: '2026-01-01T00:00:00.000Z' };
  global.localStorage.setItem('sinaptix_antropometria', JSON.stringify(original));
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 0, talla: 170, edad: 30, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 70, talla: 400, edad: 30, sexo: 'Masculino' }), false);
  assert.strictEqual(nutriGuardarOActualizarAntropometria({ peso: 70, talla: 170, edad: 30, sexo: '' }), false);
  assert.deepStrictEqual(JSON.parse(global.localStorage.getItem('sinaptix_antropometria')), original);
});

test('nutriGuardarOActualizarAntropometria — registro previo corrupto se trata como si no hubiera nada', () => {
  global.localStorage.clear();
  global.localStorage.setItem('sinaptix_antropometria', '{no es json valido');
  const resultado = nutriGuardarOActualizarAntropometria({ peso: 70, talla: 175, edad: 30, sexo: 'Masculino' });
  assert.strictEqual(resultado, true);
  const guardado = JSON.parse(global.localStorage.getItem('sinaptix_antropometria'));
  assert.strictEqual(guardado.peso, 70);
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
