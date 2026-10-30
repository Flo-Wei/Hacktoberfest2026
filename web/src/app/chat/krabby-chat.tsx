"use client";

import { useState } from "react";
import { requestMeal } from "@/app/actions";
import type { Meal } from "@/lib/meals";
import { MealCard } from "./meal-card";

type Message =
  | { from: "krabby" | "user"; text: string; meal?: undefined }
  | { from: "krabby"; text: string; meal: Meal };

function introduce(meal: Meal, reason: "similar" | "cooked") {
  if (reason === "similar") return "People with similar tastes liked this one:";
  if (meal.source === "mock") return "No OpenRouter key yet, so here's a simple mock recipe:";
  return "Fresh out of my kitchen:";
}

export function KrabbyChat({ name }: { name: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { from: "krabby", text: `Hi ${name}, I'm Krabby! Tell me what you feel like, or let me pick a meal.` },
  ]);
  const [draft, setDraft] = useState("");
  const [cooking, setCooking] = useState(false);

  async function ask(wish: string, userText: string) {
    if (cooking) return;
    const shownIds = messages.flatMap((message) => (message.meal ? [message.meal.id] : []));
    setMessages((current) => [...current, { from: "user", text: userText }]);
    setCooking(true);

    let reply: Message;
    try {
      const result = await requestMeal(shownIds, wish);
      reply =
        "error" in result
          ? { from: "krabby", text: result.error }
          : { from: "krabby", text: introduce(result.meal, result.reason), meal: result.meal };
    } catch {
      reply = { from: "krabby", text: "I couldn't reach the kitchen. Please try again." };
    }
    setMessages((current) => [...current, reply]);
    setCooking(false);
  }

  function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || cooking) return;
    setDraft("");
    void ask(text, text);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Krabby</h1>
      <ul className="space-y-2">
        {messages.map((message, index) => (
          <li key={index} className="space-y-2">
            <p
              className={
                message.from === "user"
                  ? "ml-8 rounded-lg bg-orange-600 p-3 text-white"
                  : "mr-8 rounded-lg bg-white p-3"
              }
            >
              {message.text}
            </p>
            {message.meal && <MealCard meal={message.meal} />}
          </li>
        ))}
        {cooking && <li className="mr-8 rounded-lg bg-white p-3 text-stone-600">Krabby is cooking...</li>}
      </ul>
      <button
        onClick={() => ask("", "Suggest a meal")}
        disabled={cooking}
        className="w-full rounded-lg border border-orange-600 bg-white py-2 font-semibold text-orange-600 disabled:opacity-60"
      >
        Suggest a meal
      </button>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Something quick with chicken"
          aria-label="Message Krabby"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
        {/* Placeholder for speech to text. */}
        <button
          type="button"
          disabled
          title="Speech to text is coming later"
          aria-label="Speech to text is coming later"
          className="rounded-lg border border-stone-300 bg-white px-3 opacity-60"
        >
          🎤
        </button>
        <button disabled={cooking} className="rounded-lg bg-orange-600 px-4 font-semibold text-white disabled:opacity-60">
          Send
        </button>
      </form>
    </div>
  );
}
