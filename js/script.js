// Netlify Identity — login / logout
  if(window.netlifyIdentity){
    netlifyIdentity.init();

    const btnLogin = document.getElementById('btnLogin');
    const btnAcceder = document.getElementById('btnAcceder');
    const miPlan = document.getElementById('miPlan');
    const btnLogout = document.getElementById('btnLogout');

    function setLoginButton(user){
      if(btnLogin){
        if(user){
          btnLogin.textContent = user.user_metadata && user.user_metadata.full_name
            ? user.user_metadata.full_name
            : 'Mi cuenta';
        } else {
          btnLogin.textContent = 'Iniciar sesión';
        }
      }
      // "Acceder" solo tiene sentido para quien todavía no tiene cuenta/sesión
      if(btnAcceder){
        btnAcceder.classList.toggle('hidden', !!user);
      }
    }

    function pintarMiPlan(user){
      if(!miPlan) return;

      document.getElementById('miPlanEmail').textContent = 'Sesión iniciada como '+user.email;

      const antro = localStorage.getItem('sinaptix_antropometria');
      if(antro){
        try{
          const d = JSON.parse(antro);
          document.getElementById('miPlanImc').textContent = d.imc.toFixed(1);
          document.getElementById('miPlanImcLab').textContent = 'IMC estimado (última medición registrada)';
        }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
      }

      const miPlanDetalleEl = document.getElementById('miPlanDetalle');
      const miPlanCtaEl = document.getElementById('miPlanCta');
      const objetivo = localStorage.getItem('sinaptix_objetivo');
      if(objetivo){
        try{
          const o = JSON.parse(objetivo);
          document.getElementById('miPlanObjetivo').textContent = o.objetivo;
          // Reconstruye el plan completo (con ajustes y avisos) a partir de
          // la encuesta guardada, sin tener que volver a pedir nada.
          if(miPlanDetalleEl && o.encuesta && typeof nutriBuildResumenHTML === 'function'){
            miPlanDetalleEl.innerHTML = nutriBuildResumenHTML(o.encuesta);
            miPlanDetalleEl.classList.remove('hidden');
          }
          if(miPlanCtaEl) miPlanCtaEl.classList.add('hidden');
        }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
      } else {
        if(miPlanDetalleEl) miPlanDetalleEl.classList.add('hidden');
        if(miPlanCtaEl) miPlanCtaEl.classList.remove('hidden');
      }
    }

    function mostrarMiPlan(user){
      if(!miPlan) return;
      pintarMiPlan(user);
      miPlan.classList.remove('hidden');
    }

    function ocultarMiPlan(){
      if(!miPlan) return;
      miPlan.classList.add('hidden');
    }

    if(btnLogout){
      btnLogout.addEventListener('click', ()=>netlifyIdentity.logout());
    }

    if(btnLogin){
      btnLogin.addEventListener('click', function(e){
        e.preventDefault();
        const current = netlifyIdentity.currentUser();
        if(current){
          netlifyIdentity.open('user'); // ya con sesión: abre panel de cuenta
        } else {
          netlifyIdentity.open('login'); // el modal de Identity también permite "Sign up"
        }
      });
    }

    netlifyIdentity.on('init', user => {
      setLoginButton(user);
      if(user) mostrarMiPlan(user); else ocultarMiPlan();
    });
    netlifyIdentity.on('login', user => {
      setLoginButton(user);
      mostrarMiPlan(user);
      netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => {
      setLoginButton(null);
      ocultarMiPlan();
    });
  }

  // Modales
  function openModal(id){
    document.getElementById(id).classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeModal(el){
    el.classList.remove('open');
    document.body.style.overflow='';
  }
  document.getElementById('btnNutricion').addEventListener('click', ()=>{
    resetNutriWizard();
    openModal('modalNutricion');
  });
  document.getElementById('btnAntropometria').addEventListener('click', ()=>openModal('modalAntropometria'));
  const btnAbrirNutricionMiPlan = document.getElementById('btnAbrirNutricionMiPlan');
  if(btnAbrirNutricionMiPlan){
    btnAbrirNutricionMiPlan.addEventListener('click', ()=>{
      resetNutriWizard();
      openModal('modalNutricion');
    });
  }
  document.querySelectorAll('[data-close]').forEach(b=>{
    b.addEventListener('click', e=>closeModal(e.target.closest('.modal-overlay')));
  });
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target===m) closeModal(m); });
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ document.querySelectorAll('.modal-overlay.open').forEach(closeModal); }
  });

  document.getElementById('formAntro').addEventListener('submit', function(e){
    e.preventDefault();
    const res = document.getElementById('antroResultado');

    const peso = parseFloat(document.getElementById('antroPeso').value);
    const tallaCm = parseFloat(document.getElementById('antroTalla').value);
    const edad = parseInt(document.getElementById('antroEdad').value, 10);
    const sexo = document.getElementById('antroSexo').value;

    // Validación real de los datos ingresados
    if(!peso || peso <= 0 || peso > 400){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = 'Ingresa un peso válido (entre 1 y 400 kg).';
      return;
    }
    if(!tallaCm || tallaCm <= 0 || tallaCm > 250){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = 'Ingresa una talla válida (entre 1 y 250 cm).';
      return;
    }
    if(!edad || edad <= 0 || edad > 120){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = 'Ingresa una edad válida.';
      return;
    }
    if(!sexo){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = 'Selecciona tu sexo.';
      return;
    }

    const talla = tallaCm/100;
    const imc = peso/(talla*talla);
    let cat = 'peso saludable';
    if(imc<18.5) cat='bajo peso';
    else if(imc>=25 && imc<30) cat='sobrepeso';
    else if(imc>=30) cat='rango a vigilar';

    // Guardado local (persiste entre visitas en este navegador)
    localStorage.setItem('sinaptix_antropometria', JSON.stringify({peso, tallaCm, edad, sexo, imc, fecha: new Date().toISOString()}));

    res.style.display='block';
    res.style.color='';
    res.textContent = sexo+', '+edad+' años — IMC estimado: '+imc.toFixed(1)+' ('+cat+'). Abriendo tu correo para enviar estos datos al equipo… ✓';

    // Envía los datos al equipo de SINAPTIX por correo, igual que los demás formularios
    const asunto = encodeURIComponent('Datos antropométricos — nuevo registro');
    const cuerpo = encodeURIComponent(
      'Peso: '+peso+' kg\n'+
      'Talla: '+tallaCm+' cm\n'+
      'Edad: '+edad+'\n'+
      'Sexo: '+sexo+'\n'+
      'IMC estimado: '+imc.toFixed(1)+' ('+cat+')'
    );
    window.location.href = 'mailto:hola@sinaptix.com?subject='+asunto+'&body='+cuerpo;
  });

  // Formulario de contacto: envía un correo real a hola@sinaptix.com
  document.getElementById('formContacto').addEventListener('submit', function(e){
    e.preventDefault();
    const nombre = document.getElementById('contactoNombre').value.trim();
    const email = document.getElementById('contactoEmail').value.trim();
    const mensaje = document.getElementById('contactoMensaje').value.trim();

    const asunto = encodeURIComponent('Contacto desde la web — '+nombre);
    const cuerpo = encodeURIComponent(
      'Nombre: '+nombre+'\n'+
      'Correo: '+email+'\n\n'+
      'Objetivo cognitivo:\n'+mensaje
    );

    window.location.href = 'mailto:hola@sinaptix.com?subject='+asunto+'&body='+cuerpo;
    this.querySelector('button').textContent = 'Abriendo tu correo… ✓';
  });

  // ===================== Encuesta de nutrición especializada (wizard) =====================
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
  const NUTRI_TOTAL_STEPS = 8;
  let nutriCurrentStep = 1;

  const nutriForm = document.getElementById('formNutricion');
  const nutriSteps = nutriForm ? Array.from(nutriForm.querySelectorAll('.nutri-step')) : [];
  const nutriDots = document.querySelectorAll('#nutriProgress .dot');
  const nutriBackBtn = document.getElementById('nutriBack');
  const nutriNextBtn = document.getElementById('nutriNext');
  const nutriSubmitBtn = document.getElementById('nutriSubmit');
  const nutriErrorEl = document.getElementById('nutriError');

  function nutriShowStep(n){
    nutriCurrentStep = n;
    nutriSteps.forEach(s=>s.classList.toggle('active', parseInt(s.dataset.step,10)===n));
    nutriDots.forEach((d,i)=>{
      d.classList.toggle('done', i < n-1);
      d.classList.toggle('active', i === n-1);
    });
    nutriBackBtn.classList.toggle('hidden', n===1);
    nutriNextBtn.classList.toggle('hidden', n===NUTRI_TOTAL_STEPS);
    nutriSubmitBtn.classList.toggle('hidden', n!==NUTRI_TOTAL_STEPS);
    nutriErrorEl.classList.remove('show');
    if(n===NUTRI_TOTAL_STEPS) nutriRenderResumen();
  }

  function resetNutriWizard(){
    if(!nutriForm) return;
    nutriForm.reset();
    document.getElementById('nutriResultado').style.display='none';
    // Prellenar edad/sexo/peso/talla si ya existen en "Mis datos" (antropometría)
    const antro = localStorage.getItem('sinaptix_antropometria');
    const hint = document.getElementById('nutriAntroHint');
    if(antro){
      try{
        const d = JSON.parse(antro);
        document.getElementById('nutriEdad').value = d.edad || '';
        document.getElementById('nutriSexo').value = d.sexo === 'Femenino' || d.sexo === 'Masculino' ? d.sexo : '';
        document.getElementById('nutriPeso').value = d.peso || '';
        document.getElementById('nutriTalla').value = d.tallaCm || '';
        if(hint) hint.textContent = 'Prellenado con los datos que ya registraste en "Registrar datos antropométricos".';
      }catch(err){ if(hint) hint.textContent=''; }
    } else if(hint){ hint.textContent=''; }
    nutriShowStep(1);
  }

  function nutriValidateStep(n){
    const stepEl = nutriSteps.find(s=>parseInt(s.dataset.step,10)===n);
    if(!stepEl) return true;
    const invalid = stepEl.querySelector(':invalid');
    if(invalid){
      nutriErrorEl.textContent = 'Completa los campos obligatorios de este paso antes de continuar.';
      nutriErrorEl.classList.add('show');
      if(invalid.reportValidity) invalid.reportValidity();
      return false;
    }
    nutriErrorEl.classList.remove('show');
    return true;
  }

  if(nutriNextBtn){
    nutriNextBtn.addEventListener('click', ()=>{
      if(!nutriValidateStep(nutriCurrentStep)) return;
      if(nutriCurrentStep < NUTRI_TOTAL_STEPS) nutriShowStep(nutriCurrentStep+1);
    });
  }
  if(nutriBackBtn){
    nutriBackBtn.addEventListener('click', ()=>{
      if(nutriCurrentStep > 1) nutriShowStep(nutriCurrentStep-1);
    });
  }

  function nutriGetChecked(name){
    return Array.from(document.querySelectorAll('input[name="'+name+'"]:checked')).map(i=>i.value);
  }
  function nutriGetRadio(name){
    const el = document.querySelector('input[name="'+name+'"]:checked');
    return el ? el.value : '';
  }

  function nutriCollectData(){
    return {
      objetivo: document.getElementById('nutriObjetivo').value,
      nombre: document.getElementById('nutriNombre').value.trim(),
      email: document.getElementById('nutriEmail').value.trim(),
      edad: document.getElementById('nutriEdad').value,
      sexo: document.getElementById('nutriSexo').value,
      peso: document.getElementById('nutriPeso').value,
      talla: document.getElementById('nutriTalla').value,
      actividadFisica: document.getElementById('nutriActividadFisica').value,
      tipoActividad: document.getElementById('nutriTipoActividad').value,
      horaExigencia: document.getElementById('nutriHoraExigencia').value,
      sueno: document.getElementById('nutriSueno').value,
      pantallas: document.getElementById('nutriPantallas').value,
      calidadSueno: parseInt(nutriGetRadio('nutriCalidadSueno')||'0', 10),
      comidas: document.getElementById('nutriComidas').value,
      agua: document.getElementById('nutriAgua').value,
      cafeina: document.getElementById('nutriCafeina').value,
      alcohol: document.getElementById('nutriAlcohol').value,
      ultraprocesados: document.getElementById('nutriUltraprocesados').value,
      tiempoCocina: document.getElementById('nutriTiempoCocina').value,
      alergias: nutriGetChecked('nutriAlergia'),
      alergiaOtra: document.getElementById('nutriAlergiaOtra').value.trim(),
      restriccion: document.getElementById('nutriRestriccion').value,
      condiciones: nutriGetChecked('nutriCondicion'),
      medicacion: nutriGetRadio('nutriMedicacion'),
      estres: parseInt(nutriGetRadio('nutriEstres')||'0', 10),
      fatiga: parseInt(nutriGetRadio('nutriFatiga')||'0', 10),
      concentracion: parseInt(nutriGetRadio('nutriConcentracion')||'0', 10),
      olvidos: parseInt(nutriGetRadio('nutriOlvidos')||'0', 10),
      disgustos: document.getElementById('nutriDisgustos').value.trim(),
      presupuesto: document.getElementById('nutriPresupuesto').value,
      consentimiento: document.getElementById('nutriConsentimiento').checked
    };
  }

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
  // Se usa tanto en el paso 8 del wizard (#nutriResumen) como en "Mi plan"
  // (#miPlanDetalle), reconstruyendo el mismo resultado desde los datos
  // guardados en localStorage sin tener que repetir la lógica.
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

  function nutriRenderResumen(){
    const d = nutriCollectData();
    document.getElementById('nutriResumen').innerHTML = nutriBuildResumenHTML(d);
  }

  // Formulario de nutrición especializada: el plan ya se genera y se muestra
  // en pantalla en el paso 8 (nutriRenderResumen), así que el envío ya no pide
  // el plan por correo. En vez de eso, guarda la respuesta en localStorage
  // (igual que los datos antropométricos) y ofrece iniciar sesión para
  // dejar el plan guardado y verlo completo, cada vez, en "Mi plan".
  if(nutriForm){
    nutriForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!nutriValidateStep(NUTRI_TOTAL_STEPS)) return;

      const d = nutriCollectData();
      const objetivos = nutriResolverObjetivo(d);

      localStorage.setItem('sinaptix_objetivo', JSON.stringify({
        objetivo: objetivos.join(' + '),
        email: d.email,
        encuesta: d,
        fecha: new Date().toISOString()
      }));

      const res = document.getElementById('nutriResultado');
      res.style.display='block';

      const currentUser = window.netlifyIdentity && netlifyIdentity.currentUser();
      const miPlanEl = document.getElementById('miPlan');
      const miPlanObjetivoEl = document.getElementById('miPlanObjetivo');
      const miPlanDetalleEl = document.getElementById('miPlanDetalle');
      const miPlanCtaEl = document.getElementById('miPlanCta');

      if(currentUser){
        // Ya con sesión iniciada: refresca "Mi plan" al toque y lleva ahí.
        if(miPlanObjetivoEl) miPlanObjetivoEl.textContent = objetivos.join(' + ');
        if(miPlanDetalleEl){
          miPlanDetalleEl.innerHTML = nutriBuildResumenHTML(d);
          miPlanDetalleEl.classList.remove('hidden');
        }
        if(miPlanCtaEl) miPlanCtaEl.classList.add('hidden');

        res.textContent = 'Tu plan quedó guardado en tu cuenta. Te llevamos a "Mi plan". ✓';
        renderMethodGauges();
        setTimeout(function(){
          closeModal(document.getElementById('modalNutricion'));
          if(miPlanEl) miPlanEl.scrollIntoView({behavior:'smooth'});
        }, 900);
      } else {
        // Sin sesión: queda guardado en este navegador, pero para verlo
        // completo y no perderlo, invitamos a iniciar sesión (o crear cuenta).
        res.textContent = 'Guardamos tu propuesta en este navegador. Iniciá sesión para verla completa, guardada y lista cada vez que entres. ✓';
        renderMethodGauges();
        if(window.netlifyIdentity){
          setTimeout(function(){ netlifyIdentity.open('login'); }, 900);
        }
      }
    });
  }

  // ===================== Anillos de progreso (Método) =====================
  // Compara la medición inicial de la encuesta (paso 6: estrés, fatiga,
  // dificultad de concentración, olvidos) contra una reevaluación posterior
  // opcional, guardada aparte en 'sinaptix_reevaluacion'. Ver memoria.md,
  // sección "Anillos de progreso", para la justificación de esta decisión
  // (no existía una segunda medición real hasta la sesión que agregó esto,
  // y el gráfico se rediseñó de radar a anillos tipo gauge en la sesión
  // siguiente, a pedido del usuario).
  function gaugeFechaCorta(iso){
    try{
      return new Date(iso).toLocaleDateString('es-AR', {day:'2-digit', month:'short'});
    }catch(err){ return ''; }
  }

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

  function gaugeArc(cx, cy, r, strokeWidth, pct, color){
    const circumference = 2*Math.PI*r;
    const len = (Math.max(0, Math.min(100, pct))/100)*circumference;
    return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="var(--panel-line)" stroke-width="'+strokeWidth+'"/>'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+strokeWidth+'" stroke-linecap="round" '+
      'stroke-dasharray="'+len.toFixed(1)+' '+circumference.toFixed(1)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
  }

  // Un anillo tipo "Apple Watch" por área, coloreado según su propio
  // porcentaje. Si hay reevaluación, se agrega debajo una línea de texto
  // con el valor inicial y la diferencia — en vez de un segundo anillo
  // concéntrico pegado al primero, que en el tamaño real de la tarjeta
  // quedaba demasiado apretado contra el anillo externo y se leía como un
  // glitch en vez de una comparación clara (ver memoria.md).
  function gaugeDeltaHtml(antesPct, despuesPct){
    if(despuesPct == null) return '';
    const delta = despuesPct - antesPct;
    let deltaText, deltaColor;
    if(delta > 0){ deltaText = '+'+delta+' pts'; deltaColor = 'var(--green)'; }
    else if(delta < 0){ deltaText = delta+' pts'; deltaColor = '#B3261E'; }
    else { deltaText = 'sin cambios'; deltaColor = 'var(--ink-faint)'; }
    return '<p class="gauge-delta">Antes: '+antesPct+'% <span style="color:'+deltaColor+'">('+deltaText+')</span></p>';
  }

  function gaugeBuildItem(label, antesPct, despuesPct){
    const cx=60, cy=60;
    const current = (despuesPct==null) ? antesPct : despuesPct;
    const color = gaugeColorForPercent(current);
    let svg = '<svg viewBox="0 0 120 120" role="img" aria-label="'+label+': '+current+'%'+
      (despuesPct!=null ? ' (antes '+antesPct+'%)' : '')+'">';
    svg += gaugeArc(cx, cy, 46, 12, current, color);
    svg += '<text x="60" y="57" text-anchor="middle" style="font-family:var(--font-d);font-size:24px;font-weight:800;fill:var(--ink)">'+current+'%</text>';
    svg += '<text x="60" y="75" text-anchor="middle" style="font-family:var(--font-m);font-size:10px;font-weight:700;fill:var(--ink-faint);letter-spacing:.02em">'+label+'</text>';
    svg += '</svg>';
    return '<div class="gauge-item">'+svg+gaugeDeltaHtml(antesPct, despuesPct)+'</div>';
  }

  function renderMethodGauges(){
    const el = document.getElementById('methodGauges');
    if(!el) return;

    let antesObjetivo = null;
    let despuesReeval = null;
    try{
      const obj = localStorage.getItem('sinaptix_objetivo');
      if(obj){
        const o = JSON.parse(obj);
        if(o && o.encuesta) antesObjetivo = o;
      }
    }catch(err){ /* dato corrupto: se ignora */ }
    try{
      const reeval = localStorage.getItem('sinaptix_reevaluacion');
      if(reeval) despuesReeval = JSON.parse(reeval);
    }catch(err){ /* dato corrupto: se ignora */ }

    const header = '<span class="eyebrow">Tu progreso</span>'+
      '<h3 class="method-gauges-title">Foco, memoria, energía y calma</h3>';

    if(!antesObjetivo){
      el.innerHTML = header+
        '<p class="method-gauges-text">Generá tu diagnóstico de nutrición especializada y vas a ver acá, de un vistazo, cómo está hoy tu foco, tu memoria, tu energía y tu calma.</p>'+
        '<button type="button" class="btn btn-ghost" id="btnGaugeDiagnostico">Generar mi diagnóstico</button>';
      return;
    }

    const antes = gaugeComputeAreas(antesObjetivo.encuesta);
    const despues = despuesReeval ? gaugeComputeAreas(despuesReeval) : null;

    const areas = [
      {key:'foco', label:'Foco'},
      {key:'memoria', label:'Memoria'},
      {key:'energia', label:'Energía'},
      {key:'calma', label:'Calma'}
    ];
    const grid = areas.map(function(a){
      const antesPct = Math.round((antes[a.key]/5)*100);
      const despuesPct = despues ? Math.round((despues[a.key]/5)*100) : null;
      return gaugeBuildItem(a.label, antesPct, despuesPct);
    }).join('');

    const scale = '<div class="gauge-scale">'+
      '<span><i style="background:'+GAUGE_LOW+'"></i>Necesita atención</span>'+
      '<span><i style="background:'+GAUGE_MID+'"></i>En progreso</span>'+
      '<span><i style="background:'+GAUGE_HIGH+'"></i>Sólido</span>'+
      '</div>';

    let legend = '<p class="gauge-dates">';
    if(despues){
      legend += 'Diagnóstico inicial · '+gaugeFechaCorta(antesObjetivo.fecha)+
        ' &nbsp;→&nbsp; Última actualización · '+gaugeFechaCorta(despuesReeval.fecha);
    } else {
      legend += 'Diagnóstico inicial · '+gaugeFechaCorta(antesObjetivo.fecha);
    }
    legend += '</p>';

    const cta = '<button type="button" class="btn btn-ghost" id="btnReevaluar">'+
      (despues ? 'Actualizar mi estado otra vez' : 'Actualizar mi estado')+'</button>';

    el.innerHTML = header+'<div class="gauge-grid">'+grid+'</div>'+scale+legend+cta;
  }

  function resetReevalForm(){
    const form = document.getElementById('formReevaluacion');
    if(form) form.reset();
    const res = document.getElementById('reevalResultado');
    if(res){ res.style.display='none'; res.textContent=''; }
  }

  const methodGaugesEl = document.getElementById('methodGauges');
  if(methodGaugesEl){
    methodGaugesEl.addEventListener('click', function(e){
      if(e.target.closest('#btnGaugeDiagnostico')){
        resetNutriWizard();
        openModal('modalNutricion');
      } else if(e.target.closest('#btnReevaluar')){
        resetReevalForm();
        openModal('modalReevaluacion');
      }
    });
  }

  const formReeval = document.getElementById('formReevaluacion');
  if(formReeval){
    formReeval.addEventListener('submit', function(e){
      e.preventDefault();
      const res = document.getElementById('reevalResultado');
      const estres = parseInt(nutriGetRadio('reevalEstres')||'0', 10);
      const fatiga = parseInt(nutriGetRadio('reevalFatiga')||'0', 10);
      const concentracion = parseInt(nutriGetRadio('reevalConcentracion')||'0', 10);
      const olvidos = parseInt(nutriGetRadio('reevalOlvidos')||'0', 10);

      if(!estres || !fatiga || !concentracion || !olvidos){
        res.style.display='block';
        res.style.color='#B3261E';
        res.textContent = 'Respondé las 4 preguntas para poder comparar tu progreso.';
        return;
      }

      localStorage.setItem('sinaptix_reevaluacion', JSON.stringify({
        estres, fatiga, concentracion, olvidos, fecha: new Date().toISOString()
      }));

      res.style.display='block';
      res.style.color='';
      res.textContent = 'Actualización guardada. Así se ve tu progreso. ✓';
      renderMethodGauges();

      setTimeout(function(){
        closeModal(document.getElementById('modalReevaluacion'));
        const target = document.getElementById('methodGauges');
        if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
      }, 900);
    });
  }

  renderMethodGauges();

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15});
  revealEls.forEach(el=>io.observe(el));

  // Progreso de scroll (barra superior)
  const progressBar = document.getElementById('scrollProgress');
  function onScroll(){
    if(!progressBar) return;
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = Math.min(1, Math.max(0, scrolled/height));
    progressBar.style.width = (pct*100)+'%';
  }
  document.addEventListener('scroll', ()=>window.requestAnimationFrame(onScroll));
  onScroll();