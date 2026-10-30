# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Grabby is a hackathon group project that recommends food based on grocery discounts, a user's profile, and what other users like. `README.md` lists the planned features. Discount scraping is meant to be mocked, so don't build real scrapers.

Only the package scaffold exists so far: the `grabby` command calls `main()` in `src/grabby/__init__.py`. The repo and folder are named `Hacktoberfest2026`, but the project and package are named `grabby`.

## Commands

```bash
uv sync                         # install dependencies
cp .env.example .env            # first time only
uv run --env-file .env grabby   # run with API keys loaded
uv add <package>                # add a dependency, then commit pyproject.toml and uv.lock
uv build                        # build the package
```

No test runner or linter is configured yet.

Nothing loads `.env` automatically, so commands that need API keys must pass `--env-file .env`.

## External services

`.env.example` lists the keys. When you add one, add it there too.

- **Gemma:** use the hosted Gemini API with `GEMINI_API_KEY`. The available models are `gemma-4-26b-a4b-it` and `gemma-4-31b-it`.
- **ElevenLabs:** use `ELEVENLABS_API_KEY`.
- **Lovable:** Lovable projects are built and hosted in Lovable's cloud, not in this repo. Use the `lovable` MCP server and the `lovable-mcp` skill, which lists the actions to confirm first because they spend credits or publish publicly. The server uses per-person OAuth, so it needs no key.
- **Lovable REST API:** `LOV_PUBLIC_API_KEY` is optional and needs a Business or Enterprise workspace. Lovable reserves secret names starting with `LOVABLE_`, so don't use that prefix.
