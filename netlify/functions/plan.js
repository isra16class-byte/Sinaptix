// Lee y escribe los 3 bloques de datos de "Mi plan" (antropometría,
// objetivo/plan de nutrición, reevaluación) en Netlify Database, asociados
// al usuario autenticado vía Netlify Identity. Ver memoria.md, sección
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
//
// La tabla `mi_plan` NO se crea acá: vive en
// netlify/database/migrations/20260913231933_create_mi_plan.sql, que
// Netlify aplica solo durante el deploy (ver "CRITICAL: Never apply
// migrations to a Netlify-hosted database" en la guía de Netlify Database
// — el runtime de la función nunca corre DDL).
const { getDatabase } = require('@netlify/database');

const TIPOS_VALIDOS = ['antropometria', 'objetivo', 'reevaluacion'];

exports.handler = async function(event, context){
  const user = context.clientContext && context.clientContext.user;
  if(!user){
    return {statusCode: 401, body: JSON.stringify({error: 'No hay sesión iniciada.'})};
  }

  const db = getDatabase();

  if(event.httpMethod === 'GET'){
    // Tagged template de db.sql: los valores interpolados (acá, user.sub)
    // se bindean como parámetros reales, no se concatenan en el texto de
    // la query — seguro para valores, no para nombres de columna (ver el
    // POST más abajo, donde `tipo` sí es un nombre de columna dinámico).
    const filas = await db.sql`
      SELECT antropometria, objetivo, reevaluacion
      FROM mi_plan
      WHERE user_id = ${user.sub}
    `;
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

    // El nombre de columna (`tipo`) no se puede bindear como parámetro de
    // un tagged template (los placeholders de db.sql son para VALORES, no
    // para identificadores) — por eso este INSERT/UPDATE se arma con
    // db.pool (pg.Pool crudo, mismo mecanismo que usa el ejemplo de
    // transacciones de la doc de Netlify Database) y placeholders
    // numerados ($1/$2/$3) solo para los valores reales. El nombre de
    // columna interpolado en el texto siempre viene de TIPOS_VALIDOS de
    // arriba, nunca directo del body, así que no es una inyección SQL: ya
    // se validó contra esa lista fija antes de llegar acá.
    const client = await db.pool.connect();
    try{
      await client.query(
        'INSERT INTO mi_plan (user_id, email, '+tipo+', updated_at) '+
        'VALUES ($1, $2, $3, now()) '+
        'ON CONFLICT (user_id) DO UPDATE SET '+tipo+' = $3, email = $2, updated_at = now()',
        [user.sub, user.email, JSON.stringify(datos)]
      );
    } finally {
      client.release();
    }

    return {statusCode: 200, body: JSON.stringify({ok: true})};
  }

  return {statusCode: 405, body: JSON.stringify({error: 'Método no soportado.'})};
};
