"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { switchToPersona } from "@/app/actions";
import { SpeakButton } from "@/components/speak-button";
import { transcribeAudio } from "@/lib/krabby/audio";
import type { Photo, TurnEvent } from "@/lib/krabby/agent";
import type { ChatMessage } from "@/lib/chats";
import { VoiceMode } from "./voice-mode";

const MAX_PHOTO_SIDE = 1280;

type Shown = Pick<ChatMessage, "id" | "role" | "content" | "has_photo">;

export type Reply = { messageId: string; text: string };

// Keeps photos well below the upload limit, and the model doesn't need more detail.
async function preparePhoto(file: File): Promise<Photo> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return { mimeType: "image/jpeg", data: canvas.toDataURL("image/jpeg", 0.85).split(",")[1] };
}

export function ChatView({
  name,
  chatId: initialChatId,
  initialMessages,
}: {
  name: string;
  chatId: string | null;
  initialMessages: Shown[];
}) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [streamed, setStreamed] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const chatRef = useRef(chatId);

  useEffect(() => {
    // Leave the browser at a linked comment on first load.
    if (!hasScrolled.current && window.location.hash) {
      hasScrolled.current = true;
      return;
    }
    hasScrolled.current = true;
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, streamed, status]);

  async function send(text: string, attached: Photo | null = null, voice = false): Promise<Reply | null> {
    const local = `local-${Date.now()}`;
    setMessages((current) => [...current, { id: local, role: "user", content: text, has_photo: Boolean(attached) }]);
    setBusy(true);
    setError(null);
    setStatus("Thinking");
    setStreamed("");

    let reply: Reply | null = null;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chatId: chatRef.current, text, photo: attached, voice }),
      });
      if (!response.ok || !response.body) throw new Error(await response.text());

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as TurnEvent | { type: "chat"; chatId: string };
          if (event.type === "chat") {
            chatRef.current = event.chatId;
            setChatId(event.chatId);
          } else if (event.type === "status") {
            setStatus(event.text);
          } else if (event.type === "text") {
            setStatus(null);
            setStreamed((current) => current + event.delta);
          } else if (event.type === "reset") {
            setStreamed(event.text);
          } else if (event.type === "error") {
            setError(event.message);
          } else if (event.type === "done") {
            reply = { messageId: event.messageId, text: event.text };
            const { messageId } = event;
            setMessages((current) => [
              ...current,
              { id: messageId, role: "krabby", content: event.text, has_photo: false },
            ]);
            if (event.switchTo) await switchToPersona(event.switchTo);
          }
        }
      }
    } catch {
      setError("Krabby couldn't be reached. Please try again.");
    }
    setStreamed("");
    setStatus(null);
    setBusy(false);
    return reply;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !photo) || busy) return;
    const attached = photo;
    setDraft("");
    setPhoto(null);
    await send(text, attached);
  }

  async function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setPhoto(await preparePhoto(file));
    } catch {
      setError("That photo couldn't be read.");
    }
  }

  async function toggleRecording() {
    if (recorder) {
      recorder.stop();
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Krabby can't hear you. Please allow the microphone.");
      return;
    }
    const next = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    next.ondataavailable = (event) => chunks.push(event.data);
    next.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      setRecorder(null);
      setStatus("Listening back");
      try {
        const text = await transcribeAudio(new Blob(chunks, { type: next.mimeType }));
        setStatus(null);
        if (text) await send(text);
      } catch {
        setStatus(null);
        setError("That recording didn't work. Please try again.");
      }
    };
    next.start();
    setRecorder(next);
  }

  async function startNewChat() {
    await fetch("/api/chats/new", { method: "POST" });
    router.push("/chat");
    router.refresh();
    if (window.location.pathname === "/chat") {
      chatRef.current = null;
      setChatId(null);
      setMessages([]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Krabby</h1>
        <div className="flex gap-3 text-sm text-stone-600">
          <button type="button" onClick={() => void startNewChat()} className="underline">
            New chat
          </button>
          <Link href="/chat/history" className="underline">
            Past chats
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {messages.length === 0 && (
          <li className="mr-8 rounded-lg bg-white p-3">Hey {name}, I&apos;m Krabby! Ask me about offers, send me a product photo, or tell me what to put on your list.</li>
        )}
        {messages.map((message) =>
          message.role === "event" ? (
            <li key={message.id} className="text-center text-xs text-stone-600">
              {message.content}
            </li>
          ) : (
            <li
              key={message.id}
              id={`message-${message.id}`}
              className={
                message.role === "user"
                  ? "ml-8 whitespace-pre-wrap rounded-lg bg-orange-600 p-3 text-white"
                  : "mr-8 whitespace-pre-wrap rounded-lg bg-white p-3"
              }
            >
              {message.has_photo && <span className="block text-sm opacity-80">📷 Photo</span>}
              {message.content}
              {message.role === "krabby" && <SpeakButton messageId={message.id} />}
            </li>
          ),
        )}
        {streamed && <li className="mr-8 whitespace-pre-wrap rounded-lg bg-white p-3">{streamed}</li>}
        {status && (
          <li aria-live="polite" className="mr-8 text-sm text-stone-600">
            🦀 {status}...
          </li>
        )}
      </ul>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <div ref={bottom} />

      <div className="sticky bottom-12 space-y-2 bg-[#fff7f0] py-2">
        {photo && (
          <p className="flex items-center justify-between rounded-lg bg-orange-100 px-3 py-1 text-sm">
            📷 Photo attached
            <button type="button" onClick={() => setPhoto(null)} className="underline">
              Remove
            </button>
          </p>
        )}
        <form onSubmit={(event) => void submit(event)} className="flex gap-2">
          <label className="flex cursor-pointer items-center rounded-lg border border-stone-300 bg-white px-3" aria-label="Add a photo">
            📷
            <input type="file" accept="image/*" onChange={(event) => void choosePhoto(event)} className="hidden" />
          </label>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={recorder ? "Listening..." : "Message Krabby"}
            aria-label="Message Krabby"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
          />
          {draft.trim() || photo ? (
            <button disabled={busy} className="rounded-lg bg-orange-600 px-4 font-semibold text-white disabled:opacity-60">
              Send
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggleRecording()}
              aria-label={recorder ? "Stop recording" : "Record a voice message"}
              className="rounded-lg border border-stone-300 bg-white px-3 disabled:opacity-60"
            >
              {recorder ? "⏹" : "🎤"}
            </button>
          )}
        </form>
        <button type="button" disabled={busy} onClick={() => setVoiceMode(true)} className="text-sm text-stone-600 underline disabled:opacity-60">
          Hands-free voice mode
        </button>
        <p className="text-xs text-stone-600">
          Contains data from{" "}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline">
            Open Food Facts
          </a>{" "}
          under the{" "}
          <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="underline">
            Open Database License
          </a>
          .
        </p>
      </div>

      {voiceMode && <VoiceMode send={(text) => send(text, null, true)} onClose={() => setVoiceMode(false)} />}
    </div>
  );
}
