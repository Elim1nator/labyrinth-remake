# M1.58 handoff

## What was wrong
The featured rule was already "unshift one, plus a second from floor 5, and also roll from the pool". Real-flow counts on M1.57 showed Tiled Baths L2–4 always had at least 1 Bather (often 2–4; L3 averaged 3.8, but could be only 1, which is easy to miss). L5+ Baths and Mossy Cellar also met the minimum in the sample. **Slate Halls (and theoretically any L6+ theme floor) could drop to 1** after later generation steps: Rattlebone swaps from floor 6, and shop or boss-arena moves that fail to re-place a moved monster. The M1.57 test only counted map letter `a` via `genMap` / pool membership, so it could not catch a later swap eating the second featured Slick Man.

Two Treasure Knights is intended: one is spawned on every floor from 2, and a coin door can add another (`COINDOOR.chance` 0.45 × `mob` 0.22 × `knight` 0.4 ≈ 4%). In 640 floors, 19 had two and none had zero.

The statue sheet had been centred on each frame's bounding box, not the feet, and some frames had bottom padding, so the walk wobbled. The cycle used `ph*4` (4 frames/s); other walkers use `*6`–`*8`.

## The fix
- After all map mutations, `ensureThemeMob` restores the minimum: 1 on L2–4, 2 from L5, for the Bather, Lichen Face, Slick Man and Mortared Man.
- `bather.png` is re-cut: same 4 frames, height 120, feet centred and planted on the bottom edge.
- Walk rate is `ph*8` (8 frames/s, ~2×). Idle still uses frame 0.
- New `m158Tests` count placed ents after `startLevel` (real-flow), plus alignment and frame-rate checks.

## Art for Mr Lead
`assets/mobs/bather.png` changed; `slickman.png` and `items.png` unchanged. Blob SHA in the review / agent report.

## Freeze
- Tests: **568/568** passed (30 retired pre-M1.23/M1.31 checks).
- Release `builds/m1.58/index.html` 1570.8 KB (1608465 bytes), sha256 `b0c6afca95b516b8dc3535b0f6f5bc0bd060991e1341b79b35afd1069dce7b5f`.
- QA `builds/m1.58-qa/index.html` sha256 `54a5e2a28cf444e4a9defb764ccc4a15195ec262d3660d404c48a69dbd3fc0ad`.
- Main's frozen `builds/m1.57/` is unchanged.

## PNG git blobs for Mr Lead
- `assets/mobs/bather.png` (changed): 4-frame statue sheet recut, 232×120, 47528 bytes, blob `b56dd15b3d70bdf4f5e61ae44bbde99a0e0efd29`.
- `assets/mobs/slickman.png` and `assets/items.png` are unchanged.

