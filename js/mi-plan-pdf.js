// ===================== "Descargar mi plan en PDF" =====================
// Genera el PDF de "Mi plan" 100% en el navegador de quien hace click, con
// jsPDF cargado bajo demanda (lazy) desde cdnjs. NO usa html2canvas ni
// captura de pantalla: todo el documento se dibuja con primitivas
// vectoriales de jsPDF (texto, rect, roundedRect, líneas, polígonos para
// los sectores de la dona), así que el PDF sale con texto seleccionable,
// buscable y nítido a cualquier zoom, y pesa ~30 KB en vez de ~1 MB.
//
// Fuente de datos: exactamente la misma que ya usa pintarMiPlan()
// (js/mi-plan.js) para renderizar el dashboard — `sinaptix_objetivo`,
// `sinaptix_antropometria` y `sinaptix_reevaluacion` de localStorage, más
// las funciones puras de js/nutricion-planes.js (nutriResolverObjetivo,
// nutriConstruirAjustes, nutriConstruirAvisos, gaugeComputeAreas,
// gaugeColorForPercent, imcCategoria). No hay una segunda fuente de verdad.
//
// Referencia visual: docs/mockup-pdf-mi-plan.html (misma paleta, misma
// jerarquía, mismos bloques). Ver memoria.md → "PDF de Mi plan" para las
// decisiones de diseño (tipografía, meta del 80%, reparto de la dona).
//
// Este archivo se carga como <script> plano (sin import/export), igual que
// el resto de js/ del proyecto. Al final expone un bloque guardado para
// que tests/mi-plan-pdf.test.js pueda importar las funciones puras con Node.
(function(global){
  'use strict';

  // ---------- Carga diferida de jsPDF ----------
  // Versión fijada a propósito (no "latest"): el spec de Playwright
  // intercepta esta misma URL y sirve el bundle local de node_modules, así
  // que test y producción corren exactamente el mismo código de jsPDF.
  const JSPDF_VERSION = '3.0.1';
  const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/' + JSPDF_VERSION + '/jspdf.umd.min.js';
  const PDF_ARCHIVO = 'mi-plan-sinaptix.pdf';
  const LOGO_URL = 'img/sinaptix-icon.png';

  // ---------- Paleta (misma de css/styles.css, :root) ----------
  // Paleta del PDF. OJO: NO es la del sitio. El morado de marca
  // (--purple/--purple-dark) se probó y se descartó: en papel y en visores
  // de PDF lee como un lila apagado y le da al documento un aire más
  // "folleto" que "informe". El documento usa una paleta neutra de
  // azules/grises con acentos semánticos, que es lo que pedía la
  // referencia. La marca sigue presente por el logo y la tipografía.
  const C = {
    ink:        [31, 41, 55],     // texto principal
    inkSoft:    [75, 85, 99],     // texto secundario
    inkFaint:   [148, 163, 184],  // rótulos, escalas, pie
    marca:      [26, 37, 66],     // azul noche: títulos y nombre de marca
    acento:     [59, 110, 165],   // azul acero: rótulos, barras de acento
    acentoSuave:[241, 245, 249],  // fondo del panel de objetivo
    green:      [21, 128, 61],
    gold:       [180, 83, 9],
    red:        [159, 19, 57],
    paper:      [255, 255, 255],
    panel:      [248, 250, 252],
    panel2:     [226, 232, 240],
    line:       [203, 213, 225],
    verde:      [240, 253, 244],  // tinte de la caja "Priorizar"
    dorado:     [255, 251, 235],  // tinte de la caja "Moderar"
    rojoSuave:  [254, 242, 242],  // tinte de aviso "alto"
    rielTimeline:[203, 213, 225]
  };
  // Tipografía: jsPDF solo trae las 14 fuentes estándar del formato PDF.
  // Fraunces e Inter no están ahí y embeberlas como TTF base64 sumaría
  // ~300 KB al bundle solo para el PDF. Se aproxima el par del sitio con
  // el par estándar equivalente: serif de display para títulos (Fraunces →
  // Times) y sans para cuerpo/UI (Inter → Helvetica). La paleta, la
  // jerarquía y el layout sí son idénticos al sitio.
  const F_TITULO = 'times';
  const F_CUERPO = 'helvetica';

  // ---------- Geometría de página (mm, A4 vertical) ----------
  const PAGE_W = 210, PAGE_H = 297;
  const M = 15;                       // margen lateral
  const CW = PAGE_W - M * 2;          // ancho útil = 180
  const Y_INICIO = 32;                // debajo del encabezado de la pág. 1
  const Y_INICIO_CONT = 27;           // debajo del encabezado de las siguientes
  const Y_LIMITE = 274;               // último mm usable antes del pie

  // Meta de referencia de las barras de estado. No sale de la encuesta:
  // es un objetivo sugerido fijo, el mismo para las 4 áreas, para que la
  // barra se lea como "dónde estás vs. a dónde apuntamos" y no como un
  // número suelto. Se rotula explícitamente como sugerida en el PDF.
  const META_PCT = 80;

  // Reparto orientativo de la energía del día entre los 4 momentos del
  // "día tipo" de NUTRI_PLANES (todos los planes tienen los mismos 4:
  // Desayuno / Snack / Almuerzo / Cena). Es una distribución de referencia
  // general, no un cálculo personalizado — va rotulada como orientativa.
  const REPARTO = {
    'Desayuno': 30,
    'Snack':    10,
    'Almuerzo': 35,
    'Cena':     25
  };
  // 4 tonos bien distinguibles también en escala de grises (impresión B/N):
  // ámbar, esmeralda, azul acero y gris pizarra.
  const REPARTO_COLOR = {
    'Desayuno': [217, 119, 6],
    'Snack':    [5, 150, 105],
    'Almuerzo': [59, 110, 165],
    'Cena':     [100, 116, 139]
  };

  // Qué área del gráfico de barras corresponde a cada objetivo, para
  // destacarla (es "el" área que la persona vino a mejorar).
  const OBJETIVO_AREA = {
    'Mejorar concentración':      'foco',
    'Sostener memoria de trabajo':'memoria',
    'Reducir fatiga mental':      'energia',
    'Manejo de estrés mental':    'calma'
  };

  // ===================== Utilidades puras =====================

  // nutriConstruirAjustes() escapa el texto libre de la encuesta porque su
  // salida va a innerHTML. Acá el destino es un PDF, no HTML: hay que
  // revertir ese escapado o se vería "&amp;" literal en el documento.
  function pdfDesescaparHTML(texto){
    return String(texto)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // Las 14 fuentes estándar del PDF usan WinAnsi (cp1252): los acentos y la
  // ñ del castellano entran sin problema, pero los símbolos tipográficos
  // que usa el sitio (flechas, tilde larga, puntos suspensivos) no siempre.
  // Se normalizan a equivalentes seguros antes de dibujar.
  function pdfTextoSeguro(texto){
    return pdfDesescaparHTML(texto)
      .replace(/[\u2014\u2013]/g, '-')    // — –
      .replace(/[\u2018\u2019]/g, "'")    // ' '
      .replace(/[\u201C\u201D]/g, '"')    // " "
      .replace(/\u2026/g, '...')
      .replace(/[\u2192\u21D2]/g, '>')    // → ⇒
      .replace(/\u2713|\u2714/g, '')      // ✓
      .replace(/\u00A0/g, ' ');
  }

  // Rampa semántica del PDF (0 = necesita atención, 50 = en progreso,
  // 100 = sólido). Es la misma IDEA que gaugeColorForPercent() del
  // dashboard, pero con los tonos de este documento: los del sitio
  // (#B3261E / #C1703B / #2E7D5B) son terracotas cálidos que sobre el
  // fondo blanco y la paleta neutra de acá se ven apagados y embarrados.
  // Si se cambia el criterio de color del dashboard, revisar también esto.
  const RAMPA = [[190, 18, 60], [217, 119, 6], [5, 150, 105]];
  function pdfColorPorcentaje(pct){
    const p = Math.max(0, Math.min(100, pct));
    const i = p <= 50 ? 0 : 1;
    const t = p <= 50 ? p / 50 : (p - 50) / 50;
    const a = RAMPA[i], b = RAMPA[i + 1];
    return [0, 1, 2].map(function(k){ return Math.round(a[k] + (b[k] - a[k]) * t); });
  }

  // gaugeColorForPercent() devuelve un hex ('#2E7D5B') porque su destino
  // original es CSS; jsPDF pide los 3 canales por separado.
  function pdfHexARgb(hex){
    const h = String(hex).replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16)
    ];
  }

  function pdfFecha(iso){
    try{
      const d = iso ? new Date(iso) : new Date();
      if(isNaN(d.getTime())) return '';
      return d.toLocaleDateString('es-AR', {day:'2-digit', month:'long', year:'numeric'});
    }catch(err){ return ''; }
  }

  // Rango de peso saludable (IMC 18.5–24.9) para la talla registrada —
  // mismo cálculo que ya muestra la tarjeta "Mi IMC" de Método.
  function pdfRangoPesoSaludable(tallaCm){
    const t = parseFloat(tallaCm);
    if(!t || t <= 0) return null;
    const m = t / 100;
    return {min: Math.round(18.5 * m * m), max: Math.round(24.9 * m * m)};
  }

  // Dependencias de js/nutricion-planes.js. OJO: ese archivo declara
  // `NUTRI_PLANES` con `const` en el tope de un <script> clásico, y los
  // `const`/`let` de nivel superior NO quedan colgados de `window` (a
  // diferencia de las `function`, que sí). Por eso se resuelven por
  // identificador léxico —visible entre scripts del mismo documento— y no
  // como propiedades de `global`. En Node esos identificadores no existen,
  // de ahí los `typeof`: los tests inyectan las dependencias a mano.
  function depsPorDefecto(){
    return {
      NUTRI_PLANES:          typeof NUTRI_PLANES          !== 'undefined' ? NUTRI_PLANES          : undefined,
      nutriResolverObjetivo: typeof nutriResolverObjetivo !== 'undefined' ? nutriResolverObjetivo : undefined,
      nutriConstruirAjustes: typeof nutriConstruirAjustes !== 'undefined' ? nutriConstruirAjustes : undefined,
      nutriConstruirAvisos:  typeof nutriConstruirAvisos  !== 'undefined' ? nutriConstruirAvisos  : undefined,
      gaugeComputeAreas:     typeof gaugeComputeAreas     !== 'undefined' ? gaugeComputeAreas     : undefined,
      gaugeColorForPercent:  typeof gaugeColorForPercent  !== 'undefined' ? gaugeColorForPercent  : undefined,
      imcCategoria:          typeof imcCategoria          !== 'undefined' ? imcCategoria          : undefined
    };
  }

  // Modelo de datos del PDF: TODO lo que el documento necesita, ya
  // resuelto, en un objeto plano. Función pura (no toca DOM, red ni
  // localStorage) para poder testearla con Node sin navegador. `deps`
  // permite inyectar las funciones de js/nutricion-planes.js en los tests;
  // en el navegador salen de depsPorDefecto().
  function nutriPdfModelo(objetivo, antro, reeval, deps){
    const api = deps || depsPorDefecto();
    if(!objetivo || !objetivo.encuesta) return null;
    if(!api.NUTRI_PLANES || typeof api.nutriResolverObjetivo !== 'function') return null;
    const d = objetivo.encuesta;

    const claves = api.nutriResolverObjetivo(d);
    const planes = claves.map(function(k){ return api.NUTRI_PLANES[k]; }).filter(Boolean);
    if(!planes.length) return null;

    const areasHoy = api.gaugeComputeAreas(reeval || d);
    const areasAntes = reeval ? api.gaugeComputeAreas(d) : null;
    const destacada = OBJETIVO_AREA[claves[0]] || null;

    const barras = [
      {key:'foco',    label:'Foco'},
      {key:'memoria', label:'Memoria'},
      {key:'energia', label:'Energía'},
      {key:'calma',   label:'Calma'}
    ].map(function(item){
      const pct = Math.round((areasHoy[item.key] / 5) * 100);
      const antesPct = areasAntes ? Math.round((areasAntes[item.key] / 5) * 100) : null;
      return {
        key: item.key,
        label: item.label,
        pct: pct,
        antesPct: antesPct,
        color: pdfColorPorcentaje(pct),
        destacada: item.key === destacada
      };
    });

    let imcInfo = null;
    if(antro && typeof antro.imc === 'number' && isFinite(antro.imc)){
      const cat = api.imcCategoria(antro.imc);
      imcInfo = {
        imc: antro.imc,
        cat: cat.cat,
        zona: cat.zona,
        peso: antro.peso || null,
        tallaCm: antro.tallaCm || null,
        rango: pdfRangoPesoSaludable(antro.tallaCm),
        fecha: antro.fecha || null
      };
    }

    const diaTipo = (planes[0].diaTipo || []).map(function(m){
      return {
        momento: m.momento,
        detalle: pdfTextoSeguro(m.detalle),
        pct: REPARTO[m.momento] != null ? REPARTO[m.momento] : 0
      };
    });

    return {
      nombre: pdfTextoSeguro(d.nombre || (objetivo.email ? objetivo.email.split('@')[0] : '')),
      email: objetivo.email || d.email || '',
      fechaPlan: objetivo.fecha || null,
      fechaReeval: reeval ? reeval.fecha : null,
      objetivoTitulo: planes.map(function(p){ return pdfTextoSeguro(p.nombre); }).join(' + '),
      planes: planes.map(function(p){
        return {
          nombre: pdfTextoSeguro(p.nombre),
          enfoque: pdfTextoSeguro(p.enfoque),
          nutrientes: p.nutrientes.map(pdfTextoSeguro),
          priorizar: p.priorizar.map(pdfTextoSeguro),
          moderar: p.moderar.map(pdfTextoSeguro)
        };
      }),
      barras: barras,
      metaPct: META_PCT,
      imc: imcInfo,
      diaTipo: diaTipo,
      ajustes: api.nutriConstruirAjustes(d).map(pdfTextoSeguro),
      avisos: api.nutriConstruirAvisos(d).map(function(a){
        return {nivel: a.nivel, texto: pdfTextoSeguro(a.texto)};
      })
    };
  }

  // Lee las 3 claves de localStorage que ya usa pintarMiPlan() y arma el
  // modelo. Devuelve null si todavía no hay plan generado (mismo criterio
  // que usa el dashboard para mostrar/ocultar el detalle del plan).
  function nutriPdfModeloDesdeStorage(){
    let objetivo = null, antro = null, reeval = null;
    try{
      const o = localStorage.getItem('sinaptix_objetivo');
      if(o) objetivo = JSON.parse(o);
    }catch(err){ return null; }
    try{
      const a = localStorage.getItem('sinaptix_antropometria');
      if(a) antro = JSON.parse(a);
    }catch(err){ /* dato corrupto: el PDF sale sin el bloque de IMC */ }
    try{
      const r = localStorage.getItem('sinaptix_reevaluacion');
      if(r) reeval = JSON.parse(r);
    }catch(err){ /* dato corrupto: el PDF sale sin comparación */ }
    try{
      return nutriPdfModelo(objetivo, antro, reeval);
    }catch(err){ return null; }
  }

  // ===================== Carga de jsPDF y del logo =====================

  let jsPDFPromesa = null;
  function nutriPdfCargarJsPDF(){
    if(global.jspdf && global.jspdf.jsPDF) return Promise.resolve(global.jspdf.jsPDF);
    if(jsPDFPromesa) return jsPDFPromesa;
    jsPDFPromesa = new Promise(function(resolve, reject){
      const s = document.createElement('script');
      s.src = JSPDF_URL;
      s.async = true;
      s.onload = function(){
        if(global.jspdf && global.jspdf.jsPDF) resolve(global.jspdf.jsPDF);
        else reject(new Error('jsPDF cargó pero no expuso window.jspdf.jsPDF'));
      };
      s.onerror = function(){ reject(new Error('No se pudo cargar jsPDF desde el CDN')); };
      document.head.appendChild(s);
    });
    // Si falla, se limpia la promesa para que un segundo click reintente
    // (el primer error puede haber sido una caída momentánea de red).
    jsPDFPromesa.catch(function(){ jsPDFPromesa = null; });
    return jsPDFPromesa;
  }

  let logoPromesa = null;
  function nutriPdfCargarLogo(){
    if(logoPromesa) return logoPromesa;
    logoPromesa = fetch(LOGO_URL)
      .then(function(r){
        if(!r.ok) throw new Error('logo ' + r.status);
        return r.blob();
      })
      .then(function(blob){
        return new Promise(function(resolve, reject){
          const fr = new FileReader();
          fr.onload = function(){ resolve(fr.result); };   // data:image/png;base64,...
          fr.onerror = function(){ reject(new Error('no se pudo leer el logo')); };
          fr.readAsDataURL(blob);
        });
      })
      .catch(function(){ return null; });  // sin logo, se dibuja el fallback vectorial
    return logoPromesa;
  }

  // ===================== Helpers de dibujo =====================

  function crearCtx(doc){
    return {
      doc: doc,
      y: Y_INICIO,
      logo: null,
      seccion: 0,
      // Salto de página: reserva `h` mm; si no entran, abre página nueva
      // con el encabezado compacto y devuelve true.
      espacio: function(h){
        if(this.y + h <= Y_LIMITE) return false;
        this.doc.addPage();
        dibujarEncabezadoContinuacion(this);
        return true;
      }
    };
  }

  function setFill(doc, c){ doc.setFillColor(c[0], c[1], c[2]); }
  function setDraw(doc, c){ doc.setDrawColor(c[0], c[1], c[2]); }
  function setText(doc, c){ doc.setTextColor(c[0], c[1], c[2]); }
  function fuente(doc, familia, estilo, tam){ doc.setFont(familia, estilo); doc.setFontSize(tam); }

  // Alto de un bloque de texto ya cortado en líneas, en mm.
  function altoTexto(doc, lineas, interlineado){
    const lh = (doc.getFontSize() * 0.3528) * (interlineado || 1.25);
    return lineas.length * lh;
  }

  // Dibuja texto multilínea y devuelve el alto consumido.
  function parrafo(doc, texto, x, y, ancho, interlineado){
    const lineas = doc.splitTextToSize(pdfTextoSeguro(texto), ancho);
    const lh = (doc.getFontSize() * 0.3528) * (interlineado || 1.25);
    lineas.forEach(function(l, i){ doc.text(l, x, y + lh * (i + 1) - lh * 0.28); });
    return lineas.length * lh;
  }

  // Punto sobre una circunferencia (0° = arriba, sentido horario), que es
  // como se recorre la dona.
  function puntoArco(cx, cy, r, grados){
    const rad = (grados - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  // Sector de dona (anillo) como polígono relleno: se aproxima el arco con
  // segmentos rectos de 3° — a los radios que usa el documento (< 25 mm) el
  // borde se lee perfectamente curvo en pantalla y en papel. jsPDF no tiene
  // primitiva de arco, y doc.lines() con segmentos rectos evita depender de
  // curvas Bézier calculadas a mano.
  function sectorDona(doc, cx, cy, rExt, rInt, desde, hasta, color){
    const paso = 3;
    const pts = [];
    for(let a = desde; a < hasta; a += paso) pts.push(puntoArco(cx, cy, rExt, a));
    pts.push(puntoArco(cx, cy, rExt, hasta));
    for(let a = hasta; a > desde; a -= paso) pts.push(puntoArco(cx, cy, rInt, a));
    pts.push(puntoArco(cx, cy, rInt, desde));

    const rel = [];
    for(let i = 1; i < pts.length; i++) rel.push([pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]]);
    setFill(doc, color);
    doc.lines(rel, pts[0][0], pts[0][1], [1, 1], 'F', true);
  }

  // Triangulito de puntero (usado por la barra de IMC).
  function triangulo(doc, x, y, ancho, alto, color){
    setFill(doc, color);
    doc.triangle(x - ancho/2, y, x + ancho/2, y, x, y + alto, 'F');
  }

  // ===================== Bloques del documento =====================

  function dibujarEncabezado(ctx, m){
    const doc = ctx.doc;
    if(ctx.logo){
      // 432x397 px en el original: se respeta la proporción para que el
      // logo no salga deformado.
      doc.addImage(ctx.logo, 'PNG', M, 12.4, 11.5, 11.5 * (397/432));
    } else {
      // Fallback vectorial si el PNG no se pudo cargar (offline, 404): un
      // nodo con 2 sinapsis, en la misma familia gráfica del sitio.
      setFill(doc, C.acento);
      doc.circle(M + 6.5, 17.5, 5.5, 'F');
      setFill(doc, C.gold);
      doc.circle(M + 4.2, 15.6, 1.4, 'F');
      doc.circle(M + 8.9, 19.2, 1.4, 'F');
    }

    fuente(doc, F_TITULO, 'bold', 16);
    setText(doc, C.marca);
    doc.text('SINAPTIX', M + 15, 18);

    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkFaint);
    doc.text('Plan personalizado de neuroalimentación', M + 15, 22);

    // Bloque de identificación, alineado al margen derecho.
    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkFaint);
    doc.text('PREPARADO PARA', PAGE_W - M, 14.6, {align:'right'});
    fuente(doc, F_CUERPO, 'bold', 10);
    setText(doc, C.ink);
    doc.text(m.nombre || 'Tu plan', PAGE_W - M, 19, {align:'right'});
    fuente(doc, F_CUERPO, 'normal', 7.6);
    setText(doc, C.inkSoft);
    doc.text(pdfFecha(m.fechaReeval || m.fechaPlan), PAGE_W - M, 22.8, {align:'right'});

    // Una sola regla fina en azul noche, a todo el ancho. Antes había además
    // un tramo dorado grueso a la izquierda: con el encabezado ya más
    // compacto quedaba pesado y desbalanceado hacia un costado.
    setDraw(doc, C.marca);
    doc.setLineWidth(0.35);
    doc.line(M, 25.6, PAGE_W - M, 25.6);
    ctx.y = Y_INICIO;
  }

  function dibujarEncabezadoContinuacion(ctx){
    const doc = ctx.doc;
    if(ctx.logo){
      doc.addImage(ctx.logo, 'PNG', M, 11.4, 7, 7 * (397/432));
    }
    fuente(doc, F_TITULO, 'bold', 10);
    setText(doc, C.marca);
    doc.text('SINAPTIX', M + (ctx.logo ? 9 : 0), 16.8);
    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkFaint);
    doc.text('Mi plan de neuroalimentación', PAGE_W - M, 16.8, {align:'right'});
    setDraw(doc, C.marca);
    doc.setLineWidth(0.3);
    doc.line(M, 19.6, PAGE_W - M, 19.6);
    ctx.y = Y_INICIO_CONT;
  }

  // Título de sección: número en círculo morado + texto + regla fina.
  // La numeración es automática (contador del contexto) para que no se
  // desfase si algún bloque opcional no se dibuja. `altoBloque` es el alto
  // estimado de lo que viene justo debajo: se reserva junto con el título
  // para que nunca quede un título colgado al pie de una página y su
  // contenido arrancando en la siguiente.
  function tituloSeccion(ctx, texto, altoBloque){
    const doc = ctx.doc;
    ctx.seccion += 1;
    const numero = ctx.seccion;
    ctx.espacio(9 + Math.min(altoBloque || 14, Y_LIMITE - Y_INICIO_CONT - 9));
    const y = ctx.y;
    // Versalitas sobre una regla, en vez del título en serif grande con el
    // número dentro de un círculo relleno: ese tratamiento competía con el
    // encabezado y engordaba el documento. Acá el número va como prefijo.
    fuente(doc, F_CUERPO, 'bold', 9);
    setText(doc, C.marca);
    doc.text(numero + '.  ' + texto.toUpperCase(), M, y + 2.6);

    setDraw(doc, C.marca);
    doc.setLineWidth(0.45);
    doc.line(M, y + 4.8, PAGE_W - M, y + 4.8);
    ctx.y = y + 9;
  }

  // Panel destacado del objetivo.
  function dibujarObjetivo(ctx, m){
    const doc = ctx.doc;
    fuente(doc, F_CUERPO, 'normal', 8.2);
    const enfoque = m.planes[0].enfoque;
    const lineas = doc.splitTextToSize(enfoque, CW - 16);
    const alto = 17.5 + altoTexto(doc, lineas) + 4;

    ctx.espacio(alto);
    const y = ctx.y;

    setFill(doc, C.acentoSuave);
    setDraw(doc, C.panel2);
    doc.setLineWidth(0.25);
    doc.roundedRect(M, y, CW, alto, 1.5, 1.5, 'FD');
    // Barra de acento a la izquierda, a sangre contra el borde del panel:
    // el radio del panel bajó a 1.5 mm y ya no hace falta despegarla.
    setFill(doc, C.acento);
    doc.rect(M, y, 1.2, alto, 'F');

    const x = M + 8;
    fuente(doc, F_CUERPO, 'bold', 6.8);
    setText(doc, C.acento);
    doc.text('OBJETIVO COGNITIVO PRINCIPAL', x, y + 7.2);

    fuente(doc, F_TITULO, 'bold', 13.5);
    setText(doc, C.marca);
    doc.text(m.objetivoTitulo, x, y + 14.4);

    fuente(doc, F_CUERPO, 'normal', 8.2);
    setText(doc, C.inkSoft);
    parrafo(doc, enfoque, x, y + 16.4, CW - 16);

    ctx.y = y + alto + 6;
  }

  // Tarjeta blanca con borde + título chico en versalitas.
  function tarjeta(doc, x, y, w, h, titulo){
    setFill(doc, C.paper);
    setDraw(doc, C.line);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');
    fuente(doc, F_CUERPO, 'bold', 7);
    setText(doc, C.marca);
    doc.text(titulo, x + 5, y + 6.4);
    setDraw(doc, C.line);
    doc.setLineWidth(0.2);
    doc.line(x + 5, y + 8.6, x + w - 5, y + 8.6);
  }

  // Barras de estado con marca de meta.
  function dibujarBarras(ctx, m, x, y, w){
    const doc = ctx.doc;
    const alto = 13 + m.barras.length * 8.6 + 6;
    tarjeta(doc, x, y, w, alto, 'TU ESTADO ACTUAL');

    const xLabel = x + 5;
    const xTrack = x + 29;
    const trackW = w - 29 - 5 - 12;
    let yy = y + 15.5;

    m.barras.forEach(function(b){
      fuente(doc, F_CUERPO, b.destacada ? 'bold' : 'normal', 8);
      setText(doc, b.destacada ? C.marca : C.inkSoft);
      doc.text(b.label, xLabel + (b.destacada ? 2.4 : 0), yy + 2);
      if(b.destacada){
        setFill(doc, C.acento);
        doc.circle(xLabel + 0.7, yy + 1.3, 0.7, 'F');
      }

      // Riel
      setFill(doc, C.panel2);
      doc.roundedRect(xTrack, yy, trackW, 2.4, 1.2, 1.2, 'F');
      // Relleno
      const wFill = Math.max(2.4, trackW * b.pct / 100);
      setFill(doc, b.color);
      doc.roundedRect(xTrack, yy, wFill, 2.4, 1.2, 1.2, 'F');

      // Marca de "antes" (solo si hubo reevaluación): tramo oscuro fino
      // sobre el riel, en la posición del valor anterior.
      if(b.antesPct != null){
        const xa = xTrack + trackW * b.antesPct / 100;
        setDraw(doc, C.marca);
        doc.setLineWidth(0.35);
        doc.line(xa, yy - 0.8, xa, yy + 3.2);
      }

      // Marca de meta
      const xm = xTrack + trackW * m.metaPct / 100;
      setDraw(doc, C.inkFaint);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([0.6, 0.6], 0);
      doc.line(xm, yy - 1.2, xm, yy + 3.6);
      doc.setLineDashPattern([], 0);

      fuente(doc, F_CUERPO, 'bold', 8);
      setText(doc, C.ink);
      doc.text(b.pct + '%', x + w - 5, yy + 2, {align:'right'});

      yy += 8.6;
    });

    // Leyenda de la tarjeta
    fuente(doc, F_CUERPO, 'normal', 6.8);
    setText(doc, C.inkFaint);
    const leyenda = m.barras[0].antesPct != null
      ? 'Línea punteada: meta sugerida (' + m.metaPct + '%). Línea llena: valor de la encuesta inicial.'
      : 'Línea punteada: meta sugerida (' + m.metaPct + '%) para cada área.';
    doc.text(doc.splitTextToSize(leyenda, w - 10), x + 5, yy + 1.2);

    return alto;
  }

  // Barra de IMC por zonas + puntero.
  function dibujarImc(ctx, m, x, y, w, alto){
    const doc = ctx.doc;
    tarjeta(doc, x, y, w, alto, 'ANTROPOMETRÍA');

    if(!m.imc){
      fuente(doc, F_CUERPO, 'normal', 8);
      setText(doc, C.inkFaint);
      parrafo(doc, 'Todavía no registraste tus datos antropométricos, así que este plan no incluye el ajuste por IMC.', x + 5, y + 12.5, w - 10);
      return;
    }

    const info = m.imc;
    // Número grande + categoría
    const valor = info.imc.toFixed(1);
    fuente(doc, F_TITULO, 'bold', 19);
    setText(doc, C.ink);
    doc.text(valor, x + 5, y + 20.5);
    const xUnidad = x + 5 + doc.getTextWidth(valor) + 1.8;
    // El ² no está garantizado en las fuentes estándar del PDF: se dibuja
    // como un "2" más chico y elevado en vez de confiar en el glifo.
    fuente(doc, F_CUERPO, 'normal', 7);
    setText(doc, C.inkFaint);
    doc.text('kg/m', xUnidad, y + 20.5);
    const xSup = xUnidad + doc.getTextWidth('kg/m');
    fuente(doc, F_CUERPO, 'normal', 4.6);
    doc.text('2', xSup, y + 18.6);

    const colorZona = info.zona === 'saludable' ? RAMPA[2] : (info.zona === 'obesidad' ? RAMPA[0] : RAMPA[1]);
    const etiqueta = info.cat.charAt(0).toUpperCase() + info.cat.slice(1);
    // Píldora de contorno, no maciza: en un bloque tan chico el relleno
    // sólido se comía visualmente al número del IMC, que es el dato.
    fuente(doc, F_CUERPO, 'bold', 7);
    const pillW = doc.getTextWidth(etiqueta) + 6;
    setDraw(doc, colorZona);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + w - 5 - pillW, y + 15.4, pillW, 5.4, 2.7, 2.7, 'D');
    setText(doc, colorZona);
    doc.text(etiqueta, x + w - 5 - pillW / 2, y + 19, {align:'center'});

    // Barra segmentada 15–40 con los umbrales OMS (18.5 / 25 / 30), los
    // mismos que usa imcCategoria() y el medidor del dashboard.
    const bx = x + 5, bw = w - 10, by = y + 29, bh = 2.4;
    const MIN = 15, MAX = 40;
    const cortes = [
      {hasta: 18.5, color: RAMPA[1]},
      {hasta: 25,   color: RAMPA[2]},
      {hasta: 30,   color: RAMPA[1]},
      {hasta: MAX,  color: RAMPA[0]}
    ];
    let desde = MIN;
    cortes.forEach(function(seg, i){
      const x0 = bx + bw * (desde - MIN) / (MAX - MIN);
      const x1 = bx + bw * (seg.hasta - MIN) / (MAX - MIN);
      setFill(doc, seg.color);
      // Solo los extremos llevan punta redondeada, igual que el arco del
      // medidor del sitio (los cortes internos van a tope, sin costura).
      if(i === 0 || i === cortes.length - 1){
        doc.roundedRect(x0, by, x1 - x0, bh, 1.2, 1.2, 'F');
        if(i === 0) doc.rect(x0 + (x1 - x0) / 2, by, (x1 - x0) / 2, bh, 'F');
        else doc.rect(x0, by, (x1 - x0) / 2, bh, 'F');
      } else {
        doc.rect(x0, by, x1 - x0, bh, 'F');
      }
      desde = seg.hasta;
    });

    // Puntero del valor real (recortado al rango visible del gráfico)
    const v = Math.max(MIN, Math.min(MAX, info.imc));
    const px = bx + bw * (v - MIN) / (MAX - MIN);
    triangulo(doc, px, by - 2.2, 2.8, 2.2, C.marca);

    fuente(doc, F_CUERPO, 'normal', 6.4);
    setText(doc, C.inkFaint);
    doc.text('15', bx, by + bh + 3.6);
    doc.text('18,5', bx + bw * 3.5 / 25, by + bh + 3.6, {align:'center'});
    doc.text('25', bx + bw * 10 / 25, by + bh + 3.6, {align:'center'});
    doc.text('30', bx + bw * 15 / 25, by + bh + 3.6, {align:'center'});
    doc.text('40', bx + bw, by + bh + 3.6, {align:'right'});

    let yy = by + bh + 9;
    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkSoft);
    if(info.peso && info.tallaCm){
      doc.text(info.peso + ' kg · ' + info.tallaCm + ' cm', x + 5, yy);
      yy += 4;
    }
    if(info.rango){
      setText(doc, C.inkFaint);
      fuente(doc, F_CUERPO, 'normal', 6.8);
      doc.text('Peso saludable estimado: ' + info.rango.min + '-' + info.rango.max + ' kg', x + 5, yy);
    }
  }

  // Nutrientes clave como chips.
  function dibujarNutrientes(ctx, plan){
    const doc = ctx.doc;
    ctx.espacio(20);
    fuente(doc, F_CUERPO, 'bold', 7);
    setText(doc, C.inkFaint);
    doc.text('NUTRIENTES CLAVE', M, ctx.y);
    let y = ctx.y + 2.8;
    let x = M;

    fuente(doc, F_CUERPO, 'normal', 8);
    plan.nutrientes.forEach(function(n){
      const w = doc.getTextWidth(n) + 6.5;
      if(x + w > PAGE_W - M){ x = M; y += 7.2; }
      if(y + 6 > Y_LIMITE){ ctx.y = y; ctx.espacio(999); y = ctx.y; x = M; }
      setFill(doc, C.panel);
      setDraw(doc, C.panel2);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, w, 5.6, 1, 1, 'FD');
      setText(doc, C.ink);
      doc.text(n, x + w / 2, y + 3.8, {align:'center'});
      x += w + 2.5;
    });
    ctx.y = y + 8;
  }

  // Caja de lista con encabezado de color (Priorizar / Moderar / Ajustes).
  // Devuelve el alto que ocupó.
  function altoCajaLista(doc, items, w, tamano){
    fuente(doc, F_CUERPO, 'normal', tamano || 8);
    let h = 10;
    items.forEach(function(it){
      h += altoTexto(doc, doc.splitTextToSize(it, w - 14)) + 1.2;
    });
    return h + 2.5;
  }

  function dibujarCajaLista(doc, x, y, w, titulo, items, colorBase, colorFondo, tamano, hForzado){
    const h = hForzado || altoCajaLista(doc, items, w, tamano);
    setFill(doc, colorFondo);
    setDraw(doc, C.panel2);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');
    // Filete de color a sangre contra el borde izquierdo (antes era una
    // barra redondeada despegada, que engrosaba la caja sin aportar).
    setFill(doc, colorBase);
    doc.rect(x, y, 1, h, 'F');

    fuente(doc, F_CUERPO, 'bold', 7.4);
    setText(doc, colorBase);
    doc.text(titulo, x + 5.5, y + 6.2);

    fuente(doc, F_CUERPO, 'normal', tamano || 8);
    setText(doc, C.ink);
    let yy = y + 9;
    items.forEach(function(it){
      setFill(doc, colorBase);
      doc.circle(x + 6.4, yy + 1.4, 0.5, 'F');
      const usado = parrafo(doc, it, x + 9, yy - 0.9, w - 14);
      yy += usado + 1.2;
    });
    return h;
  }

  // Alto de cada ítem del timeline del día tipo. Se calcula aparte de
  // dibujarDiaTipo para poder reservarlo junto con el título de sección.
  const DIA_TIPO_ANCHO_TEXTO = 86;
  function altosDiaTipo(doc, m){
    fuente(doc, F_CUERPO, 'normal', 8);
    return m.diaTipo.map(function(it){
      return Math.max(11, altoTexto(doc, doc.splitTextToSize(it.detalle, DIA_TIPO_ANCHO_TEXTO)) + 6.5);
    });
  }
  function altoDiaTipo(doc, m){
    const suma = altosDiaTipo(doc, m).reduce(function(a, b){ return a + b; }, 0);
    // El lado de la dona (dona + leyenda al costado + nota) mide ~44 mm.
    // Es el alto del bloque en sí, sin el margen que va después.
    return Math.max(suma, 42);
  }

  // Timeline del día tipo + dona de reparto.
  function dibujarDiaTipo(ctx, m){
    const doc = ctx.doc;
    const anchoTexto = DIA_TIPO_ANCHO_TEXTO;
    const xDona = M + 122;

    const altos = altosDiaTipo(doc, m);
    const altoTl = altos.reduce(function(a, b){ return a + b; }, 0);
    ctx.espacio(altoDiaTipo(doc, m));
    const y0 = ctx.y;

    // Riel vertical del timeline: del centro del primer círculo al del
    // último, para que no sobresalga por arriba ni por abajo.
    const yUltimo = y0 + altos.slice(0, -1).reduce(function(a, b){ return a + b; }, 0) + 2.5;
    setDraw(doc, C.rielTimeline);
    doc.setLineWidth(0.4);
    doc.line(M + 2.5, y0 + 2.5, M + 2.5, yUltimo);

    let yy = y0;
    m.diaTipo.forEach(function(it, i){
      const color = REPARTO_COLOR[it.momento] || C.acento;
      setFill(doc, color);
      doc.circle(M + 2.5, yy + 2.5, 2.5, 'F');
      fuente(doc, F_CUERPO, 'bold', 6);
      setText(doc, C.paper);
      doc.text(String(i + 1), M + 2.5, yy + 3.3, {align:'center'});

      fuente(doc, F_CUERPO, 'bold', 8.2);
      setText(doc, C.marca);
      doc.text(it.momento, M + 8, yy + 3.4);
      // El ancho del momento se mide ANTES de cambiar de cuerpo, o el %
      // queda pegado al texto (se mediría con la tipografía chica).
      const xPct = M + 8 + doc.getTextWidth(it.momento) + 2.4;
      fuente(doc, F_CUERPO, 'normal', 6.8);
      setText(doc, C.inkFaint);
      doc.text(it.pct + '%', xPct, yy + 3.4);

      fuente(doc, F_CUERPO, 'normal', 8);
      setText(doc, C.inkSoft);
      parrafo(doc, it.detalle, M + 8, yy + 4.6, anchoTexto);

      yy += altos[i];
    });

    // Dona + leyenda al costado (no debajo): así el bloque entero mide
    // ~44 mm de alto en vez de ~78 y entra junto al timeline sin empujar
    // la sección a la página siguiente.
    // Anillo fino (16 -> 11,5 mm de radio = 4,5 mm de grosor). Antes era de
    // 7,5 mm y leía como un gráfico de torta pesado, no como un dato.
    const cx = xDona + 16, cy = y0 + 18;
    let ang = 0;
    m.diaTipo.forEach(function(it){
      const barrido = it.pct * 3.6;
      sectorDona(doc, cx, cy, 16, 11.5, ang, ang + barrido, REPARTO_COLOR[it.momento] || C.acento);
      ang += barrido;
    });
    fuente(doc, F_TITULO, 'bold', 11);
    setText(doc, C.marca);
    doc.text(String(m.diaTipo.length), cx, cy + 0.6, {align:'center'});
    fuente(doc, F_CUERPO, 'normal', 5);
    setText(doc, C.inkFaint);
    doc.text('MOMENTOS', cx, cy + 3.8, {align:'center'});

    const xLeyenda = xDona + 35;
    let ly = cy - 6.6;
    m.diaTipo.forEach(function(it){
      setFill(doc, REPARTO_COLOR[it.momento] || C.acento);
      doc.roundedRect(xLeyenda, ly - 1.7, 2, 2, 0.3, 0.3, 'F');
      fuente(doc, F_CUERPO, 'normal', 6.8);
      setText(doc, C.inkSoft);
      doc.text(it.momento, xLeyenda + 3.4, ly);
      fuente(doc, F_CUERPO, 'bold', 6.8);
      setText(doc, C.marca);
      doc.text(it.pct + '%', PAGE_W - M, ly, {align:'right'});
      ly += 4.4;
    });

    fuente(doc, F_CUERPO, 'normal', 6.2);
    setText(doc, C.inkFaint);
    const nota = doc.splitTextToSize('Reparto orientativo de la energía del día.', 58);
    nota.forEach(function(l, i){ doc.text(l, xDona, cy + 20.5 + i * 3); });

    ctx.y = Math.max(yy, cy + 20.5 + nota.length * 3) + 6;
  }

  function dibujarAvisos(ctx, m){
    const doc = ctx.doc;
    if(!m.avisos.length) return;
    fuente(doc, F_CUERPO, 'normal', 8);
    const primero = altoTexto(doc, doc.splitTextToSize(m.avisos[0].texto, CW - 20)) + 10;
    tituloSeccion(ctx, 'A tener en cuenta', primero);
    m.avisos.forEach(function(a){
      const alto = a.nivel === 'alto' ? C.red : C.gold;
      const fondo = a.nivel === 'alto' ? C.rojoSuave : C.dorado;
      fuente(doc, F_CUERPO, 'normal', 8);
      const lineas = doc.splitTextToSize(a.texto, CW - 17);
      const h = altoTexto(doc, lineas) + 5.5;
      ctx.espacio(h + 2.5);
      const y = ctx.y;
      setFill(doc, fondo);
      setDraw(doc, C.panel2);
      doc.setLineWidth(0.25);
      doc.roundedRect(M, y, CW, h, 1.5, 1.5, 'FD');
      setFill(doc, alto);
      doc.rect(M, y, 1, h, 'F');
      // Triángulo de atención
      triangulo(doc, M + 6.5, y + 5.6, 3.6, -3.4, alto);
      fuente(doc, F_CUERPO, 'bold', 4.6);
      setText(doc, C.paper);
      doc.text('!', M + 6.5, y + 5.2, {align:'center'});
      setText(doc, C.ink);
      fuente(doc, F_CUERPO, 'normal', 8);
      parrafo(doc, a.texto, M + 11.5, y + 1.6, CW - 17);
      ctx.y = y + h + 2.5;
    });
  }

  const TEXTO_LEGAL = 'Este documento es contenido informativo generado a partir de la encuesta que completaste en SINAPTIX. No reemplaza un diagnóstico médico ni nutricional certificado, ni una consulta profesional. Si tenés una condición de salud o tomás medicación de forma regular, validá este plan con tu médico o nutricionista antes de aplicarlo.';

  function dibujarCierre(ctx, m){
    const doc = ctx.doc;
    fuente(doc, F_CUERPO, 'normal', 7.4);
    const lineas = doc.splitTextToSize(TEXTO_LEGAL, CW - 12);
    const h = 9.5 + altoTexto(doc, lineas) + 9;

    ctx.espacio(h + 4);
    const y = ctx.y;
    setFill(doc, C.panel);
    setDraw(doc, C.panel2);
    doc.setLineWidth(0.25);
    doc.roundedRect(M, y, CW, h, 1.5, 1.5, 'FD');

    fuente(doc, F_CUERPO, 'bold', 7);
    setText(doc, C.marca);
    doc.text('AVISO', M + 6, y + 6.6);

    fuente(doc, F_CUERPO, 'normal', 7.4);
    setText(doc, C.inkSoft);
    const usado = parrafo(doc, TEXTO_LEGAL, M + 6, y + 8, CW - 12);

    // Pie del panel: de dónde salió este documento y cuándo, para que el
    // PDF se pueda contrastar con el dashboard aunque el plan cambie después.
    setDraw(doc, C.panel2);
    doc.setLineWidth(0.3);
    doc.line(M + 6, y + 10.5 + usado, PAGE_W - M - 6, y + 10.5 + usado);
    fuente(doc, F_CUERPO, 'normal', 6.8);
    setText(doc, C.inkFaint);
    doc.text('Plan generado el ' + pdfFecha(m.fechaPlan) +
      (m.fechaReeval ? ' · Última reevaluación: ' + pdfFecha(m.fechaReeval) : '') +
      (m.email ? ' · ' + m.email : ''), M + 6, y + 14.6 + usado);

    ctx.y = y + h + 4;
  }

  function dibujarPies(doc, m){
    const total = doc.getNumberOfPages();
    for(let p = 1; p <= total; p++){
      doc.setPage(p);
      setDraw(doc, C.line);
      doc.setLineWidth(0.3);
      doc.line(M, 280, PAGE_W - M, 280);
      fuente(doc, F_CUERPO, 'normal', 6.8);
      setText(doc, C.inkFaint);
      doc.text('SINAPTIX · Contenido informativo; no reemplaza diagnóstico médico ni nutricional certificado.', M, 284.5);
      doc.text('Página ' + p + ' de ' + total, PAGE_W - M, 284.5, {align:'right'});
    }
  }

  // ===================== Documento completo =====================

  function nutriPdfConstruirDoc(jsPDFCtor, m, logoDataUrl){
    const doc = new jsPDFCtor({orientation:'portrait', unit:'mm', format:'a4', compress:true});
    doc.setProperties({
      title: 'Mi plan de neuroalimentación - SINAPTIX',
      subject: m.objetivoTitulo,
      author: 'SINAPTIX',
      creator: 'SINAPTIX'
    });

    const ctx = crearCtx(doc);
    ctx.logo = logoDataUrl || null;
    dibujarEncabezado(ctx, m);

    dibujarObjetivo(ctx, m);

    // Fila de métricas: barras (izquierda) + IMC (derecha).
    const wIzq = 108, wDer = CW - wIzq - 4;
    const altoFila = 13 + m.barras.length * 8.6 + 6;
    ctx.espacio(altoFila);
    const yFila = ctx.y;
    dibujarBarras(ctx, m, M, yFila, wIzq);
    dibujarImc(ctx, m, M + wIzq + 4, yFila, wDer, altoFila);
    ctx.y = yFila + altoFila + 5;

    // Estrategia nutricional (un bloque por plan si el objetivo resolvió
    // en más de uno, igual que nutriBuildResumenHTML)
    m.planes.forEach(function(plan){
      const wCol = (CW - 5) / 2;
      const hCol = Math.max(
        altoCajaLista(doc, plan.priorizar, wCol),
        altoCajaLista(doc, plan.moderar, wCol)
      );
      tituloSeccion(ctx, m.planes.length > 1
        ? 'Estrategia nutricional: ' + plan.nombre
        : 'Estrategia nutricional', 22);
      if(m.planes.length > 1){
        fuente(doc, F_CUERPO, 'normal', 8.4);
        setText(doc, C.inkSoft);
        ctx.y += parrafo(doc, plan.enfoque, M, ctx.y - 2.5, CW) + 3;
      }
      dibujarNutrientes(ctx, plan);

      ctx.espacio(hCol);
      const yCols = ctx.y;
      // Las 2 columnas se dibujan con el mismo alto (el del contenido más
      // largo) para que queden alineadas arriba y abajo, no escalonadas.
      dibujarCajaLista(doc, M, yCols, wCol, 'PRIORIZAR', plan.priorizar, C.green, C.verde, 8, hCol);
      dibujarCajaLista(doc, M + wCol + 5, yCols, wCol, 'MODERAR', plan.moderar, C.gold, C.dorado, 8, hCol);
      ctx.y = yCols + hCol + 6;
    });

    // Día tipo
    tituloSeccion(ctx, 'Tu día tipo', altoDiaTipo(doc, m));
    dibujarDiaTipo(ctx, m);

    // Ajustes
    if(m.ajustes.length){
      const h = altoCajaLista(doc, m.ajustes, CW);
      tituloSeccion(ctx, 'Ajustado a tu caso', h);
      ctx.espacio(h);
      dibujarCajaLista(doc, M, ctx.y, CW, 'QUÉ CAMBIA EN TU PLAN', m.ajustes, C.acento, C.acentoSuave);
      ctx.y += h + 6;
    }

    // Avisos + cierre
    dibujarAvisos(ctx, m);
    dibujarCierre(ctx, m);
    dibujarPies(doc, m);
    return doc;
  }

  // Punto de entrada del botón. Devuelve una promesa que resuelve con el
  // objeto jsPDF ya construido (el spec de Playwright lo usa para
  // inspeccionar el contenido antes de la descarga).
  function nutriPdfGenerar(opts){
    const o = opts || {};
    const m = o.modelo || nutriPdfModeloDesdeStorage();
    if(!m) return Promise.reject(new Error('Todavía no hay un plan generado para exportar.'));
    return Promise.all([nutriPdfCargarJsPDF(), nutriPdfCargarLogo()]).then(function(res){
      const doc = nutriPdfConstruirDoc(res[0], m, res[1]);
      if(o.descargar !== false) doc.save(PDF_ARCHIVO);
      return doc;
    });
  }

  // ===================== Botón de la UI =====================

  function nutriPdfConectarBoton(btn){
    if(!btn || btn.dataset.pdfConectado === '1') return;
    btn.dataset.pdfConectado = '1';
    btn.addEventListener('click', function(){
      if(btn.disabled) return;
      const textoOriginal = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Generando PDF…';
      nutriPdfGenerar().then(function(){
        btn.textContent = textoOriginal;
        btn.disabled = false;
      }).catch(function(err){
        // El error se muestra en el propio botón durante unos segundos:
        // esta pantalla no tiene un contenedor de mensajes global y un
        // alert() cortaría el flujo de golpe.
        btn.textContent = 'No se pudo generar el PDF';
        btn.disabled = false;
        if(global.console && console.warn) console.warn('[mi-plan-pdf]', err);
        setTimeout(function(){ btn.textContent = textoOriginal; }, 4000);
      });
    });
  }

  // Muestra u oculta el botón según haya o no plan generado — mismo
  // criterio condicional que usa el resto del dashboard (clase .hidden).
  function nutriPdfActualizarBoton(hayPlan){
    const btn = document.getElementById('btnDescargarPdf');
    if(!btn) return;
    if(hayPlan) btn.classList.remove('hidden');
    else btn.classList.add('hidden');
    nutriPdfConectarBoton(btn);
  }

  global.nutriPdfModelo = nutriPdfModelo;
  global.nutriPdfModeloDesdeStorage = nutriPdfModeloDesdeStorage;
  global.nutriPdfGenerar = nutriPdfGenerar;
  global.nutriPdfActualizarBoton = nutriPdfActualizarBoton;
  global.nutriPdfConstruirDoc = nutriPdfConstruirDoc;
  global.NUTRI_PDF_ARCHIVO = PDF_ARCHIVO;
  global.NUTRI_PDF_JSPDF_URL = JSPDF_URL;

  // Exports para tests con Node (mismo patrón que js/nutricion-planes.js:
  // en el navegador `module` no existe y este bloque no hace nada).
  if(typeof module !== 'undefined' && module.exports){
    module.exports = {
      nutriPdfModelo: nutriPdfModelo,
      nutriPdfConstruirDoc: nutriPdfConstruirDoc,
      pdfTextoSeguro: pdfTextoSeguro,
      pdfDesescaparHTML: pdfDesescaparHTML,
      pdfHexARgb: pdfHexARgb,
      pdfColorPorcentaje: pdfColorPorcentaje,
      pdfRangoPesoSaludable: pdfRangoPesoSaludable,
      META_PCT: META_PCT,
      REPARTO: REPARTO,
      NUTRI_PDF_ARCHIVO: PDF_ARCHIVO,
      NUTRI_PDF_JSPDF_URL: JSPDF_URL
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
