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

    // Validación real de los datos ingresados — mismos rangos que el
    // wizard de nutrición (NUTRI_RANGOS en js/nutricion-planes.js), para
    // que los dos caminos que piden peso/talla/edad (esta pantalla y el
    // paso 2 de la encuesta) acepten y rechacen exactamente lo mismo. Antes
    // este formulario tenía sus propios límites, más laxos (peso hasta
    // 400, talla hasta 250, sin mínimo de edad) y desalineados de los del
    // wizard — ver plan-validacion-encuesta-nutricion.md.
    const errPeso = nutriValidarRango('peso', document.getElementById('antroPeso').value);
    if(errPeso){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = errPeso;
      return;
    }
    const errTalla = nutriValidarRango('talla', document.getElementById('antroTalla').value);
    if(errTalla){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = errTalla;
      return;
    }
    const errEdad = nutriValidarRango('edad', document.getElementById('antroEdad').value);
    if(errEdad){
      res.style.display='block';
      res.style.color='#B3261E';
      res.textContent = errEdad;
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

  // Botón "copiar correo" en Contacto
  const copyEmailBtn = document.querySelector('.copy-email-btn');
  if(copyEmailBtn){
    copyEmailBtn.addEventListener('click', function(){
      const email = this.dataset.email || 'hola@sinaptix.com';
      const done = () => {
        this.classList.add('is-copied');
        setTimeout(() => this.classList.remove('is-copied'), 1600);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        done();
      }
    });
  }

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
        // completo y no perderlo, invitamos a iniciar sesión (o crear
        // cuenta) en "Mi plan" — mismo destino que #btnLogin/#btnAcceder
        // del header, que ya usan las pantallas propias de login/registro
        // (.miplan-locked-card en mi-plan.html) en vez del widget nativo
        // de Netlify Identity. Antes acá se abría ese widget directo con
        // netlifyIdentity.open('login'), pero quedó inconsistente con el
        // resto del sitio y, en el deploy real, no siempre se veía (el
        // usuario reportó no encontrar ningún botón en este paso) — se
        // reemplaza por un botón visible y explícito.
        res.textContent = 'Guardamos tu propuesta en este navegador. Iniciá sesión para verla completa, guardada y lista cada vez que entres. ✓';
        renderMethodGauges();
        renderMethodImc();
        const loginBtn = document.getElementById('nutriLoginBtn');
        if(loginBtn) loginBtn.classList.remove('hidden');
        // El modal (`.modal-card`) es el propio contenedor con scroll
        // (max-height:88vh;overflow:auto en css/styles.css), y con todos
        // los avisos nutricionales del último paso, el mensaje de éxito +
        // el botón "Iniciar sesión" quedan por debajo del fold: la persona
        // tiene que scrollear el modal para encontrarlos (se perdía en el
        // deploy real). Apenas se muestran, bajamos el scroll del modal
        // hasta el final para que queden a la vista sin que nadie tenga
        // que buscarlos. rAF espera que el navegador ya haya pintado el
        // botón (recién visible, ya no display:none) antes de medir
        // scrollHeight.
        const modalCard = document.querySelector('#modalNutricion .modal-card');
        if(modalCard){
          requestAnimationFrame(function(){
            modalCard.scrollTo({ top: modalCard.scrollHeight, behavior: 'smooth' });
          });
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

  // Preferencia de "menos movimiento" del navegador, leída una sola vez
  // (no cambia durante la sesión salvo que el usuario edite la config del
  // SO y recargue) — usada para saltear la animación de llenado del
  // anillo (ver gaugeArc/gaugeAnimateArcs más abajo).
  const gaugePrefersReducedMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Un punto chico (no un segundo anillo) en el ángulo correspondiente al
  // valor `antesPct`, sobre el mismo radio que el arco. A propósito NO
  // reusa el color del arco (para no confundirse con el extremo actual
  // del trazo animado) ni es un anillo concéntrico completo — esa versión
  // se probó y se descartó por verse como un glitch a este tamaño de
  // tarjeta (ver historico/memoria-2026-09-14.md, "Anillos de progreso").
  // El ángulo usa la misma referencia que el arco (0% = arriba, sentido
  // horario) sin necesidad del transform="rotate(-90)" del arco: se
  // calcula el punto ya en su posición final directamente.
  function gaugeArcMarker(cx, cy, r, antesPct, size){
    const p = Math.max(0, Math.min(100, antesPct));
    const angleRad = (p/100*360 - 90) * (Math.PI/180);
    const mx = cx + r*Math.cos(angleRad);
    const my = cy + r*Math.sin(angleRad);
    return '<circle class="gauge-arc-marker" cx="'+mx.toFixed(1)+'" cy="'+my.toFixed(1)+'" r="'+size+'" aria-hidden="true"/>';
  }

  function gaugeArc(cx, cy, r, strokeWidth, pct, color, opts){
    opts = opts || {};
    const circumference = 2*Math.PI*r;
    const len = (Math.max(0, Math.min(100, pct))/100)*circumference;
    const finalOffset = circumference - len;
    // Animación de llenado: dasharray fijo a la circunferencia completa
    // (dash=gap=circumference, técnica estándar de "progress ring") y lo
    // que se anima es stroke-dashoffset, de "circumference" (anillo
    // vacío) a "finalOffset" (el pct real) — reemplaza el truco anterior
    // de dasharray="len circumference", que dibujaba el arco ya resuelto
    // y no se podía animar en CSS sin recalcular el dasharray en cada
    // frame. Si el usuario prefiere menos movimiento, arranca directo en
    // finalOffset y sin transición (ver gaugePrefersReducedMotion).
    const startOffset = gaugePrefersReducedMotion ? finalOffset : circumference;
    const delay = opts.delayMs || 0;
    const style = gaugePrefersReducedMotion ? '' : ' style="transition-delay:'+delay+'ms"';
    let svg = '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="var(--panel-line)" stroke-width="'+strokeWidth+'"/>'+
      '<circle class="gauge-arc-value" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+strokeWidth+'" stroke-linecap="round" '+
      'stroke-dasharray="'+circumference.toFixed(1)+' '+circumference.toFixed(1)+'" stroke-dashoffset="'+startOffset.toFixed(1)+'" '+
      'data-final-offset="'+finalOffset.toFixed(1)+'"'+style+' '+
      'transform="rotate(-90 '+cx+' '+cy+')"/>';
    if(opts.antesPct != null){
      svg += gaugeArcMarker(cx, cy, r, opts.antesPct, opts.markerSize || 4);
    }
    return svg;
  }

  // Dispara la animación de llenado de todos los anillos recién insertados
  // en `container` (llamar justo después de asignar el innerHTML). Doble
  // requestAnimationFrame: el primero deja que el navegador pinte el
  // estado inicial (anillo "vacío", stroke-dashoffset = circunferencia
  // completa); recién en el segundo frame se cambia al valor final — si
  // se hiciera en el mismo frame que el innerHTML, varios navegadores no
  // llegan a pintar el estado inicial y el anillo aparece directo en su
  // valor final, sin barrido. No hace nada si prefers-reduced-motion está
  // activo (gaugeArc ya arrancó esos anillos en su valor final).
  function gaugeAnimateArcs(container){
    if(gaugePrefersReducedMotion) return;
    const arcs = container.querySelectorAll('.gauge-arc-value');
    if(!arcs.length) return;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        arcs.forEach(function(arc){
          arc.style.strokeDashoffset = arc.getAttribute('data-final-offset');
        });
      });
    });
  }

  // Paleta propia de esta tarjeta (Método): morado oscuro → dorado →
  // verde salvia apagado, en vez del rojo/dorado/verde semáforo genérico
  // de gaugeColorForPercent/GAUGE_LOW/MID/HIGH (js/nutricion-planes.js).
  // Esas constantes compartidas NO se tocan porque las sigue usando el
  // gráfico de barras de "Mi plan" (nutriBuildBarChartHTML) — este cambio
  // queda scopeado a la tarjeta de Método, a pedido del usuario.
  const METHOD_GAUGE_LOW = '#4B2E45';
  const METHOD_GAUGE_MID = '#C1703B';
  const METHOD_GAUGE_HIGH = '#6B8F71';
  function methodGaugeColorForPercent(pct){
    const p = Math.max(0, Math.min(100, pct));
    const low = gaugeHexToRgb(METHOD_GAUGE_LOW), mid = gaugeHexToRgb(METHOD_GAUGE_MID), high = gaugeHexToRgb(METHOD_GAUGE_HIGH);
    if(p <= 50){
      const t = p/50;
      return gaugeRgbToHex({r:gaugeLerp(low.r,mid.r,t), g:gaugeLerp(low.g,mid.g,t), b:gaugeLerp(low.b,mid.b,t)});
    }
    const t = (p-50)/50;
    return gaugeRgbToHex({r:gaugeLerp(mid.r,high.r,t), g:gaugeLerp(mid.g,high.g,t), b:gaugeLerp(mid.b,high.b,t)});
  }
  function methodTierLabel(pct){
    if(pct <= 40) return 'Necesita atención';
    if(pct <= 75) return 'En progreso';
    return 'Sólido';
  }

  // Ícono lineal por área (mismo estilo que el resto del sitio: viewBox
  // 24, stroke currentColor 1.5) para poder escanear la tarjeta sin leer
  // cada palabra.
  function methodGaugeIcon(key){
    const icons = {
      foco:'<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
      memoria:'<path d="M3 12h4l2-6 3 12 2-9 2 3h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
      energia:'<path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
      calma:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class="gauge-icon">'+(icons[key]||'')+'</svg>';
  }

  // Delta "Antes: X% (+/- N pts)" pintado como badge con flecha en vez
  // del texto gris chico de antes (gaugeDeltaHtml, que sigue viviendo tal
  // cual en nutricion-planes.js y se sigue usando en "Mi plan" sin
  // cambios). Acá se lee de un vistazo en vez de tener que leer el número.
  function methodDeltaBadge(antesPct, despuesPct){
    if(despuesPct == null) return '';
    const delta = despuesPct - antesPct;
    if(delta > 0){
      return '<span class="gauge-delta-badge is-up"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>+'+delta+' pts</span>';
    }
    if(delta < 0){
      return '<span class="gauge-delta-badge is-down"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M7 7 17 17M17 9v8H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'+delta+' pts</span>';
    }
    return '<span class="gauge-delta-badge is-flat">sin cambios</span>';
  }

  // Frase que resume el estado en palabras en vez de solo 4 números
  // sueltos: sin esto la tarjeta era un dashboard sin interpretación.
  // Con reevaluación, celebra el mayor avance y señala qué área sigue
  // floja; sin reevaluación (primera visita), señala directamente dónde
  // hay más margen de mejora.
  function methodInsightHtml(areas, hasReeval){
    const pctDe = function(a){ return a.despuesPct==null ? a.antesPct : a.despuesPct; };
    const worst = areas.reduce(function(a,b){ return pctDe(b) < pctDe(a) ? b : a; });
    const worstPct = pctDe(worst);
    let texto;
    if(hasReeval){
      const best = areas.reduce(function(a,b){
        const da = a.despuesPct - a.antesPct, db = b.despuesPct - b.antesPct;
        return db > da ? b : a;
      });
      const bestDelta = best.despuesPct - best.antesPct;
      const logro = bestDelta > 0
        ? 'Tu mayor avance: <strong>'+best.label.toLowerCase()+'</strong> pasó de '+best.antesPct+'% a '+best.despuesPct+'% (+'+bestDelta+' pts). '
        : '';
      texto = logro+worst.label+' sigue en '+worstPct+'% — va a ser el foco de la próxima fase.';
    } else {
      texto = 'Tu área con más margen de mejora hoy es <strong>'+worst.label.toLowerCase()+'</strong> ('+worstPct+'%) — probá enfocar ahí las próximas dos semanas.';
    }
    return '<div class="gauge-insight">'+
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
      '<p>'+texto+'</p>'+
    '</div>';
  }

  // Un anillo tipo "Apple Watch" por área, coloreado según su propio
  // porcentaje. `featured` agranda el anillo y agrega el ícono + badge de
  // nivel (ver renderMethodGauges: es el área que peor está, para que la
  // tarjeta diga "mirá esto primero" en vez de mostrar 4 anillos
  // idénticos sin jerarquía). El delta ("Antes: X%") usa methodDeltaBadge
  // en vez de un segundo anillo concéntrico pegado al primero, que en el
  // tamaño real de la tarjeta quedaba demasiado apretado contra el
  // anillo externo y se leía como un glitch en vez de una comparación
  // clara (ver memoria.md).
  function gaugeBuildItem(area, featured, index){
    const current = area.despuesPct==null ? area.antesPct : area.despuesPct;
    const color = methodGaugeColorForPercent(current);
    const size = featured ? {r:46, sw:12, box:120, font:26, marker:5} : {r:34, sw:9, box:92, font:19, marker:3.5};
    const c = size.box/2;
    // Escalonado de la animación: el destacado arranca en 0ms; los 3
    // chicos arrancan ~90ms después (diferencia pedida por el usuario
    // para que no se sientan como 4 anillos disparando a la vez) y entre
    // ellos hay un desfase menor (30ms) para que tampoco salten los tres
    // exactamente juntos.
    const delayMs = featured ? 0 : 90 + ((index||0)*30);
    let svg = '<svg viewBox="0 0 '+size.box+' '+size.box+'" role="img" aria-label="'+area.label+': '+current+'%'+
      (area.despuesPct!=null ? ' (antes '+area.antesPct+'%)' : '')+'">';
    svg += gaugeArc(c, c, size.r, size.sw, current, color, {
      delayMs: delayMs,
      // El marcador de "antes" usa el mismo criterio que el badge de
      // delta debajo: solo si hay reevaluación guardada.
      antesPct: area.despuesPct!=null ? area.antesPct : null,
      markerSize: size.marker
    });
    svg += '<text x="'+c+'" y="'+(c+size.font*0.34)+'" text-anchor="middle" style="font-family:var(--font-d);font-size:'+size.font+'px;font-weight:800;fill:var(--ink)">'+current+'%</text>';
    svg += '</svg>';

    const badge = featured ? '<span class="gauge-tier-badge">'+methodTierLabel(current)+'</span>' : '';
    const antesLine = area.despuesPct==null ? '' :
      '<span class="gauge-item-antes">Antes: '+area.antesPct+'%</span> '+methodDeltaBadge(area.antesPct, area.despuesPct);

    return '<div class="gauge-item'+(featured?' is-featured':'')+'">'+
      '<div class="gauge-ring">'+svg+'</div>'+
      '<div class="gauge-item-meta">'+
        '<span class="gauge-item-label">'+methodGaugeIcon(area.key)+area.label+badge+'</span>'+
        antesLine+
      '</div>'+
    '</div>';
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

    const ctaProgresoEl = document.getElementById('gaugesFooterCtaProgreso');

    if(!antesObjetivo){
      el.innerHTML = header+
        '<p class="method-gauges-text">Generá tu diagnóstico de nutrición especializada y vas a ver acá, de un vistazo, cómo está hoy tu foco, tu memoria, tu energía y tu calma.</p>';
      if(ctaProgresoEl) ctaProgresoEl.innerHTML =
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
    ].map(function(a){
      return {
        key:a.key,
        label:a.label,
        antesPct: Math.round((antes[a.key]/5)*100),
        despuesPct: despues ? Math.round((despues[a.key]/5)*100) : null
      };
    });

    // El área que peor está (según el valor más reciente) se destaca en
    // grande arriba de la grilla, en vez de mostrar los 4 anillos
    // idénticos sin decir cuál mirar primero (ver memoria.md, "Método:
    // tarjeta de progreso con jerarquía").
    const featured = areas.reduce(function(a,b){
      const pa = a.despuesPct==null?a.antesPct:a.despuesPct;
      const pb = b.despuesPct==null?b.antesPct:b.despuesPct;
      return pb < pa ? b : a;
    });

    const insight = methodInsightHtml(areas, !!despues);
    const featuredHtml = gaugeBuildItem(featured, true);
    const grid = areas.filter(function(a){ return a.key!==featured.key; })
      .map(function(a, idx){ return gaugeBuildItem(a, false, idx); }).join('');

    const scale = '<div class="gauge-scale">'+
      '<span><i style="background:'+METHOD_GAUGE_LOW+'"></i>Necesita atención</span>'+
      '<span><i style="background:'+METHOD_GAUGE_MID+'"></i>En progreso</span>'+
      '<span><i style="background:'+METHOD_GAUGE_HIGH+'"></i>Sólido</span>'+
      '</div>';

    let legend = '<p class="gauge-dates">';
    if(despues){
      legend += 'Diagnóstico inicial · '+gaugeFechaCorta(antesObjetivo.fecha)+
        ' &nbsp;→&nbsp; Última actualización · '+gaugeFechaCorta(despuesReeval.fecha);
    } else {
      legend += 'Diagnóstico inicial · '+gaugeFechaCorta(antesObjetivo.fecha);
    }
    legend += '</p>';

    el.innerHTML = header+insight+featuredHtml+'<div class="gauge-grid">'+grid+'</div>'+scale+legend;
    // Dispara la animación de llenado de los 4 anillos recién insertados
    // (no hace nada si prefers-reduced-motion está activo). Se llama acá
    // y no dentro de gaugeBuildItem porque necesita el contenedor ya en
    // el DOM (querySelectorAll sobre `el`, no sobre el string armado).
    gaugeAnimateArcs(el);
    // Botón de reevaluación: vive al lado del interruptor Mi progreso/Mi
    // IMC en el footer de la tarjeta (#gaugesFooterCtaProgreso), no acá
    // adentro (ver memoria.md, "Método: interruptor junto al CTA"). Texto
    // fijo "Actualizar" en los dos estados (antes decía "Actualizar mi
    // estado"/"Actualizar mi estado otra vez"; se simplificó a pedido del
    // usuario).
    if(ctaProgresoEl) ctaProgresoEl.innerHTML =
      '<button type="button" class="btn btn-ghost" id="btnReevaluar">Actualizar</button>';
  }

  // ===================== Interruptor "Mi progreso" / "Mi IMC" (Método) =====================
  // La sección 03 (Método) mostraba solo los anillos de progreso. Ahora
  // conviven dos gráficas dentro de la misma tarjeta `.method-gauges`,
  // alternadas con un interruptor tipo pestañas, siempre arrancando en
  // "Mi progreso" (ver llamada a setGaugesView('progreso') en el arranque,
  // más abajo). Reusa imcCategoria/imcGaugeAngulo de nutricion-planes.js,
  // el mismo medidor semicircular que ya existía en "Mi plan".
  // Frase de insight para la pestaña "Mi IMC" — mismo patrón que
  // methodInsightHtml (Progreso): un mensaje corto y accionable en vez de
  // dejar que la persona interprete sola el número. Texto fijo por zona
  // (no hay "antes/después" para el IMC como sí para foco/memoria/
  // energía/calma, así que no hace falta comparar con una medición
  // previa).
  function methodImcInsightHtml(zona){
    const textos = {
      bajo: 'Tu IMC está en zona de bajo peso — sumar calorías de calidad puede ayudar a sostener tu energía mental durante el día.',
      saludable: 'Tu IMC está en rango saludable — buen punto de partida para sostener tu rendimiento cognitivo.',
      sobrepeso: 'Tu IMC está en sobrepeso — un plan de neuroalimentación puede ayudarte a acercarlo al rango saludable.',
      obesidad: 'Tu IMC está en rango de obesidad — vale la pena acompañarlo con seguimiento profesional además del plan de nutrición.'
    };
    return '<div class="gauge-insight">'+
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
      '<p>'+(textos[zona] || textos.saludable)+'</p>'+
    '</div>';
  }

  function renderMethodImc(){
    const el = document.getElementById('methodGaugesImc');
    if(!el) return;

    // Antes decía "Tu progreso" acá también (copiado del header de la
    // otra pestaña) — se corrige a "Antropometría" para que el eyebrow
    // describa esta pestaña y no la de al lado.
    const header = '<span class="eyebrow">Antropometría</span>'+
      '<h3 class="method-gauges-title">Tu IMC</h3>';

    let antro = null;
    try{
      const raw = localStorage.getItem('sinaptix_antropometria');
      if(raw) antro = JSON.parse(raw);
    }catch(err){ /* dato corrupto: se ignora */ }

    const ctaImcEl = document.getElementById('gaugesFooterCtaImc');

    if(!antro || typeof imcGaugeAngulo !== 'function' || typeof imcCategoria !== 'function'){
      el.innerHTML = header+
        '<p class="method-gauges-text">Registrá tu peso y talla para ver acá tu IMC y a qué rango corresponde.</p>';
      if(ctaImcEl) ctaImcEl.innerHTML =
        '<button type="button" class="btn btn-ghost" id="btnGaugeAntro">Registrar datos antropométricos</button>';
      return;
    }

    if(ctaImcEl) ctaImcEl.innerHTML = '';

    const deg = imcGaugeAgujaDeg(antro.imc);
    const marcador = imcGaugeMarkerPos(antro.imc);
    const info = imcCategoria(antro.imc);
    const catLabel = info.cat.charAt(0).toUpperCase()+info.cat.slice(1);

    // Rango de peso saludable (IMC 18.5–24.9) para la talla registrada —
    // dato extra que le da a la persona algo concreto para "apuntar", no
    // solo un número y una etiqueta de categoría.
    let rangoHtml = '';
    if(antro.tallaCm){
      const tallaM = antro.tallaCm/100;
      const min = (18.5*tallaM*tallaM).toFixed(1);
      const max = (24.9*tallaM*tallaM).toFixed(1);
      rangoHtml = '<p class="method-imc-range">Peso saludable estimado para tu talla: <strong>'+min+'–'+max+' kg</strong></p>';
    }

    // El medidor + número + categoría se agrupan en una sola tarjeta con
    // borde propio (.method-imc-featured), mismo tratamiento que el área
    // destacada de la pestaña "Mi progreso" (.gauge-item.is-featured): le
    // da un límite visual claro en vez de que el número "flote" suelto
    // sobre el fondo de la tarjeta general.
    el.innerHTML = header+
      methodImcInsightHtml(info.zona)+
      '<div class="method-imc-featured">'+
        '<div class="imc-gauge" aria-hidden="true">'+
          '<svg viewBox="-10 -2 240 148" width="100%">'+
            imcGaugeGradientDefsHtml()+
            (typeof imcGaugeTrackHtml === 'function' ? imcGaugeTrackHtml() : '')+
            '<path class="imc-zone imc-zone-bajo" d="M25 115 A 85 85 0 0 1 33.09 78.81"/>'+
            '<path class="imc-zone imc-zone-saludable" d="M33.09 78.81 A 85 85 0 0 1 83.73 34.16"/>'+
            '<path class="imc-zone imc-zone-sobrepeso" d="M83.73 34.16 A 85 85 0 0 1 136.27 34.16"/>'+
            '<path class="imc-zone imc-zone-obesidad" d="M136.27 34.16 A 85 85 0 0 1 195 115"/>'+
            (typeof imcGaugeMinorTicksHtml === 'function' ? imcGaugeMinorTicksHtml() : '')+
            (typeof imcGaugeTicksHtml === 'function' ? imcGaugeTicksHtml() : '')+
            '<circle class="imc-gauge-marker-glow imc-gauge-marker-glow-'+info.zona+'" cx="'+marcador.x+'" cy="'+marcador.y+'" r="10"/>'+
            '<circle class="imc-gauge-marker" cx="'+marcador.x+'" cy="'+marcador.y+'" r="4"/>'+
            '<line class="imc-aguja" x1="110" y1="115" x2="110" y2="45" transform="rotate('+deg.toFixed(2)+' 110 115)"/>'+
            '<circle class="imc-pivote-outer" cx="110" cy="115" r="8.5"/>'+
            '<circle class="imc-pivote" cx="110" cy="115" r="4.5"/>'+
          '</svg>'+
        '</div>'+
        '<div class="num">'+antro.imc.toFixed(1)+'</div>'+
        '<div class="lab">IMC estimado (última medición registrada)</div>'+
        '<span class="gauge-tier-badge imc-tier-'+info.zona+'">'+catLabel+'</span>'+
      '</div>'+
      rangoHtml+
      '<ul class="imc-legend">'+
        '<li><span class="imc-dot imc-dot-bajo"></span>Bajo peso</li>'+
        '<li><span class="imc-dot imc-dot-saludable"></span>Saludable</li>'+
        '<li><span class="imc-dot imc-dot-sobrepeso"></span>Sobrepeso</li>'+
        '<li><span class="imc-dot imc-dot-obesidad"></span>Obesidad</li>'+
      '</ul>';
  }

  function setGaugesView(view){
    const progresoEl = document.getElementById('methodGaugesProgreso');
    const imcEl = document.getElementById('methodGaugesImc');
    const btnProgreso = document.getElementById('btnVerProgreso');
    const btnImc = document.getElementById('btnVerImc');
    // Los botones de acción de cada pestaña (Generar mi diagnóstico /
    // Actualizar / Registrar datos antropométricos) viven en el footer,
    // al lado del interruptor, y se muestran/ocultan junto con su panel.
    const ctaProgresoEl = document.getElementById('gaugesFooterCtaProgreso');
    const ctaImcEl = document.getElementById('gaugesFooterCtaImc');
    if(!progresoEl || !imcEl || !btnProgreso || !btnImc) return;

    const showImc = view === 'imc';
    progresoEl.classList.toggle('hidden', showImc);
    imcEl.classList.toggle('hidden', !showImc);
    if(ctaProgresoEl) ctaProgresoEl.classList.toggle('hidden', showImc);
    if(ctaImcEl) ctaImcEl.classList.toggle('hidden', !showImc);
    btnProgreso.classList.toggle('is-active', !showImc);
    btnImc.classList.toggle('is-active', showImc);
    btnProgreso.setAttribute('aria-selected', String(!showImc));
    btnImc.setAttribute('aria-selected', String(showImc));
  }

  const btnVerProgreso = document.getElementById('btnVerProgreso');
  const btnVerImc = document.getElementById('btnVerImc');
  if(btnVerProgreso) btnVerProgreso.addEventListener('click', function(){ setGaugesView('progreso'); });
  if(btnVerImc) btnVerImc.addEventListener('click', function(){ setGaugesView('imc'); });

  function resetReevalForm(){
    const form = document.getElementById('formReevaluacion');
    if(form) form.reset();
    const res = document.getElementById('reevalResultado');
    if(res){ res.style.display='none'; res.textContent=''; }
  }

  // Los 3 botones de acción de la tarjeta (#btnGaugeDiagnostico,
  // #btnReevaluar, #btnGaugeAntro) viven en el footer compartido
  // (#gaugesFooterCtaProgreso / #gaugesFooterCtaImc), generados por
  // innerHTML, así que se delega el click sobre #methodGauges (contenedor
  // fijo que envuelve paneles y footer) en vez de buscarlos recién
  // creados.
  const methodGaugesEl = document.getElementById('methodGauges');
  if(methodGaugesEl){
    methodGaugesEl.addEventListener('click', function(e){
      if(e.target.closest('#btnGaugeDiagnostico')){
        resetNutriWizard();
        openModal('modalNutricion');
      } else if(e.target.closest('#btnReevaluar')){
        resetReevalForm();
        openModal('modalReevaluacion');
      } else if(e.target.closest('#btnGaugeAntro')){
        openModal('modalAntropometria');
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