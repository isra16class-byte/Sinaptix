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

    // "Iniciar sesión"/"Acceder" ahora son links normales a mi-plan.html
    // (la pantalla de login propia del sitio), no abren el widget de
    // Identity acá ni hacen scroll a contacto — ver memoria.md.

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

    // Guardado local (persiste entre visitas en este navegador)
    const datosAntro = {peso, tallaCm, edad, sexo, imc, fecha: new Date().toISOString()};
    localStorage.setItem('sinaptix_antropometria', JSON.stringify(datosAntro));
    // Si hay sesión iniciada, además queda guardado en el servidor (ver
    // js/plan-sync.js) para que viaje entre dispositivos — si no hay
    // sesión, planSyncGuardar no hace nada y el dato queda solo local,
    // como pasaba antes de que existiera este archivo.
    if(typeof planSyncGuardar === 'function') planSyncGuardar('antropometria', datosAntro);
    if(typeof renderMethodImc === 'function') renderMethodImc();

    // Ya no se abre el cliente de correo ni se muestra el mensaje de
    // resultado dentro del modal: al guardar, se cierra el modal y se
    // lleva directo a la tarjeta "Mi IMC" en la sección Método, que ya
    // queda actualizada con el resultado (ver renderMethodImc arriba).
    res.style.display='none';
    res.textContent='';
    this.reset();
    closeModal(document.getElementById('modalAntropometria'));
    if(typeof setGaugesView === 'function') setGaugesView('imc');
    const methodGaugesSection = document.getElementById('methodGauges');
    if(methodGaugesSection) methodGaugesSection.scrollIntoView({behavior:'smooth', block:'center'});
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

      // Si no había datos antropométricos guardados todavía, pero acá se
      // completó peso y talla (paso 2), los usamos para no pedirlos de
      // nuevo en "Registrar datos antropométricos" — ver
      // nutriGuardarAntropometriaSiFalta en js/nutricion-planes.js.
      nutriGuardarAntropometriaSiFalta(d);

      const datosObjetivo = {
        objetivo: objetivos.join(' + '),
        email: d.email,
        encuesta: d,
        fecha: new Date().toISOString()
      };
      localStorage.setItem('sinaptix_objetivo', JSON.stringify(datosObjetivo));
      // Sincroniza con el servidor si hay sesión (ver js/plan-sync.js);
      // sin sesión no hace nada, igual que antes de este archivo.
      if(typeof planSyncGuardar === 'function') planSyncGuardar('objetivo', datosObjetivo);

      const res = document.getElementById('nutriResultado');
      res.style.display='block';

      const currentUser = window.netlifyIdentity && netlifyIdentity.currentUser();

      if(currentUser){
        // Ya con sesión iniciada: el plan queda guardado y "Mi plan"
        // (mi-plan.html) lo lee solo de localStorage al cargar, así que
        // alcanza con llevar ahí a la persona.
        res.textContent = 'Tu plan quedó guardado en tu cuenta. Te llevamos a "Mi plan". ✓';
        renderMethodGauges();
        renderMethodImc();
        setTimeout(function(){
          closeModal(document.getElementById('modalNutricion'));
          window.location.href = 'mi-plan.html';
        }, 900);
      } else {
        // Sin sesión: queda guardado en este navegador, pero para verlo
        // completo y no perderlo, invitamos a iniciar sesión (o crear cuenta).
        res.textContent = 'Guardamos tu propuesta en este navegador. Iniciá sesión para verla completa, guardada y lista cada vez que entres. ✓';
        renderMethodGauges();
        renderMethodImc();
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
    const el = document.getElementById('methodGaugesProgreso');
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

  // ===================== Interruptor "Mi progreso" / "Mi IMC" (Método) =====================
  // La sección 03 (Método) mostraba solo los anillos de progreso. Ahora
  // conviven dos gráficas dentro de la misma tarjeta `.method-gauges`,
  // alternadas con un interruptor tipo pestañas, siempre arrancando en
  // "Mi progreso" (ver llamada a setGaugesView('progreso') en el arranque,
  // más abajo). Reusa imcCategoria/imcGaugeAngulo de nutricion-planes.js,
  // el mismo medidor semicircular que ya existía en "Mi plan".
  function renderMethodImc(){
    const el = document.getElementById('methodGaugesImc');
    if(!el) return;

    const header = '<span class="eyebrow">Tu progreso</span>'+
      '<h3 class="method-gauges-title">Tu IMC</h3>';

    let antro = null;
    try{
      const raw = localStorage.getItem('sinaptix_antropometria');
      if(raw) antro = JSON.parse(raw);
    }catch(err){ /* dato corrupto: se ignora */ }

    if(!antro || typeof imcGaugeAngulo !== 'function' || typeof imcCategoria !== 'function'){
      el.innerHTML = header+
        '<p class="method-gauges-text">Registrá tu peso y talla para ver acá tu IMC y a qué rango corresponde.</p>'+
        '<button type="button" class="btn btn-ghost" id="btnGaugeAntro">Registrar datos antropométricos</button>';
      return;
    }

    const deg = 90 - imcGaugeAngulo(antro.imc);
    const info = imcCategoria(antro.imc);
    const catLabel = info.cat.charAt(0).toUpperCase()+info.cat.slice(1);

    el.innerHTML = header+
      '<div class="imc-gauge" aria-hidden="true">'+
        '<svg viewBox="0 0 220 140" width="100%">'+
          '<path class="imc-zone imc-zone-bajo" d="M25 115 A 85 85 0 0 1 33.09 78.81"/>'+
          '<path class="imc-zone imc-zone-saludable" d="M33.09 78.81 A 85 85 0 0 1 83.73 34.16"/>'+
          '<path class="imc-zone imc-zone-sobrepeso" d="M83.73 34.16 A 85 85 0 0 1 136.27 34.16"/>'+
          '<path class="imc-zone imc-zone-vigilar" d="M136.27 34.16 A 85 85 0 0 1 195 115"/>'+
          '<line class="imc-aguja" x1="110" y1="115" x2="110" y2="45" transform="rotate('+deg.toFixed(2)+' 110 115)"/>'+
          '<circle class="imc-pivote" cx="110" cy="115" r="6"/>'+
        '</svg>'+
      '</div>'+
      '<div class="num">'+antro.imc.toFixed(1)+'</div>'+
      '<div class="lab">IMC estimado (última medición registrada)</div>'+
      '<div class="imc-cat imc-cat-'+info.zona+'">'+catLabel+'</div>'+
      '<ul class="imc-legend">'+
        '<li><span class="imc-dot imc-dot-bajo"></span>Bajo peso</li>'+
        '<li><span class="imc-dot imc-dot-saludable"></span>Saludable</li>'+
        '<li><span class="imc-dot imc-dot-sobrepeso"></span>Sobrepeso</li>'+
        '<li><span class="imc-dot imc-dot-vigilar"></span>A vigilar</li>'+
      '</ul>';
  }

  function setGaugesView(view){
    const progresoEl = document.getElementById('methodGaugesProgreso');
    const imcEl = document.getElementById('methodGaugesImc');
    const btnProgreso = document.getElementById('btnVerProgreso');
    const btnImc = document.getElementById('btnVerImc');
    if(!progresoEl || !imcEl || !btnProgreso || !btnImc) return;

    const showImc = view === 'imc';
    progresoEl.classList.toggle('hidden', showImc);
    imcEl.classList.toggle('hidden', !showImc);
    btnProgreso.classList.toggle('is-active', !showImc);
    btnImc.classList.toggle('is-active', showImc);
    btnProgreso.setAttribute('aria-selected', String(!showImc));
    btnImc.setAttribute('aria-selected', String(showImc));
  }

  const btnVerProgreso = document.getElementById('btnVerProgreso');
  const btnVerImc = document.getElementById('btnVerImc');
  if(btnVerProgreso) btnVerProgreso.addEventListener('click', function(){ setGaugesView('progreso'); });
  if(btnVerImc) btnVerImc.addEventListener('click', function(){ setGaugesView('imc'); });

  // El botón "Registrar datos antropométricos" del estado vacío de "Mi IMC"
  // vive dentro de contenido generado por innerHTML (igual que
  // #btnGaugeDiagnostico/#btnReevaluar más abajo), así que se delega el
  // click sobre el contenedor fijo en vez de buscar el botón recién creado.
  const methodGaugesImcEl = document.getElementById('methodGaugesImc');
  if(methodGaugesImcEl){
    methodGaugesImcEl.addEventListener('click', function(e){
      if(e.target.closest('#btnGaugeAntro')) openModal('modalAntropometria');
    });
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

      const datosReeval = {estres, fatiga, concentracion, olvidos, fecha: new Date().toISOString()};
      localStorage.setItem('sinaptix_reevaluacion', JSON.stringify(datosReeval));
      // Sincroniza con el servidor si hay sesión (ver js/plan-sync.js);
      // sin sesión no hace nada, igual que antes de este archivo.
      if(typeof planSyncGuardar === 'function') planSyncGuardar('reevaluacion', datosReeval);

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
  renderMethodImc();
  setGaugesView('progreso'); // arranca siempre en "Mi progreso", nunca en "Mi IMC"

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