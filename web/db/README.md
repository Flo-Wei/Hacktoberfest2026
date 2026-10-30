# Seed data

- `seed.sql`: 30 fictional personas.
- `seed-products.sql`: 60 products with made-up stores and prices. Images and nutrition come from Open Food Facts.
- `seed-swipes.sql`: generated swipes for the personas.
- `seed-stores.sql`: made-up store branches with a city and distance.
- `seed-meals.sql`: 10 starter meals with generated votes from the personas.

The Python feed in `src/grabby/data/catalog.json` holds the same stores and offers. The app imports it on startup, and these seed files are the baseline for when it isn't running.

## Open Food Facts

Contains data from [Open Food Facts](https://world.openfoodfacts.org), available under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/). Product images are available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/3.0/) and are linked, not copied. `off_code` is the barcode of the source product.

Keep the visible credit in the app. If an adapted version of this data is used publicly, it must also be offered under the ODbL. Details: https://world.openfoodfacts.org/data

The source product can come from a different brand or store than the mock product. Prices and store names are not real.
