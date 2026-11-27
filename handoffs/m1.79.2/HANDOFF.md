# M1.79.2 handoff

Follow-up fix on `Grok-Code-16` from the M1.79.1 tip `b77bae5b11bbaf80fa4195f5be1abe193c0a2256` (Mr Lead had uploaded the five M1.79.1 PNGs; they were verified, and the local checkout was synced to that tip first). Jacob: "Walls and holes made by the awakened fireball should be like regular pits rendering down." No PR, no merge, no force-push. M1.79.1 and earlier builds are left intact. Grok-Code-14 and Grok-Code-15 were not touched. No PNGs were changed.

Main was rechecked before numbering: still M1.74.1 at `447992a`, and M1.75–M1.79.1 are not on main, so this is **M1.79.2**.

## What changed

On Basalt Heights, both the pit cells that replace walls (`t===11`) and the holes the Awakened Basalt's fireballs burn in the floor were drawn as flat dark ellipses (see M1.77 `m177_floor_overview` / `m177_explosion_holes`). They now go through the existing regular-pit shaft renderer — the same path used for falling Basalt pits (`t===6`): a square cell-shaped opening with visible inner shaft walls, the stone texture, shading and a depth fade.

The change is a reuse, not a new renderer:

- The dedicated M1.77 floor-pixel ellipse for `gc.t===11` was removed.
- The shaft loop now accepts `t===6` or `t===11`.
- Adjacent shaft cells merge when the neighbour is `t===6` or `t===11`, so a cluster of Heights pits (or a mix with a falling pit) has no inner walls between them, the same way neighbouring `t===6` pits already merged.
- Per-frame stats `pitShaftPx`, `pitShaft6` and `pitShaft11` count which path wrote the pixels, so the tests can assert Heights pits and fireball holes use the regular shaft.

When a fireball converts a floor tile (`deepConvertTile` still sets `c.t=11`) it becomes a regular pit visually at once. The existing `addBoom` flash is the transition; no new crumble animation was added.

Unchanged, as required:

- No-ceiling fog sky (`L.openSky`)
- Movement blocking (`solidAt` still treats `t===11` as solid)
- No-fall rule (`pitUnder` stays on `t===6` only)
- Connectivity guard (`deepWouldDisconnect`) and the 14-hole cap (`DEEP.holeCap`)
- Creeps still emerge from the pits (no new climb animation; they spawn on the adjacent floor at the lip, and the emerge screenshot shows a creep at the shaft edge)

## Performance

Headless Chromium, seed 777, a full Basalt Heights floor of pit cells, 20 warmup `render()` then 200 timed `render()` (`performance.now()/N`). Internal buffer is 480×300.

| canvas | before (m1.79.1-qa) | after (m1.79.2-qa, official freeze) |
|---|---:|---:|
| phone 844×390, deviceScaleFactor 2 | 1.55 ms (look-down 1.59) | 2.45 ms (look-down 2.32) |
| phone 844×390, 1× | 1.53 ms (look-down 1.50) | — |
| desktop | 1.74 ms (look-down 2.41) | — |

About 1.6× the cheap ellipse, still far under a 16.7 ms (60 fps) budget. The official test budget is 8 ms; the frozen QA build measured 2.45 / 2.32 ms on that phone canvas.

## Tests

New M1.79.2 checks (`V1792` / `ONLY=m179.2`):

- Heights `t===11` cells use the regular shaft path (`pitShaft11` is large; `pitShaft6` is 0 on Heights).
- Movement is still blocked, `pitUnder` is false on a `t===11` cell, `openSky` stays true.
- A fireball-converted hole uses the same shaft path once the tile converts.
- The 14-hole cap, connectivity-style conversion and no-fall rule are unchanged.
- A close look down a Heights pit, a fresh fireball hole next to an older one, a creep at a pit lip, and a regular Basalt Depths `t===6` pit (still `pitShaft6`, `pitShaft11===0`) are posed for screenshots.
- A full Heights floor on a phone-sized canvas (844×390, dsf 2) stays under 8 ms/frame.

## Freeze

- Official freeze: `node tools/release.mjs m1.79.2` at **11:00 AM America/Vancouver (UTC-7)**. Posing-only test edits after the freeze did not change `src/index.html`, so the HTML was not re-frozen.
- Release `builds/m1.79.2/index.html` 2417.0 KB (2,475,030 bytes), sha256 `6783147543cbeb897a81640052af2772e12d55b3a89332b6842cf2170991a7c2`, git blob `8c44e269ced0ddbae568e85123198e2f1621b6c0` (same as packed `src/index.html`).
- QA `builds/m1.79.2-qa/index.html` 2417.0 KB (2,475,026 bytes), sha256 `67f1ed1f70e49c6b4bc836632a5cc07abd51c21c8382d30e44590d4fa5e1be57`, git blob `f72c80908a472f6560e053bf4e83fa0a24c4593b`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **755/755** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts. M1.79.1 was 746; this release adds nine shaft/movement/convert/cap/screenshot-pose checks and the frame-time budget (755 = 746 + 9).
- M1.79.1 release/QA hashes were rechecked after this freeze and are unchanged (`f70a9d79` / `4887923c`). M1.79 is also unchanged (`6e16a1dc` / `997cf0bb`).

## Screenshots

Gitignored under `test-output/m1.79.2/screens/` (also copied to `/workspace/labyrinth-main/m179.2/`). Not pushed.

- Floor overview, Basalt Heights, Awakened Basalt in frame, merged square shafts in the floor, fog sky: `m1792_floor_overview.png`
- Close look down into a Heights pit (square opening, inner shaft walls, depth fade): `m1792_pit_close.png`
- A fresh fireball hole next to an older one (explosion flash over the new shaft): `m1792_fireball_holes.png`
- A Skittering Creep at a Heights pit lip, coming up out of the shaft: `m1792_creeps_from_pit.png`
- A regular Basalt Depths falling pit (`t===6`) for comparison: `m1792_depths_pit.png`

## PNGs

None. No asset sheets were edited for this milestone.

## Decisions

- Route `t===11` into the existing shaft loop rather than write a second pit drawer, so Heights pits and fireball holes stay visually identical to regular pits, including merge behaviour.
- Keep `solidAt` / `pitUnder` / `holeCap` / `openSky` / the connectivity guard as they are; this is a render-path fix only.
- Use the existing `addBoom` flash as the fireball-hole transition instead of adding a new crumble.
- Leave creep emerge logic alone (they already spawn on adjacent floor); the screenshot is posed at the lip over a visible shaft.
- Measure frame time on the phone-sized canvas before (M1.79.1) and after (frozen M1.79.2) in the same headless method, and budget the official test at 8 ms.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 10:54 AM
- **Official freeze:** 11:00 AM (`node tools/release.mjs m1.79.2`)
- **Official `npm test`:** first run 11:00 AM–11:08 AM (about 8 minutes, 754/754 before the later creep-pose assertion); confirmation run after screenshot posing 11:14 AM–11:22 AM (about 8 minutes, **755/755**)
- **Wall-clock, start to freeze:** about 6 minutes
- **Model turns (approx.):** about 12
- **Tool calls (approx.):** about 50 (sync, renderer change, before/after frame times, freeze, official suite, screenshot posing, this handoff, the text/HTML push). Tokens: not available
