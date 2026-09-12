// Borra un video guardado, dado su id. Se llama cuando el usuario borra el apunte.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  let id;
  try {
    const body = await req.json();
    id = body.id;
  } catch (e) {
    return new Response("Body inválido", { status: 400 });
  }
  if (!id) return new Response("Falta el id", { status: 400 });

  const store = getStore("videos");
  await store.delete(id);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
};

export const config = { path: "/.netlify/functions/delete-video" };
