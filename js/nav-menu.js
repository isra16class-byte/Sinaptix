/* Menú hamburguesa del nav (solo mobile ≤720px; en desktop el botón y el
   panel están ocultos por CSS). Compartido entre index.html y mi-plan.html.
   Abre/cierra `.nav.is-open`; el panel `#navMenu` lo muestra el CSS. */
(function(){
  var nav  = document.querySelector('.nav');
  var btn  = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if(!nav || !btn || !menu) return;

  function set(abierto){
    nav.classList.toggle('is-open', abierto);
    btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  }

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    set(!nav.classList.contains('is-open'));
  });

  // Elegir una sección cierra el menú (en index.html además hace scroll).
  menu.addEventListener('click', function(e){
    if(e.target.closest('a')) set(false);
  });

  // Tocar fuera del nav lo cierra.
  document.addEventListener('click', function(e){
    if(nav.classList.contains('is-open') && !nav.contains(e.target)) set(false);
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && nav.classList.contains('is-open')){
      set(false);
      btn.focus();
    }
  });

  // Si se agranda la ventana (rotar el teléfono, etc.) y el botón deja de
  // existir, no dejar el estado abierto colgado.
  var mq = window.matchMedia('(max-width:720px)');
  var alCambiar = function(){ if(!mq.matches) set(false); };
  if(mq.addEventListener) mq.addEventListener('change', alCambiar);
  else if(mq.addListener) mq.addListener(alCambiar);
})();
