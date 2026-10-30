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

Runs on Gemma, with speech through ElevenLabs. Krabby can do everything the app can do. The full spec is in [docs/krabby-spec.md](docs/krabby-spec.md), read it before changing the chat or adding an app feature.

- **Ask for offers:** "I'm going to Hofer, give me all the offers" returns the products on offer there.
- **Product photo:** The photographed product counts as a like.
- **Action comments:** When you do something in the app, such as swiping against your goals, Krabby replies with some good-natured teasing. The reply appears in the chat and as a pop-up.
- **Voice:** Every Krabby message can be played aloud, and voice mode allows hands-free chat.

Krabby's voice is a fictional bodybuilder character using a voice from the ElevenLabs library. Don't name real people or clone their voices, the ElevenLabs rules forbid it.

### 4. Info board

Shows which offers are available in which nearby store, with filters for store, category and distance.

## Decisions

- **First version runs locally:** The app lives in `web/` (Next.js, TypeScript, Tailwind). It will later move to Lovable or Vercel, the target is still open. Python is only used for the catalog feed in `src/grabby`.
- **The database is Postgres:** Locally it runs on PGlite with nothing to install. The data lives in `web/.data/` and is not committed. Only `web/src/lib/db.ts` knows about PGlite. The schema and mock data are plain SQL in `web/db/`, so moving to Supabase or Vercel Postgres stays simple.
- **No real login yet:** Onboarding creates a profile, and a cookie remembers the user ID (`web/src/lib/session.ts`). `/personas` switches to any of the 30 mock personas.
- **Still placeholders:** The info board only shows a notice.
- **Swipe recommendations:** `recommendProducts` in `web/src/lib/products.ts` ranks by likes from similar users, then by profile. Vegan and vegetarian rule out unsuitable products. Prices, stores and the mock personas' swipes are made up.
- **Images and nutrition:** They come from Open Food Facts and are stored in `web/db/seed-products.sql`. The licence requires the visible credit in the app, see `web/db/README.md`.
- **Offers and stores are mock data:** The Python service in `src/grabby` serves them from a mock file, and the web app imports them into Postgres on startup. A scraper can replace the mock source later, see [docs/krabby-spec.md](docs/krabby-spec.md). Without Python, the app uses the SQL seed data.
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

- **Gemma:** runs through OpenRouter with `OPENROUTER_API_KEY`, using the `openai` SDK. The app uses `google/gemma-4-26b-a4b-it`, which handles tools and images but not audio.
- **ElevenLabs:** uses `ELEVENLABS_API_KEY` for text to speech and speech to text. `ELEVENLABS_VOICE_ID` is optional and chooses the voice.
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
npm run dev      # start the app on http://localhost:3000 and the catalog feed, creates the database on first start
npm run lint     # linter
npm run build    # production build, stop npm run dev first
```

The local database needs no manual setup. When any SQL file in `web/db/` changes, for example after a `git pull`, the next start rebuilds it automatically. This also deletes local profiles and swipes, so don't rely on them. PGlite allows only one process per database.

Python catalog feed:

```bash
uv sync                         # install dependencies
cp .env.example .env            # first time only
uv run grabby-api               # start the catalog feed on http://127.0.0.1:8000, npm run dev also does this
uv add <package>                # add a dependency, then commit pyproject.toml and uv.lock
uv build                        # build the package
```

There is no test runner yet. The web app loads the `.env` at the repo root through `web/next.config.ts`. Other commands that need API keys must pass `--env-file .env`.

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
