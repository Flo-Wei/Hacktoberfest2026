const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-4-31b-it:free";
const TIMEOUT_MS = 60_000;

export function hasOpenRouterKey() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function askGemma(prompt: string) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`OpenRouter answered with ${response.status}`);

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("OpenRouter sent no text");
  return text;
}
