# AGENTS.md

Shared information for all coding agents and all 4 team members. When a decision changes, update it here so everyone has the same state.

## Language

English is the project language for everything: code, comments, docs, commit messages, branch names, UI text and data values. The one exception is product names, which keep their original German names and are never translated.

## Project

Grabby is a hackathon project: food recommendations based on grocery discounts, your profile, and what similar users like. Krabby is the chat assistant in the app.

The repo and folder are named `Hacktoberfest2026`, the project is named `grabby`.

## Features

### 1. Onboarding

Registration with short personal details: name, age, preferences and goals (for example losing weight, fitness).

### 2. Swipe

Users swipe through products. They see products that similar users liked. Until a user has swipes of their own, the selection follows the goals and preferences from onboarding.

### 3. Chat with Krabby

Runs on Gemma and handles text, images and audio:

- **Ask for offers:** "I'm going to Hofer, give me all the offers" returns the products on offer there.
- **Product photo:** The photographed product is added to the user's preferences.
- **Suggestions and roasting:** Krabby makes suggestions or roasts the user, spoken through ElevenLabs (for example "Not enough protein!").

The roasting voice is a fictional bodybuilder character using a voice from the ElevenLabs library. Don't name real people or clone their voices, the ElevenLabs rules forbid it.

### 4. Info board

Shows which offers are available in which nearby store, with filters for store, category and distance.

## Decisions

- **First version runs locally:** The app lives in `web/` (Next.js, TypeScript, Tailwind). It will later move to Lovable or Vercel, the target is still open. Python is not used for features, the package in `src/grabby` is only the original scaffold.
- **The database is Postgres:** Locally it runs on PGlite with nothing to install. The data lives in `web/.data/` and is not committed. Only `web/src/lib/db.ts` knows about PGlite. The schema and mock data are plain SQL in `web/db/`, so moving to Supabase or Vercel Postgres stays simple.
- **No real login yet:** Onboarding creates a profile, and a cookie remembers the user ID (`web/src/lib/session.ts`). `/personas` switches to any of the 30 mock personas.
- **Krabby recipes:** The chat suggests meals (`web/src/lib/meals.ts`). "Suggest a meal" first looks for a meal liked by similar users, otherwise Gemma cooks a new one and it's saved for others. A typed wish always gets a new recipe. Gemma's reply is checked: only products from the offer list are kept, and prices come from the database. Without `OPENROUTER_API_KEY` a simple mock recipe is used. Offers, product photos and speech are still missing.
- **Info board:** `/info` lists all offers per store in a card grid with the nearest branch, and filters by store and category. The distance filter is still missing.
- **Swipe recommendations:** `recommendProducts` in `web/src/lib/products.ts` ranks by likes from similar users, then by profile. Vegan and vegetarian rule out unsuitable products. Prices, stores and the mock personas' swipes are made up.
- **Images and nutrition:** They come from Open Food Facts and are stored in `web/db/seed-products.sql`. The licence requires the visible credit in the app, see `web/db/README.md`.
- **Offers and stores are mock data:** Don't build real scrapers. Stores (for example Hofer, Billa, Spar) and offers come from a fixed data set in the database.
- **No real GPS:** City and distance to a store are stored in the mock data.
- **Docker is an extra for hosting:** One container runs the app, with PGlite on a volume. See [Docker](#docker).

## Collaboration

- Create a separate branch for each feature, for example `feature/swipe` or `feature/krabby-chat`.
- When you're done, merge your branch into `main` yourself, no review required. `main` must still work afterwards.
- Before merging, bring the latest `main` into your branch.
- If you use Lovable later: Lovable projects live in Lovable and not automatically in this repo. With the Lovable MCP everyone works on the same project and not on Git branches, so coordinate changes there with the team.
- Never commit secrets such as `.env`.

## External services

The keys are listed in `.env.example`. Add new keys there as well. Keys the app needs at runtime belong in the hosting project's secrets and must never end up in frontend code.

- **Gemma:** runs through OpenRouter with `OPENROUTER_API_KEY` (`web/src/lib/openrouter.ts`). The default model is `google/gemma-4-31b-it:free`, `OPENROUTER_MODEL` overrides it. Test before building whether it handles images and audio as needed.
- **ElevenLabs:** uses `ELEVENLABS_API_KEY`.
- **Lovable:** runs through the `lovable` MCP server and the `lovable-mcp` skill. The server uses per-person OAuth and needs no key.
- **Lovable REST API:** `LOV_PUBLIC_API_KEY` is optional and needs a Business or Enterprise workspace. Lovable reserves secret names starting with `LOVABLE_`, so don't use that prefix.

Always ask before these Lovable actions:

- `create_project` and `send_message` spend build credits.
- `deploy_project` publishes a public URL.
- `query_database` can change data and schema, so show the SQL before any write.

## Commands

Web app, run in `web/`:

```bash
npm install      # install dependencies
npm run dev      # start the app on http://localhost:3000, creates the database on first start
npm run lint     # linter
npm run build    # production build, stop npm run dev first
```

The local database needs no manual setup. When any SQL file in `web/db/` changes, for example after a `git pull`, the next start rebuilds it automatically. This also deletes local profiles and swipes, so don't rely on them. PGlite allows only one process per database.

Python scaffold:

```bash
uv sync                         # install dependencies
cp .env.example .env            # first time only
uv run --env-file .env grabby   # start the scaffold with API keys loaded
uv add <package>                # add a dependency, then commit pyproject.toml and uv.lock
uv build                        # build the package
```

There is no test runner yet. The web app loads the root `.env` in `web/next.config.ts`. Nothing else loads it automatically, so other commands that need API keys must pass `--env-file .env`.

## Docker

Docker is only an extra for hosting. Develop and debug with `npm run dev`, there is no need to build or start a container for that.

Keep `web/Dockerfile`, `web/.dockerignore` and `docker-compose.yml` current: if a change affects how the app builds or runs, update them in the same branch. That includes new services, system packages, the Node version, data stored outside `web/.data/`, and files read at runtime that Next.js file tracing misses. New keys in `.env` reach the container without any change here. Only run the container when you changed one of these things.

Run in the repo root:

```bash
docker compose up --build   # build and start the app on http://localhost:3000
docker compose down         # stop, keeps the database
docker compose down -v      # stop and delete the database
```

The app runs as a single instance, because PGlite allows only one process per database. The automatic database rebuild also runs in the container: when an image with changed SQL files starts, all profiles and swipes on the volume are deleted.
