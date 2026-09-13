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
      }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
    }

    const miPlanDetalleEl = document.getElementById('miPlanDetalle');
    const miPlanCtaEl = document.getElementById('miPlanCta');
    const objetivo = localStorage.getItem('sinaptix_objetivo');
    if(objetivo){
      try{
        const o = JSON.parse(objetivo);
        const objetivoEl = document.getElementById('miPlanObjetivo');
        if(objetivoEl) objetivoEl.textContent = o.objetivo;
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

  function mostrarEstadoConSesion(user){
    if(sinSesionEl) sinSesionEl.classList.add('hidden');
    if(conSesionEl) conSesionEl.classList.remove('hidden');
    if(btnLogoutNav) btnLogoutNav.classList.remove('hidden');
    pintarMiPlan(user);
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
