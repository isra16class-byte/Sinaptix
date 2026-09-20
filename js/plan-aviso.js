/* Aviso antes de reemplazar un plan ya generado (compartido entre
   index.html y mi-plan.html).

   Problema que resuelve: volver a completar la encuesta guarda el plan nuevo
   ENCIMA del anterior (localStorage `sinaptix_objetivo` y, con sesión, el
   servidor: netlify/functions/plan.mjs hace un upsert sin historial), y los
   botones que abren la encuesta no avisaban nada. Ahora, si ya hay un plan
   guardado, se pregunta antes (Cancelar / Continuar) en un modal propio, con
   las mismas clases de los demás modales (`.modal-overlay`, `.modal-card`).
   Sin plan guardado, el botón hace lo de siempre, sin aviso.

   El texto del aviso (sesión 2026-09-19, FALLO 2) avisa también que generar
   un plan nuevo borra la reevaluación anterior (sinaptix_reevaluacion) y
   por lo tanto reinicia la comparación de "Actualizar mi estado" — antes
   solo decía que reemplazaba el plan, y ese borrado es destructivo y no
   estaba avisado. Ver js/script.js / js/mi-plan.js (submit de la encuesta)
   y memoria.md para el detalle del borrado en sí.

   Qué cuenta como "plan guardado": lo mismo que ya pinta el dashboard de
   `mi-plan.html` (pintarMiPlan en js/mi-plan.js): `sinaptix_objetivo` presente
   y con un JSON válido. Si el dato está corrupto, se trata como "sin plan",
   igual que el dashboard.

   API global:
   - hayPlanGuardado()               -> boolean
   - planAvisoActualizarBoton(btn)   -> "Actualizar mi plan" / "Generar mi plan"
   - planAvisoConfirmar(alContinuar) -> ejecuta alContinuar() directo si no hay
                                        plan; si hay, tras confirmar en el aviso.
   El modal se crea al abrirse y se quita del DOM al cerrarse, así no queda
   ningún botón invisible en el orden de tabulación. */
(function(global){
  var CLAVE_PLAN = 'sinaptix_objetivo';
  var DURACION_CIERRE = 260; // un poco más que la transición de .modal-overlay (.25s)

  function hayPlanGuardado(storage){
    var st = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if(!st) return false;
    try{
      var raw = st.getItem(CLAVE_PLAN);
      if(!raw) return false;
      var o = JSON.parse(raw);
      return !!o && typeof o === 'object';
    }catch(err){
      return false;
    }
  }

  function planAvisoActualizarBoton(btn){
    if(!btn) return;
    btn.textContent = hayPlanGuardado() ? 'Actualizar mi plan' : 'Generar mi plan';
  }

  var overlay = null;
  var alContinuarActual = null;
  var disparador = null;

  function cerrar(devolverFoco){
    if(!overlay) return;
    var el = overlay;
    overlay = null;
    el.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, DURACION_CIERRE);
    if(devolverFoco && disparador && typeof disparador.focus === 'function') disparador.focus();
  }

  function abrirAviso(alContinuar){
    if(overlay) return; // ya abierto
    alContinuarActual = alContinuar;
    disparador = document.activeElement;

    var el = document.createElement('div');
    el.className = 'modal-overlay';
    el.id = 'modalAvisoPlan';
    el.setAttribute('role', 'alertdialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'avisoPlanTitulo');
    el.setAttribute('aria-describedby', 'avisoPlanTexto');
    el.innerHTML =
      '<div class="modal-card aviso-plan-card">' +
        '<button type="button" class="modal-close" data-aviso-cancelar aria-label="Cerrar">×</button>' +
        '<span class="eyebrow" style="color:var(--purple)">Ya tenés un plan</span>' +
        '<h3 id="avisoPlanTitulo">¿Querés generar uno nuevo?</h3>' +
        '<p class="modal-text" id="avisoPlanTexto">Ya tenés un plan guardado. Si generás uno nuevo, reemplaza al actual y también reinicia la comparación de "Actualizar mi estado".</p>' +
        '<div class="aviso-plan-btns">' +
          '<button type="button" class="btn btn-ghost" data-aviso-cancelar>Cancelar</button>' +
          '<button type="button" class="btn btn-solid" data-aviso-continuar>Continuar</button>' +
        '</div>' +
      '</div>';

    el.addEventListener('click', function(e){
      if(e.target === el || e.target.closest('[data-aviso-cancelar]')){
        cerrar(true);
        return;
      }
      if(e.target.closest('[data-aviso-continuar]')){
        var cb = alContinuarActual;
        alContinuarActual = null;
        cerrar(false);
        if(typeof cb === 'function') cb();
      }
    });

    document.body.appendChild(el);
    overlay = el;
    document.body.style.overflow = 'hidden';
    // Un frame después, para que la transición de opacidad arranque desde 0.
    requestAnimationFrame(function(){
      el.classList.add('open');
      // El foco arranca en "Cancelar": la opción segura, para que un Enter
      // apurado no reemplace el plan sin querer.
      var cancelar = el.querySelector('.aviso-plan-btns [data-aviso-cancelar]');
      if(cancelar) cancelar.focus();
    });
  }

  function planAvisoConfirmar(alContinuar){
    if(hayPlanGuardado()) abrirAviso(alContinuar);
    else if(typeof alContinuar === 'function') alContinuar();
  }

  if(typeof document !== 'undefined'){
    // En captura, para cerrar solo este aviso antes de que el manejador de Esc
    // de js/script.js (que cierra todos los `.modal-overlay.open`) lo vea.
    document.addEventListener('keydown', function(e){
      if(!overlay) return;
      if(e.key === 'Escape'){
        e.stopPropagation();
        cerrar(true);
        return;
      }
      // Trampa de foco: Tab da vueltas entre los 3 controles del aviso.
      if(e.key === 'Tab'){
        var foco = Array.prototype.slice.call(overlay.querySelectorAll('button'));
        if(!foco.length) return;
        var primero = foco[0], ultimo = foco[foco.length - 1];
        if(e.shiftKey && document.activeElement === primero){ e.preventDefault(); ultimo.focus(); }
        else if(!e.shiftKey && document.activeElement === ultimo){ e.preventDefault(); primero.focus(); }
        else if(!overlay.contains(document.activeElement)){ e.preventDefault(); primero.focus(); }
      }
    }, true);
  }

  global.hayPlanGuardado = hayPlanGuardado;
  global.planAvisoActualizarBoton = planAvisoActualizarBoton;
  global.planAvisoConfirmar = planAvisoConfirmar;

  // Exports para tests con Node (mismo patrón que js/nutricion-planes.js).
  if(typeof module !== 'undefined' && module.exports){
    module.exports = { hayPlanGuardado: hayPlanGuardado, CLAVE_PLAN: CLAVE_PLAN };
  }
})(typeof window !== 'undefined' ? window : globalThis);
