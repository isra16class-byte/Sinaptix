// Tests de las funciones puras de js/mi-plan-pdf.js (el modelo de datos que
// alimenta el PDF). No cubren el dibujo en sí: eso se verifica con el spec
// de Playwright (tests/playwright/mi-plan-pdf.pw.mjs) y a ojo sobre el PDF
// renderizado. Lo que sí importa acá es que el modelo salga EXACTAMENTE de
// la misma fuente que el dashboard (js/nutricion-planes.js) y no de una
// copia paralela de la lógica.
const test = require('node:test');
const assert = require('node:assert');

// Mismo mock de localStorage que tests/nutricion-planes.test.js: hay que
// ponerlo antes de requerir el módulo, porque nutricion-planes.js lo toca.
global.localStorage = {
  _d: {},
  getItem(k){ return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
  setItem(k, v){ this._d[k] = String(v); },
  removeItem(k){ delete this._d[k]; }
};

const planes = require('../js/nutricion-planes.js');
const pdf = require('../js/mi-plan-pdf.js');

// Encuesta base "sana": sin alergias, sin restricciones, sin condiciones,
// escalas buenas. Cada test le cambia solo lo que necesita.
function encuestaBase(extra){
  return Object.assign({
    objetivo: 'Mejorar concentración',
    nombre: 'Ana Paz', email: 'ana@example.com',
    edad: '30', sexo: 'Femenino', peso: '60', talla: '165',
    actividadFisica: '3 o más veces por semana', tipoActividad: '',
    horaExigencia: 'Variable', sueno: '7 a 8', pantallas: '5', calidadSueno: 4,
    comidas: '4', agua: '2 litros o más', cafeina: '1 al día',
    alcohol: 'Nunca', ultraprocesados: 'Casi nunca',
    tiempoCocina: 'Cocino yo con tiempo',
    alergias: [], alergiaOtra: '', restriccion: 'Ninguna',
    condiciones: [], medicacion: 'No',
    estres: 1, fatiga: 1, concentracion: 2, olvidos: 1,
    disgustos: '', presupuesto: 'Sin restricción', consentimiento: true
  }, extra || {});
}

function objetivoGuardado(encuesta){
  return {
    objetivo: 'Mejorar concentración',
    email: encuesta.email,
    encuesta: encuesta,
    fecha: '2026-09-10T12:00:00.000Z'
  };
}

function modelo(encuesta, antro, reeval){
  return pdf.nutriPdfModelo(objetivoGuardado(encuesta), antro || null, reeval || null, planes);
}

test('devuelve null si no hay objetivo guardado', () => {
  assert.strictEqual(pdf.nutriPdfModelo(null, null, null, planes), null);
});

test('devuelve null si el objetivo guardado no trae la encuesta', () => {
  assert.strictEqual(pdf.nutriPdfModelo({objetivo:'x'}, null, null, planes), null);
});

test('el plan del modelo es el mismo que resuelve nutriResolverObjetivo', () => {
  const e = encuestaBase();
  const m = modelo(e);
  const esperado = planes.nutriResolverObjetivo(e).map(k => planes.NUTRI_PLANES[k].nombre);
  assert.deepStrictEqual(m.planes.map(p => p.nombre), esperado);
  assert.strictEqual(m.objetivoTitulo, esperado.join(' + '));
});

test('"No estoy seguro" con escalas empatadas produce varios planes', () => {
  const m = modelo(encuestaBase({
    objetivo: 'No estoy seguro',
    estres: 4, fatiga: 4, concentracion: 4, olvidos: 4
  }));
  assert.strictEqual(m.planes.length, 4);
});

test('las 4 barras salen de gaugeComputeAreas, en porcentaje sobre 5', () => {
  const e = encuestaBase({concentracion: 2, olvidos: 1, fatiga: 1, estres: 1});
  const m = modelo(e);
  const areas = planes.gaugeComputeAreas(e);
  const porClave = {};
  m.barras.forEach(b => { porClave[b.key] = b.pct; });
  assert.strictEqual(porClave.foco, Math.round(areas.foco / 5 * 100));
  assert.strictEqual(porClave.memoria, Math.round(areas.memoria / 5 * 100));
  assert.strictEqual(porClave.energia, Math.round(areas.energia / 5 * 100));
  assert.strictEqual(porClave.calma, Math.round(areas.calma / 5 * 100));
});

test('sin reevaluación no hay valor "antes" en ninguna barra', () => {
  const m = modelo(encuestaBase());
  m.barras.forEach(b => assert.strictEqual(b.antesPct, null));
});

test('con reevaluación la barra muestra el valor nuevo y guarda el anterior', () => {
  const inicial = encuestaBase({concentracion: 4});   // foco = 2/5 = 40%
  const reeval  = encuestaBase({concentracion: 1});   // foco = 5/5 = 100%
  const m = modelo(inicial, null, reeval);
  const foco = m.barras.find(b => b.key === 'foco');
  assert.strictEqual(foco.pct, 100);
  assert.strictEqual(foco.antesPct, 40);
});

test('el área correspondiente al objetivo queda destacada, y solo esa', () => {
  const m = modelo(encuestaBase({objetivo: 'Manejo de estrés mental'}));
  const destacadas = m.barras.filter(b => b.destacada).map(b => b.key);
  assert.deepStrictEqual(destacadas, ['calma']);
});

test('el color de cada barra sale de la rampa semántica del PDF', () => {
  // El PDF NO usa gaugeColorForPercent (los terracotas del sitio se ven
  // apagados sobre la paleta neutra del documento), pero sí el mismo
  // criterio: rojo -> ámbar -> verde según el porcentaje.
  const m = modelo(encuestaBase());
  m.barras.forEach(b => {
    assert.deepStrictEqual(b.color, pdf.pdfColorPorcentaje(b.pct));
    b.color.forEach(canal => {
      assert.ok(Number.isInteger(canal) && canal >= 0 && canal <= 255);
    });
  });
  // Extremos y punto medio de la rampa.
  assert.deepStrictEqual(pdf.pdfColorPorcentaje(0),   [190, 18, 60]);
  assert.deepStrictEqual(pdf.pdfColorPorcentaje(50),  [217, 119, 6]);
  assert.deepStrictEqual(pdf.pdfColorPorcentaje(100), [5, 150, 105]);
  // Monotonía: a más porcentaje, más verde.
  assert.ok(pdf.pdfColorPorcentaje(100)[1] > pdf.pdfColorPorcentaje(20)[1]);
});

test('sin datos antropométricos el modelo no trae bloque de IMC', () => {
  assert.strictEqual(modelo(encuestaBase()).imc, null);
});

test('con antropometría el IMC usa la categoría de imcCategoria', () => {
  const antro = {peso: 82, tallaCm: 163, imc: 30.86, fecha: '2026-09-10T12:00:00.000Z'};
  const m = modelo(encuestaBase(), antro);
  assert.strictEqual(m.imc.imc, 30.86);
  assert.strictEqual(m.imc.cat, planes.imcCategoria(30.86).cat);
  assert.strictEqual(m.imc.zona, 'obesidad');
});

test('un IMC corrupto (no numérico) no rompe el modelo, solo omite el bloque', () => {
  assert.strictEqual(modelo(encuestaBase(), {imc: 'treinta'}).imc, null);
  assert.strictEqual(modelo(encuestaBase(), {imc: NaN}).imc, null);
});

test('el rango de peso saludable usa IMC 18,5-24,9 sobre la talla', () => {
  const r = pdf.pdfRangoPesoSaludable(170);
  assert.strictEqual(r.min, Math.round(18.5 * 1.7 * 1.7));
  assert.strictEqual(r.max, Math.round(24.9 * 1.7 * 1.7));
  assert.strictEqual(pdf.pdfRangoPesoSaludable(0), null);
  assert.strictEqual(pdf.pdfRangoPesoSaludable(''), null);
});

test('los ajustes del PDF son los mismos que los del dashboard', () => {
  const e = encuestaBase({
    alergias: ['Frutos secos'], restriccion: 'Vegano',
    presupuesto: 'Ajustado', horaExigencia: 'Mañana'
  });
  const m = modelo(e);
  assert.strictEqual(m.ajustes.length, planes.nutriConstruirAjustes(e).length);
  assert.ok(m.ajustes.some(a => a.includes('Frutos secos')));
});

test('el texto libre llega al PDF sin el escapado HTML del dashboard', () => {
  // nutriConstruirAjustes escapa porque su salida va a innerHTML; en el PDF
  // ese "&amp;" se vería literal.
  const e = encuestaBase({disgustos: 'Brócoli & coliflor'});
  assert.ok(planes.nutriConstruirAjustes(e).some(a => a.includes('&amp;')));
  assert.ok(modelo(e).ajustes.some(a => a.includes('Brócoli & coliflor')));
  assert.ok(!modelo(e).ajustes.some(a => a.includes('&amp;')));
});

test('los avisos del PDF son los mismos que los del dashboard, con su nivel', () => {
  const e = encuestaBase({condiciones: ['Hipotiroidismo'], cafeina: '2 a 3 al día'});
  const esperados = planes.nutriConstruirAvisos(e);
  const m = modelo(e);
  assert.strictEqual(m.avisos.length, esperados.length);
  assert.deepStrictEqual(m.avisos.map(a => a.nivel), esperados.map(a => a.nivel));
});

test('el día tipo trae los 4 momentos del plan y un reparto que suma 100', () => {
  const m = modelo(encuestaBase());
  const plan = planes.NUTRI_PLANES['Mejorar concentración'];
  assert.deepStrictEqual(m.diaTipo.map(x => x.momento), plan.diaTipo.map(x => x.momento));
  assert.strictEqual(m.diaTipo.reduce((a, x) => a + x.pct, 0), 100);
});

test('todos los momentos del día tipo de todos los planes tienen reparto', () => {
  // Si algún plan estrena un momento nuevo ("Media tarde", etc.) sin
  // agregarlo a REPARTO, la dona quedaría con un sector de 0% mudo.
  Object.keys(planes.NUTRI_PLANES).forEach(k => {
    (planes.NUTRI_PLANES[k].diaTipo || []).forEach(m => {
      assert.ok(pdf.REPARTO[m.momento] != null, 'falta reparto para: ' + m.momento);
    });
  });
});

test('pdfTextoSeguro normaliza los símbolos que no cubren las fuentes estándar', () => {
  assert.strictEqual(pdf.pdfTextoSeguro('a — b'), 'a - b');
  assert.strictEqual(pdf.pdfTextoSeguro('a → b'), 'a > b');
  assert.strictEqual(pdf.pdfTextoSeguro('“x”'), '"x"');
  assert.strictEqual(pdf.pdfTextoSeguro('etc…'), 'etc...');
  // Los acentos y la ñ sí están en WinAnsi: no se tocan.
  assert.strictEqual(pdf.pdfTextoSeguro('mañana, energía'), 'mañana, energía');
});

test('el nombre del archivo y la URL de jsPDF están fijados', () => {
  assert.strictEqual(pdf.NUTRI_PDF_ARCHIVO, 'mi-plan-sinaptix.pdf');
  assert.match(pdf.NUTRI_PDF_JSPDF_URL, /^https:\/\/cdnjs\.cloudflare\.com\/.*jspdf\.umd\.min\.js$/);
});

test('la meta de las barras es un valor fijo dentro de 0-100', () => {
  assert.strictEqual(pdf.META_PCT, 80);
  const m = modelo(encuestaBase());
  assert.strictEqual(m.metaPct, 80);
});
