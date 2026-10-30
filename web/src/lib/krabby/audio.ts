// Browser audio helpers for the speak button and voice mode.
const clips = new Map<string, string>();

let player: HTMLAudioElement | null = null;

// Create the player during a tap, or some browsers block later playback.
export function getPlayer() {
  player ??= new Audio();
  return player;
}

export function stopPlayback() {
  player?.pause();
}

// Clips are kept for the session, so replaying one doesn't spend credits.
async function fetchClip(messageId: string) {
  const cached = clips.get(messageId);
  if (cached) return cached;
  const response = await fetch("/api/speak", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messageId }),
  });
  if (!response.ok) throw new Error("Speech failed");
  const url = URL.createObjectURL(await response.blob());
  clips.set(messageId, url);
  return url;
}

// Resolves when the clip ends or is stopped.
export async function playMessage(messageId: string, onStart?: () => void) {
  const url = await fetchClip(messageId);
  const audio = getPlayer();
  audio.src = url;
  await audio.play();
  onStart?.();
  await new Promise<void>((resolve) => {
    const done = () => {
      audio.removeEventListener("ended", done);
      audio.removeEventListener("pause", done);
      resolve();
    };
    audio.addEventListener("ended", done);
    audio.addEventListener("pause", done);
  });
}

export async function transcribeAudio(audio: Blob) {
  const form = new FormData();
  form.append("audio", audio);
  const response = await fetch("/api/transcribe", { method: "POST", body: form });
  if (!response.ok) throw new Error("Transcription failed");
  const { text } = (await response.json()) as { text: string };
  return text;
}

const SAMPLE_MS = 100;
const CALIBRATE_MS = 400;
const MIN_LEVEL = 0.015;
const NOISE_FACTOR = 2.5;
const SPEECH_MS = 200;
const SILENCE_MS = 1200;
const MAX_WAIT_MS = 30_000;
const MAX_SPEECH_MS = 30_000;

// Records until the user has spoken and gone quiet. Resolves with null if
// nobody speaks for a while or the signal aborts.
export function recordUntilSilence(stream: MediaStream, signal: AbortSignal) {
  return new Promise<Blob | null>((resolve) => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);

    let elapsed = 0;
    let noiseFloor = 0;
    let loudMs = 0;
    let quietMs = 0;
    let speechMs = 0;
    let spoke = false;

    const finish = (keep: boolean) => {
      clearInterval(timer);
      signal.removeEventListener("abort", onAbort);
      recorder.onstop = () => {
        void context.close();
        resolve(keep && spoke ? new Blob(chunks, { type: recorder.mimeType }) : null);
      };
      recorder.stop();
    };
    const onAbort = () => finish(false);
    signal.addEventListener("abort", onAbort);

    const timer = setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      const level = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
      elapsed += SAMPLE_MS;

      if (elapsed <= CALIBRATE_MS) {
        noiseFloor = Math.max(noiseFloor, level);
        return;
      }

      const loud = level > Math.max(MIN_LEVEL, noiseFloor * NOISE_FACTOR);
      if (!spoke) {
        loudMs = loud ? loudMs + SAMPLE_MS : 0;
        if (loudMs >= SPEECH_MS) spoke = true;
        else if (elapsed >= MAX_WAIT_MS) finish(false);
        return;
      }

      speechMs += SAMPLE_MS;
      quietMs = loud ? 0 : quietMs + SAMPLE_MS;
      if (quietMs >= SILENCE_MS || speechMs >= MAX_SPEECH_MS) finish(true);
    }, SAMPLE_MS);

    recorder.start();
  });
}
