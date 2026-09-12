// Recibe un video (POST, body binario) y lo guarda en Netlify Blobs.
// Devuelve { id } — ese id es lo único que hace falta guardar en el storage de notas.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const contentType = req.headers.get("content-type") || "video/webm";
  const arrayBuffer = await req.arrayBuffer();

  // límite de seguridad: 45MB (generoso, pero evita subidas descontroladas)
  const MAX_BYTES = 45 * 1024 * 1024;
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "video demasiado pesado (máx 45MB)" }), {
      status: 413,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getStore("videos");
  const id = crypto.randomUUID();
  await store.set(id, arrayBuffer, { metadata: { contentType } });

  return new Response(JSON.stringify({ id }), {
    headers: { "content-type": "application/json" },
  });
};

export const config = { path: "/.netlify/functions/save-video" };
