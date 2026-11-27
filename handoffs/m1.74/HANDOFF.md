# M1.74 handoff — Snowball, Ferryman's Coin, Master Key, Turned Face

Work is in `/workspace/labyrinth-remake`. Branch **Grok-Code-13** was cut from the M1.73.1 hotfix tip `4f0fe9c32fb24de484f7328df9e7a0e78e139dca` (`Grok-Code-12`, itself built from main `e123661f`). **Grok-Code-11 was left alone** (its earlier Snowball+Ferryman-only tip stays as it is). `/workspace/labyrinth-fix` was read, never modified. Official M1.74 freeze overwrote the earlier Snowball+Ferryman-only `builds/m1.74` pair. `builds/m1.73.1(-qa)` and `handoffs/m1.73.1` were kept from the hotfix.

Version in `src/index.html` and `tests/package.json`: **M1.74** / `1.74.0`.

## What shipped in the local tree

### Snowball (Icy Prison / Snowman)
- Run item, `noPool`, max 1. 7% per Snowman kill (`SNOWBALL.drop`), skipped if held or already on the floor.
- Held: throws set `snow`; sprite and first-person hand switch; colour flags and damage stay; Frozen Wand still +1 and bounce (bounce skips the puff).
- Hit: `slowT` for 1 s (`ITEM_FX.snow`). Regular mobs 55% speed (`SPIDERS.goldWebMul`); Mortared Man / Ice Wizard / ice spikes 50%. White snow puff + puff sound, no splash.
- CONTINUE keeps it. Pickup message and item-screen entry.

### Ferryman's Coin (Old Vaults)
- Run item, `noPool`, max 1. 30% per Debt Collector kill (`FERRY.drop`), skipped if held, already on the floor, or the shop already stocks it.
- Every Old Vaults shop always stocks it at **40** coins. If a kill-drop is on the floor, the shop hides it. Once owned, the shop still lists it but marks it sold ("SOLD OUT, WANDERER.").
- +3 coins when you open a locked door (key or Master Key) or a coin door, and for each locked or coin door the Music Box opens. Fences and Treasure Knight smashes do not pay. CONTINUE-restored paid coin doors (`sv.coinPaid`) and opened locked doors (`sv.locks`) do not pay again.
- CONTINUE keeps it. Pickup message and item-screen entry.

### Master Key (Deep Labyrinth only)
- Deep Labyrinth is the last entry of the floor 1–8 `THEMES` array (`name:'DEEP LABYRINTH'`). Later `DEEP_THEMES` (Basalt Depths, Rust Works, etc.) do **not** include that name, so these two only appear when an early-floor theme roll is Deep Labyrinth (not the floor-1 tutorial GATEHOUSE). The theme already existed; it was not invented.
- Run item, `noPool`, max 1, not shop-stocked. 15% chance as a floor item on each Deep Labyrinth floor (`MASTERKEY.drop`). Deterministic roll `hashSeed(G.seed+':masterkey:'+(G.levelIdx+1))`. Skipped if held or already on the floor. Placement `freeFloorCell(6)||freeFloorCell(3)||freeFloorCell(1)` so a successful roll is not dropped for lack of a far cell. Cannot drop from the Turned Face (the face cannot be killed).
- Permanent, never used up. While held, every locked door opens like a normal door (USE, no key spent). Keys still pick up. Coin doors and fences are unchanged. Ferryman +3 still applies to a Master Key unlock of a locked door.
- Opened locked doors persist on CONTINUE (`G.lockOpened` / `sv.locks` / `applyOpenedLocks` without payout) for **any** unlock (key or Master Key), so Ferryman + key also cannot be farmed.
- CONTINUE keeps the item. Pickup message and item-screen / codex entry.

### The Turned Face (Deep Labyrinth only)
- Exactly one per Deep Labyrinth floor, guaranteed, spawned in `startLevel` after `addFloorExtras` in the room farthest from the player's start (fallback `freeFloorCell`). Not a map letter, so layouts and seeds stay unchanged.
- Excluded from `MOB_POOLS` / `poolFor` / `ensureThemeMob` counts, `rollMods`, kettle and Rattlebones swaps, kill counts and floor-clear (`MOBS.turnedface`: `extra`, `ethereal`, `noKill`). `scaleMob` skips `noKill` only (Ice Wizard HP scaling is unchanged). `THEME_MOBS.turnedface=1` only as a swap guard.
- Floats in a straight line at the player at **0.9** cells/s (walk is **2.7**, so one-third speed, escapable). Ignores walls, doors and collision. Draws through walls (`noDepth`; fog still applies) at **0.55** alpha with bob **0.07** in code. One-frame sheet.
- Frozen **2.5 s** at floor start; also frozen during boss intros, pause and menus because `updatePlay` is not called. Cannot be hit: balloons and snowballs pass through; never takes damage or dies.
- Contact: normal 1 heart, cooldown **1.5 s**, then fades back about **3** tiles at 2.2× speed. If overlapping (`d<.08`) recoil uses fallback direction `(0,1)`. Shield / Bubble Wrap block it if they block contact damage. Descending removes it (per-floor spawn).

## Official freeze and tests

`cd tests && npm test` against the frozen QA build: **677/677** passed (30 retired pre-M1.23/M1.31 checks). Targeted `ONLY=m1731,m174` on the pre-freeze dev QA was **85/85**.

Official freeze `node tools/release.mjs m1.74` at **5:33 PM America/Vancouver**, overwriting the earlier Snowball+Ferryman-only pair. `builds/m1.73.1` and `m1.73.1-qa` kept:
- Release `builds/m1.74/index.html` — 1,926,088 bytes (1880.9 KB), sha256 `a4d81c5333560576432ba0e8eb5c741079467605dad2cedde690035a3549793f`
- QA `builds/m1.74-qa/index.html` — 1,926,086 bytes (1880.9 KB), sha256 `52dddffa7d6e4b60e7a2d7e20ad2795e87a9d56593d7aaf99a8c93d4d7aadddc`

### Rates and sweeps (latest 79/79 run)
- Snowball isolated: **63/1000 (6.3%)** in the 4–11% band; cfg **7%**. Seed sweep: 50 seeds, **89** Icy Prison floors, **1067** Snowman kills, **42** drops, **42/50** seeds got it (max 1/run).
- Slow: 1 s; **55%** regular / **50%** mortar-wizard-spike.
- Ferryman shop sweep seeds 1–200 × L2–24: **176** Old Vaults floors, **87** with a shop (**49.43%**), all 87 stock the Coin; **0** off-theme; shop marks sold when owned; price **40**.
- Master Key sweep (same 200×L2–24 window): **197** Deep Labyrinth floors, **32** with the key (**16.24%**) in the 8–22% band around 15%; **0** off-theme, **0** duplicates, **0** still spawned once owned.
- Turned Face: **197/197** Deep Labyrinth floors had exactly one; **0** on other themes; **0** duplicates.
- Face speed **0.9** cells/s vs walk **2.7** (factor 1/3). Measured fade-back distance in the contact test: **3.15** tiles.

## Art for Mr Lead (do not push the PNGs)

- `assets/hand_snow.png` — 15,955 bytes, git blob `84e26a1e3650f86c6c5c86555875bc01bd344027`, sha256 `4cf879bb8d3e888f8cc886580a02e8c459bb33b6ac5e1d5f80cfcf9da8154580`. 400×80 RGBA, 4×(100×80): idle/windup from Jacob's held-snowball hand, throw/empty from the existing blue glove.
- `assets/snowball.png` — 414 bytes, git blob `cb515d8df853b8cfa9e88fa481bf66595235dbc7`, sha256 `784ba59f3d3e68b6fbd70ef6772091e08646e20d661b93373980ab4e2a5c328d`. 12×14 RGBA projectile.
- `assets/items.png` — 39,642 bytes, git blob `8b8e8eb8b49000d4685b913f78483bdba396940c`, sha256 `d4648e616a3d25bbdf30f6fadc58665d4e07d04aee670f5c5388ac0e243815c5`. Still 240×120. Tile 41 snowball at (24,96), tile 42 Ferryman's Coin at (48,96), tile 43 Master Key at (72,96) — 103 opaque px, NN-fit 10×22 in the 24 tile (ornate copper key is tall).
- `assets/mobs/turnedface.png` — 23,459 bytes, git blob `591ec37956adc94f3c9cea48a078f4a30631b7ed`, sha256 `a9d239601c86ddd88896bc37c3653269a2a7a342b098d22221eff939aab99e58`. 89×96 RGBA, one frame, `k:1.5`. Magenta/purple dithered checker keyed out (source was muted ~`(143,31,117)` / `(185,49,149)`, not neon FF00FF); black hair strands kept.

Jacob's source art stayed outside the repo (`/workspace/labyrinth-main/snowball/src-art/`). Master Key JPG was 1408×1408 on near-white (edge flood lum≥240 or lum≥228 && chroma≤16). Turned Face JPG was 1408×1408 (brief said 1024) on a muted magenta checker; global key plus fringe/despill, 0 leftover magenta-ish opaque pixels.

## Screenshots and sweeps

Under `/workspace/labyrinth-main/m174/`:
- `m174_hand_snowball.png` — held snowball hand and item icon
- `m174_snowball_flight.png` — in-flight snowball, empty throw hand
- `m174_snowball_pickup.png` — “SNOWBALL! BALLOONS BECOME SNOWBALLS: 1 S SLOW, THEY PUFF”
- `m174_ferryman_pickup.png` — “FERRYMAN'S COIN! +3 COINS WHEN YOU OPEN A LOCKED OR COIN DOOR”
- `m174_master_key_pickup.png` — “MASTER KEY! OPENS EVERY LOCK” (28 chars; the HUD clips at 42)
- `m174_turned_face_through_wall.png` — Turned Face seen through a wall (seed 1, floor 3)

Sweep dumps: `drop_sweep.json`, `ferry_shop_sweep.json`, `master_key_sweep.json`. Previews (`preview_*`) are visual QA only, not for the repo.

## Pickup messages

The message band hard-clips at 42 characters (`if(m.length>42)m=m.slice(0,42)`), and sits in `BAND_RECT` [135,3,258,18], clear of the touch buttons. Final pickup texts (all ≤42):

- `SNOWBALL! SLOW 1 S, PUFF NOT SPLASH` (35)
- `FERRYMAN'S COIN! +3 ON LOCK OR COIN DOORS` (41)
- `MASTER KEY! OPENS EVERY LOCK` (28)

There is no Turned Face pickup (it is a mob). The item-screen descriptions match these short lines (`pickRunItem` shows `name + '! ' + desc`).

## How the M1.73.1 merge points were resolved

- The hotfix `markCoinPaid`, `hsLoad`, `HS.fetched`, `nameSubmit` re-read, `hsSubmit` 429 fallback, `api.hs`/`api.hsResetLoad`, and the M1.73.1 tests were copied **exactly**.
- `doUse` now calls `ferryPayout` **before** `markCoinPaid`, so `sv.coins = G.p.coins` is the post-payment total **including** any Ferryman +3. The hotfix function body is unchanged. CONTINUE restores that total and does not refund the door or the +3; `applyPaidCoinDoors` does not pay again.
- Locked-door opens call `ferryPayout` **before** `markLockOpened`. `persistOpenedLocks` also writes `sv.coins`, so a Ferryman +3 on a Master Key or key unlock is kept on CONTINUE. `applyOpenedLocks` still re-opens the door without a payout, so it cannot be farmed.
- `openMusicBox` now writes `sv.coins` after its Ferryman payouts as well.
- Docs list **M1.73.1 then M1.74**. Version stamps stay **M1.74**.

## Decisions

- Deep Labyrinth already existed in `THEMES`; did not invent a theme. These two do not spawn on later `DEEP_THEMES` floors.
- Face is spawned in `startLevel`, not as a gen map letter, so kettle/Rattlebones/nMob/empty-room/layout hashes stay stable.
- Locked-door CONTINUE persistence was added for any unlock (key or Master Key), not only Master Key.
- Pause/intro/menus already freeze the face because `updatePlay` is not called.
- Master Key is not shop-stocked. Price 50 is unused.
- `FX_SRC` must not list `hand_snow`, `snowball`, or `turnedface` (they do not live under `assets/boss/`).
- Face speed 0.9 (one-third of walk 2.7). Start freeze 2.5 s (in the 2–3 s brief).
- `scaleMob` skips `noKill` only, not all `M.extra` (Ice Wizard HP).
- Recoil fallback direction `(0,1)` when overlapping so a same-cell bite is not a no-op.
- Master Key placement falls back to closer free cells so the observed spawn rate stays near 15%.
- Colour stacking / Frozen Wand / doll balance / Music Box rate / boss-floor seals / seed 138 L7 skeleton / M1.66 score-display bug were left alone.

## Not done here
- No PR, no merge, no force-push, and **Grok-Code-11 was not updated**.
- Messaging Mr Playtest.
- PNGs are not pushed; Mr Lead still uploads `hand_snow.png`, `snowball.png`, `items.png` (unchanged this pass) and `mobs/turnedface.png`.


## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**.

The counts below are **approximate** (so labeled), reconstructed from the M1.74 session that started about **3:45 PM America/Vancouver**. The session spanned several compactons, and Ferryman's Coin and then Master Key + Turned Face were added mid-session, so the per-feature split is a best-effort allocation rather than a meter. Shared wrap-up is listed separately so it is not counted four times.

A later stack onto M1.73.1 (branch `Grok-Code-13` from `4f0fe9c3`) and the official re-freeze of M1.74 are a separate line. Official freeze time: **5:33 PM America/Vancouver**.

| Feature | Approx. model turns | Approx. tool calls | Read tokens | Written tokens |
|---|---|---|---|---|
| Snowball | ~35 | ~110 | not available | not available |
| Ferryman's Coin | ~25 | ~90 | not available | not available |
| Master Key | ~15 | ~50 | not available | not available |
| Turned Face | ~20 | ~70 | not available | not available |
| Shared wrap-up (all four) | ~15 | ~40 | not available | not available |
| Stack onto M1.73.1 + re-freeze | ~20 | ~70 | not available | not available |
| **Total** | **~130** | **~430** | **not available** | **not available** |

Wall-clock: 3:45 PM – official freeze 5:33 PM America/Vancouver (**1 h 48 min**). Official suite and the Grok-Code-13 push followed the freeze.
