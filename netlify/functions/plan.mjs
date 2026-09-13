// Lee y escribe los 3 bloques de datos de "Mi plan" (antropometría,
// objetivo/plan de nutrición, reevaluación) en Netlify Database, asociados
// al usuario autenticado vía Netlify Identity. Ver memoria.md, sección
// "Backend real para Mi plan", para el porqué de este diseño y su
// contraparte en el cliente (js/plan-sync.js).
//
// **Por qué este archivo es `.mjs` con `export default` (formato moderno de
// Netlify Functions) y no `.js` con `exports.handler` (formato clásico /
// "Lambda compatibility mode")**: con la firma clásica, Netlify Database
// NUNCA inyecta la connection string al runtime de la función (lo
// documenta Netlify explícitamente: "Functions in Lambda compatibility
// mode... is the only platform primitive where you're responsible for
// passing the connection string yourself") — eso causaba
// `MissingDatabaseConnectionError` en cada invocación aunque la base ya
// estuviera provisionada y el deploy log confirmara el provisioning. La
// única forma soportada de que `getDatabase()` funcione sin pasarle una
// connection string a mano es usar el formato moderno.
//
// Autenticación: `getUser()` de `@netlify/identity` lee el header
// `Authorization: Bearer <access_token>` de la request entrante (lo manda
// `js/plan-sync.js`) y devuelve el usuario ya verificado, o `null` si no
// hay sesión — reemplaza a `context.clientContext.user` del formato
// clásico, que ya no se usa en este archivo. `user.id` es el identificador
// único del usuario (el mismo valor que el JWT clásico exponía como
// `sub`).
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
// Netlify aplica solo durante el deploy (el runtime de la función nunca
// corre DDL).
import { getUser } from '@netlify/identity';
import { getDatabase } from '@netlify/database';

const TIPOS_VALIDOS = ['antropometria', 'objetivo', 'reevaluacion'];

export default async (req, context) => {
  const user = await getUser();
  if(!user){
    return Response.json({error: 'No hay sesión iniciada.'}, {status: 401});
  }

  const db = getDatabase();

  if(req.method === 'GET'){
    // Tagged template de db.sql: los valores interpolados (acá, user.id)
    // se bindean como parámetros reales, no se concatenan en el texto de
    // la query — seguro para valores, no para nombres de columna (ver el
    // POST más abajo, donde `tipo` sí es un nombre de columna dinámico).
    const filas = await db.sql`
      SELECT antropometria, objetivo, reevaluacion
      FROM mi_plan
      WHERE user_id = ${user.id}
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
    return Response.json(resultado);
  }

  if(req.method === 'POST'){
    let body;
    try{ body = await req.json(); }
    catch(err){ return Response.json({error: 'JSON inválido.'}, {status: 400}); }

    const tipo = body.tipo;
    const datos = body.datos;
    if(!TIPOS_VALIDOS.includes(tipo)){
      return Response.json({error: 'tipo inválido. Debe ser uno de: '+TIPOS_VALIDOS.join(', ')}, {status: 400});
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
        [user.id, user.email, JSON.stringify(datos)]
      );
    } finally {
      client.release();
    }

    return Response.json({ok: true});
  }

  return Response.json({error: 'Método no soportado.'}, {status: 405});
};
