"use client";

import { useState } from "react";
import { getPlayer, playMessage, stopPlayback } from "@/lib/krabby/audio";

export function SpeakButton({ messageId }: { messageId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "failed">("idle");

  async function toggle() {
    if (state === "playing" || state === "loading") {
      stopPlayback();
      setState("idle");
      return;
    }
    getPlayer();
    setState("loading");
    try {
      await playMessage(messageId, () => setState("playing"));
      setState("idle");
    } catch {
      setState("failed");
    }
  }

  const label = { idle: "🔊 Listen", loading: "Loading...", playing: "⏹ Stop", failed: "Couldn't play, try again" }[state];

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      }}
      className="mt-1 block text-xs font-medium text-selected-foreground underline"
    >
      {label}
    </button>
  );
}
