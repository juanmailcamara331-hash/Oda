// netlify/functions/claude.js
//
// Proxy hacia la API de Anthropic. El navegador NO puede llamar a
// api.anthropic.com directamente (esa API no manda cabeceras CORS para
// peticiones desde el navegador), así que esta función corre en el
// servidor de Netlify, reenvía la petición con la API key que llega en
// la cabecera x-api-key, y devuelve la respuesta tal cual al cliente.
//
// El frontend debe llamar a POST /api/claude con el mismo body y la
// misma cabecera x-api-key que antes usaba para api.anthropic.com.

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Método no permitido' } }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: 'Falta la cabecera x-api-key' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.text();
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: 'Body inválido' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let anthropicResp;
  try {
    anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': req.headers.get('anthropic-version') || '2023-06-01'
      },
      body
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: 'No se pudo contactar con la API de Anthropic: ' + e.message } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const responseText = await anthropicResp.text();
  return new Response(responseText, {
    status: anthropicResp.status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = {
  path: '/api/claude'
};
