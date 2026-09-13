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

      const objetivo = localStorage.getItem('sinaptix_objetivo');
      if(objetivo){
        try{
          const o = JSON.parse(objetivo);
          document.getElementById('miPlanObjetivo').textContent = o.objetivo;
        }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
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

  function nutriRenderResumen(){
    const d = nutriCollectData();
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

    document.getElementById('nutriResumen').innerHTML = html;
  }

  // Formulario de nutrición especializada: valida el último paso, guarda localmente
  // (igual que los datos antropométricos, usado en "Mi plan") y envía un correo real.
  if(nutriForm){
    nutriForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!nutriValidateStep(NUTRI_TOTAL_STEPS)) return;

      const d = nutriCollectData();
      const objetivos = nutriResolverObjetivo(d);
      const ajustes = nutriConstruirAjustes(d);
      const avisos = nutriConstruirAvisos(d);

      localStorage.setItem('sinaptix_objetivo', JSON.stringify({
        objetivo: objetivos.join(' + '),
        email: d.email,
        encuesta: d,
        fecha: new Date().toISOString()
      }));

      const asunto = encodeURIComponent('Solicitud de nutrición especializada — '+d.nombre);
      const cuerpo = encodeURIComponent(
        'Nombre: '+d.nombre+'\n'+
        'Correo: '+d.email+'\n'+
        'Objetivo cognitivo: '+objetivos.join(' + ')+'\n\n'+
        'Edad: '+d.edad+' | Sexo: '+d.sexo+' | Peso: '+(d.peso||'—')+' kg | Talla: '+(d.talla||'—')+' cm\n'+
        'Actividad física: '+d.actividadFisica+'\n'+
        'Tipo de actividad principal: '+d.tipoActividad+' | Mayor exigencia mental: '+d.horaExigencia+'\n'+
        'Sueño: '+d.sueno+' (calidad percibida '+d.calidadSueno+'/5) | Horas de pantalla: '+(d.pantallas||'—')+'\n'+
        'Comidas al día: '+d.comidas+' | Agua: '+d.agua+' | Cafeína: '+d.cafeina+' | Alcohol: '+d.alcohol+'\n'+
        'Ultraprocesados: '+d.ultraprocesados+' | Tiempo para cocinar: '+d.tiempoCocina+'\n'+
        'Alergias: '+(d.alergias.concat(d.alergiaOtra?[d.alergiaOtra]:[]).join(', ')||'Ninguna')+'\n'+
        'Restricción alimentaria: '+d.restriccion+'\n'+
        'Condiciones de salud: '+(d.condiciones.join(', ')||'Ninguna informada')+' | Medicación regular: '+d.medicacion+'\n'+
        'Estrés: '+d.estres+'/5 | Fatiga: '+d.fatiga+'/5 | Concentración (dificultad): '+d.concentracion+'/5 | Olvidos: '+d.olvidos+'/5\n'+
        'No le gusta: '+(d.disgustos||'—')+' | Presupuesto: '+d.presupuesto+'\n\n'+
        'Ajustes aplicados:\n- '+(ajustes.join('\n- ')||'Sin ajustes adicionales')+'\n\n'+
        (avisos.length ? 'Avisos:\n- '+avisos.join('\n- ') : '')
      );

      window.location.href = 'mailto:hola@sinaptix.com?subject='+asunto+'&body='+cuerpo;
      const res = document.getElementById('nutriResultado');
      res.style.display='block';
      res.textContent = 'Abriendo tu correo para enviar la solicitud… ✓';
    });
  }

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