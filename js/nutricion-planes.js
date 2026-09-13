// ===================== Datos y lógica de planes de nutrición =====================
// Extraído de js/script.js para poder reutilizarlo tanto en index.html (wizard de
// la encuesta) como en mi-plan.html (reconstruye el plan guardado sin repetir la
// encuesta). No depende del DOM de ningún formulario: solo recibe un objeto de
// datos `d` y devuelve texto/HTML. Debe cargarse ANTES que js/script.js o
// js/mi-plan.js en el <head>/<body> de cada página.
//
// Base de contenido de cada plan — ver memoria.md / documento de encuesta y planes
// para la justificación de cada nutriente y alimento.
const NUTRI_PLANES = {
  'Mejorar concentración': {
    nombre: 'Foco y Concentración',
    enfoque: 'Estabilizar la energía cerebral a lo largo del día y aportar los nutrientes asociados a velocidad de procesamiento y atención sostenida.',
    nutrientes: ['Omega-3 (DHA)', 'Flavonoides', 'Colina', 'Hidratos de carbono de bajo índice glucémico', 'Hierro'],
    priorizar: ['Pescados azules (o chía/lino/algas si aplica restricción)', 'Arándanos y frutos rojos', 'Huevo', 'Avena y cereales integrales', 'Frutos secos', 'Agua distribuida en el día'],
    moderar: ['Azúcares simples y bebidas azucaradas', 'Exceso de harinas refinadas'],
    diaTipo: [
      {momento: 'Desayuno', detalle: 'Avena o cereales integrales con arándanos/frutos rojos y un puñado de frutos secos.'},
      {momento: 'Snack', detalle: 'Fruta fresca con frutos secos, y agua distribuida durante la mañana.'},
      {momento: 'Almuerzo', detalle: 'Pescado azul (o su alternativa vegetal) con cereales integrales y vegetales variados.'},
      {momento: 'Cena', detalle: 'Plato liviano con huevo, evitando azúcares simples y harinas refinadas antes de dormir.'}
    ]
  },
  'Reducir fatiga mental': {
    nombre: 'Reducir Fatiga Mental',
    enfoque: 'Evitar los picos y caídas de energía que generan sensación de cansancio mental, cubriendo nutrientes cuya deficiencia se asocia a fatiga.',
    nutrientes: ['Vitamina B12 y complejo B', 'Hierro', 'Magnesio', 'Proteína de buena calidad distribuida en el día'],
    priorizar: ['Legumbres', 'Huevo o equivalente vegetal', 'Carnes magras o equivalente vegetal', 'Vegetales de hoja verde', 'Plátano', 'Cereales integrales'],
    moderar: ['Cafeína en exceso', 'Comidas copiosas en tus horas de mayor exigencia mental'],
    diaTipo: [
      {momento: 'Desayuno', detalle: 'Cereales integrales con huevo o equivalente vegetal, para una energía estable desde temprano.'},
      {momento: 'Snack', detalle: 'Plátano o fruta de estación, moderando la cafeína.'},
      {momento: 'Almuerzo', detalle: 'Legumbres o carnes magras (o equivalente vegetal) con vegetales de hoja verde.'},
      {momento: 'Cena', detalle: 'Comida liviana, evitando comidas copiosas cerca de tu bloque de mayor exigencia mental.'}
    ]
  },
  'Sostener memoria de trabajo': {
    nombre: 'Sostener Memoria de Trabajo',
    enfoque: 'Nutrientes vinculados a la síntesis de neurotransmisores relacionados con memoria y aprendizaje, y protección antioxidante de las neuronas.',
    nutrientes: ['Colina', 'Omega-3 (DHA)', 'Flavonoides / antioxidantes', 'Vitamina E'],
    priorizar: ['Huevo (colina) o equivalente vegetal', 'Pescados azules o equivalente vegetal', 'Arándanos y frutos rojos', 'Frutos secos', 'Cúrcuma', 'Chocolate negro con moderación'],
    moderar: ['Alcohol frecuente', 'Ultraprocesados'],
    diaTipo: [
      {momento: 'Desayuno', detalle: 'Huevo (o equivalente vegetal) con arándanos/frutos rojos y cereales integrales.'},
      {momento: 'Snack', detalle: 'Frutos secos, con un cuadrado de chocolate negro si te apetece.'},
      {momento: 'Almuerzo', detalle: 'Pescado azul (o equivalente vegetal) con cúrcuma y vegetales variados.'},
      {momento: 'Cena', detalle: 'Plato liviano, evitando el alcohol frecuente y los ultraprocesados.'}
    ]
  },
  'Manejo de estrés mental': {
    nombre: 'Manejo de Estrés Mental',
    enfoque: 'Nutrientes que se agotan más rápido bajo estrés y alimentos asociados a mejor regulación del ánimo vía el eje intestino-cerebro.',
    nutrientes: ['Magnesio', 'Vitamina C', 'Complejo B', 'Triptófano', 'Fibra / probióticos'],
    priorizar: ['Vegetales de hoja verde', 'Frutos secos y semillas', 'Plátano', 'Cítricos', 'Yogur o alimentos fermentados', 'Chocolate negro con moderación'],
    moderar: ['Cafeína y azúcar en exceso', 'Alcohol como manejo de estrés'],
    diaTipo: [
      {momento: 'Desayuno', detalle: 'Yogur o alimentos fermentados con frutos secos y semillas.'},
      {momento: 'Snack', detalle: 'Cítricos o plátano, para reponer vitamina C y magnesio.'},
      {momento: 'Almuerzo', detalle: 'Vegetales de hoja verde con una fuente de fibra o probióticos.'},
      {momento: 'Cena', detalle: 'Plato liviano, con infusiones en vez de cafeína y sin recurrir al alcohol como manejo de estrés.'}
    ]
  }
};

// Tabla de conexiones: decide el/los plan(es) y arma ajustes + avisos
// a partir de las respuestas — ver sección 4 del documento de encuesta y planes.
function nutriResolverObjetivo(d){
  if(d.objetivo !== 'No estoy seguro') return [d.objetivo];
  const escalas = {
    'Mejorar concentración': d.concentracion,
    'Reducir fatiga mental': d.fatiga,
    'Sostener memoria de trabajo': d.olvidos,
    'Manejo de estrés mental': d.estres
  };
  const max = Math.max.apply(null, Object.values(escalas));
  return Object.keys(escalas).filter(k=>escalas[k]===max);
}

function nutriConstruirAjustes(d){
  const ajustes = [];
  if(d.alergias.length || d.alergiaOtra){
    const lista = d.alergias.concat(d.alergiaOtra ? [d.alergiaOtra] : []).join(', ');
    ajustes.push('Se excluye de las recomendaciones: '+lista+', sustituido por alternativas equivalentes del mismo grupo nutricional.');
  }
  if(d.restriccion === 'Vegetariano' || d.restriccion === 'Vegano'){
    ajustes.push('Fuentes animales sustituidas por equivalentes vegetales (legumbres, tofu, semillas, algas).');
  }
  if(d.restriccion === 'Sin gluten'){
    ajustes.push('Cereales con gluten sustituidos por arroz, quinoa u otras opciones sin gluten.');
  }
  if(d.presupuesto === 'Ajustado'){
    ajustes.push('Fuentes premium reemplazadas por alternativas económicas (conservas de pescado, arándanos congelados, semillas de girasol o zapallo).');
  }
  if(d.tiempoCocina === 'Cocino yo con poco tiempo' || d.tiempoCocina === 'Como afuera la mayoría de días'){
    ajustes.push('Recomendaciones simplificadas a preparaciones rápidas o de compra directa.');
  }
  if(d.disgustos){
    ajustes.push('Se excluye de las recomendaciones lo que marcaste que no te gusta: '+d.disgustos+'.');
  }
  if(d.horaExigencia && d.horaExigencia !== 'Variable'){
    ajustes.push('El snack de refuerzo se ubica cerca de tu bloque de mayor exigencia mental ('+d.horaExigencia.toLowerCase()+').');
  }
  return ajustes;
}

function nutriConstruirAvisos(d){
  const avisos = [];
  if(d.condiciones.length || d.medicacion === 'Sí'){
    avisos.push('Antes de aplicar este plan, valídalo con tu médico o nutricionista: indicaste una condición de salud y/o medicación regular.');
  }
  if(d.sueno === 'Menos de 5' || d.sueno === '5 a 6' || (d.calidadSueno && d.calidadSueno <= 2)){
    avisos.push('Ningún plan alimentario sustituye dormir lo suficiente — tu sueño también está afectando tu rendimiento cognitivo.');
  }
  if(d.cafeina === '4 o más al día'){
    avisos.push('Te recomendamos reducir la cafeína de forma gradual, no de golpe, para evitar más fatiga los primeros días.');
  }
  if(d.ultraprocesados === 'A diario'){
    avisos.push('Se sugiere una transición gradual para bajar los ultraprocesados en vez de un cambio radical, para que el plan sea sostenible.');
  }
  return avisos;
}

// Arma el HTML del plan resuelto a partir de una encuesta ya respondida.
// Se usa tanto en el paso 8 del wizard (#nutriResumen, en index.html) como en
// "Mi plan" (#miPlanDetalle, en mi-plan.html), reconstruyendo el mismo
// resultado desde los datos guardados en localStorage sin tener que repetir
// la lógica ni la encuesta.
function nutriBuildResumenHTML(d){
  const objetivos = nutriResolverObjetivo(d);
  const planes = objetivos.map(o=>NUTRI_PLANES[o]).filter(Boolean);
  const ajustes = nutriConstruirAjustes(d);
  const avisos = nutriConstruirAvisos(d);

  let html = '';
  if(d.objetivo === 'No estoy seguro'){
    html += '<p>Con base en cómo te sentís día a día, el plan que más se ajusta a vos es:</p>';
  }
  planes.forEach(p=>{
    html += '<div><h4>'+p.nombre+'</h4><p>'+p.enfoque+'</p>'+
      '<div class="nutri-block-title">Nutrientes clave</div><ul>'+p.nutrientes.map(n=>'<li>'+n+'</li>').join('')+'</ul>'+
      '<div class="nutri-block-title">Priorizar</div><ul>'+p.priorizar.map(n=>'<li>'+n+'</li>').join('')+'</ul>'+
      '<div class="nutri-block-title">Moderar</div><ul>'+p.moderar.map(n=>'<li>'+n+'</li>').join('')+'</ul>'+
      (p.diaTipo && p.diaTipo.length ? '<div class="nutri-block-title">Un día tipo</div>'+
        '<div class="nutri-dia-tipo">'+p.diaTipo.map(m=>
          '<div class="dia-tipo-item">'+
            '<span class="dia-tipo-momento">'+m.momento+'</span>'+
            '<p class="dia-tipo-detalle">'+m.detalle+'</p>'+
          '</div>'
        ).join('')+'</div>' : '')+
      '</div>';
  });
  if(ajustes.length){
    html += '<div><div class="nutri-block-title">Ajustado a tu caso</div><ul>'+ajustes.map(a=>'<li>'+a+'</li>').join('')+'</ul></div>';
  }
  avisos.forEach(a=>{ html += '<p class="nutri-note">'+a+'</p>'; });
  return html;
}

// ===================== Áreas de bienestar (Foco / Memoria / Energía / Calma) =====================
// Compartido entre los anillos de "Método" (index.html) y el gráfico de
// barras de "Mi plan" (mi-plan.html): ambos parten de la misma encuesta
// (estrés/fatiga/concentración/olvidos, escala 1-5) y del mismo color
// según el porcentaje. Puramente funciones de cálculo — no tocan el DOM,
// por eso viven acá y no en script.js / mi-plan.js.

// Invierte cada escala 1-5 (donde 5 = peor) a un puntaje de bienestar
// 1-5 (donde 5 = mejor), sin importar cómo se formuló la pregunta.
function gaugeComputeAreas(d){
  return {
    foco: 6 - (parseInt(d.concentracion, 10) || 3),
    memoria: 6 - (parseInt(d.olvidos, 10) || 3),
    energia: 6 - (parseInt(d.fatiga, 10) || 3),
    calma: 6 - (parseInt(d.estres, 10) || 3)
  };
}

function gaugeHexToRgb(hex){
  const h = hex.replace('#','');
  return {
    r: parseInt(h.substring(0,2),16),
    g: parseInt(h.substring(2,4),16),
    b: parseInt(h.substring(4,6),16)
  };
}
function gaugeLerp(a, b, t){ return a + (b-a)*t; }
function gaugeRgbToHex(rgb){
  const toHex = v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0');
  return '#'+toHex(rgb.r)+toHex(rgb.g)+toHex(rgb.b);
}

// Color dinámico según el porcentaje: rojo (necesita atención) → dorado
// (en progreso) → verde (sólido), interpolado en RGB para que el cambio
// de color sea gradual y no un salto brusco entre 3 colores fijos.
const GAUGE_LOW = '#B3261E';   // mismo rojo que ya se usa para validaciones
const GAUGE_MID = '#C1703B';  // var(--gold)
const GAUGE_HIGH = '#2E7D5B'; // var(--green)
function gaugeColorForPercent(pct){
  const p = Math.max(0, Math.min(100, pct));
  const low = gaugeHexToRgb(GAUGE_LOW), mid = gaugeHexToRgb(GAUGE_MID), high = gaugeHexToRgb(GAUGE_HIGH);
  if(p <= 50){
    const t = p/50;
    return gaugeRgbToHex({r:gaugeLerp(low.r,mid.r,t), g:gaugeLerp(low.g,mid.g,t), b:gaugeLerp(low.b,mid.b,t)});
  }
  const t = (p-50)/50;
  return gaugeRgbToHex({r:gaugeLerp(mid.r,high.r,t), g:gaugeLerp(mid.g,high.g,t), b:gaugeLerp(mid.b,high.b,t)});
}

// gaugeFechaCorta y gaugeDeltaHtml viven acá (compartidos entre los
// anillos de "Método", en script.js, y el gráfico de barras de "Mi plan",
// más abajo) porque ambos necesitan formatear fechas y pintar la misma
// leyenda de diferencia "antes → después" con el mismo criterio de color.
function gaugeFechaCorta(iso){
  try{
    return new Date(iso).toLocaleDateString('es-AR', {day:'2-digit', month:'short'});
  }catch(err){ return ''; }
}

function gaugeDeltaHtml(antesPct, despuesPct){
  if(despuesPct == null) return '';
  const delta = despuesPct - antesPct;
  let deltaText, deltaColor;
  if(delta > 0){ deltaText = '+'+delta+' pts'; deltaColor = 'var(--green)'; }
  else if(delta < 0){ deltaText = delta+' pts'; deltaColor = '#B3261E'; }
  else { deltaText = 'sin cambios'; deltaColor = 'var(--ink-faint)'; }
  return '<p class="gauge-delta">Antes: '+antesPct+'% <span style="color:'+deltaColor+'">('+deltaText+')</span></p>';
}

// Arma el gráfico de barras de "Mi plan" (foco/memoria/energía/calma) a
// partir del objetivo guardado (`sinaptix_objetivo`, con la encuesta
// inicial adentro) y, si existe, la reevaluación posterior
// (`sinaptix_reevaluacion`, las mismas 4 preguntas respondidas de nuevo
// más adelante desde la sección "Método" de index.html). Sin reevaluación
// se comporta igual que antes (una sola foto del estado actual); con
// reevaluación, cada barra muestra el valor más reciente y debajo la
// comparación "antes: X% (+/- N pts)" — mismo criterio visual que ya usan
// los anillos de progreso de "Método" (`gaugeDeltaHtml`), para que la
// experiencia sea consistente entre ambas pantallas.
function nutriBuildBarChartHTML(objetivo, reeval){
  const encuesta = objetivo && objetivo.encuesta;
  if(!encuesta) return '';
  const antes = gaugeComputeAreas(encuesta);
  const despues = reeval ? gaugeComputeAreas(reeval) : null;
  const items = [
    {key:'foco', label:'Foco'},
    {key:'memoria', label:'Memoria'},
    {key:'energia', label:'Energía'},
    {key:'calma', label:'Calma'}
  ];
  let html = '<h4 class="bar-chart-title">Tu estado actual</h4>'+
    '<p class="bar-chart-text">Según lo que respondiste en la encuesta — foco, memoria, energía y calma, de 0 a 100.</p>';
  items.forEach(function(item){
    const antesPct = Math.round((antes[item.key]/5)*100);
    const despuesPct = despues ? Math.round((despues[item.key]/5)*100) : null;
    const pct = despuesPct==null ? antesPct : despuesPct;
    const color = gaugeColorForPercent(pct);
    html += '<div class="bar-item">'+
      '<div class="bar-row">'+
        '<span class="bar-label">'+item.label+'</span>'+
        '<div class="bar-track"><div class="bar-fill" style="width:'+pct+'%;background:'+color+'"></div></div>'+
        '<span class="bar-pct">'+pct+'%</span>'+
      '</div>'+
      gaugeDeltaHtml(antesPct, despuesPct)+
    '</div>';
  });
  if(despues){
    html += '<p class="gauge-dates bar-chart-dates">Diagnóstico inicial · '+gaugeFechaCorta(objetivo.fecha)+
      ' &nbsp;→&nbsp; Última actualización · '+gaugeFechaCorta(reeval.fecha)+'</p>';
  }
  return html;
}
