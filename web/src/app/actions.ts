"use server";

import { redirect } from "next/navigation";
import { CITIES, GOALS, PREFERENCES } from "@/lib/options";
import { saveSwipe } from "@/lib/products";
import { requireUser, setCurrentUser } from "@/lib/session";
import { createUser, getUser } from "@/lib/users";

export async function register(_: string | null, form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const age = Number(form.get("age"));
  const city = String(form.get("city") ?? "");

  if (!name) return "Bitte gib deinen Namen ein.";
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return "Bitte gib ein gültiges Alter ein.";
  }
  if (!CITIES.includes(city)) return "Bitte wähle eine Stadt aus.";

  const user = await createUser({
    name,
    age,
    city,
    goals: form.getAll("goals").map(String).filter((g) => GOALS.includes(g)),
    preferences: form
      .getAll("preferences")
      .map(String)
      .filter((p) => PREFERENCES.includes(p)),
  });
  await setCurrentUser(user.id);
  redirect("/");
}

export async function recordSwipe(productId: string, liked: boolean) {
  const user = await requireUser();
  await saveSwipe(user.id, productId, liked);
}

export async function switchUser(form: FormData) {
  const user = await getUser(String(form.get("id")));
  if (user) await setCurrentUser(user.id);
  redirect("/");
}
