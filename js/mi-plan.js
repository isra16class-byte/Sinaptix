// Lógica de la pantalla "Mi plan" (mi-plan.html).
// A diferencia de index.html, esta página es de una sola pantalla y solo
// tiene sentido con sesión iniciada, así que acá SÍ mostramos un estado
// "sin sesión" propio en vez de solo redirigir — cubre tanto a quien entra
// directo por la URL como a quien recién cerró sesión.
if(window.netlifyIdentity){
  netlifyIdentity.init();

  const sinSesionEl = document.getElementById('miPlanSinSesion');
  const conSesionEl = document.getElementById('miPlanConSesion');
  const btnLoginMiPlan = document.getElementById('btnLoginMiPlan');
  const btnLogout = document.getElementById('btnLogout');
  const btnLogoutNav = document.getElementById('btnLogoutNav');
  const btnAbrirNutricionMiPlan = document.getElementById('btnAbrirNutricionMiPlan');
  const nutriInlineVolver = document.getElementById('nutriInlineVolver');
  const nutriInlineEl = document.getElementById('nutriInline');

  // Reconstruye el plan completo (con ajustes y avisos) a partir de la
  // encuesta guardada en localStorage — usa nutriBuildResumenHTML de
  // js/nutricion-planes.js, sin tener que repetir la encuesta.
  function pintarMiPlan(user){
    const emailEl = document.getElementById('miPlanEmail');
    if(emailEl) emailEl.textContent = 'Sesión iniciada como '+user.email;

    const antro = localStorage.getItem('sinaptix_antropometria');
    if(antro){
      try{
        const d = JSON.parse(antro);
        const imcEl = document.getElementById('miPlanImc');
        const imcLabEl = document.getElementById('miPlanImcLab');
        if(imcEl) imcEl.textContent = d.imc.toFixed(1);
        if(imcLabEl) imcLabEl.textContent = 'IMC estimado (última medición registrada)';

        // Medidor tipo velocímetro: la aguja se recorta a [15, 40] solo para
        // su posición (imcGaugeAngulo, en js/nutricion-planes.js), el número
        // de arriba siempre muestra el IMC real sin recortar.
        const gaugeEl = document.getElementById('miPlanImcGauge');
        const agujaEl = document.getElementById('miPlanImcAguja');
        const catEl = document.getElementById('miPlanImcCat');
        const legendEl = document.getElementById('miPlanImcLegend');
        if(typeof imcGaugeAngulo === 'function' && typeof imcCategoria === 'function'){
          if(agujaEl){
            const deg = 90 - imcGaugeAngulo(d.imc);
            agujaEl.setAttribute('transform', 'rotate('+deg.toFixed(2)+' 110 115)');
          }
          const info = imcCategoria(d.imc);
          if(catEl){
            catEl.textContent = info.cat.charAt(0).toUpperCase()+info.cat.slice(1);
            catEl.className = 'imc-cat imc-cat-'+info.zona;
          }
          if(gaugeEl) gaugeEl.classList.remove('hidden');
          if(catEl) catEl.classList.remove('hidden');
          if(legendEl) legendEl.classList.remove('hidden');
        }
      }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
    }

    const miPlanDetalleEl = document.getElementById('miPlanDetalle');
    const miPlanCtaEl = document.getElementById('miPlanCta');
    const miPlanBarrasEl = document.getElementById('miPlanBarras');
    const objetivo = localStorage.getItem('sinaptix_objetivo');
    if(objetivo){
      try{
        const o = JSON.parse(objetivo);
        const objetivoEl = document.getElementById('miPlanObjetivo');
        if(objetivoEl) objetivoEl.textContent = o.objetivo;
        if(o.encuesta && miPlanBarrasEl && typeof nutriBuildBarChartHTML === 'function'){
          // Si ya se reevaluó desde "Método" (index.html), el gráfico
          // muestra el estado más reciente y la comparación contra la
          // encuesta inicial — mismo dato (`sinaptix_reevaluacion`) que
          // usan los anillos de progreso, ver js/nutricion-planes.js.
          let reeval = null;
          try{
            const r = localStorage.getItem('sinaptix_reevaluacion');
            if(r) reeval = JSON.parse(r);
          }catch(err){ /* dato corrupto: se ignora, se muestra sin comparación */ }
          miPlanBarrasEl.innerHTML = nutriBuildBarChartHTML(o, reeval);
          miPlanBarrasEl.classList.remove('hidden');
        }
        if(miPlanDetalleEl && o.encuesta && typeof nutriBuildResumenHTML === 'function'){
          miPlanDetalleEl.innerHTML = nutriBuildResumenHTML(o.encuesta);
          miPlanDetalleEl.classList.remove('hidden');
        }
        if(miPlanCtaEl) miPlanCtaEl.classList.add('hidden');
      }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
    } else {
      if(miPlanBarrasEl) miPlanBarrasEl.classList.add('hidden');
      if(miPlanDetalleEl) miPlanDetalleEl.classList.add('hidden');
      if(miPlanCtaEl) miPlanCtaEl.classList.remove('hidden');
    }
  }

  function mostrarEstadoConSesion(user){
    if(sinSesionEl) sinSesionEl.classList.add('hidden');
    if(conSesionEl) conSesionEl.classList.remove('hidden');
    if(btnLogoutNav) btnLogoutNav.classList.remove('hidden');
    // Antes de pintar, trae del servidor lo que haya guardado ese usuario
    // (ver js/plan-sync.js) y lo mezcla en localStorage — así "Mi plan" se
    // ve igual entrando desde otro dispositivo, no solo desde este
    // navegador. planSyncCargar nunca rechaza la promesa (atrapa sus
    // propios errores), así que no hace falta un .catch acá; si falla o
    // no hay nada en el servidor todavía, se pinta con lo que ya hubiera
    // localmente, como pasaba antes de que existiera este sync.
    if(typeof planSyncCargar === 'function'){
      planSyncCargar().then(function(){ pintarMiPlan(user); });
    } else {
      pintarMiPlan(user);
    }
  }

  function mostrarEstadoSinSesion(){
    if(conSesionEl) conSesionEl.classList.add('hidden');
    if(sinSesionEl) sinSesionEl.classList.remove('hidden');
    if(btnLogoutNav) btnLogoutNav.classList.add('hidden');
  }

  if(btnLoginMiPlan){
    btnLoginMiPlan.addEventListener('click', function(e){
      e.preventDefault();
      netlifyIdentity.open('login');
    });
  }

  function doLogout(e){
    if(e) e.preventDefault();
    netlifyIdentity.logout();
  }
  if(btnLogout) btnLogout.addEventListener('click', doLogout);
  if(btnLogoutNav) btnLogoutNav.addEventListener('click', doLogout);

  // La encuesta se muestra inline en esta misma pantalla (no un modal chico)
  // para tener más espacio y visión mientras se completa. Como solo se llega
  // acá con sesión ya iniciada (el botón vive dentro de #miPlanConSesion),
  // no hace falta contemplar el caso "sin sesión" en este flujo.
  if(btnAbrirNutricionMiPlan){
    btnAbrirNutricionMiPlan.addEventListener('click', function(){
      resetNutriWizard();
      if(conSesionEl) conSesionEl.classList.add('hidden');
      if(nutriInlineEl){
        nutriInlineEl.classList.remove('hidden');
        nutriInlineEl.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  }
  if(nutriInlineVolver){
    nutriInlineVolver.addEventListener('click', function(){
      if(nutriInlineEl) nutriInlineEl.classList.add('hidden');
      if(conSesionEl) conSesionEl.classList.remove('hidden');
    });
  }
  if(nutriForm){
    nutriForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!nutriValidateStep(NUTRI_TOTAL_STEPS)) return;

      const d = nutriCollectData();
      const objetivos = nutriResolverObjetivo(d);

      // Si no había datos antropométricos guardados todavía, pero acá se
      // completó peso y talla (paso 2), los usamos para no pedirlos de
      // nuevo en "Registrar datos antropométricos" — así el medidor de IMC
      // de "Mi plan" puede aparecer ni bien se pinta de nuevo más abajo, sin
      // que la persona tenga que volver a index.html a completarlos aparte.
      // Ver nutriGuardarAntropometriaSiFalta en js/nutricion-planes.js.
      nutriGuardarAntropometriaSiFalta(d);

      const datosObjetivo = {
        objetivo: objetivos.join(' + '),
        email: d.email,
        encuesta: d,
        fecha: new Date().toISOString()
      };
      localStorage.setItem('sinaptix_objetivo', JSON.stringify(datosObjetivo));
      // Sincroniza con el servidor (ver js/plan-sync.js) — a esta pantalla
      // solo se llega con sesión ya iniciada, así que siempre hay a dónde
      // sincronizar.
      if(typeof planSyncGuardar === 'function') planSyncGuardar('objetivo', datosObjetivo);

      const res = document.getElementById('nutriResultado');
      if(res){
        res.style.display='block';
        res.textContent = 'Tu plan quedó guardado. Volviendo a "Mi plan"… ✓';
      }

      // Ya estamos en "Mi plan": alcanza con volver a pintarlo (sin recargar
      // la página) y ocultar la encuesta, en vez de redirigir a otro lado.
      setTimeout(function(){
        if(nutriInlineEl) nutriInlineEl.classList.add('hidden');
        if(conSesionEl) conSesionEl.classList.remove('hidden');
        const user = netlifyIdentity.currentUser();
        if(user) pintarMiPlan(user);
      }, 900);
    });
  }

  netlifyIdentity.on('init', function(user){
    if(user) mostrarEstadoConSesion(user); else mostrarEstadoSinSesion();
  });
  netlifyIdentity.on('login', function(user){
    netlifyIdentity.close();
    mostrarEstadoConSesion(user);
  });
  netlifyIdentity.on('logout', function(){
    // Ya no hay nada que mostrar en esta pantalla sin sesión: volvemos al sitio.
    window.location.href = 'index.html';
  });
}
