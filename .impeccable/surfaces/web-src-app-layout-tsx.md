---
version: 1
slug: "web-src-app-layout-tsx"
primary_target: "web/src/app/layout.tsx"
related_targets: ["web/src/app/page.tsx","web/src/app/onboarding/page.tsx","web/src/app/chat/page.tsx","web/src/app/info/page.tsx","web/src/app/swipe/page.tsx","web/src/app/personas/page.tsx"]
---

Scope: the Grabby app shell (navbar, theme, mascot) and the existing screens. Mode: Operate.

Audience and job: budget-minded shoppers in Austria reaching offers fast, mostly on a phone.
Constraints: frontend.txt pins the palette, type, radii and spacing. The info board has no data yet, so it stays an honest placeholder. Swipe is the main feature and runs on mock products. No offer, price or savings data may be invented.
Unresolved: real offers, real authentication, the info board.

## Direction contract

THESIS: A friendly crab-branded shopping companion that behaves like a clean, familiar app. It refuses the discount-flyer look of loud badges and urgency.

OWN-WORLD: Warm cream and ivory surfaces, oat secondary areas, sand borders, espresso text, terracotta reserved for primary actions and selection. In dark mode: deep espresso with soft coral. Inter throughout, flat surfaces, pill chips.

STORY: The visitor sets up a profile quickly, or logs in from the same page, goes straight to swiping, and always knows what works today and what is coming.

FIRST VIEWPORT: A floating slim rounded navbar at the top: crab and Grabby left, Info, Swipe and Chat centered as plain buttons with Swipe filled, search, theme and profile right. On phones the three become a bottom tab bar in the same order. Below it, a panel sharing the navbar's edges carries the main task: onboarding, the product card, or the Swipe call to action on Home.

FORM: Brief-pinned direction, so no concept roll. Signature move: the crab walks sideways whenever something is happening, in onboarding, on hover of the logo, and while Krabby answers. seed: none (brief-pinned)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
