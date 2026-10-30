# Grabby

Hackathon project: food recommendations based on grocery discounts, your profile, and what other users like.

## Features

- Rabattaktionen scrapen (mock)
- multi user
- Recommender System um Lebensmittel zu finden anhand deines Profiels und was andere gern haben
- Frontend:
    - Dashboard
    - Essen Swipen
    - Chat:
        - kühlschrankfoto

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
