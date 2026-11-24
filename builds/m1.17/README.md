# Kersplat Labyrinth: The Descent — M1.17

Release build (no debug hook unless `?debug`); QA build in `../m1.17-qa/`.

## What changed since M1.16

- **Fog of war.** A haze in each floor's own colours swallows everything beyond about 5 cells, so rooms have depth and you can't see monsters coming from far off. The minimap now only fills in cells you have actually seen (within your sight range).
- **Sight items:**
  - **Torch** (power-up, lasts the floor): +3 sight. A golden Torch lights every floor.
  - **Flare** (instant): floods the floor with light for 8 s.
  - **Owl Eyes** (permanent, up to 3): +1 sight each. Found in secret rooms or bought from Old Murkle's rare wares (45, +30 each).
  - The **Candle Lantern** now also gives +2 sight while it lasts.
- **Ambience.** Every floor has its own quiet, eerie sound bed: a low drone, moving air and rare distant drips, chimes, creaks, wind, whispers or bells. Pitch and sounds come from the floor seed; boss floors sit lower. N mutes it with everything else.
- **Damage indicators:**
  - Small red **"-x"** numbers pop above monsters when you hit them.
  - Getting hurt splashes **red blood on the side of the screen** the hit came from (left, right, front or behind).
  - A red **"-x"** drops away from the heart you lost and fades.

Frozen build; sha256 in `../SHA256SUMS`.
