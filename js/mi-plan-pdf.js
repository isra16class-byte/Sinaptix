// ===================== "Descargar mi plan en PDF" =====================
// Genera el PDF de "Mi plan" 100% en el navegador de quien hace click, con
// jsPDF cargado bajo demanda (lazy) desde cdnjs. NO usa html2canvas ni
// captura de pantalla: todo el documento se dibuja con primitivas
// vectoriales de jsPDF (texto, rect, roundedRect, líneas, anillos), así que
// el PDF sale con texto seleccionable, buscable y nítido a cualquier zoom,
// y pesa ~130 KB en vez de ~1 MB.
//
// Fuente de datos: exactamente la misma que ya usa pintarMiPlan()
// (js/mi-plan.js) para renderizar el dashboard — `sinaptix_objetivo`,
// `sinaptix_antropometria` y `sinaptix_reevaluacion` de localStorage, más
// las funciones puras de js/nutricion-planes.js (nutriResolverObjetivo,
// nutriConstruirAjustes, nutriConstruirAvisos, gaugeComputeAreas,
// gaugeColorForPercent, imcCategoria). No hay una segunda fuente de verdad.
//
// Referencia visual: docs/mockup-pdf-mi-plan.html, que reproduce la
// referencia HTML que el usuario aprobó "tal cual" (sesión 2026-09-19):
// banner de resumen ejecutivo, tarjeta de IMC con barra degradada +
// puntero, tarjeta de 4 anillos de estado, columnas "Nutrientes clave" /
// "Prioridades" (coloreadas para diferenciarlas, a pedido explícito), día
// tipo como lista simple, y caja ámbar de ajustes. Ver memoria.md →
// "PDF de Mi plan" para el historial completo de decisiones de diseño
// (hubo 2 direcciones visuales antes de esta; esta es la vigente).
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

  // ---------- Paleta ----------
  // OJO: esta paleta sigue la referencia HTML que el usuario aprobó
  // "tal cual" (sesión 2026-09-19), NO la nota "sin morado" de la vuelta
  // anterior. La referencia SÍ usa un acento tipo ciruela/morado oscuro
  // (#502d4b) para títulos de sección — es intencional, viene del propio
  // mockup que subió el usuario, y reemplaza la decisión previa. Ver
  // memoria.md → "PDF de Mi plan" para el historial completo (dos
  // decisiones de paleta sucesivas, la última manda).
  const C = {
    ink:        [31, 41, 55],     // texto principal
    inkSoft:    [75, 85, 99],     // texto secundario
    inkFaint:   [148, 163, 184],  // rótulos, escalas, pie
    marca:      [26, 37, 66],     // azul noche: SOLO el nombre de marca (SINAPTIX)
    plum:       [80, 45, 75],     // ciruela oscuro: títulos de sección y de tarjeta
    acento:     [59, 110, 165],   // azul acero: columna "Nutrientes clave"
    acentoSuave:[241, 245, 249],
    green:      [21, 128, 61],    // columna "Prioridades" y banner de resumen
    gold:       [180, 83, 9],
    red:        [159, 19, 57],
    paper:      [255, 255, 255],
    panel:      [248, 250, 252],
    panel2:     [226, 232, 240],
    line:       [203, 213, 225],
    verde:      [240, 253, 244],
    dorado:     [255, 251, 235],
    rojoSuave:  [254, 242, 242],
    rielTimeline:[203, 213, 225],
    // Banner "Resumen ejecutivo" (verde, estilo "quick-tip" de la referencia)
    verdeClaro: [240, 253, 244],
    verdeBorde: [134, 239, 172],
    // Puntero de la barra de IMC
    rosaOscuro: [136, 19, 55],
    // Caja "Ajustado a tu caso particular" (ámbar, estilo "card-highlight")
    ambarClaro: [255, 251, 227],
    ambarBorde: [253, 230, 138],
    ambarTexto: [180, 83, 9]
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
  // (Antes existía REPARTO_COLOR para pintar el timeline + la dona del día
  // tipo. Con el rediseño "tal cual" la referencia, el día tipo pasó a una
  // lista simple sin esos colores — ver memoria.md.)

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
  // Diseño alineado 1:1 a la referencia HTML que aprobó el usuario
  // (docs/mockup-pdf-mi-plan.html, que reproduce esa referencia). Ya no es
  // el diseño de las 2 vueltas anteriores (panel de objetivo grande, dona,
  // timeline, cajas Priorizar/Moderar): ese quedó descartado a pedido
  // explícito del usuario ("sigue sin gustarme, mejor lo quiero así, dejalo
  // tal cual"). No reabrir esa dirección sin que el usuario la pida de
  // nuevo — ver memoria.md → "PDF de Mi plan" para el historial completo.
  //
  // Qué NO se dibuja más, a propósito, porque la referencia no lo tiene:
  //   - El panel grande "OBJETIVO COGNITIVO PRINCIPAL" (el título del
  //     plan ahora vive en el banner de resumen + en cada título de
  //     sección "N. ESTRATEGIA NUTRICIONAL: {plan}").
  //   - La columna "MODERAR" (el dato sigue en plan.moderar por si se
  //     quiere reincorporar; nutriPdfModelo() no cambió).
  //   - Los avisos personalizados (medicación, sueño, estrés+fatiga) y el
  //     panel legal grande "AVISO". El aviso general sigue en el pie de
  //     cada página, como en la referencia.
  //   - El timeline con círculos numerados y la dona de reparto del día
  //     tipo: pasa a ser una lista simple "Momento: detalle".
  //   - El QR de "verificación digital": la referencia lo muestra, pero
  //     acá no hay ningún backend real que emita o valide ese código.
  //     Ponerlo sería mostrar una promesa de verificación que no existe.
  //     Si en algún momento hay una URL real de verificación, se agrega.

  // Cuadro de texto con fragmentos en distinto peso (normal/bold) que se
  // ajustan de línea juntos, palabra por palabra — para el "Tu plan
  // prioritario está enfocado en **{objetivo}**." del resumen ejecutivo y
  // los "**Momento:** detalle" del día tipo. jsPDF no tiene texto de
  // formato mixto nativo (no es HTML); esto lo arma a mano.
  // Arma la lista de {w, bold, color} a partir de los segmentos, fusionando
  // un token que es puntuación sola (".", ",", ";"...) con la palabra
  // anterior — si no, "Concentración" + ".": queda "Concentración ." con un
  // espacio de más antes del punto, porque cada palabra se tokeniza por
  // separado. Compartida por parrafoEnfasis y altoParrafoEnfasis para que
  // ambas midan/dibujen exactamente lo mismo.
  function tokenizarSegmentos(segmentos){
    const crudo = [];
    segmentos.forEach(function(seg){
      String(seg.texto).split(' ').forEach(function(w){
        if(w.length) crudo.push({w: w, bold: !!seg.bold, color: seg.color});
      });
    });
    const palabras = [];
    crudo.forEach(function(p){
      const anterior = palabras[palabras.length - 1];
      if(anterior && /^[.,;:)]+$/.test(p.w)){
        anterior.w += p.w;
      } else {
        palabras.push({w: p.w, bold: p.bold, color: p.color});
      }
    });
    return palabras;
  }

  function parrafoEnfasis(doc, segmentos, x, y, ancho, tam, interlineado){
    const lh = (tam * 0.3528) * (interlineado || 1.3);
    const palabras = tokenizarSegmentos(segmentos);
    let cx = x, cy = y, lineas = 1, primera = true;
    palabras.forEach(function(p){
      fuente(doc, F_CUERPO, p.bold ? 'bold' : 'normal', tam);
      const wAncho = doc.getTextWidth(p.w + ' ');
      if(cx + wAncho > x + ancho && !primera){ cx = x; cy += lh; lineas++; }
      setText(doc, p.color || C.ink);
      doc.text(p.w, cx, cy);
      cx += wAncho;
      primera = false;
    });
    return lineas * lh;
  }

  // Alto que va a ocupar parrafoEnfasis, sin dibujar nada (para reservar
  // espacio con ctx.espacio() antes de dibujar).
  function altoParrafoEnfasis(doc, segmentos, ancho, tam, interlineado){
    const lh = (tam * 0.3528) * (interlineado || 1.3);
    const palabras = tokenizarSegmentos(segmentos);
    fuente(doc, F_CUERPO, 'normal', tam);
    let cx = 0, lineas = 1, primera = true;
    palabras.forEach(function(p){
      const wAncho = doc.getTextWidth(p.w + ' ');
      if(cx + wAncho > ancho && !primera){ cx = 0; lineas++; }
      cx += wAncho;
      primera = false;
    });
    return lineas * lh;
  }

  function dibujarEncabezado(ctx, m){
    const doc = ctx.doc;
    if(ctx.logo){
      // 432x397 px en el original: se respeta la proporción para que el
      // logo no salga deformado.
      doc.addImage(ctx.logo, 'PNG', M, 12.4, 11.5, 11.5 * (397/432));
    } else {
      // Fallback vectorial si el PNG no se pudo cargar (offline, 404): un
      // nodo con 2 sinapsis, en la misma familia gráfica del sitio.
      setFill(doc, C.plum);
      doc.circle(M + 6.5, 17.5, 5.5, 'F');
      setFill(doc, C.gold);
      doc.circle(M + 4.2, 15.6, 1.4, 'F');
      doc.circle(M + 8.9, 19.2, 1.4, 'F');
    }

    // La referencia usa un único sans-serif en todo el documento (incluida
    // la marca): F_TITULO (serif) queda reservado por si algún día se
    // vuelve a un diseño con jerarquía tipográfica de 2 familias.
    fuente(doc, F_CUERPO, 'bold', 16);
    setText(doc, C.marca);
    doc.text('SINAPTIX', M + 15, 18);

    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkFaint);
    doc.text('Plan personalizado de neuroalimentación', M + 15, 22);

    // Bloque de identificación, alineado al margen derecho.
    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkFaint);
    doc.text('Preparado para', PAGE_W - M, 14.6, {align:'right'});
    fuente(doc, F_CUERPO, 'bold', 10);
    setText(doc, C.marca);
    doc.text(m.nombre || 'Tu plan', PAGE_W - M, 19, {align:'right'});
    fuente(doc, F_CUERPO, 'normal', 7.6);
    setText(doc, C.inkSoft);
    doc.text(pdfFecha(m.fechaReeval || m.fechaPlan), PAGE_W - M, 22.8, {align:'right'});

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
    fuente(doc, F_CUERPO, 'bold', 10);
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

  // Banner "Resumen Ejecutivo" (verde, como el "quick-tip" de la
  // referencia). El usuario no escribe este texto: se arma solo a partir
  // de los ajustes ya calculados por nutriConstruirAjustes(), buscando 2
  // patrones frecuentes (exclusión por alergia, refuerzo en el bloque de
  // mayor exigencia). Si no aparece ninguno, cae a una frase genérica.
  function pdfResumenEjecutivo(m){
    const partes = [];
    if(m.ajustes.some(function(a){ return /excluye/i.test(a); })){
      partes.push('exclusión de alérgenos y restricciones declaradas');
    }
    if(m.ajustes.some(function(a){ return /exigencia mental/i.test(a); })){
      partes.push('refuerzo nutricional en tus horas de mayor exigencia mental');
    }
    let cola = '';
    if(partes.length){
      cola = ' Se introduce ' + partes.join(' y ') + '.';
    } else if(m.ajustes.length){
      cola = ' Se ajustó a tu encuesta.';
    }
    return {
      pre: 'Resumen ejecutivo: Tu plan prioritario está enfocado en ',
      objetivo: m.objetivoTitulo,
      post: '.' + cola
    };
  }

  function dibujarResumenEjecutivo(ctx, m){
    const doc = ctx.doc;
    const r = pdfResumenEjecutivo(m);
    const segmentos = [
      {texto: r.pre, bold: false},
      {texto: r.objetivo, bold: true},
      {texto: r.post, bold: false}
    ];
    const tam = 8.4;
    const anchoTexto = CW - 14;
    const alto = 6 + altoParrafoEnfasis(doc, segmentos, anchoTexto, tam) + 4;

    ctx.espacio(alto);
    const y = ctx.y;
    setFill(doc, C.verdeClaro);
    setDraw(doc, C.verdeBorde);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, alto, 1.2, 1.2, 'FD');
    setFill(doc, C.green);
    doc.rect(M, y, 1.1, alto, 'F');

    // Marca de "tip": un punto relleno con un anillo fino alrededor, en vez
    // de intentar una bombilla vectorial — a este tamaño (unos milímetros)
    // una silueta de bombilla con primitivas de jsPDF lee como una forma
    // rota antes que como un ícono reconocible.
    const cx = M + 9, cyIco = y + alto / 2;
    setDraw(doc, C.verdeBorde);
    doc.setLineWidth(0.5);
    doc.circle(cx, cyIco, 2.6, 'D');
    setFill(doc, C.green);
    doc.circle(cx, cyIco, 1.1, 'F');

    parrafoEnfasis(doc, segmentos, M + 14, y + 6, anchoTexto, tam);
    ctx.y = y + alto + 5;
  }

  // Título de sección: versalitas + regla en C.plum (numeración automática
  // por sección, no reabrir con círculo relleno: ver memoria.md).
  function tituloSeccion(ctx, texto, altoBloque){
    const doc = ctx.doc;
    ctx.seccion += 1;
    const numero = ctx.seccion;
    ctx.espacio(9 + Math.min(altoBloque || 14, Y_LIMITE - Y_INICIO_CONT - 9));
    const y = ctx.y;
    fuente(doc, F_CUERPO, 'bold', 9);
    setText(doc, C.plum);
    doc.text(numero + '. ' + texto.toUpperCase(), M, y + 2.6);

    setDraw(doc, C.plum);
    doc.setLineWidth(0.45);
    doc.line(M, y + 4.8, PAGE_W - M, y + 4.8);
    ctx.y = y + 9;
  }

  // Título chico de tarjeta de métrica (icono simple + texto), con línea
  // gris debajo — igual jerarquía que .card-title en la referencia: texto
  // en C.plum, regla en gris, no en el color de acento de la tarjeta.
  function tituloTarjeta(doc, x, y, w, texto){
    fuente(doc, F_CUERPO, 'bold', 7.6);
    setText(doc, C.plum);
    doc.text(texto, x, y);
    setDraw(doc, C.line);
    doc.setLineWidth(0.25);
    doc.line(x, y + 2.2, x + w, y + 2.2);
  }

  // ---------- Tarjeta 1: Antropometría (barra degradada + puntero) ----------
  const IMC_MIN = 15, IMC_MAX = 40;
  const IMC_STOPS = [
    {en: 0,   color: [148, 163, 184]}, // gris — "Bajo"
    {en: 0.35, color: [5, 150, 105]},  // verde — "Normal"
    {en: 0.65, color: [217, 119, 6]},  // ámbar — "Sobrepeso"
    {en: 1,   color: [159, 18, 57]}    // rosa oscuro — "Obesidad"
  ];
  function colorEnDegradado(stops, t){
    let i = 0;
    while(i < stops.length - 2 && t > stops[i + 1].en) i++;
    const a = stops[i], b = stops[i + 1];
    const local = b.en === a.en ? 0 : (t - a.en) / (b.en - a.en);
    return [0, 1, 2].map(function(k){ return Math.round(a.color[k] + (b.color[k] - a.color[k]) * local); });
  }

  function dibujarMetricaImc(ctx, m, x, y, w, alto){
    const doc = ctx.doc;
    const titulo = m.imc
      ? 'ANTROPOMETRÍA (IMC: ' + m.imc.imc.toFixed(1) + ' KG/M2)'
      : 'ANTROPOMETRÍA';
    tituloTarjeta(doc, x, y, w, titulo);

    if(!m.imc){
      fuente(doc, F_CUERPO, 'normal', 7.6);
      setText(doc, C.inkFaint);
      parrafo(doc, 'Todavía no registraste tus datos antropométricos, así que este plan no incluye el ajuste por IMC.', x, y + 8, w);
      return;
    }

    const info = m.imc;
    const bx = x, bw = w, by = y + 16, bh = 3.2;
    const N = 90; // más franjas = degradado más suave, menos bandeado visible
    for(let i = 0; i < N; i++){
      const t0 = i / N, t1 = (i + 1) / N;
      setFill(doc, colorEnDegradado(IMC_STOPS, (t0 + t1) / 2));
      doc.rect(bx + bw * t0, by, bw * (t1 - t0) + 0.15, bh, 'F');
    }
    // Bordes redondeados en los extremos, encimados sobre las tiras para
    // que el remate no se vea a escuadra.
    setFill(doc, colorEnDegradado(IMC_STOPS, 0));
    doc.roundedRect(bx, by, 3, bh, 1.5, 1.5, 'F');
    doc.rect(bx + 1.5, by, 1.5, bh, 'F');
    setFill(doc, colorEnDegradado(IMC_STOPS, 1));
    doc.roundedRect(bx + bw - 3, by, 3, bh, 1.5, 1.5, 'F');
    doc.rect(bx + bw - 3, by, 1.5, bh, 'F');

    // Puntero: recortado a IMC_MIN/IMC_MAX igual que antes, para que el
    // pin nunca se salga de la barra con valores extremos.
    const v = Math.max(IMC_MIN, Math.min(IMC_MAX, info.imc));
    const t = (v - IMC_MIN) / (IMC_MAX - IMC_MIN);
    const px = bx + bw * t;

    const valor = info.imc.toFixed(1);
    fuente(doc, F_CUERPO, 'bold', 6.6);
    const badgeW = doc.getTextWidth(valor) + 4;
    const badgeX = Math.max(bx, Math.min(bx + bw - badgeW, px - badgeW / 2));
    setFill(doc, C.rosaOscuro);
    doc.roundedRect(badgeX, by - 7.4, badgeW, 4.6, 1, 1, 'F');
    setText(doc, C.paper);
    doc.text(valor, badgeX + badgeW / 2, by - 4.3, {align:'center'});
    triangulo(doc, px, by - 2.8, 2.6, 2.4, C.rosaOscuro);

    fuente(doc, F_CUERPO, 'normal', 6.4);
    setText(doc, C.inkFaint);
    const yEtq = by + bh + 3.4;
    doc.text('Bajo', bx, yEtq);
    doc.text('Normal', bx + bw * 0.35, yEtq, {align:'center'});
    doc.text('Sobrepeso', bx + bw * 0.65, yEtq, {align:'center'});
    doc.text('Obesidad', bx + bw, yEtq, {align:'right'});

    setDraw(doc, C.line);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([0.6, 0.6], 0);
    doc.line(x, yEtq + 3, x + w, yEtq + 3);
    doc.setLineDashPattern([], 0);
    fuente(doc, F_CUERPO, 'normal', 6.6);
    setText(doc, C.inkFaint);
    doc.text(doc.splitTextToSize('Clasificación metabólica de referencia para ajuste de requerimientos.', w), x, yEtq + 6.6, {align:'left'});
  }

  // ---------- Tarjeta 2: Estado inicial (4 anillos) ----------
  function anillo(doc, cx, cy, r, grosor, pct, color, fondo){
    setFill(doc, fondo);
    doc.circle(cx, cy, r, 'F');
    if(pct > 0) sectorDona(doc, cx, cy, r, r - grosor, 0, Math.min(pct, 100) * 3.6, color);
    setFill(doc, C.paper);
    doc.circle(cx, cy, r - grosor, 'F');
  }

  function dibujarMetricaAnillos(ctx, m, x, y, w, alto){
    const doc = ctx.doc;
    tituloTarjeta(doc, x, y, w, 'ESTADO INICIAL');

    const n = m.barras.length;
    const r = 5.6, grosor = 1.8;
    const paso = w / n;
    const cy = y + 8 + r;
    m.barras.forEach(function(b, i){
      const cx = x + paso * i + paso / 2;
      anillo(doc, cx, cy, r, grosor, b.pct, b.color, C.panel2);
      fuente(doc, F_CUERPO, 'bold', 6.4);
      setText(doc, b.color);
      doc.text(b.pct + '%', cx, cy + 1.2, {align:'center'});
      fuente(doc, F_CUERPO, 'normal', 6.8);
      setText(doc, C.inkSoft);
      doc.text(b.label, cx, cy + r + 4, {align:'center'});
    });
  }

  // ---------- Estrategia nutricional: 2 columnas coloreadas ----------
  // A pedido explícito del usuario, "Nutrientes Clave" y "Prioridades" se
  // diferencian por color (encabezado + viñeta): azul acero para lo
  // informativo (nutrientes), verde para lo accionable (prioridades). El
  // texto de cada ítem queda en tinta neutra — solo el encabezado y la
  // viñeta llevan color, como pidió: "para poder diferenciarlos".
  function altoColumnaLista(doc, items, w){
    fuente(doc, F_CUERPO, 'normal', 8);
    let h = 6;
    items.forEach(function(it){
      h += altoTexto(doc, doc.splitTextToSize('•  ' + it, w - 4)) + 0.8;
    });
    return h;
  }

  function dibujarColumnaLista(doc, x, y, w, titulo, items, color){
    fuente(doc, F_CUERPO, 'bold', 7.6);
    setText(doc, color);
    doc.text(titulo.toUpperCase(), x, y);
    setDraw(doc, C.panel2);
    doc.setLineWidth(0.3);
    doc.line(x, y + 1.6, x + w, y + 1.6);

    let yy = y + 6;
    fuente(doc, F_CUERPO, 'normal', 8);
    items.forEach(function(it){
      setText(doc, color);
      doc.text('•', x, yy);
      setText(doc, C.ink);
      const usado = parrafo(doc, it, x + 3.6, yy - 2.8, w - 4);
      yy += usado + 0.8;
    });
  }

  function dibujarNutrientesPrioridades(ctx, plan){
    const doc = ctx.doc;
    const wCol = (CW - 8) / 2;
    const h = Math.max(
      altoColumnaLista(doc, plan.nutrientes, wCol),
      altoColumnaLista(doc, plan.priorizar, wCol)
    );
    ctx.espacio(h);
    const y = ctx.y;
    dibujarColumnaLista(doc, M, y, wCol, 'Nutrientes clave', plan.nutrientes, C.acento);
    dibujarColumnaLista(doc, M + wCol + 8, y, wCol, 'Prioridades', plan.priorizar, C.green);
    ctx.y = y + h + 4;
  }

  // ---------- Día tipo: lista simple "Momento: detalle" ----------
  function altoDiaTipoLista(doc, m){
    let h = 0;
    m.diaTipo.forEach(function(it){
      const segmentos = [{texto: it.momento + ':', bold: true}, {texto: it.detalle, bold: false}];
      h += altoParrafoEnfasis(doc, segmentos, CW, 8) + 1.6;
    });
    return h;
  }

  function dibujarDiaTipoLista(ctx, m){
    const doc = ctx.doc;
    let y = ctx.y;
    m.diaTipo.forEach(function(it){
      const segmentos = [{texto: it.momento + ':', bold: true}, {texto: it.detalle, bold: false}];
      const usado = parrafoEnfasis(doc, segmentos, M, y, CW, 8);
      y += usado + 1.6;
    });
    ctx.y = y + 2;
  }

  // ---------- "Ajustado a tu caso particular": caja ámbar ----------
  function altoAjusteDestacado(doc, m){
    fuente(doc, F_CUERPO, 'normal', 8);
    let h = 8;
    m.ajustes.forEach(function(a){
      h += altoTexto(doc, doc.splitTextToSize(a, CW - 20)) + 1;
    });
    return h + 3;
  }

  function dibujarAjusteDestacado(ctx, m){
    if(!m.ajustes.length) return;
    const doc = ctx.doc;
    const h = altoAjusteDestacado(doc, m);
    ctx.espacio(h + 3);
    const y = ctx.y;

    setFill(doc, C.ambarClaro);
    setDraw(doc, C.ambarBorde);
    doc.setLineWidth(0.25);
    doc.roundedRect(M, y, CW, h, 1, 1, 'FD');
    setFill(doc, C.gold);
    doc.rect(M, y, 1.3, h, 'F');

    fuente(doc, F_CUERPO, 'bold', 8);
    setText(doc, C.ambarTexto);
    doc.text('Ajustado a tu caso particular:', M + 7, y + 6.2);

    let yy = y + 10.4;
    fuente(doc, F_CUERPO, 'normal', 8);
    m.ajustes.forEach(function(a){
      setText(doc, C.gold);
      doc.text('•', M + 7, yy);
      setText(doc, C.ink);
      const usado = parrafo(doc, a, M + 10.5, yy - 2.8, CW - 20);
      yy += usado + 1;
    });
    ctx.y = y + h + 5;
  }

  function dibujarPies(doc, m){
    const total = doc.getNumberOfPages();
    for(let p = 1; p <= total; p++){
      doc.setPage(p);
      setDraw(doc, C.line);
      doc.setLineWidth(0.25);
      doc.line(M, 280, PAGE_W - M, 280);
      fuente(doc, F_CUERPO, 'normal', 6.8);
      setText(doc, C.inkFaint);
      doc.text('Contenido informativo, no reemplaza diagnóstico médico certificado.', M, 284.5);
      doc.text('Página ' + p + ' de ' + total, PAGE_W - M, 284.5, {align:'right'});
    }
  }

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

    dibujarResumenEjecutivo(ctx, m);

    // Fila de métricas: IMC (izquierda) + anillos de estado (derecha).
    const wIzq = (CW - 8) / 2, wDer = CW - wIzq - 8;
    const altoFila = 38;
    ctx.espacio(altoFila);
    const yFila = ctx.y;
    setFill(doc, C.panel);
    setDraw(doc, C.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, yFila, wIzq, altoFila, 1.5, 1.5, 'FD');
    doc.roundedRect(M + wIzq + 8, yFila, wDer, altoFila, 1.5, 1.5, 'FD');
    dibujarMetricaImc(ctx, m, M + 6, yFila + 6, wIzq - 12, altoFila - 10);
    dibujarMetricaAnillos(ctx, m, M + wIzq + 8 + 6, yFila + 6, wDer - 12, altoFila - 10);
    ctx.y = yFila + altoFila + 6;

    // Estrategia nutricional (un bloque por plan si el objetivo resolvió
    // en más de uno, igual que nutriBuildResumenHTML)
    m.planes.forEach(function(plan){
      const wCol = (CW - 8) / 2;
      const alto = Math.max(
        altoColumnaLista(doc, plan.nutrientes, wCol),
        altoColumnaLista(doc, plan.priorizar, wCol)
      );
      const segEnfoque = [{texto: plan.enfoque, bold: false}];
      const altoTexto1 = altoParrafoEnfasis(doc, segEnfoque, CW, 8.4);
      tituloSeccion(ctx, m.planes.length > 1
        ? 'Estrategia nutricional: ' + plan.nombre
        : 'Estrategia nutricional', altoTexto1 + alto + 8);

      const usado = parrafoEnfasis(doc, segEnfoque, M, ctx.y, CW, 8.4);
      ctx.y += usado + 4;

      dibujarNutrientesPrioridades(ctx, plan);
    });

    // Día tipo
    tituloSeccion(ctx, 'Estructura de día tipo', altoDiaTipoLista(doc, m));
    dibujarDiaTipoLista(ctx, m);

    // Ajustado a tu caso particular
    dibujarAjusteDestacado(ctx, m);

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
