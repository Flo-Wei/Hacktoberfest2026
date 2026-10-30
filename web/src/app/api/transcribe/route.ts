import { transcribe } from "@/lib/krabby/speech";
import { getCurrentUser } from "@/lib/session";

const MAX_AUDIO_BYTES = 10_000_000;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in", { status: 401 });

  const audio = (await request.formData()).get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) return new Response("No audio", { status: 400 });
  if (audio.size > MAX_AUDIO_BYTES) return new Response("Recording too long", { status: 413 });

  try {
    return Response.json({ text: await transcribe(audio) });
  } catch (error) {
    console.error(error);
    return new Response("Transcription failed", { status: 502 });
  }
}
