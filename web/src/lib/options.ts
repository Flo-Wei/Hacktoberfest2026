export const CITIES = ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"];

export const GOALS = [
  "Lose weight",
  "Build muscle",
  "Fitness",
  "Eat healthy",
  "Save money",
];

// Product tags that serve each goal. "Save money" has none: the deck always
// ranks bigger discounts first among equal matches.
export const GOAL_TAGS: Record<string, string[]> = {
  "Lose weight": ["Low Carb"],
  "Build muscle": ["High protein"],
  Fitness: ["High protein"],
  "Eat healthy": ["Organic", "Regional"],
};

// Preferences that rule products out instead of only ranking them.
export const DIETS = ["Vegan", "Vegetarian"];

export const PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "High protein",
  "Low Carb",
  "Regional",
  "Organic",
  "Sweet",
  "Quick to cook",
];
