# Kersplat Labyrinth: The Descent — M1.57

Release build (no debug hook unless `?debug`); QA build in `../m1.57-qa/`.

## What changed since M1.56

- **The Bather** (Tiled Baths only): marble statue walk loop (4 frames), pool-water-blue slick puddles. 4 HP.
- **Plunger** use-item: drop one floor through a black hole. Loot and shop on Baths floors only; uncommon, at most one per floor. A held Plunger still works anywhere.
- **The Slick Man** (Slate Halls only): the earlier hunched 5-frame art, 10 HP, lumbers at 0.8, reflects 30% of player projectiles (bounces can hurt you). While within 10 cells, view distance is forced to 5 blocks, overriding glasses and flares, then lerps back.

Frozen build; sha256 in `../SHA256SUMS`.
