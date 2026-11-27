# M1.74.2 handoff — Plunger / Music Box theme gate

Branch: `Grok-Code-14`, cut from `Grok-Code-13` tip `f5319e94b05f8467612f28920f792c40167026d9`.
Version: **M1.74.2** (main already had Claude's M1.74.1 — CONTINUE coin accounting, score board retry, ice-spike spacing — so this is not M1.74.1). This branch does not include that other M1.74.1 work.

## Root cause

Rolled loot was already theme-gated. `puPool` / `randPU` filter the Plunger to Tiled Baths and the Music Box to Timber Attic, and a seed/floor sweep of floor loot, shop, slot, `randPU`, elite `dropLoot`, CONTINUE, and leaving a Baths or Timber floor did not place either item on the wrong theme. `themeNow()` stayed in sync with the loaded floor title; `/Baths/i` does not match `BASALT DEPTHS`.

The leak was the **auto-swap** when you walk over another power-up. If the selected slot is full, `pickPower` puts the new item in your hand and leaves whatever you were holding on the floor. A Plunger carried off a Tiled Baths floor (or a Music Box off Timber Attic) could therefore appear on Basalt Depths at your feet, looking like an elite drop. You do not press a drop button; walking over loot is enough. A thief returning a stolen use-item is a separate, intentional exception and was not this report (Jacob was not holding one when he looked, but the swap path is what actually puts the sprite on the floor without a new roll).

## Fix

- Auto-swap of a carried theme-gated use-item is refused off-theme. You keep the Plunger or Music Box; the new item stays on the ground. Message: `YOU CAN'T LEAVE PLUNGER HERE` (or Music Box).
- The floor def now stores the generated theme name (`def.theme`). `floorTheme()` reads that (or parses the title), and `bathsFloor` / `timberFloor` compare exactly to `TILED BATHS` / `TIMBER ATTIC` instead of a loose `/Baths/` or `/Timber/` regex.
- Every rolled power is placed through `pushPower`, which applies the same gate (elite drops, room loot, coin rooms, secret rooms, the slot, boss loot).
- Picking up a theme use-item that does not belong on the floor converts it to 5 coins. A thief returning something stolen from your hand (`fromHand`), or a swap you were allowed to make, is still pickable. `give()` and a held Plunger or Music Box still work on any floor.

## Repro (Mr Playtest)

On **M1.74** (before this fix):

1. Start a run and get to a **Tiled Baths** floor. Pick up a **Plunger** and do not use it.
2. Take the exit (or a trapdoor) and keep going until the title is **BASALT DEPTHS**, still holding the Plunger.
3. Walk over any other use-item (an elite drop or floor loot). The new item goes into your hand and the **Plunger is left on the floor**, as if it had dropped there.

On **M1.74.2**: the same steps keep the Plunger in your hand. The other item stays on the ground, with `YOU CAN'T LEAVE PLUNGER HERE`. The same applies to a Music Box taken off a Timber Attic floor.

On the QA build you can also jump to a Basalt Depths floor, `give` a Plunger, and walk over a spawned `flare` to see the same keep-in-hand behaviour.

## Tests and freeze

- Full suite on the M1.74.2 QA build: **682/682** passed (30 retired).
- Official freeze: `node tools/release.mjs m1.74.2`.

Release `builds/m1.74.2/index.html`: 1,927,659 bytes, sha256 `10dc9c13444e1cd7f516ee920c1a1c4c91f1c574e1f8ed4703e1d80bb964329a`.

QA `builds/m1.74.2-qa/index.html`: 1,927,655 bytes, sha256 `83b9a91944376b2a2cd7458b0bf6feb5d3d741c69802e45e37254b1e3c3e23b9`.

Compare against main: https://github.com/Elim1nator/labyrinth-remake/compare/main...Grok-Code-14

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**.

Wall-clock time from start of this hotfix to freeze: **7:02 PM to 7:28 PM America/Vancouver (PT)**, about **26 minutes**.

| Work | Approx. model turns | Approx. tool calls | Read tokens | Written tokens |
| --- | ---: | ---: | --- | --- |
| Root-cause sweep and diagnosis | ~20 | ~70 | not available | not available |
| Fix, regression tests, docs, freeze | ~12 | ~40 | not available | not available |
| **Total** | **~32** | **~110** | **not available** | **not available** |
