"use client";

import { useEffect, useState } from "react";
import { getPlayer, playMessage, recordUntilSilence, stopPlayback, transcribeAudio } from "@/lib/krabby/audio";
import type { Reply } from "./chat-view";

type Phase = "starting" | "listening" | "thinking" | "speaking" | "failed";

const LABELS: Record<Phase, string> = {
  starting: "Getting ready",
  listening: "Listening, go ahead",
  thinking: "Krabby is thinking",
  speaking: "Krabby is speaking",
  failed: "Krabby can't hear you. Please allow the microphone.",
};

// Listen, reply aloud, repeat. The mic pauses while Krabby speaks so it can't hear itself.
export function VoiceMode({
  send,
  onClose,
}: {
  send: (text: string) => Promise<Reply | null>;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("starting");

  useEffect(() => {
    const stopped = new AbortController();
    const { signal } = stopped;
    let stream: MediaStream | null = null;
    let wakeLock: WakeLockSentinel | null = null;

    async function loop() {
      getPlayer();
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch {
        setPhase("failed");
        return;
      }
      // Closed while the browser was asking for the mic.
      if (signal.aborted) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      wakeLock = await navigator.wakeLock?.request("screen").catch(() => null);

      while (!signal.aborted) {
        setPhase("listening");
        const audio = await recordUntilSilence(stream, signal);
        if (signal.aborted) return;
        if (!audio) continue;

        setPhase("thinking");
        try {
          const text = await transcribeAudio(audio);
          if (!text) continue;
          const reply = await send(text);
          if (signal.aborted || !reply) continue;
          setPhase("speaking");
          await playMessage(reply.messageId);
        } catch (error) {
          console.warn("Voice mode turn failed:", error);
        }
      }
    }

    void loop();
    return () => {
      stopped.abort();
      stopPlayback();
      stream?.getTracks().forEach((track) => track.stop());
      void wakeLock?.release();
    };
    // Runs once for the whole voice session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-md flex-col items-center justify-center gap-6 bg-[#fff7f0] p-6 text-center">
      <span aria-hidden className="text-7xl">
        🦀
      </span>
      <p aria-live="polite" className="text-xl font-semibold">
        {LABELS[phase]}
      </p>
      <button onClick={onClose} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
        End voice mode
      </button>
    </div>
  );
}
