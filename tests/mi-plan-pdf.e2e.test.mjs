// Verificación end-to-end del botón "Descargar mi plan en PDF" de
// mi-plan.html, con Playwright y `netlifyIdentity` mockeado (mismo criterio
// que el resto del proyecto: el widget real de identity.netlify.com no es
// alcanzable desde el entorno de trabajo).
//
// Corre bajo `npm test` como cualquier otro test de node:test. Playwright NO
// está en package.json a propósito (el sitio no tiene build step y no
// queremos que Netlify lo instale en cada deploy): si el módulo o el browser
// no están disponibles, el archivo entero se saltea con un mensaje en vez de
// fallar. Para correrlo hay que tener Playwright y Chromium instalados:
//
//   npm i -D playwright && npx playwright install chromium && npm test
//
// Qué verifica:
//   1. Con sesión iniciada y plan guardado, el botón aparece.
//   2. Sin plan guardado, el botón no aparece.
//   3. El click dispara una descarga llamada mi-plan-sinaptix.pdf.
//   4. El PDF generado contiene los datos del plan (se inspecciona el
//      buffer que devuelve jsPDF ANTES de la descarga, sin abrir el archivo).
//   5. jsPDF no se carga hasta que se aprieta el botón (lazy load).

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let chromium = null;
let motivoSkip = null;
try{
  chromium = require_('playwright').chromium;
}catch(err){
  motivoSkip = 'playwright no está instalado (npm i -D playwright)';
}

// Bundle local de jsPDF: es el que se le sirve al navegador en lugar del
// CDN, para que el test corra sin red y contra la MISMA versión que usa
// producción (js/mi-plan-pdf.js fija 3.0.1 en la URL de cdnjs).
const JSPDF_LOCAL = path.join(RAIZ, 'node_modules/jspdf/dist/jspdf.umd.min.js');
if(!motivoSkip && !fs.existsSync(JSPDF_LOCAL)){
  motivoSkip = 'falta node_modules/jspdf (npm i -D jspdf)';
}

// ---------- Datos de prueba ----------
const ENCUESTA = {
  objetivo: 'Mejorar concentración',
  nombre: 'Renata Ibarra', email: 'renata@example.com',
  edad: '34', sexo: 'Femenino', peso: '82', talla: '163',
  actividadFisica: '1 a 2 veces por semana', tipoActividad: 'Caminatas',
  horaExigencia: 'Mañana', sueno: '5 a 6', pantallas: '9', calidadSueno: 2,
  comidas: '3', agua: 'Menos de 1 litro', cafeina: '4 o más al día',
  alcohol: 'Ocasional', ultraprocesados: 'A diario',
  tiempoCocina: 'Cocino yo con poco tiempo',
  alergias: ['Frutos secos', 'Mariscos'], alergiaOtra: 'Lactosa',
  restriccion: 'Vegetariano', condiciones: ['Hipotiroidismo'], medicacion: 'Sí',
  estres: 5, fatiga: 4, concentracion: 4, olvidos: 3,
  disgustos: 'Brócoli', presupuesto: 'Ajustado', consentimiento: true
};
const OBJETIVO = {
  objetivo: 'Mejorar concentración', email: ENCUESTA.email,
  encuesta: ENCUESTA, fecha: '2026-09-10T12:00:00.000Z'
};
const ANTRO = {peso: 82, tallaCm: 163, edad: 34, sexo: 'Femenino', imc: 30.86, fecha: '2026-09-10T12:00:00.000Z'};
const USUARIO = {email: ENCUESTA.email, user_metadata: {full_name: ENCUESTA.nombre}};

// Mock del widget de Netlify Identity: reemplaza al script de
// identity.netlify.com, que no es alcanzable desde acá.
function scriptIdentityMock(user){
  return `window.netlifyIdentity = (function(){
    var user = ${JSON.stringify(user)};
    return {
      init: function(){},
      on: function(evt, cb){ if(evt === 'init') setTimeout(function(){ cb(user); }, 0); },
      off: function(){},
      currentUser: function(){ return user; },
      gotrue: {}
    };
  })();`;
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml'
};

function levantarServidor(){
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const archivo = path.join(RAIZ, rel);
    // No servir nada fuera del repo.
    if(!archivo.startsWith(RAIZ) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()){
      res.writeHead(404); res.end('no'); return;
    }
    res.writeHead(200, {'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream'});
    res.end(fs.readFileSync(archivo));
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve({server, base: 'http://127.0.0.1:' + server.address().port}));
  });
}

// Extrae el texto de un PDF sin depender de herramientas externas: los
// streams de contenido van comprimidos con Flate (jsPDF: compress:true), se
// inflan y se juntan los literales de los operadores de texto Tj/TJ.
function textoDelPdf(buffer){
  let texto = '';
  let i = 0;
  while(true){
    const ini = buffer.indexOf('stream', i);
    if(ini === -1) break;
    let a = ini + 6;
    if(buffer[a] === 0x0d) a++;
    if(buffer[a] === 0x0a) a++;
    const fin = buffer.indexOf('endstream', a);
    if(fin === -1) break;
    const crudo = buffer.subarray(a, fin);
    let plano = null;
    try{ plano = zlib.inflateSync(crudo).toString('latin1'); }catch(err){ plano = null; }
    if(plano){
      // Literales entre paréntesis de los operadores de texto.
      const m = plano.match(/\((?:\\.|[^\\()])*\)/g);
      if(m) texto += m.map(s => s.slice(1, -1).replace(/\\([()\\])/g, '$1')).join(' ') + ' ';
    }
    i = fin + 9;
  }
  return texto;
}

async function abrirMiPlan(browser, base, {conPlan}){
  const ctx = await browser.newContext({acceptDownloads: true});
  const page = await ctx.newPage();

  // Widget de Identity → mock local.
  await page.route('**/netlify-identity-widget.js', route =>
    route.fulfill({status: 200, contentType: 'text/javascript', body: scriptIdentityMock(USUARIO)}));
  // jsPDF del CDN → bundle local (misma versión fijada en js/mi-plan-pdf.js).
  await page.route('**/cdnjs.cloudflare.com/**/jspdf.umd.min.js', route =>
    route.fulfill({status: 200, contentType: 'text/javascript', body: fs.readFileSync(JSPDF_LOCAL, 'utf8')}));
  // Backend: no hay Netlify Functions corriendo acá.
  await page.route('**/.netlify/functions/**', route =>
    route.fulfill({status: 200, contentType: 'application/json', body: '{}'}));

  await page.addInitScript(({objetivo, antro, conPlan}) => {
    if(conPlan){
      localStorage.setItem('sinaptix_objetivo', JSON.stringify(objetivo));
      localStorage.setItem('sinaptix_antropometria', JSON.stringify(antro));
    } else {
      localStorage.clear();
    }
    // Contador para comprobar que jsPDF se carga recién con el click.
    window.__jspdfPedidos = 0;
  }, {objetivo: OBJETIVO, antro: ANTRO, conPlan});

  page.on('request', req => {
    if(req.url().includes('jspdf')) page.evaluate(() => { window.__jspdfPedidos++; }).catch(() => {});
  });

  await page.goto(base + '/mi-plan.html', {waitUntil: 'networkidle'});
  await page.waitForSelector('#miPlanConSesion:not(.hidden)', {timeout: 10000});
  return {ctx, page};
}

// `skip` solo se pasa si de verdad hay motivo: node:test marca el test
// como salteado ante la sola presencia de la clave, aunque valga null.
const OPCIONES = motivoSkip ? {skip: motivoSkip} : {};

test('Mi plan: botón de PDF', OPCIONES, async (t) => {
  const {server, base} = await levantarServidor();
  let browser;
  try{
    browser = await chromium.launch();
  }catch(err){
    server.close();
    t.skip('no hay Chromium instalado (npx playwright install chromium)');
    return;
  }

  try{
    await t.test('con sesión y plan guardado, el botón aparece', async () => {
      const {ctx, page} = await abrirMiPlan(browser, base, {conPlan: true});
      await page.waitForSelector('#btnDescargarPdf:not(.hidden)', {timeout: 5000});
      assert.strictEqual(await page.isVisible('#btnDescargarPdf'), true);
      assert.strictEqual(
        (await page.textContent('#btnDescargarPdf')).trim(),
        'Descargar mi plan en PDF'
      );
      // Lazy load: jsPDF todavía no se pidió.
      assert.strictEqual(await page.evaluate(() => typeof window.jspdf), 'undefined');
      await ctx.close();
    });

    await t.test('sin plan guardado, el botón no aparece', async () => {
      const {ctx, page} = await abrirMiPlan(browser, base, {conPlan: false});
      assert.strictEqual(await page.isVisible('#btnDescargarPdf'), false);
      await ctx.close();
    });

    await t.test('el contenido del PDF coincide con los datos del plan', async () => {
      const {ctx, page} = await abrirMiPlan(browser, base, {conPlan: true});
      // Se inspecciona el buffer que devuelve jsPDF, antes de la descarga.
      const datauri = await page.evaluate(async () => {
        const doc = await window.nutriPdfGenerar({descargar: false});
        return doc.output('datauristring');
      });
      const buffer = Buffer.from(datauri.split(',')[1], 'base64');
      assert.strictEqual(buffer.subarray(0, 5).toString(), '%PDF-');

      const texto = textoDelPdf(buffer);
      // Identidad y objetivo
      assert.ok(texto.includes('SINAPTIX'), 'falta la marca');
      assert.ok(texto.includes('Renata Ibarra'), 'falta el nombre de la persona');
      assert.ok(/Foco y Concentraci/.test(texto), 'falta el nombre del plan resuelto');
      // Barras: calma = 6-5 = 1 → 20%
      assert.ok(texto.includes('20%'), 'falta el porcentaje de Calma');
      // IMC y su categoría
      assert.ok(texto.includes('30.9'), 'falta el IMC');
      assert.ok(/Obesidad/i.test(texto), 'falta la categoría de IMC');
      // Día tipo
      assert.ok(texto.includes('Desayuno') && texto.includes('Almuerzo'), 'falta el día tipo');
      // Ajustes derivados de la encuesta
      assert.ok(texto.includes('Frutos secos'), 'falta el ajuste por alergias');
      assert.ok(/vegetales/.test(texto), 'falta el ajuste por restricción vegetariana');
      // Aviso legal
      assert.ok(/no reemplaza/i.test(texto), 'falta el aviso legal');
      await ctx.close();
    });

    await t.test('el click dispara la descarga con el nombre esperado', async () => {
      const {ctx, page} = await abrirMiPlan(browser, base, {conPlan: true});
      const [download] = await Promise.all([
        page.waitForEvent('download', {timeout: 15000}),
        page.click('#btnDescargarPdf')
      ]);
      assert.strictEqual(download.suggestedFilename(), 'mi-plan-sinaptix.pdf');
      // Y jsPDF sí se cargó, ahora que se apretó el botón.
      assert.strictEqual(await page.evaluate(() => typeof window.jspdf), 'object');
      await ctx.close();
    });
  } finally {
    if(browser) await browser.close();
    server.close();
  }
});
