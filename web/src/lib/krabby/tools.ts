import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { FunctionDefinition } from "openai/resources/shared";
import { searchMessages } from "@/lib/chats";
import { cookMeal, recommendCommunityMeal, type Meal } from "@/lib/meals";
import { CITIES, GOALS, PREFERENCES } from "@/lib/options";
import {
  findOffer,
  listSwipes,
  recommendProducts,
  savePhotoProduct,
  saveSwipe,
  searchOffers,
  type Offer,
} from "@/lib/products";
import {
  addShoppingItem,
  clearShoppingList,
  findShoppingItems,
  listShoppingItems,
  removeShoppingItem,
  setShoppingItemChecked,
} from "@/lib/shopping-list";
import { listStores } from "@/lib/stores";
import { listMockUsers, updateUser, type User } from "@/lib/users";

// The user always comes from the session, so no tool can reach another user's data.
export type ToolContext = { user: User; chatId: string };

export type ToolOutcome = {
  result: unknown;
  // Saved with the reply, so Krabby remembers what it changed.
  action?: string;
  switchTo?: string;
  // Shown as a card below the reply.
  meal?: Meal;
};

type Args = Record<string, unknown>;

type Tool = {
  declaration: FunctionDefinition;
  // Shown to the user while the tool runs.
  status: string;
  run: (args: Args, context: ToolContext) => Promise<ToolOutcome>;
};

const euros = (cents: number) => `€${(cents / 100).toFixed(2)}`;

// One line per product, because every step of a turn resends these results.
function offerLine(offer: Offer) {
  const percent = Math.round((1 - offer.discount_cents / offer.regular_cents) * 100);
  const nutrition =
    offer.kcal === null ? "" : ` | ${offer.kcal} kcal, ${offer.protein_g}g protein, ${offer.sugar_g ?? "?"}g sugar`;
  return `${offer.name} | ${offer.store} | ${offer.unit} | ${euros(offer.discount_cents)} (-${percent}%)${nutrition}`;
}

const MAX_PAST_MESSAGE_CHARS = 200;

// Gemma sometimes passes a whole line from get_offers as the name.
const productName = (value: unknown) => text(value)?.split(" | ")[0].trim();

async function resolveProduct(args: Args) {
  const name = productName(args.name);
  const store = text(args.store);
  return name && store ? findOffer(name, store) : null;
}

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const number = (value: unknown) => (typeof value === "number" ? value : undefined);
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined;

async function resolveListItem(userId: string, name: unknown) {
  const matches = await findShoppingItems(userId, productName(name) ?? "");
  if (matches.length === 0) return { error: "Nothing like that on the list" };
  if (matches.length > 1) return { error: "Several items match", matches: matches.map((item) => item.name) };
  return matches[0];
}

const TOOLS: Tool[] = [
  {
    status: "Cooking something up",
    declaration: {
      name: "suggest_meal",
      description:
        "Suggest a full recipe from current offers, shown to the user as a card with ingredients, steps and a shopping list. Use whenever the user wants a meal or recipe.",
      parameters: {
        type: "object",
        properties: {
          wish: { type: "string", description: "What the user feels like, for example something quick with chicken" },
        },
      },
    },
    run: async (args, { user }) => {
      const wish = text(args.wish) ?? "";
      const meal = (wish ? null : await recommendCommunityMeal(user, [])) ?? (await cookMeal(user, wish));
      if (!meal) return { result: { error: "Couldn't make a meal" } };
      return {
        result: { title: meal.title, minutes: meal.minutes, note: "The user sees the full recipe as a card, so don't repeat it." },
        action: `Suggested the meal ${meal.title}`,
        meal,
      };
    },
  },
  {
    status: "Checking the offers",
    declaration: {
      name: "get_offers",
      description:
        "Search current offers at stores in the user's city. Every product in the catalog is an offer. Use with no filters for all offers.",
      parameters: {
        type: "object",
        properties: {
          store: { type: "string", description: "Store chain, for example Hofer, Billa or Spar" },
          category: {
            type: "string",
            description:
              "One of: Bakery, Dairy, Drinks, Fruit & Vegetables, Meat & Fish, Pantry, Ready Meals, Sweets & Snacks, Vegan & Vegetarian",
          },
          search: { type: "string", description: "One German word from the product name, such as Huhn, Milch or Joghurt" },
          max_distance_km: { type: "number", description: "Only stores within this distance" },
        },
      },
    },
    run: async (args, { user }) => {
      const offers = await searchOffers(user.city, {
        store: text(args.store),
        category: text(args.category),
        search: text(args.search),
        maxDistanceKm: number(args.max_distance_km),
      });
      const nearest = new Map(offers.map((offer) => [offer.store, offer]));
      return {
        result: {
          format: "name | store | unit | price (discount) | per 100 g",
          offers: offers.map(offerLine),
          ...(offers.length === 0 && { hint: "Nothing matched. Try a shorter word, or a category instead." }),
          nearest_stores: [...nearest.values()].map(
            (offer) => `${offer.nearest_store}, ${offer.nearest_km} km`,
          ),
        },
      };
    },
  },
  {
    status: "Finding stores nearby",
    declaration: {
      name: "list_stores",
      description: "List store branches in the user's city, nearest first.",
      parameters: {
        type: "object",
        properties: {
          store: { type: "string", description: "Store chain, for example Hofer" },
          max_distance_km: { type: "number" },
        },
      },
    },
    run: async (args, { user }) => {
      const stores = await listStores(user.city, {
        store: text(args.store),
        maxDistanceKm: number(args.max_distance_km),
      });
      return { result: { stores: stores.map((store) => `${store.name}, ${store.distance_km} km`) } };
    },
  },
  {
    status: "Picking products for you",
    declaration: {
      name: "get_swipe_suggestions",
      description:
        "Get the next products the user hasn't swiped yet, ranked by what similar users like and by their profile. These are the same products as the Swipe page.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "How many, 5 by default" } },
      },
    },
    run: async (args, { user }) => {
      const products = await recommendProducts(user, number(args.limit) ?? 5);
      return {
        result: {
          products: products.map(
            (product) =>
              `${product.name} | ${product.store} | ${euros(product.discount_cents)} | ${product.reason}`,
          ),
        },
      };
    },
  },
  {
    status: "Saving your swipe",
    declaration: {
      name: "record_swipe",
      description:
        "Record that the user likes or dislikes a catalog product, the same as swiping it on the Swipe page.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Exact product name from the catalog" },
          store: { type: "string" },
          liked: { type: "boolean" },
        },
        required: ["name", "store", "liked"],
      },
    },
    run: async (args, { user }) => {
      const product = await resolveProduct(args);
      if (!product) return { result: { error: "No catalog product with that name and store" } };
      const liked = args.liked === true;
      await saveSwipe(user.id, product.id, liked);
      return {
        result: { saved: true },
        action: `${liked ? "Liked" : "Disliked"} ${product.name} from ${product.store}`,
      };
    },
  },
  {
    status: "Looking at your swipes",
    declaration: {
      name: "get_swipe_history",
      description: "List products the user liked or disliked, newest first, including liked product photos.",
      parameters: {
        type: "object",
        properties: {
          liked: { type: "boolean", description: "Only likes (true) or only dislikes (false)" },
          limit: { type: "number" },
        },
      },
    },
    run: async (args, { user }) => {
      const swipes = await listSwipes(user.id, {
        liked: typeof args.liked === "boolean" ? args.liked : undefined,
        limit: number(args.limit),
      });
      return {
        result: {
          swipes: swipes.map(
            (swipe) =>
              `${swipe.liked ? "liked" : "disliked"} ${swipe.name}${swipe.store ? ` (${swipe.store})` : ""}${swipe.source === "photo" ? " from a photo" : ""}`,
          ),
        },
      };
    },
  },
  {
    status: "Saving your product",
    declaration: {
      name: "save_photo_product",
      description:
        "Save a photographed product as a like when it isn't in the catalog. If it is, use record_swipe instead.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name as printed on the package" },
          category: { type: "string" },
        },
        required: ["name"],
      },
    },
    run: async (args, { user }) => {
      const name = productName(args.name);
      if (!name) return { result: { error: "A product name is required" } };
      await savePhotoProduct(user.id, name, text(args.category));
      return { result: { saved: true }, action: `Saved ${name} as a liked product` };
    },
  },
  {
    status: "Updating your profile",
    declaration: {
      name: "update_profile",
      description:
        "Change the user's profile. Only pass what changes. goals and preferences replace the whole list, so include the existing values you want to keep.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
          city: { type: "string", enum: CITIES },
          goals: { type: "array", items: { type: "string", enum: GOALS } },
          preferences: { type: "array", items: { type: "string", enum: PREFERENCES } },
        },
      },
    },
    run: async (args, context) => {
      const age = number(args.age);
      const city = text(args.city);
      if (age !== undefined && (!Number.isInteger(age) || age < 1 || age > 120)) {
        return { result: { error: "Age must be between 1 and 120" } };
      }
      if (city && !CITIES.includes(city)) {
        return { result: { error: `City must be one of ${CITIES.join(", ")}` } };
      }
      const changes = {
        name: text(args.name),
        age,
        city,
        goals: strings(args.goals)?.filter((goal) => GOALS.includes(goal)),
        preferences: strings(args.preferences)?.filter((item) => PREFERENCES.includes(item)),
      };
      context.user = await updateUser(context.user.id, changes);
      const changed = Object.keys(changes).filter(
        (key) => changes[key as keyof typeof changes] !== undefined,
      );
      return {
        result: { updated: changed },
        action: `Updated the profile: ${changed.join(", ")}`,
      };
    },
  },
  {
    status: "Looking up personas",
    declaration: {
      name: "list_personas",
      description: "List the mock personas the user can switch to.",
      parameters: { type: "object", properties: {} },
    },
    run: async () => {
      const personas = await listMockUsers();
      return {
        result: {
          personas: personas.map(
            ({ name, age, city, goals }) => `${name}, ${age}, ${city}: ${goals.join(", ") || "no goals"}`,
          ),
        },
      };
    },
  },
  {
    status: "Switching persona",
    declaration: {
      name: "switch_persona",
      description: "Switch the app to a mock persona. Say goodbye in your reply: the chat then opens as that persona.",
      parameters: {
        type: "object",
        properties: { name: { type: "string", description: "First name or full name" } },
        required: ["name"],
      },
    },
    run: async (args) => {
      const wanted = String(args.name ?? "").trim().toLowerCase();
      const personas = await listMockUsers();
      const matches = personas.filter((persona) => persona.name.toLowerCase().includes(wanted));
      if (!wanted || matches.length === 0) return { result: { error: "No persona with that name" } };
      if (matches.length > 1) {
        return { result: { error: "Several personas match", matches: matches.map((match) => match.name) } };
      }
      return {
        result: { switched_to: matches[0].name },
        action: `Switched to the persona ${matches[0].name}`,
        switchTo: matches[0].id,
      };
    },
  },
  {
    status: "Opening your shopping list",
    declaration: {
      name: "get_shopping_list",
      description: "Show the user's shopping list.",
      parameters: { type: "object", properties: {} },
    },
    run: async (_, { user }) => {
      const items = await listShoppingItems(user.id);
      return {
        result: {
          items: items.map((item) =>
            [
              item.checked ? "[x]" : "[ ]",
              item.name,
              item.quantity && `(${item.quantity})`,
              item.store && `at ${item.store}`,
              item.discount_cents !== null && euros(item.discount_cents),
            ]
              .filter(Boolean)
              .join(" "),
          ),
        },
      };
    },
  },
  {
    status: "Updating your shopping list",
    declaration: {
      name: "add_to_shopping_list",
      description:
        "Add items to the shopping list. Pass store for catalog products so the price shows up.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                store: { type: "string", description: "Only for catalog products" },
                quantity: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
        required: ["items"],
      },
    },
    run: async (args, { user }) => {
      const items = (Array.isArray(args.items) ? args.items : []) as Args[];
      const names: string[] = [];
      for (const item of items) {
        const name = productName(item.name);
        if (!name) continue;
        const product = await resolveProduct(item);
        await addShoppingItem(user.id, {
          name: product?.name ?? name,
          productId: product?.id,
          quantity: text(item.quantity),
        });
        names.push(product?.name ?? name);
      }
      if (names.length === 0) return { result: { error: "No items to add" } };
      return { result: { added: names }, action: `Added to the shopping list: ${names.join(", ")}` };
    },
  },
  {
    status: "Updating your shopping list",
    declaration: {
      name: "update_shopping_list_item",
      description: "Check or uncheck an item on the shopping list.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The item, or part of its name" },
          checked: { type: "boolean" },
        },
        required: ["name", "checked"],
      },
    },
    run: async (args, { user }) => {
      const checked = args.checked === true;
      const item = await resolveListItem(user.id, args.name);
      if ("error" in item) return { result: item };
      const name = await setShoppingItemChecked(user.id, item.id, checked);
      return {
        result: { updated: true },
        action: `${checked ? "Checked off" : "Unchecked"} ${name} on the shopping list`,
      };
    },
  },
  {
    status: "Updating your shopping list",
    declaration: {
      name: "remove_from_shopping_list",
      description: "Remove an item from the shopping list.",
      parameters: {
        type: "object",
        properties: { name: { type: "string", description: "The item, or part of its name" } },
        required: ["name"],
      },
    },
    run: async (args, { user }) => {
      const item = await resolveListItem(user.id, args.name);
      if ("error" in item) return { result: item };
      const name = await removeShoppingItem(user.id, item.id);
      return { result: { removed: true }, action: `Removed ${name} from the shopping list` };
    },
  },
  {
    status: "Updating your shopping list",
    declaration: {
      name: "clear_shopping_list",
      description: "Empty the shopping list, or only remove the checked items.",
      parameters: {
        type: "object",
        properties: { checked_only: { type: "boolean" } },
      },
    },
    run: async (args, { user }) => {
      const checkedOnly = args.checked_only === true;
      const removed = await clearShoppingList(user.id, checkedOnly);
      return {
        result: { removed },
        action: checkedOnly ? "Removed the checked shopping list items" : "Emptied the shopping list",
      };
    },
  },
  {
    status: "Looking through old chats",
    declaration: {
      name: "search_past_chats",
      description: "Search the user's earlier chats with you for a word or phrase.",
      parameters: {
        type: "object",
        properties: { search: { type: "string" } },
        required: ["search"],
      },
    },
    run: async (args, { user, chatId }) => {
      const messages = await searchMessages(user.id, String(args.search ?? ""), chatId);
      return {
        result: {
          messages: messages.map(
            (message) => `${message.role}: ${message.content.slice(0, MAX_PAST_MESSAGE_CHARS)}`,
          ),
        },
      };
    },
  },
];

// Left to choose freely, Gemma copies earlier replies and says "Done!" without
// calling anything. So every step must call a tool, and this one ends the steps.
export const READY_TOOL = "ready_to_reply";

export const toolDefinitions: ChatCompletionTool[] = [
  ...TOOLS.map((tool) => tool.declaration),
  {
    name: READY_TOOL,
    description:
      "Call this when no more tools are needed: everything the user asked for is done, or the message needs no app data and changes nothing, such as small talk.",
    parameters: { type: "object", properties: {} },
  },
].map((declaration) => ({ type: "function", function: declaration }));

export function toolStatus(name: string) {
  return TOOLS.find((tool) => tool.declaration.name === name)?.status ?? "Working on it";
}

// Errors go back to the model as results, so it can recover or explain.
export async function runTool(name: string, args: Args, context: ToolContext) {
  const tool = TOOLS.find((candidate) => candidate.declaration.name === name);
  if (!tool) return { result: { error: `Unknown tool ${name}` } };
  try {
    return await tool.run(args, context);
  } catch (error) {
    console.error(`Tool ${name} failed:`, error);
    return { result: { error: "That didn't work" } };
  }
}
