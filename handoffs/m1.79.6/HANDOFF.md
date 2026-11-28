# M1.79.6 handoff

Art swap on `Grok-Code-16` from the M1.79.5 tip `48a97df6de50146352fd3d6f5dc1a8dd6ddcd395`. Jacob asked to replace the Rattlebone and bone-pile art with new sheets, with no resize. No PR merge, no force-push. Local checkout was synced to that tip first. M1.79.5 and earlier builds are left intact. PNGs are not pushed; they are listed below for Mr Lead.

Main was rechecked before numbering: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75–M1.79.5 are not on main, so this is **M1.79.6**.

## What changed

Jacob's sheets (already transparent RGBA):

- Skeleton: `/workspace/labyrinth-main/skeleton/src-art/skeleton_new.png` (205×96). Five figures side by side: frame 1 is a planted idle stance, frames 2–5 are a walk cycle. Confirmed by inspecting the poses, not assumed from width.
- Bone pile: `/workspace/labyrinth-main/bonepile/src-art/bonepile_new.png` (146×32). Two frames, almost touching (no empty gap column): a plain skull-and-crossbones, then the same pile with glowing green eyes (the awakening / about-to-rise tell).

### Rattlebone (`assets/mobs/skeleton.png`)

The old sheet was 4 equal 36×60 walk frames (144×60, k 1.5), all with lime-green eyes, and `animFrame` used the default 4-frame cycle (`((e.ph*20)|0)%4`). There was no idle pose.

The new figures were cut from alpha-column runs, not a naive 41-px split: (0–35) 36 px, (42–79) 38, (84–119) 36, (126–162) 37, (168–204) 37, with 6 / 4 / 6 / 5 px gaps. 23 near-transparent blue fringe pixels were dropped, and 146 opaque blue-spill outline pixels had B neutralized to `max(R,G)`. Cream bone colours were not touched (0 body pixels changed). Each figure was placed 1:1 (nearest-neighbour identity — no scale) into equal **42×100** cells (210×100 sheet), feet on a shared baseline (foot y=97) and horizontally centred within 0.5 px of the cell mid (cx 20.50 / 20.50 / 20.50 / 20.00 / 20.00, mid 20.50), with at least 2 px of pad so nothing touches a frame edge. Atlas is `{file:"mobs/skeleton.png", frames:5, k:1.5}`.

Idle uses **frame 0**. Walk is **1-2-3-4** at the same cadence as the old cycle (`1+(((e.ph*20)|0)%4)`). World height stays **0.62**, so on-screen size stays close; the new figure is naturally slimmer (visible width about 0.22 cells vs about 0.27 before). The new skeleton has dark sockets, not lime-green eyes.

### Bone pile (`assets/mobs/bonePile.png`)

The old sheet was 2 equal 42×21 frames (84×21, k 1.5): a plain lump, then the same lump with lime-green eyes. `e.state==='pile'` still draws `SPR.bonePile[told?1:0]`: frame 0 while dormant, frame 1 from the 3 s tell until the 4.5 s reform (or until smashed). World height stays **0.2**.

The two new figures fill the 146-px sheet with no empty column between them (the bone tips meet at x=72/73), so they were split at that midpoint, not by a gap run: (0–72) and (73–145), 73 px each. No fringe was dropped (2 mid-alpha bone AA pixels and the 26 green-eye pixels were left as drawn). Each figure was placed 1:1 into equal **77×36** cells (154×36 sheet), feet on a shared baseline (foot y=33) and centred on the cell mid (cx 38.00, mid 38.00), with 2 px of pad. Atlas stays `{file:"mobs/bonePile.png", frames:2, k:1.5}`.

Frame 0 is the plain pile; frame 1 has the glowing green eyes. That still maps to the dormant pile and the "about to rise" tell (including Sovereign small piles, which have used this sheet since M1.75.1).

## Tests

New M1.79.6 checks (`V1796` / `ONLY=m179.6`):

- The Rattlebone sheet is 5 equal 42×100 frames with unique art, a shared foot baseline and horizontal centre within 1 px, and at least 2 px of pad. Atlas: `mobs/skeleton.png`, 5 frames, k 1.5. World height stays 0.62.
- Idle uses frame 0; walk is 1-2-3-4.
- The bone-pile sheet is 2 equal 77×36 frames with unique art, the same baseline/centre/pad rules, and atlas `mobs/bonePile.png`, 2 frames, k 1.5. Frame 0 has no green; frame 1 has the glowing eyes.
- In-game: a mid-walk Rattlebone (frame 3), a collapsed plain pile, and the green-eye tell.

The M1.79.1 green-spill scan still passes. Only `bonePile` is still whitelisted (26 intentional green-eye pixels). The new skeleton has 0 green-dominant pixels; from this build it is no longer required to have them. On pre-M1.79.6 builds the skeleton stays on the whitelist.

The M1.9 "shared palette with the deco bones pile" check is relaxed from this build, because the new pile is a different illustration. On older builds the original shared-palette check still runs.

- Official freeze: `node tools/release.mjs m1.79.6`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **788/788** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts.
- The M1.8 / A5 checks that finishing floor 8 leads on to floor 9 now always skip and unseal an Ice Wizard intro if floor 9 is Icy Prison, instead of only skipping when the first 0.05 s tick already shows intro mode. That is a test-only change; the frozen HTML was not rebuilt.
- M1.79.5 release/QA hashes were rechecked after this freeze and are unchanged (`b9c12de5` / `6207d6fe`).

## Freeze

- Official freeze: `node tools/release.mjs m1.79.6` at **6:06 PM America/Vancouver (UTC-7)**.
- Release `builds/m1.79.6/index.html` 2461.0 KB (2,520,053 bytes), sha256 `812e5802c17ae86de843bf2a4f69d95f30271610551aa8230e3ce3fe0d5d511a`, git blob `5bbd3d9cbab43af331b74850e85c015f5295bc6e` (same as packed `src/index.html`).
- QA `builds/m1.79.6-qa/index.html` 2461.0 KB (2,520,049 bytes), sha256 `e3bda0022558c7ef3b8e48855edfa7e55d6ebbe2e1a728a68fe0588a3d7dbef0`, git blob `4a97333bee9e009753569afd6b29cafa6e2e3f14`.

## Screenshots

Gitignored under `test-output/m1.79.6/screens/` (also copied to `/workspace/labyrinth-main/m179.6/`). Not pushed.

- Packed frames on a checkerboard (5 Rattlebone frames + 2 bone-pile frames): `m1796_frames_checker.png`
- Mid-walk in-game (seed 777, floor 6, Mossy Cellar, walk frame 3): `m1796_skeleton_walk.png`
- Plain bone pile after a knockout (dark sockets): `m1796_bonepile_plain.png`
- The same pile after the 3 s tell (glowing green eyes): `m1796_bonepile_eyes.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | sha256 | local path | notes |
|---|---|---:|---|---|---|
| `assets/mobs/skeleton.png` | `3cf57942ef010589b385e6b980832e6bf2fe3820` | 27257 | `0f9c47c5b79a96dda3f1c32473fb80dec2e28dfce900cb1abe54c36ea9bb94b7` | `/workspace/labyrinth-remake/assets/mobs/skeleton.png` | New 5-frame idle+walk from `skeleton_new.png`, 210×100 (42×100 per frame), k 1.5. Replaces the old 144×60 4-frame sheet (blob `347b75212a77d794e7d8eda740e7449bfd00b0ae`, 2611 B). |
| `assets/mobs/bonePile.png` | `0ade0fedd269b0f7f44d620c5556392717e8c973` | 4835 | `33992f5dd8408a63aca11f5c0c6c1cff9ca98a68c8076793a0aa47949ed0a1b0` | `/workspace/labyrinth-remake/assets/mobs/bonePile.png` | New 2-frame pile from `bonepile_new.png`, 154×36 (77×36 per frame), k 1.5. Replaces the old 84×21 sheet (blob `ae1cfe1cd7dd04195fa2ebd3a5e1b9332fb0dd17`, 661 B). |

Source art copies (not in the repo): `/workspace/labyrinth-main/skeleton/src-art/skeleton_new.png`, `/workspace/labyrinth-main/bonepile/src-art/bonepile_new.png`.

## Decisions

- Keep native pixel size. Pad to equal cells and centre on the feet rather than scaling down to the old 60-px / 21-px cell heights.
- Keep world heights (0.62 / 0.2) and atlas `k` 1.5, so on-screen size stays close. Do not raise the skeleton's world height to recover width; the new figure is just slimmer.
- Detect skeleton cuts from alpha columns. Split the bone pile at the midpoint where the two figures' bone tips meet (there is no empty gap column).
- Wire idle to the planted standing pose (frame 0) and keep a 4-frame walk at the old cadence.
- Leave the bone pile's tell/reform timing and Sovereign small-pile use unchanged.
- Drop only blue fringe / outline spill on the skeleton. Do not touch cream bone pixels, and do not despill the bone pile's green eyes or mid-alpha AA.
- Take `bonePile` off the "must have green" side of the M1.79.1 whitelist for the skeleton only; the pile still needs the whitelist.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 6:00 PM
- **Official freeze:** 6:06 PM (`node tools/release.mjs m1.79.6`)
- **Official `npm test`:** 6:14 PM–6:22 PM first run 787/788 (M1.9 shared-palette check, then gated), 6:23 PM–6:31 PM second run 785/788 (M1.8 / A5 Ice Wizard intro skip was too narrow when floor 9 is Icy Prison, plus an A6 pointer-lock flake; the skip was then tightened in the tests only, with no HTML re-freeze), then 6:32 PM–6:40 PM **788/788**
- **Wall-clock, start to freeze:** about 6 minutes
- **Model turns (approx.):** about 25
- **Tool calls (approx.):** about 120 (sync, pack, tests, official suite, the M1.9 follow-up, intro-skip harden, this handoff, the text/HTML push). Tokens: not available
