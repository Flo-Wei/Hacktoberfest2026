# Grabby

Hackathon project: food recommendations based on grocery discounts, your profile, and what other users like.

## Features

- Discount offers (mock data)
- Multiple users
- Recommender system that finds food based on your profile and what others like
- Frontend:
    - Info board
    - Food swiping
    - Chat with Krabby

## Run the web app

You need [Node.js](https://nodejs.org) 20 or newer. The local database is created automatically on first start, with 30 mock personas.

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000.

## Run with Docker

Docker is optional and meant for hosting. For development, use `npm run dev` as above.

```bash
cp .env.example .env   # optional, only needed for API keys
docker compose up --build
```

Then open http://localhost:3000. To use a different port, set `WEB_PORT` in `.env`.

The database lives in the `grabby_data` volume and survives restarts. When a SQL file in `web/db/` has changed, the next start rebuilds the database and deletes all profiles and swipes. `docker compose down -v` deletes the volume by hand.

To host it somewhere else, build `web/Dockerfile` with `web/` as the build context, and:

- Mount a persistent volume at `/app/.data`, otherwise every deploy starts with a fresh database. Even with a volume, a deploy that changes a SQL file in `web/db/` deletes all profiles and swipes.
- Run a single instance, because PGlite allows only one process per database.
- Set API keys as environment variables on the host. They are not part of the image.
- The app listens on `PORT`, which defaults to 3000.

## Setup

You need [uv](https://docs.astral.sh/uv/getting-started/installation/) and [Claude Code](https://code.claude.com/docs). uv installs the right Python version for you.

```bash
git clone git@github.com:Flo-Wei/Hacktoberfest2026.git
cd Hacktoberfest2026
uv sync
cp .env.example .env
uv run --env-file .env grabby
```

Fill in your keys in `.env`. Each one is explained in the file. Git ignores `.env`, so your keys stay local.

To add a dependency, run `uv add <package>` and commit both `pyproject.toml` and `uv.lock`.

## Lovable

The repo already includes the Lovable MCP server (`.mcp.json`) and a skill that teaches Claude Code how to use it (`.claude/skills/lovable-mcp/SKILL.md`). There is nothing to install, but everyone has to log in once:

1. Open Claude Code in this repo and approve the `lovable` server when asked.
2. Run `/mcp`, select `lovable`, and log in with your Lovable account in the browser.
3. Ask Claude Code to "list my Lovable workspaces" to check that it works.

To work on the same Lovable project, everyone needs to be in the same Lovable workspace.

Keep in mind:

- Logging in gives Claude Code access to your whole Lovable account, not just this project.
- `create_project` and `send_message` spend Lovable build credits.
- `deploy_project` publishes a public URL on Free and Pro plans.
- `query_database` can change data and schema in the project's database.

## AI disclosure

This project was built with AI assistance. We used [Claude Code](https://code.claude.com/docs) to write code and documentation.

The app also uses AI at runtime. Krabby's replies come from Gemma through OpenRouter, and its voice and speech recognition come from ElevenLabs. Krabby's replies and voice are AI-generated and can contain mistakes.
