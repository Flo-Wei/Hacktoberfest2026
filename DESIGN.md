---
name: Grabby
description: A warm, crab-branded shopping companion for discounted groceries
colors:
  terracotta: "#b9432e"
  burnt-red: "#9f3625"
  soft-coral: "#f28b70"
  peach-coral: "#f6a087"
  pale-peach: "#fbe7dd"
  dark-rust: "#42271f"
  warm-cream: "#faf6f0"
  ivory: "#fffcf7"
  oat: "#f1e8dd"
  sand: "#ddd0c1"
  control-sand: "#94806f"
  espresso: "#30221b"
  cocoa: "#766253"
  deep-espresso: "#1c1512"
  warm-charcoal: "#261d18"
  dark-walnut: "#211813"
  hover-walnut: "#33261f"
  brown: "#49382d"
  control-brown: "#7e6757"
  cream: "#f8efe5"
  muted-sand: "#bea797"
  sage: "#3f6b47"
  amber: "#8a5a00"
  deep-red: "#8e1b2e"
typography:
  page-heading:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  section-heading:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
  body:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  control:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  label:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  close: "8px"
  component: "16px"
  card: "20px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.burnt-red}"
  button-outline:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.md}"
    height: "44px"
  input:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.md}"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.pale-peach}"
    textColor: "{colors.terracotta}"
    rounded: "{rounded.pill}"
  navbar:
    height: "85px"
---

# Design System: Grabby

## Overview

**Creative North Star: "The Helpful Crab"**

Grabby behaves like a clean, familiar app and sounds like a friend who knows the shelves. Everything is warm and soft, with translucent panels over a quiet wash, and the personality comes from one small crab. People arrive to find offers, so nothing competes with that job.

The source brief is `frontend.txt`. Tokens live in `web/src/app/globals.css` and reach components through shadcn semantic names, so new UI uses `bg-primary` or `text-muted-foreground`, never raw colors.

**Key Characteristics:**

- Warm cream and ivory surfaces, with espresso text and terracotta used sparingly
- Inter throughout, in regular, medium and semibold
- Glass panels with soft shadows, built only from palette colors
- Motion from hover and swipe transitions, never from entrance animations
- Comfortable 44px controls and pill-shaped chips
- Swipe as the one highlighted feature
- Full-width panels that share the navbar's edges
- A crab that walks sideways when something is happening

## Colors

A warm neutral ground with a single earthy accent, mirrored into a deep espresso dark theme.

### Primary

- **Terracotta / Soft Coral**: primary actions, selected text and focus rings, in light and dark respectively.
- **Burnt Red / Peach Coral**: hover state of primary actions.
- **Pale Peach / Dark Rust**: selected backgrounds, preference chips and the user's chat bubble.

### Neutral

- **Warm Cream / Deep Espresso**: page background.
- **Ivory / Warm Charcoal**: cards, the navbar, inputs, outline buttons and Krabby's bubbles.
- **Oat / Dark Walnut**: secondary surfaces. Hover states use Oat in light mode and Hover Walnut in dark mode, because Dark Walnut is darker than the cards it would sit on.
- **Sand / Brown**: borders.
- **Control Sand / Control Brown**: form control outlines, darker than borders so they reach 3:1 against their surface.
- **Espresso / Cream**: primary text.
- **Cocoa / Muted Sand**: secondary text.

### Status

- **Sage, Amber, Deep Red**: positive, warning and error, each with a lighter dark-theme value in `globals.css`. Always pair them with text or an icon.

### Named Rules

**The Reserved Terracotta Rule.** Terracotta and coral mark primary actions, selection and useful emphasis only. Hover on neutral controls stays neutral.

**The Honest Status Rule.** Color never carries status alone.

## Typography

**Body Font:** Inter Variable, self-hosted through `@fontsource-variable/inter` with the optical size axis, so headings pick up Inter's tighter display cut automatically. System sans is the fallback.

**Character:** One friendly workhorse carries everything, with hierarchy from size and weight.

### Hierarchy

- **Page heading** (600, 30px): one per screen. The brief allows 28 to 36px. Swipe and Chat use the 20px section size instead, because the card or conversation is the content and the name only repeats the navigation.
- **Section heading** (600, 20px): groups on a screen and empty-state titles.
- **Body** (400, 16px): running text. Controls and chat bubbles use 15px.
- **Label** (500, 14px): navigation, field labels and supporting text. Badges use 12px.
- **Product price** (24 to 28px, tabular numerals): required by the brief, not built yet.

## Layout

Mobile first. The navbar and all content share one width of up to 1280px, with a 16px side gutter, so their edges line up. Spacing follows a 4px grid: 8px within a group, 16px between components, 32px between sections.

Screens are built from panels that fill the page: a dashed empty panel for screens without content yet, an art panel with a frosted sheet for onboarding, a two-part product card on Swipe, and on Home a hero with a fanned offer stack, the shopping DNA panel, the Krabby panel, top picks and three steps.

Below 768px the four links become a floating bottom tab bar in the same order: Overview, Info, Swipe, Chat. Search then takes over the whole navbar while open.

**The Shared Edge Rule.** Content starts and ends where the navbar does. Never put a screen in a narrow centered column.

**The Earned Space Rule.** A panel stretches only when something fills it or it holds one centered focus. Cards keep their content height, because a tall card with little in it reads as a mistake.

## Elevation & Depth

Layered and soft. A fixed wash sits behind the page, and panels float over it. Every surface comes from `globals.css` and is mixed from the palette, so light and dark stay in step.

### Surfaces

- **`.glass`:** the default panel, translucent ivory with a soft shadow and a 20px blur.
- **`.hero-panel`:** the pale peach gradient with rings, only for the Home hero.
- **`.tinted-panel`:** the oat gradient, only for the Krabby panel.

### Shadow Vocabulary

- **Soft** (`--shadow-soft`): panels and floating controls.
- **Action** (`--shadow-action`): primary buttons, stronger on hover.
- **Overlay** (shadcn defaults): dropdowns and menus.

### Motion

- **Primary buttons** rise 2px over 200ms.
- **The offer stack** straightens and rises 6px over 350ms.
- **Round swipe actions** scale to 1.08 over 200ms.
- **The swipe card** leaves with a turn and fade over 200ms.
- **Toasts** rise and fade over 200ms.

Under `prefers-reduced-motion` all transitions stop.

### Named Rules

**The Palette-Only Glass Rule.** New surfaces mix existing tokens with `color-mix`. Glass never introduces a new hue.

## Shapes

Gently rounded and consistent. Buttons and inputs use 10px, cards 16px, main panels 24 to 28px, and chips and badges are full pills. Avoid nested cards.

## Components

Components come from shadcn `new-york-v4` on Radix, in `web/src/components/ui`. They were tuned for this system, so update them with `--diff` and never with a blind overwrite.

### Buttons

- **Shape:** gently curved (10px), 44px tall by default.
- **Primary:** Terracotta with Ivory text. One per screen.
- **Outline:** Ivory with a Sand border, for secondary actions.
- **Transitions:** 150ms color changes. Pending buttons show a small walking crab.

### Chips

- **Unselected:** Ivory pill with a control outline, 40px tall.
- **Selected:** Pale Peach with Terracotta text and a check icon, so selection never relies on color alone.

### Inputs / Fields

- **Style:** Ivory fill, control outline, 10px radius, 44px tall.
- **Focus:** a soft 3px ring from the focus color.
- **Forms:** compose with `FieldGroup`, `Field` and `FieldSet`. Errors use `Alert`.

### Navigation

- **Visibility:** the links, search and phone tab bar appear only for logged-in users, and never during onboarding, even after the profile exists. Logged-out visitors see the brand, theme toggle and Create account.
- **Style:** a translucent blurred bar across the full window, 85px tall and 72px on phones, with a bottom border. Its content shares the page width. Brand on the left, links in the middle, and search, theme and profile on the right.
- **Links:** all four share one anatomy, an icon and a 14px label. Rest is Cocoa, hover is glass with Terracotta text, and there are no dropdowns.
- **Current page:** a glass tile with Terracotta text. The phone tab bar uses a Pale Peach pill. Nothing else in navigation has a fill at rest.
- **Swipe:** Espresso text and a Terracotta icon at rest, so it reads first without looking selected.

**The One Highlight Rule.** Swipe is the only navigation item with color at rest. A fill always means "you are here", so a permanent fill must never be used for emphasis.

- **Search:** expands from the icon over 200ms with a leading icon, placeholder, Esc hint and close button.

### Chat

Compose with `MessageScroller`, `Message` and `Bubble` inside one full-width bordered panel, with Krabby's name in a header row and a centered 768px conversation column. Krabby uses the outline bubble and a crab avatar, and the user uses the selected bubble. The walking crab shows pending replies, with no shimmer text.

### Swipe Card

The main surface of the product: the image on the left on a secondary surface and the details on the right, stacked on phones. The price is 28px with tabular numerals and carries the discount badge beside it. Nutrition is a plain row between hairlines, not a tinted box. Like and No thanks are round icon buttons, and the arrow keys do the same. They stay visible without scrolling, and the Open Food Facts credit must stay on the page. Saving a like shows a short toast.

### Crab

Use `Crab` and `CrabWalk` from `web/src/components/crab.tsx`, which draw `web/public/crab/crab-sprites.png` with CSS. `CrabWalk` runs on onboarding. A still crab appears on the logo, Krabby's avatar, Home and empty screens, at 72px or smaller so it never outweighs an offer. Crabs marked `walkOnHover` walk while their link or `.crab-host` is hovered. Motion stops under `prefers-reduced-motion`.

### Feature Panel

For screens without content yet, built on shadcn `Empty`: a glass panel with a small crab, a heading, one honest sentence and one action, all centered. The action leads somewhere useful, usually Swipe.

### Log In

There is no separate login page. A sublink under the onboarding form switches the same page, art included, to a name field in the frosted panel. It says plainly that there are no passwords yet.

### Onboarding

The one expressive screen. A watercolor painting with a torn paper edge fills the panel, and a three-step wizard sits on a frosted sheet that straddles the tear, so the blur always has real art behind it. Controls on the sheet stay solid.

- **Wizard:** You, Tastes, Review. Steps come from one array, so adding a step needs no layout change. One step shows at a time, and content slides in the direction of travel.
- **Setup:** after Review, the sheet shows each real step with a loader, then a check and the real result, such as how many products are ready. Never fake a stage or a count.
- **Success:** one line, one crab hop, one action to Swipe.
- **Art:** `web/public/onboarding/hero.webp` was generated with ElevenLabs (`gpt-image-2.5-sunburst`). The torn edges are the SVG masks next to it. It is decorative, so its `alt` is empty.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens and existing shadcn components first.
- **Do** label sample data, using words like "Test profile" and "Sample prices".
- **Do** mark planned features with a "Soon" badge.
- **Do** write warm, everyday English such as "What do you like to buy?".

### Don't:

- **Don't** invent discounts, prices, savings or dietary claims.
- **Don't** use technical words like "mock" in the interface.
- **Don't** add surfaces outside `.glass`, `.hero-panel` and `.tinted-panel`, or colors outside the palette.
- **Don't** let the crab compete with offers or animate without a reason.
- **Don't** imply a retailer logo or product photo exists when it doesn't. Use the crab as a clean fallback, not emoji.
