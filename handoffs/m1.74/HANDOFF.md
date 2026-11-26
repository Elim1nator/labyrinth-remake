# M1.74 handoff

## What was asked
1. **Snowball** — a rare Snowman drop that turns thrown balloons into snowballs: Jacob's snowball sprite and held-snowball hand, a 1 second slow on hit, and a white puff (with a puff sound) instead of the water splash.
2. **Ferryman's Coin** — Old Vaults only. A Debt Collector has a 30% chance to drop it, and every Old Vaults shop always stocks it. Opening a locked or coin door pays +3 coins. At most one copy per run.

## The work

### Snowball
- Run item `ITEMS.snowball` (`noPool`, max 1, price 50 unused). Snowmen drop it at **7%** per kill (`SNOWBALL.drop`), skipped if you already hold it or one is already on the floor. Nothing else drops it, and it is not in the item pool.
- Official isolated rolls: **81/1000 (8.1%)**, inside the 4–11% band. Seed sweep (50 seeds): **89** Icy Prison floors, **1067** Snowman kills, **37** drops, **37/50** seeds got it (max 1 per run).
- While held, thrown balloons set `snow:true`, use `assets/snowball.png` (12×14) and the snowball hand (`assets/hand_snow.png`). Colour flags and damage stay on the shot. The Frozen Wand still adds +1 damage and bounce; the snow sprite wins over the ice balloon, and a bounce skips the puff the same way it skipped the splash. Yellow puddles still leave a puddle.
- A hit sets `e.slowT` for 1 second (`ITEM_FX.snow:1`, same chill as the Ice Cube). Regular monsters move at **55%** speed (`SPIDERS.goldWebMul`); the Mortared Man, Ice Wizard, and ice spikes use **50%**.
- Splash is replaced by `snowPuff()` (`kind:'snow'`, `SFX.puff()`, `SPR.snowPuff`). The first-person hand and the HUD balloon box also show the snowball while the item is held. Throw/empty hand frames reuse the existing glove (Jacob supplied a holding pose).

### Ferryman's Coin
- Run item `ITEMS.ferryman` (`noPool`, max 1, `theme:'OLD VAULTS'`, shop price **40** — same mid-shop price as the Jailer's Eye / Spirit Slate).
- A Debt Collector on an Old Vaults floor has a **30%** chance to drop it (`FERRY.drop`). The roll is skipped if you already hold it, one is already on the floor, or the shop already stocks it.
- Every Old Vaults shop always stocks it (`shopItems` prepends `ferryman` unless a floor copy is sitting, so only one copy is offered). Official seed sweep, seeds 1–200 × L2–24: **176** Old Vaults floors, **87** with a shop (**49.43%**), all **87** stock the Coin, **0** off-theme.
- Once you own it, collectors stop dropping it. The shop **still lists it but marks it sold** (`shopRows` `owned`, buy says “SOLD OUT, WANDERER.”), which is how the shop already treats a maxed run item.
- Opening a locked door with a key, or paying a coin door, pays **+3** coins and appends “THE FERRYMAN PAYS +3 COINS”. The Music Box pays +3 for each locked or coin door it opens (not fences). A Treasure Knight smash does not pay. A coin door restored by CONTINUE (`applyMusicBox({noGrant:true})` / `applyPaidCoinDoors`) does not pay out again.

Both items are saved in `perm.items`, so CONTINUE keeps them. Old saves without the new fields still load. Pickup messages and the item screen list them.

## Freeze
- Tests: **664/664** passed (30 retired pre-M1.23/M1.31 checks), including the official frozen QA build (`cd tests && npm test`).
- Release `builds/m1.74/index.html` 1853.3 KB (1,897,759 bytes), sha256 `e889a8c3879d418a45c8d021f36c67a00eb0323d334e616942b891b01c510c6c`.
- QA `builds/m1.74-qa/index.html` 1853.3 KB (1,897,757 bytes), sha256 `9a55249c30b0f25fd1c399728b02b3e7b99393f53269d6b4ffbc5e08ff0cf84a`.
- Base: main `e123661f` (M1.73). Branch `Grok-Code-11`.
- A test-only fix after freeze extended the M1.24 FX-sheet filter to exclude `hand_snow` and `snowball` (they live in `assets/`, not `assets/boss/`, same as `hand`/`balloon` since M1.43). Source was not changed; builds were not re-frozen.

## Art (do not push the PNGs — list for Mr Lead)
- `assets/hand_snow.png` — 15,955 bytes, git blob `84e26a1e3650f86c6c5c86555875bc01bd344027`, sha256 `4cf879bb8d3e888f8cc886580a02e8c459bb33b6ac5e1d5f80cfcf9da8154580`. 4×(100×80): idle/windup from Jacob's held-snowball hand, throw/empty copied from the existing blue glove.
- `assets/snowball.png` — 414 bytes, git blob `cb515d8df853b8cfa9e88fa481bf66595235dbc7`, sha256 `784ba59f3d3e68b6fbd70ef6772091e08646e20d661b93373980ab4e2a5c328d`. 12×14 projectile.
- `assets/items.png` — 39,027 bytes, git blob `d19616dfcd69e57c95bd20d7b232399c0e1ce462`, sha256 `51b09ff230e37ca2b9327700442a9d5e00401a7729fe0d93bca20a2cf6f2882d`. Still 240×120. Tile 41 snowball at (24,96), tile 42 Ferryman's Coin at (48,96).

## Screenshots
Under `/workspace/labyrinth-main/m174/`:
- `m174_hand_snowball.png` — held snowball hand and item icon
- `m174_snowball_flight.png` — in-flight snowball, empty throw hand
- `m174_snowball_pickup.png` — “SNOWBALL! BALLOONS BECOME SNOWBALLS: 1 S SLOW, THEY PUFF”
- `m174_ferryman_pickup.png` — “FERRYMAN'S COIN! +3 COINS WHEN YOU OPEN A LOCKED OR COIN DOOR”

Sweep dumps: `drop_sweep.json`, `ferry_shop_sweep.json` in the same folder.
