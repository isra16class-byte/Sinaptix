// Lógica de la pantalla "Mi plan" (mi-plan.html).
// A diferencia de index.html, esta página es de una sola pantalla y solo
// tiene sentido con sesión iniciada, así que acá SÍ mostramos un estado
// "sin sesión" propio en vez de solo redirigir — cubre tanto a quien entra
// directo por la URL como a quien recién cerró sesión.
if(window.netlifyIdentity){
  netlifyIdentity.init();

  const sinSesionEl = document.getElementById('miPlanSinSesion');
  const conSesionEl = document.getElementById('miPlanConSesion');
  const tabLoginMiPlan = document.getElementById('tabLoginMiPlan');
  const tabRegistroMiPlan = document.getElementById('tabRegistroMiPlan');
  const tabsMiPlan = document.querySelector('.miplan-auth-tabs');
  const formLoginMiPlan = document.getElementById('formLoginMiPlan');
  const formRegistroMiPlan = document.getElementById('formRegistroMiPlan');
  const formRecuperarMiPlan = document.getElementById('formRecuperarMiPlan');
  const formNuevaPassMiPlan = document.getElementById('formNuevaPassMiPlan');
  const linkOlvideMiPlan = document.getElementById('linkOlvideMiPlan');
  const linkVolverLoginMiPlan = document.getElementById('linkVolverLoginMiPlan');
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

    // Avatar + nombre de la tarjeta "Cierre" (ver memoria.md). full_name
    // solo existe si la persona lo cargó al registrarse en Netlify
    // Identity; si no, se usa la parte del email antes de la @ como
    // fallback, para no dejar el nombre vacío ni inventar uno.
    const avatarEl = document.getElementById('miPlanAvatar');
    const nameEl = document.getElementById('miPlanUserName');
    const fullName = user.user_metadata && user.user_metadata.full_name;
    const nombreMostrado = fullName || (user.email ? user.email.split('@')[0] : '');
    if(nameEl) nameEl.textContent = nombreMostrado;
    if(avatarEl) avatarEl.textContent = nombreMostrado ? nombreMostrado.charAt(0).toUpperCase() : '';

    const antro = localStorage.getItem('sinaptix_antropometria');
    if(antro){
      try{
        const d = JSON.parse(antro);
        const imcEl = document.getElementById('miPlanImc');
        const imcLabEl = document.getElementById('miPlanImcLab');
        if(imcEl) imcEl.textContent = d.imc.toFixed(1);
        if(imcEl) imcEl.classList.remove('is-placeholder');
        if(imcLabEl) imcLabEl.textContent = 'IMC estimado (última medición registrada)';

        // Medidor tipo velocímetro: la aguja se recorta a [15, 40] solo para
        // su posición (imcGaugeAngulo, en js/nutricion-planes.js), el número
        // de arriba siempre muestra el IMC real sin recortar.
        const gaugeEl = document.getElementById('miPlanImcGauge');
        const agujaEl = document.getElementById('miPlanImcAguja');
        const marcadorEl = document.getElementById('miPlanImcMarcador');
        const marcadorGlowEl = document.getElementById('miPlanImcMarcadorGlow');
        const catEl = document.getElementById('miPlanImcCat');
        const legendEl = document.getElementById('miPlanImcLegend');
        if(typeof imcGaugeAngulo === 'function' && typeof imcCategoria === 'function'){
          if(agujaEl && typeof imcGaugeAgujaDeg === 'function'){
            const degFinal = imcGaugeAgujaDeg(d.imc);
            const reducedMotion = !!(window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            if(reducedMotion || typeof imcGaugeAgujaDegInicial !== 'function'){
              // Sin barrido: aparece directo en su posición final (el
              // marcador fijo de más abajo ya cubre el caso de "quiero ver
              // el valor sin depender de una animación").
              agujaEl.setAttribute('transform', 'rotate('+degFinal.toFixed(2)+' 110 115)');
            } else {
              // Arranca en el extremo mínimo del arco (IMC_GAUGE_MIN) y
              // recién en el frame siguiente se pinta la rotación final —
              // mismo truco de "doble requestAnimationFrame" que ya usa
              // gaugeAnimateArcs (js/script.js) para el barrido de los
              // anillos de Método: si el transform final se asignara en el
              // mismo frame que el inicial, el navegador puede saltar
              // directo al valor final sin barrido. La duración/easing del
              // barrido viven en CSS (.imc-aguja{transition:transform...}).
              agujaEl.setAttribute('transform', 'rotate('+imcGaugeAgujaDegInicial().toFixed(2)+' 110 115)');
              requestAnimationFrame(function(){
                requestAnimationFrame(function(){
                  agujaEl.setAttribute('transform', 'rotate('+degFinal.toFixed(2)+' 110 115)');
                });
              });
            }
          }
          // Marcador fijo del valor exacto, independiente de la aguja: no
          // depende de la animación ni de prefers-reduced-motion, siempre
          // se pinta directo en su posición final (imcGaugeMarkerPos ya
          // recorta al mismo rango [15,40] que la aguja).
          if(marcadorEl && typeof imcGaugeMarkerPos === 'function'){
            const pos = imcGaugeMarkerPos(d.imc);
            marcadorEl.setAttribute('cx', pos.x);
            marcadorEl.setAttribute('cy', pos.y);
          }
          const info = imcCategoria(d.imc);
          // Halo de color detrás del marcador (sesión 2026-09-18): misma
          // posición que el marcador, clase de color según la zona
          // (imc-gauge-marker-glow-bajo/-saludable/-sobrepeso/-obesidad,
          // ver css/styles.css) para dar contexto sin leer la etiqueta.
          if(marcadorGlowEl && typeof imcGaugeMarkerPos === 'function'){
            const posGlow = imcGaugeMarkerPos(d.imc);
            marcadorGlowEl.setAttribute('cx', posGlow.x);
            marcadorGlowEl.setAttribute('cy', posGlow.y);
            marcadorGlowEl.setAttribute('class', 'imc-gauge-marker-glow imc-gauge-marker-glow-'+info.zona);
          }
          if(catEl){
            catEl.textContent = info.cat.charAt(0).toUpperCase()+info.cat.slice(1);
            catEl.className = 'imc-cat imc-cat-'+info.zona;
          }
          if(gaugeEl) gaugeEl.classList.remove('hidden');
          if(catEl) catEl.classList.remove('hidden');
          if(legendEl) legendEl.classList.remove('hidden');
        }
        // Anillo de progreso de la tarjeta "Antropometría" (rediseño visual,
        // ver memoria.md): solo se completa si los datos parsearon bien,
        // no solo por existir la clave en localStorage.
        const antroRingEl = document.getElementById('miPlanAntroRing');
        if(antroRingEl) antroRingEl.classList.add('is-complete');
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
          // "Ajustado a tu caso" no va embebido acá (a diferencia del paso 8
          // del wizard en index.html): tiene su propia tarjeta, ver más
          // abajo y .miplan-ajustes en css/styles.css.
          miPlanDetalleEl.innerHTML = nutriBuildResumenHTML(o.encuesta, {incluirAjustesEnSide: false});
          miPlanDetalleEl.classList.remove('hidden');
        }
        const miPlanAjustesEl = document.getElementById('miPlanAjustes');
        const miPlanAjustesListEl = document.getElementById('miPlanAjustesList');
        if(miPlanAjustesEl && miPlanAjustesListEl && o.encuesta && typeof nutriConstruirAjustes === 'function'){
          const ajustes = nutriConstruirAjustes(o.encuesta);
          if(ajustes.length){
            miPlanAjustesListEl.innerHTML = ajustes.map(a=>'<li>'+a+'</li>').join('');
            miPlanAjustesEl.classList.remove('hidden');
          } else {
            miPlanAjustesListEl.innerHTML = '';
            miPlanAjustesEl.classList.add('hidden');
          }
        }
        // Chips de "Nutrientes clave de tu plan" al pie de la tarjeta
        // Antropometría (sesión 2026-09-18): salen del plan resuelto
        // (nutriNutrientesClave, js/nutricion-planes.js), no son fijos.
        const nutriBoxEl = document.getElementById('miPlanNutrientes');
        const nutriChipsEl = document.getElementById('miPlanNutrientesChips');
        if(nutriBoxEl && nutriChipsEl){
          const claves = (o.encuesta && typeof nutriNutrientesClave === 'function')
            ? nutriNutrientesClave(o.encuesta, 5) : [];
          nutriChipsEl.innerHTML = claves.map(function(n){
            return '<li class="miplan-nutri-chip">'+nutriEscaparHTML(n)+'</li>';
          }).join('');
          nutriBoxEl.classList.toggle('hidden', !claves.length);
        }
        if(miPlanCtaEl) miPlanCtaEl.classList.add('hidden');
        // Botón "Descargar mi plan en PDF" (js/mi-plan-pdf.js): solo tiene
        // sentido con un plan ya generado, mismo criterio que el resto del
        // contenido condicional de esta pantalla.
        if(typeof nutriPdfActualizarBoton === 'function') nutriPdfActualizarBoton(true);
        // Anillo de progreso de la tarjeta "Objetivo cognitivo" (rediseño
        // visual, ver memoria.md): mismo criterio que el de Antropometría.
        const objetivoRingEl = document.getElementById('miPlanObjetivoRing');
        if(objetivoRingEl) objetivoRingEl.classList.add('is-complete');
      }catch(err){ /* datos corruptos: se ignoran, se deja el placeholder */ }
    } else {
      if(miPlanBarrasEl) miPlanBarrasEl.classList.add('hidden');
      if(miPlanDetalleEl) miPlanDetalleEl.classList.add('hidden');
      const nutriBoxVacio = document.getElementById('miPlanNutrientes');
      if(nutriBoxVacio) nutriBoxVacio.classList.add('hidden');
      const miPlanAjustesElVacio = document.getElementById('miPlanAjustes');
      if(miPlanAjustesElVacio) miPlanAjustesElVacio.classList.add('hidden');
      if(miPlanCtaEl) miPlanCtaEl.classList.remove('hidden');
      if(typeof nutriPdfActualizarBoton === 'function') nutriPdfActualizarBoton(false);
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

  // Si la persona llegó acá desde el botón "Iniciar sesión" del wizard de
  // nutrición (paso 8, sin sesión) después de cargar nombre/correo en el
  // paso 1, reusamos esos dos datos para no pedírselos de nuevo: quedan
  // guardados en `sinaptix_objetivo` (ver js/script.js, evento submit del
  // wizard). Solo prellena, nunca pisa algo que la persona ya haya
  // escrito a mano en el formulario. El foco en la contraseña asume el
  // caso más probable (ya tiene cuenta, pestaña de login activa por
  // defecto) — si en realidad quiere registrarse, el nombre también quedó
  // prellenado en esa pestaña al cambiar.
  function prefillAuthDesdeEncuesta(){
    let obj = null;
    try{
      const raw = localStorage.getItem('sinaptix_objetivo');
      if(raw) obj = JSON.parse(raw);
    }catch(err){ obj = null; }
    const email = obj && obj.email;
    const nombre = obj && obj.encuesta && obj.encuesta.nombre;
    if(!email && !nombre) return;
    const loginEmailEl = document.getElementById('loginEmailMiPlan');
    const registroEmailEl = document.getElementById('registroEmailMiPlan');
    const registroNombreEl = document.getElementById('registroNombreMiPlan');
    if(email){
      if(loginEmailEl && !loginEmailEl.value) loginEmailEl.value = email;
      if(registroEmailEl && !registroEmailEl.value) registroEmailEl.value = email;
    }
    if(nombre && registroNombreEl && !registroNombreEl.value) registroNombreEl.value = nombre;
    if(email){
      const loginPassEl = document.getElementById('loginPassMiPlan');
      if(loginPassEl) loginPassEl.focus();
    }
  }

  // ---------------------------------------------------------------------
  // Login / registro propios (reemplazan al widget nativo de Identity)
  // ---------------------------------------------------------------------
  // Estrategia "híbrida", decidida con el usuario antes de escribir esto
  // (ver memoria.md): la parte VISUAL del login/signup es nuestra, pero
  // por debajo seguimos usando el cliente GoTrue que el widget ya expone
  // (`netlifyIdentity.gotrue`) en vez de hacer fetch a mano contra
  // /.netlify/identity. El motivo concreto: `netlifyIdentity.currentUser()`
  // no devuelve un estado interno del widget, sino `gotrue.currentUser()`,
  // que lee la sesión de localStorage — así que logueando por acá,
  // js/plan-sync.js (que arma el header Authorization con
  // `netlifyIdentity.currentUser()`) sigue funcionando sin tocarlo y sin
  // recargar la página, igual que `user.update()` y `user.jwt()`.
  //
  // Dos efectos secundarios de NO pasar por el widget, resueltos abajo:
  //  1. El evento `netlifyIdentity.on('login')` no se dispara (el widget lo
  //     emite al cambiar SU estado interno, que acá no tocamos), así que
  //     llamamos a mostrarEstadoConSesion(user) nosotros.
  //  2. `netlifyIdentity.logout()` no cierra la sesión si esta se creó por
  //     esta vía en la misma carga de página — ver doLogout().
  //
  // Nota para desarrollo local: si se abre el sitio en localhost sin
  // haberle cargado antes la Site URL de Netlify, `netlifyIdentity.gotrue`
  // es null y el widget abre su propio modal para pedirla. En el sitio
  // desplegado no pasa.
  function authGotrue(){
    return window.netlifyIdentity ? netlifyIdentity.gotrue : null;
  }

  // Traduce los errores de GoTrue (vienen en inglés, en err.message) a los
  // casos que el widget resolvía solo. El texto exacto lo manda el
  // servidor, así que se compara por substring y siempre hay un fallback
  // genérico para no dejar el formulario mudo ante un error inesperado.
  function authMensajeError(err){
    const msg = (err && err.message) ? String(err.message) : '';
    if(/Invalid Password|No user found|Invalid login credentials/i.test(msg)){
      return 'Ese correo o esa contraseña no coinciden.';
    }
    if(/Email not confirmed/i.test(msg)){
      return 'Confirmá tu correo antes de entrar (revisá tu bandeja de entrada).';
    }
    if(/already (been )?registered|already exists|duplicate/i.test(msg)){
      return 'Ese correo ya tiene una cuenta. Probá iniciar sesión.';
    }
    if(/Signups not allowed/i.test(msg)){
      return 'El registro está cerrado por ahora. Escribinos desde el sitio.';
    }
    if(/[Pp]assword.*(6|characters|short)/.test(msg)){
      return 'La contraseña es demasiado corta (al menos 8 caracteres).';
    }
    if(/Failed to fetch|NetworkError/i.test(msg)){
      return 'No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.';
    }
    return 'No pudimos completar la operación. Probá de nuevo en un momento.';
  }

  function authMostrarMsg(el, texto, esOk){
    if(!el) return;
    el.textContent = texto;
    el.classList.toggle('is-ok', !!esOk);
    el.classList.remove('hidden');
  }
  function authLimpiarMsg(el){
    if(!el) return;
    el.textContent = '';
    el.classList.remove('is-ok');
    el.classList.add('hidden');
  }
  function authBloquear(btn, textoMientras){
    if(!btn) return function(){};
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = textoMientras;
    return function(){ btn.disabled = false; btn.textContent = original; };
  }

  // Toggle entre paneles (layout "variante A", confirmado con el
  // usuario): solo un formulario visible por vez, reusando la clase
  // .hidden que ya usa el resto de la página. Las 2 pestañas cubren
  // login/registro; los paneles de recuperación no tienen pestaña (se
  // llega desde el link del login o desde el correo de Netlify), así que
  // en esos casos la fila de pestañas se oculta y el panel muestra su
  // propio encabezado.
  function mostrarPanelAuth(cual){
    const esLogin = cual === 'login';
    const esRegistro = cual === 'registro';
    if(tabLoginMiPlan){
      tabLoginMiPlan.classList.toggle('is-active', esLogin);
      tabLoginMiPlan.setAttribute('aria-selected', esLogin ? 'true' : 'false');
    }
    if(tabRegistroMiPlan){
      tabRegistroMiPlan.classList.toggle('is-active', esRegistro);
      tabRegistroMiPlan.setAttribute('aria-selected', esRegistro ? 'true' : 'false');
    }
    if(tabsMiPlan) tabsMiPlan.classList.toggle('hidden', !esLogin && !esRegistro);
    const card = document.querySelector('.miplan-locked-card');
    if(card) card.classList.toggle('is-recuperando', !esLogin && !esRegistro);
    if(formLoginMiPlan) formLoginMiPlan.classList.toggle('hidden', !esLogin);
    if(formRegistroMiPlan) formRegistroMiPlan.classList.toggle('hidden', !esRegistro);
    if(formRecuperarMiPlan) formRecuperarMiPlan.classList.toggle('hidden', cual !== 'recuperar');
    if(formNuevaPassMiPlan) formNuevaPassMiPlan.classList.toggle('hidden', cual !== 'nueva');
    ['loginMsgMiPlan','registroMsgMiPlan','recuperarMsgMiPlan','nuevaPassMsgMiPlan'].forEach(function(id){
      authLimpiarMsg(document.getElementById(id));
    });
  }
  if(tabLoginMiPlan) tabLoginMiPlan.addEventListener('click', function(){ mostrarPanelAuth('login'); });
  if(tabRegistroMiPlan) tabRegistroMiPlan.addEventListener('click', function(){ mostrarPanelAuth('registro'); });

  if(formLoginMiPlan){
    formLoginMiPlan.addEventListener('submit', function(e){
      e.preventDefault();
      const msgEl = document.getElementById('loginMsgMiPlan');
      const btn = document.getElementById('loginSubmitMiPlan');
      const email = document.getElementById('loginEmailMiPlan').value.trim();
      const pass = document.getElementById('loginPassMiPlan').value;
      authLimpiarMsg(msgEl);

      const auth = authGotrue();
      if(!auth){
        authMostrarMsg(msgEl, 'No pudimos conectar con el servidor. Probá de nuevo en un momento.');
        return;
      }
      const restaurar = authBloquear(btn, 'Entrando…');
      // El tercer parámetro (remember) es lo que hace que gotrue-js persista
      // la sesión en localStorage — sin él, currentUser() devolvería null en
      // la próxima carga y "Mi plan" pediría login de nuevo cada vez.
      auth.login(email, pass, true).then(function(user){
        mostrarEstadoConSesion(user);
      }).catch(function(err){
        restaurar();
        authMostrarMsg(msgEl, authMensajeError(err));
      });
    });
  }

  if(formRegistroMiPlan){
    formRegistroMiPlan.addEventListener('submit', function(e){
      e.preventDefault();
      const msgEl = document.getElementById('registroMsgMiPlan');
      const btn = document.getElementById('registroSubmitMiPlan');
      const nombre = document.getElementById('registroNombreMiPlan').value.trim();
      const email = document.getElementById('registroEmailMiPlan').value.trim();
      const pass = document.getElementById('registroPassMiPlan').value;
      authLimpiarMsg(msgEl);

      if(!nombre){
        authMostrarMsg(msgEl, 'Necesitamos tu nombre para armar tu plan.');
        return;
      }
      const auth = authGotrue();
      if(!auth){
        authMostrarMsg(msgEl, 'No pudimos conectar con el servidor. Probá de nuevo en un momento.');
        return;
      }
      const restaurar = authBloquear(btn, 'Creando tu cuenta…');
      // El 3er argumento de signup() es el `data` de la API de GoTrue, que
      // el servidor guarda como user_metadata — por eso `full_name` es la
      // misma clave que pintarMiPlan() ya leía del widget. Acá el nombre es
      // obligatorio (required en el HTML + chequeo de arriba), así que el
      // fallback "prefijo del email" de pintarMiPlan() deja de usarse para
      // cuentas nuevas.
      auth.signup(email, pass, {full_name: nombre}).then(function(){
        // Con la confirmación por correo desactivada en el panel de Netlify
        // (autoconfirm), el usuario ya queda habilitado y lo logueamos
        // directo para que no tenga que escribir los datos dos veces. Si
        // esa opción volviera a activarse, el login falla con "Email not
        // confirmed" y se muestra el aviso en vez de un error: por eso se
        // intenta el login en vez de leer settings() aparte.
        return auth.login(email, pass, true).then(function(user){
          mostrarEstadoConSesion(user);
        }).catch(function(err){
          restaurar();
          const msg = (err && err.message) ? String(err.message) : '';
          if(/Email not confirmed/i.test(msg)){
            mostrarPanelAuth('login');
            authMostrarMsg(document.getElementById('loginMsgMiPlan'),
              'Te mandamos un correo para confirmar tu cuenta. Después de confirmarlo vas a poder entrar acá mismo.', true);
          } else {
            authMostrarMsg(msgEl, authMensajeError(err));
          }
        });
      }).catch(function(err){
        restaurar();
        authMostrarMsg(msgEl, authMensajeError(err));
      });
    });
  }

  // --- Recuperación de contraseña, parte 1: pedir el enlace -------------
  // Reemplaza al "Forgot password?" que ofrecía el widget nativo. La API
  // es `requestPasswordRecovery(email)` (POST /.netlify/identity/recover
  // con {email}); Netlify manda el correo con el enlace.
  if(linkOlvideMiPlan){
    linkOlvideMiPlan.addEventListener('click', function(){
      mostrarPanelAuth('recuperar');
      // Si ya escribió el correo en el login, no se lo hacemos tipear de nuevo.
      const emailLogin = document.getElementById('loginEmailMiPlan').value.trim();
      const campo = document.getElementById('recuperarEmailMiPlan');
      if(emailLogin && campo) campo.value = emailLogin;
    });
  }
  if(linkVolverLoginMiPlan){
    linkVolverLoginMiPlan.addEventListener('click', function(){ mostrarPanelAuth('login'); });
  }

  if(formRecuperarMiPlan){
    formRecuperarMiPlan.addEventListener('submit', function(e){
      e.preventDefault();
      const msgEl = document.getElementById('recuperarMsgMiPlan');
      const btn = document.getElementById('recuperarSubmitMiPlan');
      const email = document.getElementById('recuperarEmailMiPlan').value.trim();
      authLimpiarMsg(msgEl);

      const auth = authGotrue();
      if(!auth){
        authMostrarMsg(msgEl, 'No pudimos conectar con el servidor. Probá de nuevo en un momento.');
        return;
      }
      const restaurar = authBloquear(btn, 'Enviando…');
      auth.requestPasswordRecovery(email).then(function(){
        restaurar();
        // A propósito NO se distingue entre "correo enviado" y "ese correo
        // no existe": responder distinto permitiría averiguar qué correos
        // tienen cuenta en el sitio. El mensaje es el mismo en los dos
        // casos (GoTrue igual suele responder 200 aunque no exista).
        authMostrarMsg(msgEl, 'Si ese correo tiene una cuenta, te llega un enlace en unos minutos. Revisá también el spam.', true);
      }).catch(function(err){
        restaurar();
        authMostrarMsg(msgEl, authMensajeError(err));
      });
    });
  }

  // --- Recuperación de contraseña, parte 2: volver desde el correo ------
  // El enlace del correo vuelve al sitio con #recovery_token=… ; el script
  // inline del <head> de mi-plan.html (y el de index.html, que reenvía
  // acá) lo levanta y limpia el fragmento antes de que el widget lo vea,
  // y lo deja en window.SINAPTIX_RECOVERY_TOKEN.
  //
  // `recover(token, true)` canjea ese token por una sesión real — o sea
  // que a partir de acá la persona ya está logueada, aunque todavía no
  // eligió su contraseña nueva. Por eso el paso siguiente es un
  // `user.update({password})` normal y no hace falta volver a loguear.
  // Mismo comportamiento que tenía el widget.
  function iniciarRecuperacion(token){
    const auth = authGotrue();
    // Aunque haya sesión previa en este navegador, se muestra el panel de
    // contraseña nueva: la persona llegó desde el correo justamente para
    // cambiarla.
    mostrarEstadoSinSesion();
    mostrarPanelAuth('nueva');
    const msgEl = document.getElementById('nuevaPassMsgMiPlan');
    const btn = document.getElementById('nuevaPassSubmitMiPlan');
    if(!auth){
      authMostrarMsg(msgEl, 'No pudimos conectar con el servidor. Probá de nuevo en un momento.');
      return;
    }
    const restaurar = authBloquear(btn, 'Verificando el enlace…');
    auth.recover(token, true).then(function(){
      restaurar();
    }).catch(function(){
      // Token vencido o ya usado: no tiene sentido dejarla escribir una
      // contraseña que no vamos a poder guardar, así que se vuelve al
      // panel de pedir el enlace con el aviso.
      mostrarPanelAuth('recuperar');
      authMostrarMsg(document.getElementById('recuperarMsgMiPlan'),
        'Ese enlace ya venció o se usó antes. Pedí uno nuevo.');
    });
  }

  if(formNuevaPassMiPlan){
    formNuevaPassMiPlan.addEventListener('submit', function(e){
      e.preventDefault();
      const msgEl = document.getElementById('nuevaPassMsgMiPlan');
      const btn = document.getElementById('nuevaPassSubmitMiPlan');
      const pass = document.getElementById('nuevaPassMiPlan').value;
      const pass2 = document.getElementById('nuevaPassRepetirMiPlan').value;
      authLimpiarMsg(msgEl);

      if(pass !== pass2){
        authMostrarMsg(msgEl, 'Las dos contraseñas no coinciden.');
        return;
      }
      const user = netlifyIdentity.currentUser();
      if(!user){
        mostrarPanelAuth('recuperar');
        authMostrarMsg(document.getElementById('recuperarMsgMiPlan'),
          'Ese enlace ya venció o se usó antes. Pedí uno nuevo.');
        return;
      }
      const restaurar = authBloquear(btn, 'Guardando…');
      user.update({password: pass}).then(function(userActualizado){
        mostrarEstadoConSesion(userActualizado);
      }).catch(function(err){
        restaurar();
        authMostrarMsg(msgEl, authMensajeError(err));
      });
    });
  }

  function doLogout(e){
    if(e) e.preventDefault();
    // No se usa netlifyIdentity.logout(): ese método cierra la sesión del
    // estado interno del widget, que queda vacío cuando el login se hizo
    // con los formularios propios de arriba (en esa misma carga de página
    // no haría nada y la sesión seguiría abierta). El objeto que devuelve
    // currentUser() es el User de gotrue-js y su .logout() sí hace el POST
    // /logout y limpia localStorage en los dos casos. Como tampoco se
    // dispara el evento 'logout' del widget, el redirect va explícito acá.
    const user = netlifyIdentity.currentUser();
    if(!user){ window.location.href = 'index.html'; return; }
    user.logout().then(function(){
      window.location.href = 'index.html';
    }).catch(function(){
      // El .logout() de gotrue-js limpia la sesión local aunque el POST
      // falle, así que igual sacamos a la persona de esta pantalla.
      window.location.href = 'index.html';
    });
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
    // Si se llegó desde el correo de recuperación, ese flujo manda sobre
    // todo lo demás (incluso sobre una sesión ya abierta en este
    // navegador): la persona vino justamente a cambiar la contraseña.
    if(window.SINAPTIX_RECOVERY_TOKEN){
      iniciarRecuperacion(window.SINAPTIX_RECOVERY_TOKEN);
      window.SINAPTIX_RECOVERY_TOKEN = null; // un token se canjea una sola vez
      return;
    }
    if(user){
      mostrarEstadoConSesion(user);
    } else {
      mostrarEstadoSinSesion();
      prefillAuthDesdeEncuesta();
    }
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
