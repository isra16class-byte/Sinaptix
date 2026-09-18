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
  const C = {
    ink:        [38, 22, 31],     // --ink
    inkSoft:    [105, 88, 97],    // --ink-soft aplanado sobre blanco
    inkFaint:   [150, 138, 145],  // --ink-faint aplanado sobre blanco
    purple:     [113, 75, 103],   // --purple
    purpleDark: [75, 46, 69],     // --purple-dark
    green:      [46, 125, 91],    // --green
    gold:       [193, 112, 59],   // --gold
    navy:       [59, 110, 165],   // --navy-bright
    red:        [179, 38, 30],    // --red
    paper:      [255, 255, 255],  // --paper
    panel:      [247, 241, 245],  // --panel
    panel2:     [241, 229, 236],  // --panel-2
    line:       [229, 220, 227],  // --line aplanado sobre blanco
    lila:       [239, 225, 236],  // --miplan-card-lila
    verde:      [223, 238, 228],  // --miplan-card-verde
    dorado:     [246, 231, 214],  // --miplan-card-dorado
    rojoSuave:  [251, 236, 235],  // tinte de aviso "alto" (rojo al 8%)
    rielTimeline:[223, 208, 219]  // --panel-2 un paso más oscuro: sobre papel
                                  // blanco el riel del timeline en --panel-2
                                  // puro directamente no se veía
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
  const Y_INICIO = 34;                // debajo del encabezado de la pág. 1
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
  const REPARTO_COLOR = {
    'Desayuno': C.gold,
    'Snack':    C.green,
    'Almuerzo': C.purple,
    'Cena':     C.navy
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
        color: pdfHexARgb(api.gaugeColorForPercent(pct)),
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
      doc.addImage(ctx.logo, 'PNG', M, 12, 13, 13 * (397/432));
    } else {
      // Fallback vectorial si el PNG no se pudo cargar (offline, 404): un
      // nodo con 2 sinapsis, en la misma familia gráfica del sitio.
      setFill(doc, C.purple);
      doc.circle(M + 6.5, 17.5, 5.5, 'F');
      setFill(doc, C.gold);
      doc.circle(M + 4.2, 15.6, 1.4, 'F');
      doc.circle(M + 8.9, 19.2, 1.4, 'F');
    }

    fuente(doc, F_TITULO, 'bold', 19);
    setText(doc, C.purpleDark);
    doc.text('SINAPTIX', M + 16.5, 18.6);

    fuente(doc, F_CUERPO, 'normal', 7.6);
    setText(doc, C.inkFaint);
    doc.text('Plan personalizado de neuroalimentación', M + 16.5, 23);

    // Bloque de identificación, alineado al margen derecho.
    fuente(doc, F_CUERPO, 'normal', 7.2);
    setText(doc, C.inkFaint);
    doc.text('PREPARADO PARA', PAGE_W - M, 14.6, {align:'right'});
    fuente(doc, F_CUERPO, 'bold', 10.5);
    setText(doc, C.ink);
    doc.text(m.nombre || 'Tu plan', PAGE_W - M, 19.4, {align:'right'});
    fuente(doc, F_CUERPO, 'normal', 7.6);
    setText(doc, C.inkSoft);
    doc.text(pdfFecha(m.fechaReeval || m.fechaPlan), PAGE_W - M, 23.4, {align:'right'});

    // Regla del encabezado: hairline morado a todo el ancho + tramo dorado
    // corto a la izquierda (mismo recurso de acento que usa el sitio).
    setDraw(doc, C.line);
    doc.setLineWidth(0.4);
    doc.line(M, 27.2, PAGE_W - M, 27.2);
    setDraw(doc, C.gold);
    doc.setLineWidth(1);
    doc.line(M, 27.2, M + 26, 27.2);
    ctx.y = Y_INICIO;
  }

  function dibujarEncabezadoContinuacion(ctx){
    const doc = ctx.doc;
    if(ctx.logo){
      doc.addImage(ctx.logo, 'PNG', M, 11, 8, 8 * (397/432));
    }
    fuente(doc, F_TITULO, 'bold', 11);
    setText(doc, C.purpleDark);
    doc.text('SINAPTIX', M + (ctx.logo ? 10.5 : 0), 17.2);
    fuente(doc, F_CUERPO, 'normal', 7.6);
    setText(doc, C.inkFaint);
    doc.text('Mi plan de neuroalimentación', PAGE_W - M, 17.2, {align:'right'});
    setDraw(doc, C.line);
    doc.setLineWidth(0.4);
    doc.line(M, 20.4, PAGE_W - M, 20.4);
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
    ctx.espacio(11 + Math.min(altoBloque || 14, Y_LIMITE - Y_INICIO_CONT - 11));
    const y = ctx.y;
    setFill(doc, C.purple);
    doc.circle(M + 2.6, y + 1.4, 2.6, 'F');
    fuente(doc, F_CUERPO, 'bold', 7.5);
    setText(doc, C.paper);
    doc.text(String(numero), M + 2.6, y + 2.5, {align:'center'});

    fuente(doc, F_TITULO, 'bold', 12.5);
    setText(doc, C.purpleDark);
    doc.text(texto, M + 7.8, y + 3);

    setDraw(doc, C.line);
    doc.setLineWidth(0.3);
    doc.line(M, y + 6.4, PAGE_W - M, y + 6.4);
    ctx.y = y + 11;
  }

  // Panel destacado del objetivo.
  function dibujarObjetivo(ctx, m){
    const doc = ctx.doc;
    fuente(doc, F_CUERPO, 'normal', 8.6);
    const enfoque = m.planes[0].enfoque;
    const lineas = doc.splitTextToSize(enfoque, CW - 24);
    const alto = 19.5 + altoTexto(doc, lineas) + 4.5;

    ctx.espacio(alto);
    const y = ctx.y;

    setFill(doc, C.lila);
    doc.roundedRect(M, y, CW, alto, 3, 3, 'F');
    // Barra de acento a la izquierda, con aire arriba y abajo para no
    // pelearse con el redondeo del panel.
    setFill(doc, C.purple);
    doc.roundedRect(M + 4.5, y + 4.5, 1.6, alto - 9, 0.8, 0.8, 'F');

    const x = M + 10.5;
    fuente(doc, F_CUERPO, 'bold', 7.2);
    setText(doc, C.purple);
    doc.text('OBJETIVO COGNITIVO PRINCIPAL', x, y + 8);

    fuente(doc, F_TITULO, 'bold', 16);
    setText(doc, C.purpleDark);
    doc.text(m.objetivoTitulo, x, y + 16.4);

    fuente(doc, F_CUERPO, 'normal', 8.6);
    setText(doc, C.inkSoft);
    parrafo(doc, enfoque, x, y + 18.6, CW - 24);

    ctx.y = y + alto + 6;
  }

  // Tarjeta blanca con borde + título chico en versalitas.
  function tarjeta(doc, x, y, w, h, titulo){
    setFill(doc, C.paper);
    setDraw(doc, C.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');
    fuente(doc, F_CUERPO, 'bold', 7.4);
    setText(doc, C.purple);
    doc.text(titulo, x + 6, y + 7);
    setDraw(doc, C.line);
    doc.setLineWidth(0.25);
    doc.line(x + 6, y + 9.4, x + w - 6, y + 9.4);
  }

  // Barras de estado con marca de meta.
  function dibujarBarras(ctx, m, x, y, w){
    const doc = ctx.doc;
    const alto = 14 + m.barras.length * 9.6 + 6;
    tarjeta(doc, x, y, w, alto, 'TU ESTADO ACTUAL');

    const xLabel = x + 6;
    const xTrack = x + 30;
    const trackW = w - 30 - 6 - 12;
    let yy = y + 16.5;

    m.barras.forEach(function(b){
      fuente(doc, F_CUERPO, b.destacada ? 'bold' : 'normal', 8.2);
      setText(doc, b.destacada ? C.purpleDark : C.inkSoft);
      doc.text(b.label, xLabel, yy + 2.6);
      if(b.destacada){
        setFill(doc, C.purple);
        doc.circle(xLabel - 2.2, yy + 1.8, 0.8, 'F');
      }

      // Riel
      setFill(doc, C.panel2);
      doc.roundedRect(xTrack, yy, trackW, 3.4, 1.7, 1.7, 'F');
      // Relleno
      const wFill = Math.max(3.4, trackW * b.pct / 100);
      setFill(doc, b.color);
      doc.roundedRect(xTrack, yy, wFill, 3.4, 1.7, 1.7, 'F');

      // Marca de "antes" (solo si hubo reevaluación): tramo oscuro fino
      // sobre el riel, en la posición del valor anterior.
      if(b.antesPct != null){
        const xa = xTrack + trackW * b.antesPct / 100;
        setDraw(doc, C.purpleDark);
        doc.setLineWidth(0.5);
        doc.line(xa, yy - 1, xa, yy + 4.4);
      }

      // Marca de meta
      const xm = xTrack + trackW * m.metaPct / 100;
      setDraw(doc, C.inkFaint);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([0.7, 0.7], 0);
      doc.line(xm, yy - 1.6, xm, yy + 5);
      doc.setLineDashPattern([], 0);

      fuente(doc, F_CUERPO, 'bold', 8.2);
      setText(doc, C.ink);
      doc.text(b.pct + '%', x + w - 6, yy + 2.6, {align:'right'});

      yy += 9.6;
    });

    // Leyenda de la tarjeta
    fuente(doc, F_CUERPO, 'normal', 6.8);
    setText(doc, C.inkFaint);
    const leyenda = m.barras[0].antesPct != null
      ? 'Línea punteada: meta sugerida (' + m.metaPct + '%). Línea llena: valor de la encuesta inicial.'
      : 'Línea punteada: meta sugerida (' + m.metaPct + '%) para cada área.';
    doc.text(doc.splitTextToSize(leyenda, w - 12), x + 6, yy + 1.5);

    return alto;
  }

  // Barra de IMC por zonas + puntero.
  function dibujarImc(ctx, m, x, y, w, alto){
    const doc = ctx.doc;
    tarjeta(doc, x, y, w, alto, 'ANTROPOMETRÍA');

    if(!m.imc){
      fuente(doc, F_CUERPO, 'normal', 8);
      setText(doc, C.inkFaint);
      parrafo(doc, 'Todavía no registraste tus datos antropométricos, así que este plan no incluye el ajuste por IMC.', x + 6, y + 14, w - 12);
      return;
    }

    const info = m.imc;
    // Número grande + categoría
    const valor = info.imc.toFixed(1);
    fuente(doc, F_TITULO, 'bold', 24);
    setText(doc, C.ink);
    doc.text(valor, x + 6, y + 24);
    const xUnidad = x + 6 + doc.getTextWidth(valor) + 2.2;
    // El ² no está garantizado en las fuentes estándar del PDF: se dibuja
    // como un "2" más chico y elevado en vez de confiar en el glifo.
    fuente(doc, F_CUERPO, 'normal', 7);
    setText(doc, C.inkFaint);
    doc.text('kg/m', xUnidad, y + 24);
    const xSup = xUnidad + doc.getTextWidth('kg/m');
    fuente(doc, F_CUERPO, 'normal', 4.6);
    doc.text('2', xSup, y + 21.8);

    const colorZona = info.zona === 'saludable' ? C.green : (info.zona === 'obesidad' ? C.red : C.gold);
    const etiqueta = info.cat.charAt(0).toUpperCase() + info.cat.slice(1);
    fuente(doc, F_CUERPO, 'bold', 7.6);
    const pillW = doc.getTextWidth(etiqueta) + 7;
    setFill(doc, colorZona);
    doc.roundedRect(x + w - 6 - pillW, y + 18.6, pillW, 6.4, 3.2, 3.2, 'F');
    setText(doc, C.paper);
    doc.text(etiqueta, x + w - 6 - pillW / 2, y + 22.9, {align:'center'});

    // Barra segmentada 15–40 con los umbrales OMS (18.5 / 25 / 30), los
    // mismos que usa imcCategoria() y el medidor del dashboard.
    const bx = x + 6, bw = w - 12, by = y + 34, bh = 3.6;
    const MIN = 15, MAX = 40;
    const cortes = [
      {hasta: 18.5, color: C.gold},
      {hasta: 25,   color: C.green},
      {hasta: 30,   color: C.gold},
      {hasta: MAX,  color: C.red}
    ];
    let desde = MIN;
    cortes.forEach(function(seg, i){
      const x0 = bx + bw * (desde - MIN) / (MAX - MIN);
      const x1 = bx + bw * (seg.hasta - MIN) / (MAX - MIN);
      setFill(doc, seg.color);
      // Solo los extremos llevan punta redondeada, igual que el arco del
      // medidor del sitio (los cortes internos van a tope, sin costura).
      if(i === 0 || i === cortes.length - 1){
        doc.roundedRect(x0, by, x1 - x0, bh, 1.8, 1.8, 'F');
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
    triangulo(doc, px, by - 2.6, 3.4, 2.6, C.purpleDark);

    fuente(doc, F_CUERPO, 'normal', 6.4);
    setText(doc, C.inkFaint);
    doc.text('15', bx, by + bh + 5.6);
    doc.text('18,5', bx + bw * 3.5 / 25, by + bh + 5.6, {align:'center'});
    doc.text('25', bx + bw * 10 / 25, by + bh + 5.6, {align:'center'});
    doc.text('30', bx + bw * 15 / 25, by + bh + 5.6, {align:'center'});
    doc.text('40', bx + bw, by + bh + 5.6, {align:'right'});

    let yy = by + bh + 11;
    fuente(doc, F_CUERPO, 'normal', 7.4);
    setText(doc, C.inkSoft);
    if(info.peso && info.tallaCm){
      doc.text(info.peso + ' kg · ' + info.tallaCm + ' cm', x + 6, yy);
      yy += 4.4;
    }
    if(info.rango){
      setText(doc, C.inkFaint);
      fuente(doc, F_CUERPO, 'normal', 7);
      doc.text('Peso saludable estimado: ' + info.rango.min + '-' + info.rango.max + ' kg', x + 6, yy);
    }
  }

  // Nutrientes clave como chips.
  function dibujarNutrientes(ctx, plan){
    const doc = ctx.doc;
    ctx.espacio(20);
    fuente(doc, F_CUERPO, 'bold', 8);
    setText(doc, C.purpleDark);
    doc.text('NUTRIENTES CLAVE', M, ctx.y);
    let y = ctx.y + 3.4;
    let x = M;

    fuente(doc, F_CUERPO, 'normal', 8);
    plan.nutrientes.forEach(function(n){
      const w = doc.getTextWidth(n) + 8;
      if(x + w > PAGE_W - M){ x = M; y += 8.4; }
      if(y + 7 > Y_LIMITE){ ctx.y = y; ctx.espacio(999); y = ctx.y; x = M; }
      setFill(doc, C.panel);
      setDraw(doc, C.panel2);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, w, 6.6, 3.3, 3.3, 'FD');
      setText(doc, C.purpleDark);
      doc.text(n, x + w / 2, y + 4.4, {align:'center'});
      x += w + 3;
    });
    ctx.y = y + 9;
  }

  // Caja de lista con encabezado de color (Priorizar / Moderar / Ajustes).
  // Devuelve el alto que ocupó.
  function altoCajaLista(doc, items, w, tamano){
    fuente(doc, F_CUERPO, 'normal', tamano || 8);
    let h = 11;
    items.forEach(function(it){
      h += altoTexto(doc, doc.splitTextToSize(it, w - 14)) + 1.4;
    });
    return h + 3;
  }

  function dibujarCajaLista(doc, x, y, w, titulo, items, colorBase, colorFondo, tamano, hForzado){
    const h = hForzado || altoCajaLista(doc, items, w, tamano);
    setFill(doc, colorFondo);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
    setFill(doc, colorBase);
    doc.roundedRect(x, y + 3, 1.4, h - 6, 0.7, 0.7, 'F');

    fuente(doc, F_CUERPO, 'bold', 8);
    setText(doc, colorBase);
    doc.text(titulo, x + 6, y + 7);

    fuente(doc, F_CUERPO, 'normal', tamano || 8);
    setText(doc, C.ink);
    let yy = y + 10;
    items.forEach(function(it){
      setFill(doc, colorBase);
      doc.circle(x + 7.2, yy + 1.5, 0.7, 'F');
      const usado = parrafo(doc, it, x + 10, yy - 0.8, w - 16);
      yy += usado + 1.4;
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
    return Math.max(suma, 44);
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
    const yUltimo = y0 + altos.slice(0, -1).reduce(function(a, b){ return a + b; }, 0) + 3;
    setDraw(doc, C.rielTimeline);
    doc.setLineWidth(0.8);
    doc.line(M + 3.2, y0 + 3, M + 3.2, yUltimo);

    let yy = y0;
    m.diaTipo.forEach(function(it, i){
      const color = REPARTO_COLOR[it.momento] || C.purple;
      setFill(doc, color);
      doc.circle(M + 3.2, yy + 3, 3.2, 'F');
      fuente(doc, F_CUERPO, 'bold', 7);
      setText(doc, C.paper);
      doc.text(String(i + 1), M + 3.2, yy + 4.1, {align:'center'});

      fuente(doc, F_CUERPO, 'bold', 8.6);
      setText(doc, C.purpleDark);
      doc.text(it.momento, M + 9.5, yy + 4);
      // El ancho del momento se mide ANTES de cambiar de cuerpo, o el %
      // queda pegado al texto (se mediría con la tipografía chica).
      const xPct = M + 9.5 + doc.getTextWidth(it.momento) + 2.6;
      fuente(doc, F_CUERPO, 'normal', 7);
      setText(doc, C.inkFaint);
      doc.text(it.pct + '%', xPct, yy + 4);

      fuente(doc, F_CUERPO, 'normal', 8);
      setText(doc, C.inkSoft);
      parrafo(doc, it.detalle, M + 9.5, yy + 5.4, anchoTexto);

      yy += altos[i];
    });

    // Dona + leyenda al costado (no debajo): así el bloque entero mide
    // ~44 mm de alto en vez de ~78 y entra junto al timeline sin empujar
    // la sección a la página siguiente.
    const cx = xDona + 17, cy = y0 + 19;
    let ang = 0;
    m.diaTipo.forEach(function(it){
      const barrido = it.pct * 3.6;
      sectorDona(doc, cx, cy, 17, 9.5, ang, ang + barrido, REPARTO_COLOR[it.momento] || C.purple);
      ang += barrido;
    });
    fuente(doc, F_TITULO, 'bold', 12);
    setText(doc, C.purpleDark);
    doc.text(String(m.diaTipo.length), cx, cy + 1, {align:'center'});
    fuente(doc, F_CUERPO, 'normal', 5.2);
    setText(doc, C.inkFaint);
    doc.text('MOMENTOS', cx, cy + 4.4, {align:'center'});

    const xLeyenda = xDona + 37;
    let ly = cy - 6.6;
    m.diaTipo.forEach(function(it){
      setFill(doc, REPARTO_COLOR[it.momento] || C.purple);
      doc.roundedRect(xLeyenda, ly - 1.9, 2.4, 2.4, 0.6, 0.6, 'F');
      fuente(doc, F_CUERPO, 'normal', 6.8);
      setText(doc, C.inkSoft);
      doc.text(it.momento, xLeyenda + 4, ly);
      fuente(doc, F_CUERPO, 'bold', 6.8);
      setText(doc, C.purpleDark);
      doc.text(it.pct + '%', PAGE_W - M, ly, {align:'right'});
      ly += 4.6;
    });

    fuente(doc, F_CUERPO, 'normal', 6.2);
    setText(doc, C.inkFaint);
    const nota = doc.splitTextToSize('Reparto orientativo de la energía del día.', 58);
    nota.forEach(function(l, i){ doc.text(l, xDona, cy + 21.5 + i * 3); });

    ctx.y = Math.max(yy, cy + 21.5 + nota.length * 3) + 6;
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
      const lineas = doc.splitTextToSize(a.texto, CW - 20);
      const h = altoTexto(doc, lineas) + 7;
      ctx.espacio(h + 3);
      const y = ctx.y;
      setFill(doc, fondo);
      doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'F');
      // Triángulo de atención
      triangulo(doc, M + 7, y + 6.6, 4.6, -4.4, alto);
      fuente(doc, F_CUERPO, 'bold', 5.4);
      setText(doc, C.paper);
      doc.text('!', M + 7, y + 6.1, {align:'center'});
      setText(doc, C.ink);
      fuente(doc, F_CUERPO, 'normal', 8);
      parrafo(doc, a.texto, M + 13, y + 2.2, CW - 20);
      ctx.y = y + h + 3;
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
    doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'F');

    fuente(doc, F_CUERPO, 'bold', 7.6);
    setText(doc, C.purple);
    doc.text('AVISO', M + 6, y + 7);

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
    const altoFila = 14 + m.barras.length * 9.6 + 6;
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
      dibujarCajaLista(doc, M, ctx.y, CW, 'QUÉ CAMBIA EN TU PLAN', m.ajustes, C.purple, C.lila);
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
      pdfRangoPesoSaludable: pdfRangoPesoSaludable,
      META_PCT: META_PCT,
      REPARTO: REPARTO,
      NUTRI_PDF_ARCHIVO: PDF_ARCHIVO,
      NUTRI_PDF_JSPDF_URL: JSPDF_URL
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
