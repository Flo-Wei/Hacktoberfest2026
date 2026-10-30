"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CITIES, GOALS, PREFERENCES } from "@/lib/options";
import { recommendProducts, saveSwipe } from "@/lib/products";
import { clearCurrentUser, requireUser, setCurrentUser } from "@/lib/session";
import {
  addShoppingItem,
  clearShoppingList,
  removeShoppingItem,
  setShoppingItemChecked,
} from "@/lib/shopping-list";
import { createUser, findUserByName, getUser } from "@/lib/users";

// The browser shrinks photos before sending them, so a valid one stays small.
const AVATAR_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
const AVATAR_MAX_LENGTH = 300_000;

export async function register(form: FormData): Promise<string | null> {
  const name = String(form.get("name") ?? "").trim();
  const age = Number(form.get("age"));
  const city = String(form.get("city") ?? "");
  const avatar = String(form.get("avatar") ?? "");

  if (!name) return "Please enter your name.";
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return "Please enter a valid age.";
  }
  if (!CITIES.includes(city)) return "Please choose a city.";
  if (avatar && (avatar.length > AVATAR_MAX_LENGTH || !AVATAR_PATTERN.test(avatar))) {
    return "That photo didn't work. Please try another one.";
  }

  const user = await createUser({
    name,
    age,
    city,
    goals: form.getAll("goals").map(String).filter((g) => GOALS.includes(g)),
    preferences: form
      .getAll("preferences")
      .map(String)
      .filter((p) => PREFERENCES.includes(p)),
    avatar: avatar || null,
  });
  await setCurrentUser(user.id);
  return null;
}

export async function prepareDeck() {
  const user = await requireUser();
  const products = await recommendProducts(user, 500);
  return {
    total: products.length,
    matched: products.filter((product) => product.reason === "profile").length,
  };
}

export async function login(_: string | null, form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return "Please enter your name.";

  const user = await findUserByName(name);
  if (!user) return "We couldn't find that profile. Check the name or create a new one.";

  await setCurrentUser(user.id);
  redirect("/");
}

export async function logout() {
  await clearCurrentUser();
  redirect("/onboarding");
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

// Krabby can't set the cookie from its streamed reply, so the chat calls this afterwards.
export async function switchToPersona(id: string) {
  const user = await getUser(id);
  if (user?.is_mock) await setCurrentUser(user.id);
  redirect("/chat");
}

export async function addListItem(form: FormData) {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  await addShoppingItem(user.id, { name });
  revalidatePath("/list");
}

export async function toggleListItem(itemId: string, checked: boolean) {
  const user = await requireUser();
  await setShoppingItemChecked(user.id, itemId, checked);
  revalidatePath("/list");
}

export async function removeListItem(itemId: string) {
  const user = await requireUser();
  await removeShoppingItem(user.id, itemId);
  revalidatePath("/list");
}

export async function clearCheckedListItems() {
  const user = await requireUser();
  await clearShoppingList(user.id, true);
  revalidatePath("/list");
}
