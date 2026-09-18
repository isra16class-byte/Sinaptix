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
    // d.alergias viene de checkboxes de opciones fijas (no hace falta
    // escapar); d.alergiaOtra es texto libre y sí se pinta con innerHTML
    // más abajo (nutriBuildResumenHTML), así que se escapa acá, en el
    // único lugar donde entra al HTML del resumen.
    const otra = d.alergiaOtra ? nutriEscaparHTML(d.alergiaOtra) : '';
    const lista = d.alergias.concat(otra ? [otra] : []).join(', ');
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
    // Mismo motivo que alergiaOtra arriba: es texto libre que termina en
    // innerHTML, se escapa antes de concatenarlo.
    ajustes.push('Se excluye de las recomendaciones lo que marcaste que no te gusta: '+nutriEscaparHTML(d.disgustos)+'.');
  }
  if(d.horaExigencia && d.horaExigencia !== 'Variable'){
    ajustes.push('El snack de refuerzo se ubica cerca de tu bloque de mayor exigencia mental ('+d.horaExigencia.toLowerCase()+').');
  }
  return ajustes;
}

// Cada aviso lleva un `nivel` ('moderado' | 'alto') además del texto, para
// que nutriBuildResumenHTML pueda pintarlos con distinta intensidad visual
// (ver .nutri-note / .nutri-note--alto en css/styles.css) — ver
// plan-mejoras-mi-plan-y-encuesta.md, sección 4.2 ("Ajustes más graduales,
// no binarios") para el criterio de esta sesión.
function nutriConstruirAvisos(d){
  const avisos = [];
  const estresAlto = (parseInt(d.estres, 10) || 0) >= 4;
  const fatigaAlta = (parseInt(d.fatiga, 10) || 0) >= 4;
  const suenoMalo = d.sueno === 'Menos de 5' || d.sueno === '5 a 6' || (d.calidadSueno && d.calidadSueno <= 2);

  if(d.condiciones.length || d.medicacion === 'Sí'){
    avisos.push({nivel:'alto', texto:'Antes de aplicar este plan, valídalo con tu médico o nutricionista: indicaste una condición de salud y/o medicación regular.'});
  }

  // Antes este aviso era independiente del estrés; ahora solo se muestra si
  // además hay estrés alto (4-5), combo que pedía el documento original.
  if(suenoMalo && estresAlto){
    avisos.push({nivel:'alto', texto:'Dormir poco combinado con estrés alto desgasta tu rendimiento cognitivo más rápido que cualquiera de los dos por separado — ningún plan alimentario sustituye dormir lo suficiente.'});
  }

  // Eje combinado nuevo (estrés + fatiga altos a la vez): no lo cubre
  // ningún aviso individual, ver sección 4.2 del documento de mejoras.
  if(estresAlto && fatigaAlta){
    avisos.push({nivel:'alto', texto:'Estrés y fatiga elevados al mismo tiempo agotan más rápido nutrientes como magnesio y complejo B — este plan ya los prioriza, pero conviene atender el descanso y el manejo del estrés en paralelo.'});
  }

  if(d.cafeina === '4 o más al día'){
    avisos.push({nivel:'alto', texto:'Te recomendamos reducir la cafeína de forma gradual, no de golpe, para evitar más fatiga los primeros días.'});
  } else if(d.cafeina === '2 a 3 al día'){
    avisos.push({nivel:'moderado', texto:'Tu consumo de cafeína es moderado — prestá atención a cómo te sentís si lo seguís aumentando.'});
  }

  if(d.ultraprocesados === 'A diario'){
    avisos.push({nivel:'alto', texto:'Se sugiere una transición gradual para bajar los ultraprocesados en vez de un cambio radical, para que el plan sea sostenible.'});
  } else if(d.ultraprocesados === 'Algunas veces por semana'){
    avisos.push({nivel:'moderado', texto:'Tu consumo de ultraprocesados es moderado — ir reduciéndolo de a poco ayuda a que el cambio se sostenga.'});
  }

  return avisos;
}

// Íconos SVG lineales a mano (mismo criterio que .miplan-card-icon: trazo
// fino, currentColor, sin imagen ni librería) para el detalle del plan —
// ver "Estado actual del diseño" en memoria.md, sesión del rediseño de
// "Detalle del plan de nutrición" en 3 columnas (Plan / Prioridades y
// Moderación / Cierre). Reemplaza el emoji 🧠 que usaba el título del plan
// antes de esa sesión, para ser consistente con el resto de íconos del sitio.
const NUTRI_ICON_BRAIN = '<svg class="nutri-plan-icon" aria-hidden="true" viewBox="0 0 40 40">'+
  '<path d="M14 10c-3 0-5.2 2.4-5.2 5.4 0 1 .3 1.9.8 2.7C8.6 19 8 20.7 8 22.4 8 26 10.9 29 14.5 29H16"/>'+
  '<path d="M26 10c3 0 5.2 2.4 5.2 5.4 0 1-.3 1.9-.8 2.7.9.9 1.6 2.5 1.6 4.3 0 3.6-2.9 6.6-6.5 6.6H24"/>'+
  '<path d="M20 9v21"/>'+
  '<path d="M14.5 16c1.7 0 2.5 1.2 2.5 2.6M25.5 16c-1.7 0-2.5 1.2-2.5 2.6M15.5 23c1.4 0 2.3-1 2.5-2M24.5 23c-1.4 0-2.3-1-2.5-2"/>'+
  '</svg>';
const NUTRI_ICON_CHECK = '<svg class="nutri-side-icon" aria-hidden="true" viewBox="0 0 24 24">'+
  '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.6 2.6L16 9.5"/></svg>';
const NUTRI_ICON_WARN = '<svg class="nutri-side-icon" aria-hidden="true" viewBox="0 0 24 24">'+
  '<path d="M12 4.2l9 15.8H3z" stroke-linejoin="round"/><path d="M12 10.2v4"/>'+
  '<circle class="icon-dot" cx="12" cy="17" r="1"/></svg>';

// Arma el HTML del plan resuelto a partir de una encuesta ya respondida.
// Se usa tanto en el paso 8 del wizard (#nutriResumen, en index.html) como en
// "Mi plan" (#miPlanDetalle, en mi-plan.html), reconstruyendo el mismo
// resultado desde los datos guardados en localStorage sin tener que repetir
// la lógica ni la encuesta.
//
// Estructura por plan: `.nutri-plan-block` con 2 sub-bloques,
// `.nutri-plan-main` (título+ícono, enfoque, nutrientes clave, día tipo) y
// `.nutri-plan-side` (Priorizar/Moderar + "Ajustado a tu caso" del último
// plan, si hay ajustes). En el CSS de #miPlan esos 2 sub-bloques se ven en
// columnas lado a lado (con la tarjeta "Cierre" ya existente en
// mi-plan.html formando la 3ra columna vía .miplan-detalle-grid); en el
// modal de index.html (#modalNutricion, más angosto) siguen apilados en una
// sola columna, sin CSS especial — son simples <div>s en flujo normal ahí.
// Si el objetivo resuelve en más de un plan combinado, se repite un
// `.nutri-plan-block` completo por cada uno.
// `opts.incluirAjustesEnSide` (default true) controla si el bloque
// "Ajustado a tu caso" se embebe en `.nutri-plan-side` como antes (paso 8
// del wizard, index.html) o se omite acá porque el llamador lo va a pintar
// en su propia tarjeta aparte (mi-plan.html, ver `.miplan-ajustes` en
// css/styles.css y `pintarMiPlan()` en js/mi-plan.js) — la lista de datos
// (`nutriConstruirAjustes(d)`) es la misma en los dos casos, esto solo
// decide dónde termina el HTML.
function nutriBuildResumenHTML(d, opts){
  const incluirAjustesEnSide = !opts || opts.incluirAjustesEnSide !== false;
  const objetivos = nutriResolverObjetivo(d);
  const planes = objetivos.map(o=>NUTRI_PLANES[o]).filter(Boolean);
  const ajustes = nutriConstruirAjustes(d);
  const avisos = nutriConstruirAvisos(d);

  let html = '';
  if(d.objetivo === 'No estoy seguro'){
    html += '<p>Con base en cómo te sentís día a día, el plan que más se ajusta a vos es:</p>';
  }
  planes.forEach((p, i)=>{
    // "Ajustado a tu caso" es un dato de la encuesta completa, no de un plan
    // en particular — se muestra una sola vez, en la columna lateral del
    // último plan (en el caso más común, un solo plan, coincide con la
    // referencia visual de esta sesión).
    const esUltimo = i === planes.length - 1;
    html += '<div class="nutri-plan-block">'+
      '<div class="nutri-plan-main">'+
        '<div class="nutri-plan-head">'+NUTRI_ICON_BRAIN+'<h4>'+p.nombre+'</h4></div>'+
        '<p>'+p.enfoque+'</p>'+
        '<div class="nutri-block-title">Nutrientes clave</div><ul>'+p.nutrientes.map(n=>'<li>'+n+'</li>').join('')+'</ul>'+
        (p.diaTipo && p.diaTipo.length ? '<div class="nutri-block-title">Un día tipo</div>'+
          '<div class="nutri-dia-tipo">'+p.diaTipo.map(m=>
            '<div class="dia-tipo-item">'+
              '<span class="dia-tipo-momento">'+m.momento+'</span>'+
              '<p class="dia-tipo-detalle">'+m.detalle+'</p>'+
            '</div>'
          ).join('')+'</div>' : '')+
      '</div>'+
      '<div class="nutri-plan-side">'+
        '<div class="nutri-side-title">Prioridades y Moderación</div>'+
        '<div class="nutri-side-box nutri-side-box--priorizar">'+
          '<div class="nutri-side-box-head">'+NUTRI_ICON_CHECK+'<span>Priorizar</span></div>'+
          '<ul>'+p.priorizar.map(n=>'<li>'+n+'</li>').join('')+'</ul>'+
        '</div>'+
        '<div class="nutri-side-box nutri-side-box--moderar">'+
          '<div class="nutri-side-box-head">'+NUTRI_ICON_WARN+'<span>Moderar</span></div>'+
          '<ul>'+p.moderar.map(n=>'<li>'+n+'</li>').join('')+'</ul>'+
        '</div>'+
        (incluirAjustesEnSide && esUltimo && ajustes.length ? '<div class="nutri-side-box nutri-side-box--ajustes">'+
          '<div class="nutri-side-box-head"><span>Ajustado a tu caso</span></div>'+
          '<ul>'+ajustes.map(a=>'<li>'+a+'</li>').join('')+'</ul>'+
        '</div>' : '')+
      '</div>'+
    '</div>';
  });
  // Caso borde: ningún objetivo resolvió a un plan conocido pero sí hay
  // ajustes — no debería perderse esa info solo porque no hay plan al cual
  // "colgarla" (no debería pasar en la práctica, ver NUTRI_PLANES, pero
  // evita que el dato desaparezca en silencio si algún día se agrega un
  // objetivo nuevo sin su entrada correspondiente ahí).
  if(incluirAjustesEnSide && !planes.length && ajustes.length){
    html += '<div><div class="nutri-block-title">Ajustado a tu caso</div><ul>'+ajustes.map(a=>'<li>'+a+'</li>').join('')+'</ul></div>';
  }
  avisos.forEach(a=>{
    const cls = a.nivel === 'alto' ? 'nutri-note nutri-note--alto' : 'nutri-note';
    html += '<p class="'+cls+'">'+a.texto+'</p>';
  });
  return html;
}

// ===================== Validación de rangos y saneo de texto libre =====================
// Rangos "razonables" para los 4 campos numéricos libres de la encuesta
// (edad/peso/talla/horas de pantalla) — se usan tanto en el wizard
// (index.html y mi-plan.html, vía atributos min/max en el HTML) como en
// el formulario de antropometría (js/script.js, formAntro), para que los
// dos caminos que piden estos mismos datos validen exactamente igual. No
// buscan validar "es tu dato real", buscan bloquear lo humanamente
// imposible (negativos, cero, valores absurdos). Ver
// plan-validacion-encuesta-nutricion.md (entregado al usuario) para el
// detalle de por qué se eligió cada rango — en particular, el máximo de
// edad (120) cubre casos reales documentados de longevidad extrema, no
// es un tope arbitrario "típico".
const NUTRI_RANGOS = {
  edad:      { min: 14,  max: 120, label: 'la edad',                                  unidad: 'años' },
  peso:      { min: 30,  max: 250, label: 'el peso',                                  unidad: 'kg' },
  talla:     { min: 100, max: 230, label: 'la talla',                                 unidad: 'cm' },
  pantallas: { min: 0,   max: 18,  label: 'las horas de pantalla/estudio seguido',    unidad: 'h' }
};

// Devuelve null si el valor es válido (vacío incluido — que un campo
// opcional esté vacío no es "irracional", eso lo decide `required`
// aparte) o un mensaje de error listo para mostrar si está fuera de
// rango o no es un número.
function nutriValidarRango(campo, valor){
  const r = NUTRI_RANGOS[campo];
  if(!r) return null;
  if(valor === '' || valor === null || valor === undefined) return null;
  const n = parseFloat(valor);
  if(isNaN(n)) return 'Ingresá un número válido para '+r.label+'.';
  if(n < r.min || n > r.max) return 'Revisá '+r.label+': tiene que estar entre '+r.min+' y '+r.max+' '+r.unidad+'.';
  return null;
}

// Nombre: rechaza vacío, solo espacios o solo símbolos/números — sin
// exigir un formato más estricto (hay nombres cortos, con guion, con
// apóstrofe, etc., y no vale la pena una lista blanca de caracteres).
function nutriValidarNombre(valor){
  const v = (valor || '').trim();
  if(v.length < 2) return 'Ingresá tu nombre.';
  if(!/[a-zA-ZÀ-ÿ]/.test(v)) return 'El nombre tiene que incluir al menos una letra.';
  return null;
}

// Escapa HTML antes de insertar texto libre (alergiaOtra, disgustos) con
// innerHTML en nutriBuildResumenHTML — sin esto, alguien podía escribir
// una etiqueta con un atributo de evento en esos campos y que se
// ejecutara en el navegador de quien viera el resumen (wizard paso 8 y
// "Mi plan").
function nutriEscaparHTML(texto){
  return String(texto).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

// ===================== IMC: categoría y medidor tipo velocímetro =====================
// Compartido entre el formulario de antropometría (js/script.js, que calcula
// el IMC) y el medidor de "Mi plan" (js/mi-plan.js, que lo pinta) — antes cada
// uno tenía su propia copia de estos mismos umbrales. Ver
// plan-mejoras-mi-plan-y-encuesta.md / continuar-grafico-imc.md: se mantiene
// 'rango a vigilar' en vez de 'obesidad' (decisión de tono ya tomada).
function imcCategoria(imc){
  if(imc < 18.5) return {cat:'bajo peso', zona:'bajo'};
  if(imc < 25) return {cat:'peso saludable', zona:'saludable'};
  if(imc < 30) return {cat:'sobrepeso', zona:'sobrepeso'};
  return {cat:'rango a vigilar', zona:'vigilar'};
}

// Rango que cubre el arco del medidor (15 a 40) — valores fuera de este
// rango se recortan solo para la posición de la aguja, nunca para el
// número exacto que se muestra al lado (ese siempre es el IMC real).
const IMC_GAUGE_MIN = 15;
const IMC_GAUGE_MAX = 40;
function imcGaugeAngulo(imc){
  const v = Math.max(IMC_GAUGE_MIN, Math.min(IMC_GAUGE_MAX, imc));
  return 180 - (v - IMC_GAUGE_MIN) / (IMC_GAUGE_MAX - IMC_GAUGE_MIN) * 180;
}

// Centro/radio fijos del semicírculo (mismas coordenadas que ya usan los
// <path> del arco y el pivote de la aguja en mi-plan.html y en
// renderMethodImc, js/script.js) — se centralizan acá para no repetir
// "110/115/85" sueltos en cada lugar que necesite ubicar algo sobre el
// arco (aguja, marcador, degradado).
const IMC_GAUGE_CX = 110;
const IMC_GAUGE_CY = 115;
const IMC_GAUGE_R = 85;

// Grados de rotación de la aguja sobre su pivote (IMC_GAUGE_CX,
// IMC_GAUGE_CY) para un IMC dado. Antes "Mi plan" (js/mi-plan.js) y la
// pestaña "Mi IMC" de Método (js/script.js) calculaban cada uno por su
// lado "90 - imcGaugeAngulo(imc)" — se unifica acá para no tener la
// misma fórmula duplicada en dos archivos.
function imcGaugeAgujaDeg(imc){
  return 90 - imcGaugeAngulo(imc);
}

// Posición de arranque del barrido de la aguja (usada por
// pintarMiPlan en js/mi-plan.js): el extremo mínimo del arco
// (IMC_GAUGE_MIN), no un ángulo arbitrario — así la animación siempre
// recorre el arco completo de punta a punta, sin importar el IMC real
// de la persona. Vive acá (no en mi-plan.js) porque es un cálculo puro
// sobre el mismo rango que ya define imcGaugeAngulo.
function imcGaugeAgujaDegInicial(){
  return imcGaugeAgujaDeg(IMC_GAUGE_MIN);
}

// Marcador fijo del valor exacto sobre el propio arco (independiente de
// la aguja): un punto ubicado sobre el mismo radio que el trazo del
// arco (IMC_GAUGE_R), en el ángulo correspondiente al IMC (recortado al
// mismo rango de display que la aguja, vía imcGaugeAngulo). Sirve para
// que el valor se vea aunque la aguja todavía esté en pleno barrido, o
// si prefers-reduced-motion desactivó la animación (ver css/styles.css,
// .imc-gauge-marker). Compartido entre js/mi-plan.js y renderMethodImc
// (js/script.js).
function imcGaugeMarkerPos(imc){
  const rad = imcGaugeAngulo(imc) * Math.PI / 180;
  return {
    x: +(IMC_GAUGE_CX + IMC_GAUGE_R * Math.cos(rad)).toFixed(2),
    y: +(IMC_GAUGE_CY - IMC_GAUGE_R * Math.sin(rad)).toFixed(2)
  };
}

// ===================== Medidor de IMC: degradado continuo del arco =====================
// Antes el arco se pintaba con 4 <path> de color sólido, uno por zona
// (.imc-zone-bajo/-saludable/-sobrepeso/-vigilar en css/styles.css). Los
// 4 <path> y sus mismos umbrales (18.5/25/30) NO cambian — lo que cambia
// es que ahora comparten un único <linearGradient> para que el color se
// lea como una transición continua en vez de bloques con un corte
// brusco entre zonas.
// Los 3 colores de anclaje son EXACTAMENTE los mismos que ya usa
// gaugeColorForPercent para los anillos de "Método" (0=rojo/GAUGE_LOW,
// 50=dorado/GAUGE_MID, 100=verde/GAUGE_HIGH) — se piden llamando a esa
// misma función en vez de escribir los hex de nuevo, para que el
// criterio de color quede compartido de verdad, no solo "parecido".
// Cada ancla se ubica en el CENTRO de su zona de IMC (no en el umbral):
// así la transición entre colores ocurre alrededor del umbral real, que
// sigue siendo el límite semántico, en vez de que el color cambie recién
// en el punto exacto del umbral (eso se vería como un corte casi tan
// duro como antes).
function imcGaugeGradientStops(){
  const centroBajo = (IMC_GAUGE_MIN + 18.5) / 2;
  const centroSaludable = (18.5 + 25) / 2;
  const centroSobrepeso = (25 + 30) / 2;
  const centroVigilar = (30 + IMC_GAUGE_MAX) / 2;
  const offset = imc => +((imc - IMC_GAUGE_MIN) / (IMC_GAUGE_MAX - IMC_GAUGE_MIN) * 100).toFixed(2);
  return [
    { offset: offset(centroBajo), color: gaugeColorForPercent(50) },       // bajo peso → dorado
    { offset: offset(centroSaludable), color: gaugeColorForPercent(100) }, // saludable → verde
    { offset: offset(centroSobrepeso), color: gaugeColorForPercent(50) },  // sobrepeso → dorado
    { offset: offset(centroVigilar), color: gaugeColorForPercent(0) }      // a vigilar → rojo
  ];
}

// Arma el <defs><linearGradient>…</linearGradient></defs> a insertar
// dentro del <svg> del medidor (usado por renderMethodImc, js/script.js,
// que arma el SVG entero como string en cada render). mi-plan.html NO
// llama a esta función — es HTML estático, así que su <defs> equivalente
// está escrito a mano con los mismos offsets/colores (ver comentario en
// mi-plan.html) en vez de generarse en el navegador.
// gradientUnits="userSpaceOnUse" + los mismos x1/x2 que las coordenadas
// reales del arco (IMC_GAUGE_CX ± IMC_GAUGE_R) para que el degradado
// quede horizontal y alineado con el arco completo: con
// objectBoundingBox (el default), cada uno de los 4 <path> tiene su
// propio bounding box angosto y el degradado se vería cortado/repetido
// en cada segmento en vez de continuo.
function imcGaugeGradientDefsHtml(gradientId){
  const id = gradientId || 'imcGaugeGradient';
  const stops = imcGaugeGradientStops().map(function(s){
    return '<stop offset="'+s.offset+'%" stop-color="'+s.color+'"/>';
  }).join('');
  return '<defs><linearGradient id="'+id+'" gradientUnits="userSpaceOnUse" '+
    'x1="'+(IMC_GAUGE_CX-IMC_GAUGE_R)+'" y1="'+IMC_GAUGE_CY+'" '+
    'x2="'+(IMC_GAUGE_CX+IMC_GAUGE_R)+'" y2="'+IMC_GAUGE_CY+'">'+
    stops+
  '</linearGradient></defs>';
}

// ===================== Medidor de IMC: marcas y números de escala =====================
// Escala fija de referencia (15/20/25/30/35/40, los extremos del arco +
// pasos de 5) independiente del IMC de cada persona — a diferencia del
// degradado/aguja/marcador, esto NO depende de ningún dato de usuario,
// así que se puede precalcular una sola vez. Se generan igual por
// función (en vez de escribir los 6 números sueltos) para que la
// geometría (radios/ángulos) salga siempre de imcGaugeAngulo y quede
// perfectamente alineada con el arco, sin números "a ojo".
const IMC_GAUGE_TICKS = [15, 20, 25, 30, 35, 40];
// Radios de las marcas (rayitas) y de los números, medidos desde el
// mismo centro que el arco (IMC_GAUGE_CX/CY). El arco pinta entre
// radio ~76 y ~94 (IMC_GAUGE_R=85 ± mitad de stroke-width:18), así que
// la marca arranca apenas afuera (95) y el número un poco más afuera
// todavía (111), para que quede "rayita, después número" y no se pisen.
const IMC_GAUGE_TICK_R_IN = 95;
const IMC_GAUGE_TICK_R_OUT = 103;
const IMC_GAUGE_TICK_R_LABEL = 111;
function imcGaugeTickPoint(imc, r){
  const rad = imcGaugeAngulo(imc) * Math.PI / 180;
  return {
    x: +(IMC_GAUGE_CX + r * Math.cos(rad)).toFixed(2),
    y: +(IMC_GAUGE_CY - r * Math.sin(rad)).toFixed(2)
  };
}
// Arma las 6 `<line>` (rayita) + `<text>` (número) de la escala, listas
// para insertar dentro del mismo `<svg>` del medidor. `dy="0.35em"` en
// vez de ajustar cada `y` a mano centra el texto verticalmente sobre su
// punto sea cual sea el ángulo (funciona igual para las 2 marcas
// horizontales de los extremos que para las 4 en diagonal/arriba).
function imcGaugeTicksHtml(){
  return IMC_GAUGE_TICKS.map(function(v){
    const pIn = imcGaugeTickPoint(v, IMC_GAUGE_TICK_R_IN);
    const pOut = imcGaugeTickPoint(v, IMC_GAUGE_TICK_R_OUT);
    const pLabel = imcGaugeTickPoint(v, IMC_GAUGE_TICK_R_LABEL);
    return '<line class="imc-tick" x1="'+pIn.x+'" y1="'+pIn.y+'" x2="'+pOut.x+'" y2="'+pOut.y+'"/>'+
      '<text class="imc-tick-label" x="'+pLabel.x+'" y="'+pLabel.y+'" dy="0.35em">'+v+'</text>';
  }).join('');
}

// Marcas chicas intermedias (17.5/22.5/27.5/32.5/37.5 — el punto medio
// entre cada 2 marcas principales), sin número: solo para que la escala
// se lea como un instrumento real (velocímetro) y no como 6 rayitas
// sueltas. Mismo centro/radio que imcGaugeTickPoint, más cortas y más
// tenues que las principales (ver .imc-tick-minor, css/styles.css).
const IMC_GAUGE_MINOR_TICKS = [17.5, 22.5, 27.5, 32.5, 37.5];
const IMC_GAUGE_MINOR_TICK_R_IN = 95;
const IMC_GAUGE_MINOR_TICK_R_OUT = 100;
function imcGaugeMinorTicksHtml(){
  return IMC_GAUGE_MINOR_TICKS.map(function(v){
    const pIn = imcGaugeTickPoint(v, IMC_GAUGE_MINOR_TICK_R_IN);
    const pOut = imcGaugeTickPoint(v, IMC_GAUGE_MINOR_TICK_R_OUT);
    return '<line class="imc-tick-minor" x1="'+pIn.x+'" y1="'+pIn.y+'" x2="'+pOut.x+'" y2="'+pOut.y+'"/>';
  }).join('');
}

// "Riel" gris claro de fondo, debajo de los 4 <path> de color
// (imc-zone-*): mismo trazado que esos 4 juntos (los mismos puntos
// intermedios, ver arriba), pero como un único <path> más ancho
// (stroke-width 22 vs 18 de los tramos de color) y con las 2 puntas
// redondeadas — al ser un solo trazo entero (no 4 tramos) no hay riesgo
// de costura entre colores. Da la sensación de "ranura" en la que corre
// el arco de color, en vez de que el arco flote solo sobre el fondo de
// la tarjeta. Geometría fija (no depende del IMC de nadie), por eso va
// como constante y no como función.
const IMC_GAUGE_TRACK_D = 'M25 115 A 85 85 0 0 1 33.09 78.81 '+
  'A 85 85 0 0 1 83.73 34.16 A 85 85 0 0 1 136.27 34.16 '+
  'A 85 85 0 0 1 195 115';
function imcGaugeTrackHtml(){
  return '<path class="imc-gauge-track" d="'+IMC_GAUGE_TRACK_D+'"/>';
}

// ===================== Guardar antropometría automáticamente desde la encuesta =====================
// Si la persona todavía no tiene "datos antropométricos" guardados
// (sinaptix_antropometria — normalmente se registran aparte en
// #modalAntropometria) pero sí completó peso y talla en el paso 2 de la
// encuesta de nutrición (son campos opcionales ahí, ver nutricion-wizard.js),
// aprovechamos esos mismos datos para no pedírselos dos veces: así "Mi plan"
// puede mostrar el medidor de IMC apenas se genera el plan, sin que la
// persona tenga que ir aparte a "Registrar datos antropométricos" a mano.
// Se llama desde el submit de la encuesta tanto en js/script.js
// (index.html) como en js/mi-plan.js (mi-plan.html), justo antes de guardar
// sinaptix_objetivo. Si ya existe un registro previo de antropometría, no
// se toca (para no pisar una medición hecha a propósito, más reciente o más
// precisa, con ese formulario dedicado).
function nutriGuardarAntropometriaSiFalta(d){
  if(localStorage.getItem('sinaptix_antropometria')) return false;

  const peso = parseFloat(d.peso);
  const tallaCm = parseFloat(d.talla);
  const edad = parseInt(d.edad, 10);
  const sexo = d.sexo;

  // Mismos rangos de validación que #formAntro en js/script.js y el paso 2
  // del wizard (NUTRI_RANGOS, más arriba en este archivo) — si algo no
  // luce como un dato real (vacío, fuera de rango), no se guarda nada: se
  // deja que la persona lo complete cuando quiera desde el formulario
  // dedicado, en vez de guardar un IMC basado en datos incompletos.
  if(!peso || nutriValidarRango('peso', peso)) return false;
  if(!tallaCm || nutriValidarRango('talla', tallaCm)) return false;
  if(!edad || nutriValidarRango('edad', edad)) return false;
  if(!sexo) return false;

  const talla = tallaCm/100;
  const imc = peso/(talla*talla);

  const datosAntro = {peso, tallaCm, edad, sexo, imc, fecha: new Date().toISOString()};
  localStorage.setItem('sinaptix_antropometria', JSON.stringify(datosAntro));
  // Mismo espejo hacia el servidor que #formAntro (ver js/plan-sync.js y
  // js/script.js) — sin sesión no hace nada, y esta función ya tenía este
  // único efecto secundario de localStorage antes de que existiera
  // plan-sync.js, así que agregar el de red acá es consistente con eso.
  if(typeof planSyncGuardar === 'function') planSyncGuardar('antropometria', datosAntro);
  return true;
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

// ===================== Exports para tests (Node) =====================
// Este archivo se carga como <script> plano en index.html/mi-plan.html —
// ahí `module` no existe, así que este bloque no hace nada en el
// navegador. Sirve solo para que `tests/nutricion-planes.test.mjs` pueda
// importar estas funciones con Node (ver plan-tests-sinaptix.md,
// Prioridad 1). No exporta NUTRI_PLANES completo ni las funciones que
// arman HTML (nutriBuildResumenHTML, nutriBuildBarChartHTML) porque no
// son el foco de esta primera tanda de tests — son las que combinan
// texto, no cálculo.
if(typeof module !== 'undefined' && module.exports){
  module.exports = {
    nutriResolverObjetivo,
    nutriConstruirAjustes,
    nutriConstruirAvisos,
    nutriGuardarAntropometriaSiFalta,
    imcCategoria,
    imcGaugeAngulo,
    imcGaugeAgujaDeg,
    imcGaugeAgujaDegInicial,
    imcGaugeMarkerPos,
    imcGaugeGradientStops,
    imcGaugeGradientDefsHtml,
    imcGaugeTickPoint,
    imcGaugeTicksHtml,
    imcGaugeMinorTicksHtml,
    imcGaugeTrackHtml,
    gaugeComputeAreas,
    gaugeColorForPercent,
    gaugeDeltaHtml,
    NUTRI_RANGOS,
    nutriValidarRango,
    nutriValidarNombre,
    nutriEscaparHTML
  };
}
