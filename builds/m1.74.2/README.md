# Kersplat Labyrinth: The Descent — M1.74.2

Release build (no debug hook unless `?debug`); QA build in `../m1.74.2-qa/`.

Hotfix on M1.74. Main already has a separate M1.74.1 (CONTINUE coin accounting, score board retry, ice-spike spacing), so this theme-gate fix is numbered M1.74.2. It was cut from the Grok-Code-13 M1.74 tip and does not include that other M1.74.1 work.

## What changed since M1.74

- Walking over another power-up no longer swaps a carried **Plunger** or **Music Box** onto a floor of the wrong theme. That swap was how a Plunger could appear on Basalt Depths: you kept one from a Tiled Baths floor, walked over a drop, and the Plunger was left on the ground as if an elite had dropped it. Off-theme you now keep the Plunger or Music Box; the new item stays on the ground (`YOU CAN'T LEAVE PLUNGER HERE`).
- The theme gate uses the floor's generated theme name (`TILED BATHS` / `TIMBER ATTIC`), stored on the floor def, not a loose `/Baths/` or `/Timber/` test of the "LEVEL n: ..." title. Rolls, placement, and pickup all check it. A Plunger or Music Box that somehow landed on the wrong theme cannot be picked up (it becomes 5 coins). A thief returning something stolen from your hand can still be picked up. A Plunger or Music Box you already hold still works on any floor.

Frozen build; sha256 in `../SHA256SUMS`.
Tests: 682/682 passed.
