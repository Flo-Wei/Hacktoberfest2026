import { GOAL_TAGS } from "@/lib/options";
import type { Offer } from "@/lib/products";
import type { User } from "@/lib/users";

const HIGH_KCAL = 350;
const HIGH_SUGAR_G = 20;
const LOW_PROTEIN_G = 5;
const SMALL_DISCOUNT = 0.2;
const PRAISE_CHANCE = 0.4;

export const SWIPES_BETWEEN_COMMENTS = 5;

export type Verdict = { kind: "against" | "good"; reason: string };

function nutrition(product: Offer) {
  if (product.kcal === null) return "";
  return ` (per 100 g: ${product.kcal} kcal, ${product.protein_g} g protein, ${product.sugar_g ?? "?"} g sugar)`;
}

// Why a liked product works against a goal, if it does.
function conflict(goal: string, product: Offer) {
  const sweets = product.category === "Sweets & Snacks";
  const sugary = (product.sugar_g ?? 0) >= HIGH_SUGAR_G;
  const heavy = (product.kcal ?? 0) >= HIGH_KCAL;
  const lowProtein = product.protein_g !== null && product.protein_g < LOW_PROTEIN_G;
  const discount = 1 - product.discount_cents / product.regular_cents;

  switch (goal) {
    case "Lose weight":
      return sweets || sugary || heavy;
    case "Build muscle":
    case "Fitness":
      return lowProtein && (sweets || sugary || heavy);
    case "Eat healthy":
      return sweets || sugary || product.category === "Ready Meals";
    case "Save money":
      return discount < SMALL_DISCOUNT;
    default:
      return false;
  }
}

// Decides whether a swipe is worth a comment. The model only writes the line.
export function judgeSwipe(user: User, product: Offer, liked: boolean): Verdict | null {
  const name = `${product.name}${nutrition(product)}`;
  const fits = user.goals.filter((goal) =>
    (GOAL_TAGS[goal] ?? []).some((tag) => product.tags.includes(tag)),
  );

  if (!liked) {
    if (fits.length === 0) return null;
    return { kind: "against", reason: `The user turned down ${name}, which fits their goal "${fits[0]}".` };
  }

  const clash = user.goals.find((goal) => conflict(goal, product));
  if (clash) {
    return { kind: "against", reason: `The user liked ${name}, which works against their goal "${clash}".` };
  }
  if (fits.length > 0 && Math.random() < PRAISE_CHANCE) {
    return { kind: "good", reason: `The user liked ${name}, which fits their goal "${fits[0]}".` };
  }
  return null;
}
