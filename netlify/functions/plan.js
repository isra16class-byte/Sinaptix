// Lee y escribe los 3 bloques de datos de "Mi plan" (antropometría,
// objetivo/plan de nutrición, reevaluación) en Netlify DB, asociados al
// usuario autenticado vía Netlify Identity. Ver memoria.md, sección
// "Backend real para Mi plan", para el porqué de este diseño y su
// contraparte en el cliente (js/plan-sync.js).
//
// Autenticación: Netlify decodifica el JWT de Identity automáticamente
// cuando el cliente manda el header "Authorization: Bearer <access_token>"
// (lo hace js/plan-sync.js) y deja el usuario ya verificado en
// `context.clientContext.user` — no hace falta validar la firma a mano acá,
// eso ya lo hizo Netlify antes de invocar la función. Sin ese header (o sin
// sesión iniciada), `user` viene undefined y devolvemos 401.
//
// GET  -> devuelve {antropometria, objetivo, reevaluacion} del usuario
//         (cualquier bloque que no se haya guardado todavía viene ausente,
//         no null, para no pisar nada del lado del cliente — ver
//         planSyncCargar en js/plan-sync.js).
// POST -> body {tipo: 'antropometria'|'objetivo'|'reevaluacion', datos}
//         guarda/actualiza SOLO ese bloque, sin tocar los otros dos que ya
//         tuviera guardados ese usuario (cada formulario del sitio llama a
//         esto en momentos distintos).
const { neon } = require('@netlify/neon');

const TIPOS_VALIDOS = ['antropometria', 'objetivo', 'reevaluacion'];

// CREATE TABLE IF NOT EXISTS en cada invocación en vez de una migración
// aparte: no hay build step ni herramienta de migraciones en este repo
// (sitio 100% estático), y la tabla es de un registro por usuario, así que
// el costo de este chequeo en cada request es despreciable. Si el esquema
// crece (más columnas, índices, relaciones con otras tablas), conviene
// pasar a una migración real con drizzle-kit — ver la guía de Netlify DB.
async function ensureTabla(sql){
  await sql(`
    CREATE TABLE IF NOT EXISTS mi_plan (
      user_id text PRIMARY KEY,
      email text,
      antropometria jsonb,
      objetivo jsonb,
      reevaluacion jsonb,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

exports.handler = async function(event, context){
  const user = context.clientContext && context.clientContext.user;
  if(!user){
    return {statusCode: 401, body: JSON.stringify({error: 'No hay sesión iniciada.'})};
  }

  const sql = neon();
  await ensureTabla(sql);

  if(event.httpMethod === 'GET'){
    const filas = await sql(
      'SELECT antropometria, objetivo, reevaluacion FROM mi_plan WHERE user_id = $1',
      [user.sub]
    );
    const fila = filas[0];
    // Solo se devuelven los bloques que existen de verdad (columna no
    // nula) — si el usuario nunca guardó una reevaluación, por ejemplo,
    // esa clave ni aparece en la respuesta, para que planSyncCargar no
    // pise el localStorage con un null.
    const resultado = {};
    if(fila){
      if(fila.antropometria != null) resultado.antropometria = fila.antropometria;
      if(fila.objetivo != null) resultado.objetivo = fila.objetivo;
      if(fila.reevaluacion != null) resultado.reevaluacion = fila.reevaluacion;
    }
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(resultado)
    };
  }

  if(event.httpMethod === 'POST'){
    let body;
    try{ body = JSON.parse(event.body || '{}'); }
    catch(err){ return {statusCode: 400, body: JSON.stringify({error: 'JSON inválido.'})}; }

    const tipo = body.tipo;
    const datos = body.datos;
    if(!TIPOS_VALIDOS.includes(tipo)){
      return {statusCode: 400, body: JSON.stringify({error: 'tipo inválido. Debe ser uno de: '+TIPOS_VALIDOS.join(', ')})};
    }

    // El nombre de columna interpolado (${tipo}) viene siempre del array
    // TIPOS_VALIDOS de arriba, nunca directo del body — no es una inyección
    // SQL porque ya se validó contra esa lista fija antes de llegar acá.
    await sql(
      'INSERT INTO mi_plan (user_id, email, '+tipo+', updated_at) '+
      'VALUES ($1, $2, $3, now()) '+
      'ON CONFLICT (user_id) DO UPDATE SET '+tipo+' = $3, email = $2, updated_at = now()',
      [user.sub, user.email, JSON.stringify(datos)]
    );

    return {statusCode: 200, body: JSON.stringify({ok: true})};
  }

  return {statusCode: 405, body: JSON.stringify({error: 'Método no soportado.'})};
};
