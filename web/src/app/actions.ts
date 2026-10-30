"use server";

import { redirect } from "next/navigation";
import { cookMeal, recommendCommunityMeal, saveMealVote, type Meal } from "@/lib/meals";
import { CITIES, GOALS, PREFERENCES } from "@/lib/options";
import { saveSwipe } from "@/lib/products";
import { requireUser, setCurrentUser } from "@/lib/session";
import { createUser, getUser } from "@/lib/users";

export async function register(_: string | null, form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const age = Number(form.get("age"));
  const city = String(form.get("city") ?? "");

  if (!name) return "Please enter your name.";
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return "Please enter a valid age.";
  }
  if (!CITIES.includes(city)) return "Please choose a city.";

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

export type MealResult =
  | { meal: Meal; reason: "similar" | "cooked" }
  | { error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_WISH_LENGTH = 200;

// Without a wish, a meal similar users liked comes first. A wish always gets a
// new recipe, because saved meals can't be matched against free text.
export async function requestMeal(shownIds: string[], wish = ""): Promise<MealResult> {
  const user = await requireUser();
  const trimmedWish = wish.trim().slice(0, MAX_WISH_LENGTH);

  try {
    if (!trimmedWish) {
      const meal = await recommendCommunityMeal(user, shownIds.filter((id) => UUID.test(id)));
      if (meal) return { meal, reason: "similar" };
    }
    const meal = await cookMeal(user, trimmedWish);
    if (meal) return { meal, reason: "cooked" };
  } catch (error) {
    console.error("Krabby couldn't make a meal", error);
  }
  return { error: "Krabby burnt that one. Please try again." };
}

export async function recordMealVote(mealId: string, liked: boolean) {
  const user = await requireUser();
  await saveMealVote(user.id, mealId, liked);
}

export async function switchUser(form: FormData) {
  const user = await getUser(String(form.get("id")));
  if (user) await setCurrentUser(user.id);
  redirect("/");
}
