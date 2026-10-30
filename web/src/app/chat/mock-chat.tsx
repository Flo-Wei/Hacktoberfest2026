"use client";

import { useState } from "react";

type Message = { from: "krabby" | "user"; text: string };

// Canned replies until Krabby is connected to Gemma.
const MOCK_REPLY = "I'm still a mock. Soon I'll know all the offers for you!";

export function MockChat({ name }: { name: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { from: "krabby", text: `Hi ${name}, I'm Krabby!` },
  ]);
  const [draft, setDraft] = useState("");

  function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages([...messages, { from: "user", text }, { from: "krabby", text: MOCK_REPLY }]);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Krabby (Mock)</h1>
      <ul className="space-y-2">
        {messages.map((message, index) => (
          <li
            key={index}
            className={
              message.from === "user"
                ? "ml-8 rounded-lg bg-orange-600 p-3 text-white"
                : "mr-8 rounded-lg bg-white p-3"
            }
          >
            {message.text}
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message Krabby"
          aria-label="Message Krabby"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
        <button className="rounded-lg bg-orange-600 px-4 font-semibold text-white">Send</button>
      </form>
    </div>
  );
}
