export const CITIES = ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck"];

export const GOALS = [
  "Abnehmen",
  "Muskelaufbau",
  "Fitness",
  "Gesund essen",
  "Geld sparen",
];

// Product tags that serve each goal. "Geld sparen" has none: the deck always
// ranks bigger discounts first among equal matches.
export const GOAL_TAGS: Record<string, string[]> = {
  Abnehmen: ["Low Carb"],
  Muskelaufbau: ["Proteinreich"],
  Fitness: ["Proteinreich"],
  "Gesund essen": ["Bio", "Regional"],
};

// Preferences that rule products out instead of only ranking them.
export const DIETS = ["Vegan", "Vegetarisch"];

export const PREFERENCES = [
  "Vegetarisch",
  "Vegan",
  "Proteinreich",
  "Low Carb",
  "Regional",
  "Bio",
  "Süßes",
  "Schnell kochen",
];
