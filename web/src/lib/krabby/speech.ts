const API = "https://api.elevenlabs.io/v1";
const TTS_MODEL = "eleven_flash_v2_5";
const STT_MODEL = "scribe_v2";
// A deep voice from the ElevenLabs library, until the final one is chosen.
const DEFAULT_VOICE = "pNInz6obpgDQGcFmaJgB";

function headers() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
  return { "xi-api-key": key };
}

export async function synthesize(text: string) {
  const voice = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  const response = await fetch(`${API}/text-to-speech/${voice}/stream?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { ...headers(), "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: TTS_MODEL }),
  });
  if (!response.ok || !response.body) {
    throw new Error(`Text to speech failed with ${response.status}: ${await response.text()}`);
  }
  return response.body;
}

export async function transcribe(audio: Blob) {
  const form = new FormData();
  form.append("file", audio, "speech.webm");
  form.append("model_id", STT_MODEL);
  form.append("tag_audio_events", "false");
  const response = await fetch(`${API}/speech-to-text`, { method: "POST", headers: headers(), body: form });
  if (!response.ok) {
    throw new Error(`Speech to text failed with ${response.status}: ${await response.text()}`);
  }
  const { text } = (await response.json()) as { text?: string };
  return text?.trim() ?? "";
}
