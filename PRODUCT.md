# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Budget-minded shoppers in Austria who plan or do their grocery shop at BILLA, SPAR or HOFER, often on their phone, and want deals that fit their goals and diet.

## Product Purpose

Grabby recommends discounted groceries from each person's profile and from what similar users like. Success means someone finds relevant offers quickly and enjoys doing it.

## Positioning

Grabby is a shopping companion rather than a discount list: swiping teaches it what you like, and Krabby, its crab assistant, answers questions and roasts your choices.

## Operating Context

People use it at home while planning and in or near the store. The first version runs locally, and the hosting target is still open.

## Capabilities and Constraints

- Working today: onboarding, swiping with recommendations from similar users, logging in by name from the onboarding page, logging out, and switching between 30 mock personas. There are no passwords yet.
- Placeholders today: the info board shows a note, and Krabby answers with fixed mock text.
- Stores and offers are planned as a fixed mock dataset. No scrapers and no real GPS: city and distance come from mock data.
- Krabby is planned on Gemma (text, image, audio) with ElevenLabs voice. The roasting voice is a fictional bodybuilder character, never a real person or a cloned voice.
- The interface language is English.
- Swipe is the main feature.

## Brand Commitments

- Name: Grabby. The assistant is Krabby, a crab.
- Voice: warm, direct, everyday English, without corporate jargon or exaggerated savings claims.
- The crab mascot stays simple and occasional, so offers remain the focus.
- The project is open source, which is presented quietly through an About or footer link.

## Evidence on Hand

- Crab artwork: an 8-frame sprite sheet in `web/public/crab/`.
- Onboarding painting: an AI-generated watercolor in `web/public/onboarding/`.
- 30 fictional personas in `web/db/seed.sql`, with made-up swipes in `web/db/seed-swipes.sql`.
- Mock products in `web/db/seed-products.sql`, with images and nutrition from Open Food Facts. The licence requires the visible credit on the Swipe page.
- Prices and stores are made up. No real offers, savings figures, retailer logos, testimonials or usage numbers exist. Do not invent them.

## Product Principles

- Offers come first: the mascot and personality support them and never compete with them.
- Show only what the data supports, and say honestly when something is unknown or not built yet.
- Keep sample data clearly distinguishable from real offers.
- A short setup is enough, and preferences stay easy to change later.

## Accessibility & Inclusion

Mobile-first with comfortable touch targets. Status is never carried by color alone. Motion respects reduced-motion preferences.
