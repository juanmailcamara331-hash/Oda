// Devuelve el video guardado por save-video.js, dado su id.
// Se puede usar directo como src="/.netlify/functions/get-video?id=..." en un <video>.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("Falta el id", { status: 400 });

  const store = getStore("videos");
  const blob = await store.get(id, { type: "arrayBuffer" });
  if (!blob) return new Response("No encontrado", { status: 404 });

  const meta = await store.getMetadata(id);
  const contentType = (meta && meta.metadata && meta.metadata.contentType) || "video/webm";

  return new Response(blob, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

export const config = { path: "/.netlify/functions/get-video" };
