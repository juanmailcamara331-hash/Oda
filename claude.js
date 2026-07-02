// netlify/functions/claude.js
//
// Proxy hacia la API de Anthropic. El navegador NO puede llamar a
// api.anthropic.com directamente (esa API no manda cabeceras CORS para
// peticiones desde el navegador), así que esta función corre en el
// servidor de Netlify, reenvía la petición con la API key que llega en
// la cabecera x-api-key, y devuelve la respuesta tal cual al cliente.
//
// Formato clásico de Netlify Functions (exports.handler) — funciona
// sin necesidad de declarar el proyecto como módulo ES, a diferencia
// del formato con "export default" + "config".

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Método no permitido' } })
    };
  }

  const headers = event.headers || {};
  const apiKey = headers['x-api-key'] || headers['X-Api-Key'] || headers['X-API-KEY'];
  if (!apiKey) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Falta la cabecera x-api-key' } })
    };
  }

  try {
    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': headers['anthropic-version'] || '2023-06-01'
      },
      body: event.body
    });

    const text = await anthropicResp.text();
    return {
      statusCode: anthropicResp.status,
      headers: { 'Content-Type': 'application/json' },
      body: text
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'No se pudo contactar con la API de Anthropic: ' + e.message } })
    };
  }
};
