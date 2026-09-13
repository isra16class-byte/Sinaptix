// Ancho real del viewport (fix sangrado de rayones al borde de pantalla)
  //
  // Los rayones decorativos que "sangran" al borde real de la pantalla usan
  // un truco calc(50% - 50vw). El problema: en navegadores con scrollbar
  // clásica (no overlay, ej. Windows/Chrome), la unidad `vw` se calcula
  // sobre el ancho TOTAL del viewport (incluye el hueco del scrollbar),
  // mientras que `.wrap{margin:0 auto}` centra usando el ancho VISIBLE del
  // documento (sin el scrollbar). Esa diferencia (~15-17px) hace que el
  // rayón derecho se quede corto y no llegue al borde real.
  //
  // Fix: en vez de `50vw`, usamos una variable CSS `--vw100` actualizada
  // por JS con `document.documentElement.clientWidth` (el ancho visible
  // real, el mismo que usa `.wrap` para centrarse), así el cálculo siempre
  // coincide sin importar si hay scrollbar o no.
  function setViewportWidthVar(){
    document.documentElement.style.setProperty(
      '--vw100',
      document.documentElement.clientWidth + 'px'
    );
  }
  setViewportWidthVar();
  window.addEventListener('resize', setViewportWidthVar);

// Netlify Identity — login / logout
  if(window.netlifyIdentity){
    netlifyIdentity.init();

    const btnLogin = document.getElementById('btnLogin');
    const btnAcceder = document.getElementById('btnAcceder');
    const btnMiPlanNav = document.getElementById('btnMiPlanNav');

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
      // "Mi plan" (mi-plan.html) solo tiene sentido con sesión iniciada
      if(btnMiPlanNav){
        btnMiPlanNav.classList.toggle('hidden', !user);
      }
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
    });
    netlifyIdentity.on('login', user => {
      setLoginButton(user);
      netlifyIdentity.close();
      // "Mi plan" ahora vive en su propia pantalla (mi-plan.html), así que al
      // iniciar sesión desde el sitio principal llevamos ahí directo.
      window.location.href = 'mi-plan.html';
    });
    netlifyIdentity.on('logout', () => {
      setLoginButton(null);
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
    // imcCategoria vive en js/nutricion-planes.js (compartida con el medidor
    // de "Mi plan") — antes esta misma tabla de umbrales estaba duplicada acá.
    const cat = imcCategoria(imc).cat;

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
  // El motor del wizard (navegación entre pasos, validación, recolección de
  // datos, NUTRI_TOTAL_STEPS, resetNutriWizard, nutriValidateStep,
  // nutriCollectData, etc.) vive ahora en js/nutricion-wizard.js —
  // compartido con la sección inline de mi-plan.html — que se carga antes
  // que este archivo. Acá solo queda lo específico de index.html: cómo se
  // abre (dentro del modal, ver btnNutricion más arriba) y qué pasa al
  // guardar el plan.

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

      if(currentUser){
        // Ya con sesión iniciada: el plan queda guardado y "Mi plan"
        // (mi-plan.html) lo lee solo de localStorage al cargar, así que
        // alcanza con llevar ahí a la persona.
        res.textContent = 'Tu plan quedó guardado en tu cuenta. Te llevamos a "Mi plan". ✓';
        renderMethodGauges();
        setTimeout(function(){
          closeModal(document.getElementById('modalNutricion'));
          window.location.href = 'mi-plan.html';
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
  // gaugeComputeAreas, gaugeColorForPercent (y sus helpers de color),
  // gaugeFechaCorta y gaugeDeltaHtml viven ahora en js/nutricion-planes.js
  // (compartidos con el gráfico de barras de mi-plan.html, que desde esta
  // sesión también muestra la comparación antes/después) — ese script se
  // carga antes que este.

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