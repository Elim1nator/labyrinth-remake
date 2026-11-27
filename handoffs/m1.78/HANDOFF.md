# M1.78 handoff

Next release on `Grok-Code-16`, on top of Mr Lead's M1.77 PNG upload (`51f9c2e3296f9d82d9fb05c3f09431d5ae26243f`). No PR, no merge, no force-push. Local checkout was synced to that tip first (origin only tracks `main` by default; `Grok-Code-16` was fetched explicitly). M1.77 and earlier builds are left intact. Grok-Code-14 and Grok-Code-15 were not touched.

Main was rechecked before numbering: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75–M1.77 are not on main, so this is **M1.78**.

## What changed

Jacob asked to replace the Debt Collector art with a new 3-frame sheet (`/workspace/labyrinth-main/collector/src-art/collector_new.png`, 225×128 RGBA, real transparency; a hooded black-robed figure with a jack-o'-lantern face) and then to do the same for the Skittering Creep (`/workspace/labyrinth-main/creep/src-art/creep_new.png`, 926×128 RGBA, already transparent; a dark brown bug with red eyes, 5 frames side by side). Every frame has to draw right.

### Debt Collector

The current Collector was already a 3-frame walk in `assets/mobs/collector.png` (192×112 palette, 64×112 per frame, k 1.5). `animFrame` used frame 0 when idle or paid off, and a ping-pong `[0,1,2,1]` while walking (`((e.ph*6)|0)%4`). There was no separate idle or hurt sheet.

The new sheet is also 3 frames, so the walk cycle is unchanged. Frame boundaries were **not** assumed to be 75 px: alpha-column runs are 0–68 (69 px), 77–146 (70 px) and 156–224 (69 px), with 8 and 9 px gaps. Each figure was extracted with all alpha>0 pixels (no hood or robe cropping), placed 1:1 (nearest-neighbour identity — no scale) into equal 75×132 cells, feet on a shared baseline (foot y=129) and horizontally centred within 0.5 px of the cell mid (cx 38.00 / 37.50 / 38.00, mid 37.50), with at least 2 px of pad so nothing touches a frame edge or bleeds into a neighbour. Atlas stays `{file:"mobs/collector.png", frames:3, k:1.5}`. On-screen size stays close to the old Collector (`MOBS.collector.h` is still 0.62).

Idle and paid-off poses now use **frame 1** (the planted mid stride). Walk is still 0-1-2-1. There were no leftover old poses to drop.

### Skittering Creep

The current Creep was already a 5-frame walk in `assets/mobs/creep.png` (340×52 RGBA, 68×52 per frame, k 1.5). `animFrame` is `((e.ph*14)|0)%5` (0-1-2-3-4). Logic stays unchanged.

Frame boundaries were **not** assumed to be 185 px: alpha-column runs are (0,168) 169 px, (186,356) 171, (375,545) 171, (563,735) 173, (756,925) 170, with 17 / 18 / 17 / 20 px gaps. Legs and antennae reach close to their neighbours but do not bleed. Each figure was extracted with all alpha>0 pixels (no cropping), placed 1:1 into equal 177×132 cells, feet on a shared baseline (foot y=129) and horizontally centred within 1 px of the cell mid (cx 88.00 / 89.00 / 89.00 / 88.00 / 88.50, mid 88.50), with at least 2 px of pad so nothing touches a frame edge. Atlas stays `{file:"mobs/creep.png", frames:5, k:1.5}`. World height stays **0.30**. Aspect 177/132 ≈ 1.34 vs the old 68/52 ≈ 1.31; the visible fraction 128/132 vs ~48/52 is a little larger, accepted as "close" so the legs and antennae stay uncropped (same rationale as the Collector).

The walk cycle is still **0-1-2-3-4**. Spawn, combat, pit cadence, and banners are unchanged.

## Freeze

A first collector-only freeze at 8:56 AM (2178.0 KB) was superseded once the Creep sheet was packed into the same version.

- Official re-freeze: `node tools/release.mjs m1.78` at **9:05 AM America/Dawson_Creek (UTC-7)**.
- Release `builds/m1.78/index.html` 2330.9 KB (2,386,874 bytes), sha256 `b27e3b37f6930c8947b1400917ed1eb62668fd04990747ae3c31033f8d22be1a`, git blob `288cbb598fcf8be2e621d76c1b9a700663777d26` (same as packed `src/index.html`).
- QA `builds/m1.78-qa/index.html` 2330.9 KB (2,386,872 bytes), sha256 `ceac0773e10ff5b324c3d757c3b90db08f0bda6c5f2e1f580590179ddd654838`, git blob `ff204fefb21a7b4fe833543e5d4c2e13f64e2c14`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **736/736** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts.
- M1.77 release/QA hashes were rechecked after this freeze and are unchanged (`317e69ed` / `9a56938c`, blobs `c61eb136` / `e0f43191`).

## Screenshots

Gitignored under `test-output/m1.78/screens/` (also copied to `/workspace/labyrinth-main/m178/`). Not pushed.

Collector:

- Packed frames on a checkerboard: `m178_frames_checker.png`
- The same three frames in-game: `m178_frames_ingame.png`
- Collector near: `m178_near.png`
- Collector far: `m178_far.png`
- Animation strip across walk frames in-game: `m178_anim_strip.png`

Creep:

- Packed frames on a checkerboard: `m178_creep_frames_checker.png`
- The same five frames in-game: `m178_creep_frames_ingame.png`
- Creep near: `m178_creep_near.png`
- Creep far: `m178_creep_far.png`
- Animation strip across walk frames in-game: `m178_creep_anim_strip.png`
- A creep coming out of a pit: `m178_creep_from_pit.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | notes |
|---|---|---:|---|
| `assets/mobs/collector.png` | `fa3d4f6f124414a0f5ef546731d8f6b0439da835` | 32147 | New 3-frame walk from `collector_new.png`, 225×132 (75×132 per frame), k 1.5. Replaces the old 192×112 palette sheet (blob `e2ba5437300268a8f5d82e6673ba4334be794eb8`, 5094 B). |
| `assets/mobs/creep.png` | `39e7ffb3b7db53b8013848040521e8cb613b7e9a` | 141057 | New 5-frame walk from `creep_new.png`, 885×132 (177×132 per frame), k 1.5. Replaces the old 340×52 sheet (blob `4683f8bb23524854fb0a9ddf2d05aeee0b819675`, 27606 B). |

## Decisions

- Keep the Collector's existing 0-1-2-1 ping-pong rather than invent a new cycle; the new sheet is the same three walk poses, just higher-res and already transparent.
- Use Collector frame 1 for idle/paid because it is the most planted, front-facing pose; frames 0 and 2 are the stride poses.
- Keep the Creep's existing 0-1-2-3-4 walk (`((e.ph*14)|0)%5`). The new sheet is a 5-frame walk; spawn and combat logic stay the same.
- Pack both sheets 1:1 with padding instead of scaling down to the old cell height, so hood/robe and legs/antennae stay uncropped. World heights are unchanged, so on-screen size stays close.
- Detect frame cuts from alpha columns. A naive 75-px Collector split would have clipped the left of frame 0 and the right of frame 2 (those figures already touched the source edges). A naive 185-px Creep split would not have matched the actual 169–173 px runs, and the legs and antennae reach close to their neighbours.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Dawson_Creek (UTC-7).

- **Start:** Fri 27 Nov 2026, 8:47 AM
- **First (collector-only) freeze:** 8:56 AM — superseded
- **Official re-freeze (Collector + Creep):** 9:05 AM (`node tools/release.mjs m1.78`)
- **Official `npm test`:** 9:05 AM–9:13 AM (about 8 minutes)
- **Wall-clock, start to freeze:** about 18 minutes
- **Model turns (approx.):** about 12
- **Tool calls (approx.):** about 70 (sync, Collector pack, Creep pack, tests, official suite, this handoff, the text/HTML push). Tokens: not available
