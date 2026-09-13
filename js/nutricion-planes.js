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
    moderar: ['Azúcares simples y bebidas azucaradas', 'Exceso de harinas refinadas']
  },
  'Reducir fatiga mental': {
    nombre: 'Reducir Fatiga Mental',
    enfoque: 'Evitar los picos y caídas de energía que generan sensación de cansancio mental, cubriendo nutrientes cuya deficiencia se asocia a fatiga.',
    nutrientes: ['Vitamina B12 y complejo B', 'Hierro', 'Magnesio', 'Proteína de buena calidad distribuida en el día'],
    priorizar: ['Legumbres', 'Huevo o equivalente vegetal', 'Carnes magras o equivalente vegetal', 'Vegetales de hoja verde', 'Plátano', 'Cereales integrales'],
    moderar: ['Cafeína en exceso', 'Comidas copiosas en tus horas de mayor exigencia mental']
  },
  'Sostener memoria de trabajo': {
    nombre: 'Sostener Memoria de Trabajo',
    enfoque: 'Nutrientes vinculados a la síntesis de neurotransmisores relacionados con memoria y aprendizaje, y protección antioxidante de las neuronas.',
    nutrientes: ['Colina', 'Omega-3 (DHA)', 'Flavonoides / antioxidantes', 'Vitamina E'],
    priorizar: ['Huevo (colina) o equivalente vegetal', 'Pescados azules o equivalente vegetal', 'Arándanos y frutos rojos', 'Frutos secos', 'Cúrcuma', 'Chocolate negro con moderación'],
    moderar: ['Alcohol frecuente', 'Ultraprocesados']
  },
  'Manejo de estrés mental': {
    nombre: 'Manejo de Estrés Mental',
    enfoque: 'Nutrientes que se agotan más rápido bajo estrés y alimentos asociados a mejor regulación del ánimo vía el eje intestino-cerebro.',
    nutrientes: ['Magnesio', 'Vitamina C', 'Complejo B', 'Triptófano', 'Fibra / probióticos'],
    priorizar: ['Vegetales de hoja verde', 'Frutos secos y semillas', 'Plátano', 'Cítricos', 'Yogur o alimentos fermentados', 'Chocolate negro con moderación'],
    moderar: ['Cafeína y azúcar en exceso', 'Alcohol como manejo de estrés']
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
      '<div class="nutri-block-title">Moderar</div><ul>'+p.moderar.map(n=>'<li>'+n+'</li>').join('')+'</ul></div>';
  });
  if(ajustes.length){
    html += '<div><div class="nutri-block-title">Ajustado a tu caso</div><ul>'+ajustes.map(a=>'<li>'+a+'</li>').join('')+'</ul></div>';
  }
  avisos.forEach(a=>{ html += '<p class="nutri-note">'+a+'</p>'; });
  return html;
}
