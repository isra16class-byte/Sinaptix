// Sincronización con el backend (netlify/functions/plan.js + Netlify DB) de
// los 3 bloques de datos de "Mi plan": antropometría, objetivo (plan de
// nutrición) y reevaluación. Ver memoria.md, sección "Backend real para Mi
// plan", para el diseño completo.
//
// Compartido entre index.html y mi-plan.html — igual que
// js/nutricion-planes.js, debe cargarse antes que js/script.js y
// js/mi-plan.js, que son quienes llaman a estas dos funciones.
//
// Principio de diseño: localStorage sigue siendo lo único que lee el resto
// del sitio (pintarMiPlan, renderMethodGauges, etc. — nada de esa lectura
// se tocó). Este archivo solo agrega un "espejo" hacia el servidor:
//
// - planSyncGuardar(tipo, datos): se llama justo después de cada
//   localStorage.setItem('sinaptix_...', ...) que ya existía. Si hay sesión
//   iniciada, manda una copia al backend; si no hay sesión, no hace nada
//   (el dato igual queda en localStorage, como pasaba antes de este
//   cambio). Es "fire and forget": si la llamada falla (sin conexión,
//   función caída, etc.) solo se avisa por console.warn — nunca bloquea ni
//   interrumpe el flujo del formulario que la llamó.
// - planSyncCargar(): se llama una vez al mostrar el estado "con sesión" en
//   mi-plan.html, antes de pintarMiPlan. Trae lo que haya guardado en el
//   servidor y lo escribe en localStorage — el servidor manda (por eso
//   sobreescribe), para que el plan generado en un dispositivo aparezca en
//   otro. Un bloque que no venga en la respuesta (porque ese usuario nunca
//   lo guardó desde ningún dispositivo) se deja tal cual esté en
//   localStorage, no se borra. Si la llamada falla, se resuelve igual (con
//   null) y mi-plan.html sigue mostrando lo que ya hubiera en este
//   navegador, como antes de este cambio.

function planSyncHeaders(){
  const user = window.netlifyIdentity && netlifyIdentity.currentUser();
  if(!user || !user.token || !user.token.access_token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + user.token.access_token
  };
}

function planSyncGuardar(tipo, datos){
  const headers = planSyncHeaders();
  if(!headers) return; // sin sesión: no hay a dónde sincronizar, se sigue de largo
  fetch('/.netlify/functions/plan', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({tipo: tipo, datos: datos})
  }).catch(function(err){
    console.warn('No se pudo sincronizar "'+tipo+'" con el servidor (queda guardado en este navegador igual):', err);
  });
}

function planSyncCargar(){
  const headers = planSyncHeaders();
  if(!headers) return Promise.resolve(null);
  return fetch('/.netlify/functions/plan', {headers: headers})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if(!data) return null;
      if(data.antropometria) localStorage.setItem('sinaptix_antropometria', JSON.stringify(data.antropometria));
      if(data.objetivo) localStorage.setItem('sinaptix_objetivo', JSON.stringify(data.objetivo));
      if(data.reevaluacion) localStorage.setItem('sinaptix_reevaluacion', JSON.stringify(data.reevaluacion));
      return data;
    })
    .catch(function(err){
      console.warn('No se pudo traer "Mi plan" del servidor (se muestra lo que haya guardado en este navegador):', err);
      return null;
    });
}
