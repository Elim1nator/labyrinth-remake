# M1.76 handoff

Next release on `Grok-Code-16`, on top of Mr Lead's M1.75.2 `walls.png` upload (`978c679`, blob `571dfb4a`). No PR, no merge, no force-push. Local checkout was synced to that tip first. M1.75 / M1.75.1 / M1.75.2 builds are left intact. Grok-Code-14 and Grok-Code-15 were not touched.

Main was rechecked before numbering and again after the official suite: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75 / M1.75.1 / M1.75.2 are not on main, so this is **M1.76**.

## A. Moss wall art restored

Jacob said to keep the old wall art (`pt93u`). `assets/walls.png` was restored to the pre-M1.75.2 blob `a89eab312663083b7b5ccfb5df42b274bd73135d` (174,577 B). `node tools/assets.mjs pack` / `node tools/release.mjs m1.76` embedded that sheet, so the packed src uses the old moss tile again. The wall renderer is unchanged. A regression test checks that the packed moss tile's `texHash` matches the old art (FNV `2027769424`), not the M1.75.2 retouch. Mr Lead will re-upload this PNG.

## B. Obsidian Column

A Basalt Depths run item (`obsidian`, max 1, `noPool`), following the Master Key pattern: rare **12%** floor spawn (`OBSIDIAN.drop`) on `/Basalt Depths/i` only, at most one per run, deterministic per seed and floor unless a test overrides `OBSIDIAN.rng`. Placement is `freeFloorCell(6)||freeFloorCell(3)||freeFloorCell(1)`.

Once per minute, the next throw after a **60 s** cooldown (`OBSIDIAN.cd`) is an **obsidian shard** instead of a balloon. It does **+2** damage on top of base damage (1 + dumbbell, doubled by a piggy spend). Balloon colours, the Frozen Wand's +1 and bounce, the Snowball slow/puff, and the Balloon Pump giant splash do not apply to the shard. A Party Hat throw fires shards for every shot of that throw. The first throw after pickup is a shard; the cooldown is kept across floors in the same run. The column icon in the effect row (top-left, clear of the touch buttons) glows when a shard is ready.

Pickup text: `OBSIDIAN COLUMN! A +2 SHARD ONCE A MINUTE` (41 characters). Temporary pixel art: a 24×24 glassy black column with purple/blue highlights in `assets/items.png` (tile `obsidian`), and `assets/obsidian_shard.png` (12×16 jagged shard, k 1.5).

## C. Skittering Creep

On Basalt Depths it climbs out of pits on the same timer and cap as pit Skitters (`SPIDERS.skitEvery` 14–22 s, `skitCap` 1, +1 from floor 12, `pitSpawnCell(9)`), **even when no coins have been tossed** (`spiderLvl` 0). Coin-toss Skitters and Brood Spiders are unchanged and still require the 10 / 50 coin milestones. First spawn: "A CREEP CRAWLS OUT OF THE PIT!"

Balance vs the Skitter: **2 HP** (unscaled; Skitter is 1), speed **5.2** cells/s (Skitter is 4.4), height 0.30, hit radius 0.28, contact bite **1 heart** (not a face-hug). Voice `chitter` (synthesized with the existing `noise`/`tone` helpers). Pit-spawned creeps drop nothing (`noLoot`).

Art: Jacob's 5-frame walk sheet `/workspace/labyrinth-main/creep/src-art/creep_walk.jpg`. White background removed by an edge flood-fill (tolerance kept tight so the pale claws and teeth stay). Scaled nearest-neighbour (1/8), feet-centred, packed as `assets/mobs/creep.png` (5 frames, 68×52, k 1.5) via `assets/atlas.json`.

## Freeze

- Official freeze: `node tools/release.mjs m1.76` at **9:57 PM America/Dawson_Creek (UTC-7)**.
- Release `builds/m1.76/index.html` 2021.1 KB (2,069,589 bytes), sha256 `25c58d794e13ba90356c773c1cc4c04b82fe4ddf68000fbe208da895d79ab1e7`, git blob `a4be99b89f3cc4031803a62245989c31bded0f3a` (same as packed `src/index.html`).
- QA `builds/m1.76-qa/index.html` 2021.1 KB (2,069,587 bytes), sha256 `f7ad1f084040fcdc45882f99e0553b64924f6831fd59c806c6fd15b10a6bf602`, git blob `7aa7fcc25aa72d0d32038e1696cbb912047f3a96`.
- Official `cd tests && npm test` on the frozen QA build: **707/707** passed (30 retired). Fetch is mocked; the suite made no live score-board posts.
- M1.75, M1.75.1 and M1.75.2 release/QA hashes were rechecked after this freeze and are unchanged.

## Screenshots

Gitignored under `test-output/m1.76/screens/` (also copied to `/workspace/labyrinth-main/m176/`). Not pushed.

- Shard in flight: `m176_shard_in_flight.png`
- Item pickup: `m176_obsidian_pickup.png`
- Creeps coming out of a pit: `m176_creep_from_pit.png`
- Creep up close: `m176_creep_close.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | notes |
|---|---|---:|---|
| `assets/walls.png` | `a89eab312663083b7b5ccfb5df42b274bd73135d` | 174577 | Reverted to the pre-M1.75.2 moss tile. Was `571dfb4a2fcc92047a54799fa7e9f96938c417d9`, 171336 B. |
| `assets/items.png` | `0f7ed9c8d664aee7fb5785ca6c48c13ad57ca411` | 39901 | Temporary Obsidian Column icon added as tile `obsidian` (row 4, col 4). Was 39642 B. |
| `assets/obsidian_shard.png` | `6d491756ccc8f8214166847012aece07e8b95e68` | 238 | Temporary 12×16 jagged shard projectile (k 1.5). |
| `assets/mobs/creep.png` | `4683f8bb23524854fb0a9ddf2d05aeee0b819675` | 27606 | 5-frame walk sheet from Jacob's `creep_walk.jpg`, 68×52 per frame, k 1.5. |

## Decisions

- Restore the moss tile rather than keep the M1.75.2 retouch (Jacob: leave the old wall art).
- Floor-spawn the Obsidian Column at 12% (between the Snowball's 7% kill drop and the Master Key's 15% floor spawn), not as a creep kill drop, so it cannot be farmed from the always-on pit spawns.
- Shard replaces the whole throw (including a Party Hat volley) and skips balloon-only extras; base damage still includes dumbbell and piggy.
- Creeps always use the Skitter cadence and cap on Basalt, independent of `spiderLvl`, so coin-toss spiders stay on their own gate.
- Temporary pixel art for the column and shard, as Jacob okayed; original filenames only.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Dawson_Creek (UTC-7).

- **Start:** Thu 26 Nov 2026, 9:43 PM
- **Official freeze:** 9:57 PM (`node tools/release.mjs m1.76`)
- **Official `npm test`:** 9:57–10:06 PM (about 8.5 minutes)
- **Wall-clock, start to freeze:** about 14 minutes
- **Model turns (approx.):** about 20
- **Tool calls (approx.):** about 90 (sync, revert, art, feature, tests, official suite, this handoff, the text/HTML push). Tokens: not available
