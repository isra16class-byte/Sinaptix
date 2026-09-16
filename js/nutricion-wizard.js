// ===================== Motor del wizard de nutrición (compartido) =====================
// Extraído de js/script.js para poder mostrar la misma encuesta tanto en el
// modal de index.html como en la sección inline de mi-plan.html, sin
// duplicar la lógica de navegación entre pasos. Solo opera sobre
// #formNutricion y sus hijos — no sabe (ni le importa) si ese formulario
// está dentro de un modal o de una sección normal de la página.
//
// Requiere que #formNutricion ya exista en el DOM al momento de cargar este
// script (colocarlo después del formulario en el HTML, como el resto de los
// scripts de este sitio) y que js/nutricion-planes.js se haya cargado antes
// (usa nutriBuildResumenHTML). El manejo del evento "submit" (qué pasa
// cuando se guarda el plan) NO vive acá — es distinto en cada página
// (index.html redirige a "Mi plan"; mi-plan.html se queda en la misma
// pantalla) y se define en js/script.js / js/mi-plan.js respectivamente.

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
  const resultadoEl = document.getElementById('nutriResultado');
  if(resultadoEl) resultadoEl.style.display='none';
  const loginBtnEl = document.getElementById('nutriLoginBtn');
  if(loginBtnEl) loginBtnEl.classList.add('hidden');

  // Prellenar edad/sexo/peso/talla si ya existen en "Mis datos"
  // (antropometría). Peso y talla, en particular, ya no se muestran como
  // dos inputs vacíos para volver a completar cuando ya hay un dato
  // guardado: se resumen en una frase ("Ya tenemos tu peso y talla
  // registrados...") + botón "Actualizar peso y talla" que revela los
  // inputs si el usuario quiere cambiarlos. Los inputs igual quedan
  // prellenados por debajo aunque estén ocultos, así que si el usuario no
  // toca nada se sigue mandando el mismo peso/talla que ya tenía. Ver
  // plan-mejoras-mi-plan-y-encuesta.md, sección 4.2 ("Lógica condicional
  // para no repetir datos ya conocidos").
  const antro = localStorage.getItem('sinaptix_antropometria');
  const antroInputsEl = document.getElementById('nutriAntroInputs');
  const antroResumenEl = document.getElementById('nutriAntroResumen');
  const antroResumenTextoEl = document.getElementById('nutriAntroResumenTexto');
  let d = null;
  if(antro){
    try{ d = JSON.parse(antro); }catch(err){ d = null; }
  }
  if(d){
    document.getElementById('nutriEdad').value = d.edad || '';
    document.getElementById('nutriSexo').value = d.sexo === 'Femenino' || d.sexo === 'Masculino' ? d.sexo : '';
    document.getElementById('nutriPeso').value = d.peso || '';
    document.getElementById('nutriTalla').value = d.tallaCm || '';
  }
  if(d && d.peso && d.tallaCm){
    if(antroResumenTextoEl){
      // gaugeFechaCorta vive en js/nutricion-planes.js (cargado antes que
      // este script) — es un formateador de fecha genérico, no específico
      // de los anillos/gráfico, así que se reutiliza acá también.
      antroResumenTextoEl.textContent = 'Ya tenemos tu peso y talla registrados ('+gaugeFechaCorta(d.fecha)+') — '+d.peso+' kg, '+d.tallaCm+' cm.';
    }
    if(antroInputsEl) antroInputsEl.classList.add('hidden');
    if(antroResumenEl) antroResumenEl.classList.remove('hidden');
  } else {
    if(antroInputsEl) antroInputsEl.classList.remove('hidden');
    if(antroResumenEl) antroResumenEl.classList.add('hidden');
  }
  nutriShowStep(1);
}

const btnNutriAntroEditar = document.getElementById('btnNutriAntroEditar');
if(btnNutriAntroEditar){
  btnNutriAntroEditar.addEventListener('click', function(){
    const antroInputsEl = document.getElementById('nutriAntroInputs');
    const antroResumenEl = document.getElementById('nutriAntroResumen');
    if(antroInputsEl) antroInputsEl.classList.remove('hidden');
    if(antroResumenEl) antroResumenEl.classList.add('hidden');
  });
}

function nutriValidateStep(n){
  const stepEl = nutriSteps.find(s=>parseInt(s.dataset.step,10)===n);
  if(!stepEl) return true;
  const invalid = stepEl.querySelector(':invalid');
  if(invalid){
    // `:invalid` acá también agarra los min/max/minlength/pattern que se
    // agregaron a edad/peso/talla/pantallas/nombre (ver
    // plan-validacion-encuesta-nutricion.md), no solo `required` como
    // antes — se distingue el mensaje según el tipo de violación para no
    // decir "completá los campos obligatorios" cuando en realidad el
    // campo tiene un valor, solo que fuera de rango.
    const v = invalid.validity;
    if(v.rangeUnderflow || v.rangeOverflow){
      nutriErrorEl.textContent = 'Uno de los valores de este paso está fuera del rango permitido — revisalo antes de continuar.';
    } else if(v.patternMismatch || v.tooShort){
      nutriErrorEl.textContent = 'El nombre tiene que tener al menos 2 caracteres e incluir alguna letra.';
    } else {
      nutriErrorEl.textContent = 'Completa los campos obligatorios de este paso antes de continuar.';
    }
    nutriErrorEl.classList.add('show');
    if(invalid.reportValidity) invalid.reportValidity();
    return false;
  }
  nutriErrorEl.classList.remove('show');
  return true;
}

// "Prefiero no decir" (paso 5, condiciones de salud) es mutuamente
// excluyente con el resto de checkboxes del mismo grupo — hoy se podía
// tildar "Prefiero no decir" y, por ejemplo, "Diabetes" al mismo tiempo,
// lo cual no tiene sentido. Al tildar una, se destilda la otra rama.
const nutriCondicionInputs = Array.from(document.querySelectorAll('input[name="nutriCondicion"]'));
if(nutriCondicionInputs.length){
  nutriCondicionInputs.forEach(function(input){
    input.addEventListener('change', function(){
      if(!input.checked) return;
      const esPrefieroNoDecir = input.value === 'Prefiero no decir';
      nutriCondicionInputs.forEach(function(otro){
        if(otro === input) return;
        const otroEsPrefieroNoDecir = otro.value === 'Prefiero no decir';
        if(esPrefieroNoDecir || (!esPrefieroNoDecir && otroEsPrefieroNoDecir)){
          otro.checked = false;
        }
      });
    });
  });
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

function nutriRenderResumen(){
  const d = nutriCollectData();
  document.getElementById('nutriResumen').innerHTML = nutriBuildResumenHTML(d);
}
