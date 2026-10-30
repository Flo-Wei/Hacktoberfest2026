---
name: lovable-mcp
description: Create, edit, deploy, and manage Lovable apps through the Lovable MCP server. Use when the user mentions Lovable or wants to work with Lovable projects, their databases, deployments, or project knowledge.
---

# Lovable MCP Server

Lovable is an AI-powered full-stack app builder. Describe what you want in natural language and an AI agent writes real TypeScript + Tailwind CSS + shadcn/ui code in a cloud sandbox with a live preview. The MCP server lets you create, edit, deploy, and manage Lovable projects from any MCP-compatible client.

New projects use Lovable's backend default stack. There is no tech stack selector in `create_project`; include framework or rendering preferences in the initial message.

## Confirm before acting

These prompts come from Lovable's official Claude Code plugin. They are not part of Lovable's published skill file.

- `create_project` and `send_message` spend Lovable build credits. Confirm with the user before calling them.
- `deploy_project` publishes a publicly reachable URL on Free and Pro plans. Ask before publishing.
- `query_database` can read, write, and alter schema. Show the SQL and confirm before any write or schema change.
- If the user belongs to more than one workspace, ask which one to use.

## Setup

The server uses OAuth. On first connection your client opens a browser window to authenticate with your Lovable account.

### Claude Desktop / ChatGPT

Add to your MCP configuration:

```json
{
  "lovable": {
    "type": "http",
    "url": "https://mcp.lovable.dev"
  }
}
```

### Cursor

Add to your MCP configuration:

```json
{
  "lovable": {
    "type": "http",
    "url": "https://mcp.lovable.dev",
    "auth": {
      "CLIENT_ID": "6d465f583e1e4ce5801b1616f735670c"
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http lovable "https://mcp.lovable.dev"
```

### Codex

```bash
codex mcp add lovable "https://mcp.lovable.dev"
```

## What you can build

Landing pages, dashboards, SaaS apps, internal tools, marketplaces, CRUD apps, admin panels, portfolios, booking systems, and more. Projects support authentication, databases (PostgreSQL), payments (Stripe/Paddle), email (Resend), file storage, and 50+ integrations out of the box.

## Recommended workflow

1. **Discover workspaces** -- call `list_workspaces` to get workspace IDs.
2. **Create a project** -- call `create_project` with `initial_message`; it becomes the first builder message. In MCP App hosts, call `render_project_widget` with the returned `projectId` to show progress.
3. **Review changes** -- call `get_diff` with the returned `message_id` to see what the agent changed.
4. **Iterate** -- send follow-up messages with `send_message` to refine, add features, or fix issues.
5. **Deploy** -- call `deploy_project` to publish to a live URL on `lovable.app`.

## MCP App UI

In hosts that render MCP App UI, call `render_project_widget` with the `projectId` returned by `create_project` to show project status. If multiple workspaces can create projects, call `create_project` with a detailed `initial_message` and no `workspace_id`; it returns `available_workspaces` for the agent to choose from or ask the user about, then call `create_project` again with the selected `workspace_id`.

## Tool reference

### Identity and discovery

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `get_me` | (none) | Get authenticated user profile and workspaces |
| `list_workspaces` | `limit?`, `offset?`, `cursor?` | List all workspaces. Call first to get workspace IDs. Paginate with `pagination.next_cursor`; `cursor` takes precedence over `offset` |
| `get_workspace` | `workspace_id` | Get workspace details: plan, credits, settings |

### Projects

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `create_project` | `workspace_id?`, `initial_message`, `files?`, `template_project_id?`, `design_systems?`, `wait?`, `timeout_seconds?` | Create a new project using Lovable's backend default stack. Omit `workspace_id` only when the account has exactly one eligible workspace or when asking the tool to return `available_workspaces` for agent/user selection. Pass `design_systems` (from `list_design_systems`) to start from a design system |
| `render_project_widget` | `project_id` | Show build progress for a project returned by `create_project` |
| `list_projects` | `workspace_id`, `query?`, `visibility?`, `publish_status?`, `folder_id?`, `user_id?`, `viewed_by_me?`, `limit?`, `cursor?` | Search and list projects with filtering and pagination |
| `get_project` | `project_id` | Get project details and a screenshot of the current state |
| `deploy_project` | `project_id`, `name?` | Publish to production on `lovable.app`. Returns the live URL |
| `set_project_visibility` | `project_id`, `visibility` (`draft`, `private`, `public`) | Change project visibility |
| `set_folder_visibility` | `workspace_id`, `folder_id`, `visibility` (`personal`, `workspace`) | Change folder visibility (propagates to all projects in folder) |
| `move_projects_to_folder` | `workspace_id`, `folder_id`, `project_ids` | Move up to 30 projects into a folder |
| `remix_project` | `project_id`, `workspace_id`, `include_history?`, `include_custom_knowledge?`, `project_name?`, `timeout_seconds?` | Fork a project into a workspace |

### Agent interaction

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `send_message` | `project_id`, `message` (1-100k chars), `wait?`, `timeout_seconds?`, `plan_mode?`, `files?` | Send a message to the project's main agent. Use `plan_mode=true` to discuss architecture before the agent writes code. `wait=true` (default) waits for completion |
| `get_message` | `project_id`, `message_id`, `thread_id?` | Poll after `send_message` with `wait=false`, or after a timeout. Pass the `message_id` and `thread_id` returned by `send_message` |
| `respond_to_approval` | `project_id`, `message_id` (the user message the pause was reported on), `event_id`, `decision` (`approved`/`rejected`), `user_input?`, `wait?`, `timeout_seconds?` | Answer a tool approval the agent paused on (`status: awaiting_input` with an `awaiting_input` object). Show the human `awaiting_input.tool_id` and `params` first and pass their decision; never decide for them. A new `send_message` cancels the pending tool instead of answering it |
| `list_messages` | `project_id`, `limit?`, `cursor?` | List recent messages newest-first. Use to discover message IDs when you only have a project. Paginate with `pagination.next_cursor` |

### Retry deduplication

`create_project` and `send_message` detect identical retries (same authenticated caller and arguments within ~2 minutes, extended while a `wait` is in flight) and reuse the original result instead of creating a duplicate project or agent run. A dedup hit returns `deduplicated: true` with the original `projectId` / `message_id` — treat it as the earlier call's result, not a new one. If the original call is still in flight, the retry returns an error telling you to poll (`list_projects` / `list_messages` + `get_message`) instead of retrying.

### Code inspection

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `get_diff` | `project_id`, `message_id?`, `sha?`, `base_sha?` | Get unified diff from a message or between commits |
| `list_files` | `project_id`, `ref?`, `limit?`, `cursor?` | List a page of files at a git ref. Paginate with `pagination.next_cursor` |
| `read_file` | `project_id`, `path`, `ref` | Read a single file's contents at a git ref |
| `list_edits` | `project_id`, `limit?`, `cursor?`, `before?` | List edit history with commit SHAs. Paginate with `cursor` (`pagination.next_cursor` from the previous page). `before` accepts an ISO 8601 timestamp for compatibility; `cursor` takes precedence |

### Knowledge (custom instructions)

Knowledge is persistent instructions that guide the AI agent's behavior. Workspace knowledge applies to all projects; project knowledge applies to one project.

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `get_workspace_knowledge` | `workspace_id` | Get workspace-level instructions |
| `set_workspace_knowledge` | `workspace_id`, `content` (max 10k chars) | Replace workspace instructions. Read first to preserve existing content |
| `get_project_knowledge` | `project_id` | Get project-level instructions |
| `set_project_knowledge` | `project_id`, `content` (max 10k chars) | Replace project instructions. Read first to preserve existing content |

Examples of useful knowledge:
- "Use Supabase for all authentication and database operations"
- "Follow brand colors: primary #2563EB, secondary #7C3AED"
- "All API calls should include error handling with toast messages"
- "Use React Query for server state management"

### Database (PostgreSQL via Supabase)

Each project can have a cloud PostgreSQL database.

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `get_database_status` | `project_id` | Check if a database is provisioned |
| `enable_database` | `project_id` | Provision the database (30-60 seconds, one-time) |
| `query_database` | `project_id`, `sql` | Execute SQL (SELECT, INSERT, UPDATE, DELETE, DDL) |

Workflow: check status with `get_database_status`, provision with `enable_database` if needed, then query with `query_database`.

### File uploads

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `get_file_upload_url` | `file_name`, `content_type?` | Get a presigned upload URL and file ID |

Upload workflow:
1. Call `get_file_upload_url` to get `upload_url` and `file_id`
2. PUT the file content to `upload_url`
3. Pass `file_id` in the `files` array of `send_message` or `create_project`

Use this to attach design mockups, screenshots, wireframes, or data files to messages.

### Integrations and connectors

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `list_connectors` | `workspace_id` | List all available integrations grouped by type (standard, seamless, MCP). Shows enabled/disabled status |

Full catalog: https://docs.lovable.dev/integrations/introduction

#### Standard connectors (OAuth-based)

These use OAuth and provide API access to external services. The agent can read and write data through them during chat.

Aikido, Algolia, Asana, Ashby, AWS S3, BigQuery, Contentful, Databricks, ElevenLabs, Firecrawl, Fireflies, Google Calendar, Google Docs, Google Drive, Google Mail, Google Maps, Google Sheets, Google Slides, Granola, Hex, HubSpot, Inngest, Linear, Microsoft Excel, Microsoft OneDrive, Microsoft OneNote, Microsoft Outlook, Microsoft PowerPoint, Microsoft Teams, Microsoft Word, Perplexity, PostHog, Resend, Sentry, Slack, Snowflake, Storyblok, Telegram, Twilio, Twitch, Wiz, WordPress.com

#### Seamless connectors (zero-config)

These require minimal setup and integrate directly with the platform:

- **Supabase** -- PostgreSQL database, authentication, and file storage
- **Stripe** -- Payment processing and billing (see Built-in payments below)
- **Shopify** -- E-commerce platform
- **Amplitude** -- Product analytics
- **Atlassian (Jira)** -- Issue and project tracking
- **Confidence (Spotify)** -- Feature flags and experiments
- **Miro** -- Collaborative whiteboarding
- **n8n** -- Workflow automation
- **Polar** -- Revenue and subscription management
- **Sanity** -- Structured content platform

### Connectors (external tools)

Connectors let the AI agent call external services (Linear, Notion, Slack, custom MCP servers) during chat.

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `list_connectors` | `workspace_id` | List available connectors by type with enabled and connected status |
| `add_connector` | `connector_id?` | Returns the dashboard URL where the user must add the connector. The MCP cannot add connectors programmatically — all setup happens in the Lovable UI |

### Templates and design systems

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `list_template_projects` | `workspace_id` | List project templates to clone as a starting point |
| `list_design_systems` | `workspace_id` | List design systems (components, tokens, styles) to start new projects from |

### Analytics (published projects)

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `get_project_analytics` | `project_id`, `start_date` (RFC 3339), `end_date` (RFC 3339), `granularity?` (`hourly`, `daily`) | Historical visitor metrics with breakdowns by page, source, device, country |
| `get_project_analytics_trend` | `project_id` | Real-time visitor count and 5-minute interval trend (last 30 minutes) |

## Writing effective messages

- **Describe what you want, not how to implement it.** "Add a user settings page with profile editing and password change" works better than "Create a React component at src/pages/Settings.tsx".
- **Be specific about UI.** "Use a card layout with a sidebar navigation" gives better results than "make it look nice".
- **Mention desired behavior.** "When the user clicks save, show a success toast and redirect to the dashboard."
- **Attach images.** Upload design mockups, screenshots, or wireframes via `get_file_upload_url` and pass the `file_id` in your message.
- **Use plan mode for complex features.** Set `plan_mode=true` on `send_message` to discuss architecture before the agent writes code.

## Built-in payments

Lovable has built-in payment support powered by **Paddle** or **Stripe**. When you ask the agent to add payments, it analyzes the project and recommends a provider. The agent handles account creation, product setup, checkout UI, and webhook configuration automatically.

### Eligibility

Built-in payments support digital products and software: SaaS subscriptions, premium unlocks, one-time purchases, memberships, digital downloads, and developer tools with API access. Physical products should use the Shopify integration instead (or Stripe with separate inventory management).

Requires a Pro plan or higher and Lovable Cloud (the agent will prompt to enable it if needed). Authentication is recommended so purchases can be linked to users.

### Paddle vs Stripe

| | Paddle | Stripe |
|---|--------|--------|
| Model | Dedicated merchant of record (handles taxes, invoicing, receipts) | Optional merchant of record per transaction |
| Cost | 5% + 50c per transaction, no monthly fee | Standard Stripe rates |
| Best for | SaaS and digital products selling globally | Services, domestic markets, or per-transaction MOR control |

Both providers cost the same through Lovable as setting up directly. One provider per project.

### How it works

1. Ask the agent to add payments (e.g. "Add a pricing page with a $29/month subscription")
2. The agent creates provider accounts, products, prices, checkout flow, and UI components
3. Test in the preview using test cards (4242 4242 4242 4242 for success)
4. Complete provider verification (KYC/KYB) and go live through the Payments tab

The agent supports subscriptions, one-time payments, free trials, discount codes, and customer portal links. Products sync from test to live automatically when you publish.

### Limitations

- One payment provider per project
- One subscription per user by default (ask the agent to adjust if needed)
- Projects with payments cannot be remixed
- Checkout styling must be configured in the provider's dashboard
- Do not create webhooks manually (Lovable registers them automatically)
