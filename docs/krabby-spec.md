# Krabby spec

Instructions for agents and teammates finishing Krabby and connecting it to the rest of the app. The decisions below were made with the project owner. Follow them, and update this file when one changes.

## The core rule

Everything you can do or see in the app must also work in the chat. Krabby's tools and the app's pages call the same server functions in `web/src/lib/`, so a feature behaves the same in both places.

When you add or change an app feature:

1. Put the logic in a function in `web/src/lib/`.
2. Call it from the page or server action.
3. Add a matching tool in `web/src/lib/krabby/tools.ts`, or update the existing one.

## Who Krabby is

- One character for everyone: a buff, warm, tough-love gym crab. Fictional, never based on a real person.
- Always replies in English, even when the user writes in German. Product names stay in their original German.
- Sticks to food, shopping and the app.
- Normal chat replies are friendly and never tease.
- Teasing only appears in action comments (see below), and it's good-natured ribbing, never mean.
- Never comments on body, weight, looks, age or other personal details. Never suggests crash diets. If someone mentions disordered eating, Krabby drops the humour and responds seriously.

## What Krabby can see and do

Krabby sees only what the current user can see in the app. The user ID always comes from the session cookie on the server. No tool takes a user ID as input, so the model can't choose whose data it reads or changes. Similar-users data only appears as finished recommendations.

Krabby acts right away on clear requests and says what changed. It only asks first when a request is unclear.

| Area | Tools |
|---|---|
| Offers and stores | `get_offers`, `list_stores` |
| Swipe | `get_swipe_suggestions`, `record_swipe`, `get_swipe_history` |
| Product photo | `save_photo_product`, or `record_swipe` when the product is in the catalog |
| Profile | `update_profile` (the profile itself is always in Krabby's context) |
| Personas | `list_personas`, `switch_persona` |
| Shopping list | `get_shopping_list`, `add_to_shopping_list`, `update_shopping_list_item`, `remove_from_shopping_list`, `clear_shopping_list` |
| Past chats | `search_past_chats` |

Creating a new profile stays in onboarding, because you need a profile to open the chat.

Gemma gets much slower with many tools: usually a few seconds with up to 8, but 20 to 36 seconds with all 15. So each tool belongs to one or more areas, and Krabby starts each turn with only `choose_tools`, which loads the areas a request needs. Keep this in mind when adding tools.

Out of scope: fridge photos, a recipe database and meal tracking. Krabby can still suggest meals in plain text.

## Model

- Replies and comments run on `gemma-4-26b-a4b-it` only. Gemma 4 is a project requirement, so don't add a non-Gemma fallback. `gemma-4-31b-it` isn't used: it failed most requests and typically took over a minute.
- Tested behaviour: tools, multi-step tool use, streaming and images work. Audio is rejected with a 400.
- About 1 in 4 requests returned a temporary 500, and some calls stall, so `web/src/lib/krabby/model.ts` retries model calls and gives up early on a silent one. Tools never re-run on a retry.
- The free tier allows only 16,000 input tokens per minute for this model, shared by everyone using the key, and Gemma has no paid tier. Every step of a turn resends the prompt, tools and history. So keep tool results compact, and refer to products and list items by name rather than by ID. On a 429, Krabby waits as long as the API asks, and comments are skipped.
- Replies stream word by word, and Krabby shows what it's doing until the text starts.

## Speech

Both directions use ElevenLabs. Audio never goes to Gemma.

- Speech to text: `scribe_v2`. The transcript becomes a normal user message.
- Text to speech: `eleven_flash_v2_5`, with `ELEVENLABS_VOICE_ID` choosing the voice. Use a voice from the ElevenLabs library, and never clone a real person.
- Every Krabby message has a speak button. Nothing plays by itself outside voice mode.
- Voice mode is a hands-free loop: Krabby listens, notices when you stop talking, answers aloud, then listens again. The mic pauses while Krabby speaks, so it can't be interrupted yet. Replies are shorter, the screen stays awake, and one tap exits.
- Browsers only allow the mic on `localhost` or HTTPS, so testing on a phone needs HTTPS.

## Action comments (pop-ups)

An action comment is a Krabby reply caused by something the user did in the app. It's a normal chat message that also appears as a pop-up.

- It's saved in the current chat together with an event row saying what triggered it, so Krabby understands a reply to it. If there's no current chat, one is created.
- The pop-up has no reply box. You can only answer in the chat. It fades after a few seconds, and tapping it opens the comment in the chat.
- The first version reacts only to swipes on the Swipe page, at most once every 5 swipes.
- Simple rules in `web/src/lib/krabby/rules.ts` decide whether to comment, and Gemma writes the line. The swipe never waits, and a comment that fails is skipped.

To add a trigger, call `reportAppEvent` from `web/src/lib/krabby/events.ts` after the action, handle the event in `web/src/app/api/krabby/event/route.ts`, and add its rule in `rules.ts`.

## Chats

- Each user has their own saved chats, and each persona has its own.
- A new chat starts after 3 hours without messages, or when the app is opened fresh. Closing and reopening the app counts. A server restart doesn't.
- Old chats stay in a list and can be reopened and continued.
- The model gets the last 20 messages of the current chat, up to 6,000 characters. A new chat starts without the old conversation, but Krabby still has the profile, swipes and shopping list, and can look things up with `search_past_chats`.
- Only text is saved. Photos and recordings are discarded after processing.

## Product photos

A photographed product counts as a like. If it's in the catalog, it's saved as a normal swipe. If not, it goes in `photo_products`, because swipes can only point to catalog rows, and those need a store and a price. Krabby treats both as likes.

## Catalog

The catalog lives in Postgres, because swipes and `recommendProducts` depend on it.

The Python service in `src/grabby` is a feed in front of it. It serves stores and offers from a mock file, and Next.js imports them on startup (`web/src/lib/catalog.ts`). The SQL seed files remain as the offline baseline, so the app still works when Python isn't running.

To add a scraper, implement `CatalogSource` in `src/grabby/sources.py` and return it from `get_source()`. Nothing on the Next.js side needs to change.

Offers in the feed are matched to `products` by `name` and `store`. The import only inserts and updates. It never deletes, because deleting a product would also delete its swipes. A real scraper needs a way to retire old offers.

## Still to do

- [ ] **Info board:** build `/info` on `listStores` and `searchOffers` from `web/src/lib/`, and keep the `get_offers` tool working the same way.
- [ ] **Design pass:** the chat, pop-up, voice mode and shopping list only have functional styling. Apply the design specs and components when they arrive. Keep the behaviour in this file.
- [ ] **Open Food Facts credit:** keep the visible credit wherever product data appears, including any product cards added to the chat. See `web/db/README.md`.
- [ ] **New pages:** apply the core rule, and add action comments where they make sense.
- [ ] **Voice:** choose the final bodybuilder voice, then set `ELEVENLABS_VOICE_ID`. The ElevenLabs key can't list voices, so pick the ID in the ElevenLabs app.
- [ ] **Hosting:** the Python feed needs a host when the app moves off local. If the target can't run it, keep the SQL seed data.
