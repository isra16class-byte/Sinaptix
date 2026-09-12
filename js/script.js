// Netlify Identity — login / logout
  if(window.netlifyIdentity){
    netlifyIdentity.init();

    const btnLogin = document.getElementById('btnLogin');

    function setLoginButton(user){
      if(!btnLogin) return;
      if(user){
        btnLogin.textContent = user.user_metadata && user.user_metadata.full_name
          ? user.user_metadata.full_name
          : 'Mi cuenta';
      } else {
        btnLogin.textContent = 'Iniciar sesión';
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

    netlifyIdentity.on('init', user => setLoginButton(user));
    netlifyIdentity.on('login', user => {
      setLoginButton(user);
      netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => setLoginButton(null));
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
  document.getElementById('btnNutricion').addEventListener('click', ()=>openModal('modalNutricion'));
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

  // Formulario de nutrición especializada: envía un correo real a hola@sinaptix.com
  document.getElementById('formNutricion').addEventListener('submit', function(e){
    e.preventDefault();
    const objetivo = document.getElementById('nutriObjetivo').value;
    const email = document.getElementById('nutriEmail').value.trim();

    const asunto = encodeURIComponent('Solicitud de nutrición especializada');
    const cuerpo = encodeURIComponent(
      'Correo del solicitante: '+email+'\n'+
      'Objetivo cognitivo principal: '+objetivo
    );

    window.location.href = 'mailto:hola@sinaptix.com?subject='+asunto+'&body='+cuerpo;
    const res = document.getElementById('nutriResultado');
    res.style.display='block';
    res.textContent = 'Abriendo tu correo para enviar la solicitud… ✓';
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15});
  revealEls.forEach(el=>io.observe(el));

  // Rail progress + active node
  const railDot = document.getElementById('railDot');
  const nodes = document.querySelectorAll('.rail-node');
  const sections = document.querySelectorAll('section');
  function onScroll(){
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = Math.min(1, Math.max(0, scrolled/height));
    railDot.style.top = (pct*100)+'%';

    let idx = 0;
    sections.forEach((s,i)=>{
      const r = s.getBoundingClientRect();
      if(r.top < window.innerHeight*0.5) idx = i;
    });
    nodes.forEach(n=>n.classList.toggle('active', parseInt(n.dataset.i)===idx));
  }
  document.addEventListener('scroll', ()=>window.requestAnimationFrame(onScroll));
  onScroll();