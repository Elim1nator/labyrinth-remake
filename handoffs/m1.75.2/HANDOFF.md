# M1.75.2 handoff

Jacob confirmed the wall renderer is fine. The seam he disliked is in the **moss** tile art (`assets/walls.png` 'moss', the vine-covered stone on Basalt Depths). This freeze retouches that tile so it wraps left to right. Branch `Grok-Code-16`, on top of M1.75.1 (`367cbf6`). No PR, no merge, no force-push. The wall renderer is unchanged. M1.75 and M1.75.1 builds are left intact.

Main was rechecked before numbering and again after the official suite: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75 / M1.75.1 are not on main, so this is **M1.75.2**.

## Art fix

The old moss tile is a 128×128 3-panel mural, but the panels were uneven (~32 / 63 / 33 px) and the right edge cut through a stone face with no mortar, so a sheared block and a broken vine met at every tile wrap (visible in Jacob's Level 10 screenshot).

Only the moss tile in `assets/walls.png` was edited (the pack step embeds that PNG; it does not regenerate it from other source art). The new tile keeps the same look, 64-colour palette (no new colours), pixel style and 128×128 size. Three even stone faces sit between 6 px mortar joints, with one joint split across the 127→0 edge so it is not doubled. Vines were blended across that wrap (snapped back to the original palette) so stems are not sheared. Top canopy and the bottom mortar line stay complete.

`node tools/assets.mjs pack` / `node tools/release.mjs m1.75.2` embedded the new sheet.

## Other wall tiles

All 20 wall styles (plus door, locked and fence) were checked by tiling each 4-wide and zooming the 127→0 seam. Brick, stone, wood, tile, basalt, rust, slate, glyph, ember, sandstone, granite, cobble, limestone, dripstone, shale, ironbound, icetile, frostwall and icebrick were **not** clearly broken: joints generally fall at or very near the tile edge, and none had a mid-face cut-off block or a doubled joint like moss. Door and locked are complete door leaves, not wall runs, and were left alone. No other tile was changed.

## Freeze

- Official freeze: `node tools/release.mjs m1.75.2` at **9:27 PM America/Vancouver**.
- Release `builds/m1.75.2/index.html` 1971.3 KB (2,018,568 bytes), sha256 `a6c0598a2655438576fcf7f019eb4a00f201f22699aaacaaf1f8dbe786ae17c0`, git blob `4534c1b9def217b75e263d8b83b713c32a3088dd` (same as packed `src/index.html`).
- QA `builds/m1.75.2-qa/index.html` 1971.3 KB (2,018,564 bytes), sha256 `a2658063f36ba0e2551ec92530862d09909981ceec3bb1cccc0ebfec75f524ed`, git blob `d77ab6f5470c7379eab44e983d4fbdded4967bb7`.
- Official `cd tests && npm test` on the frozen QA build: **695/695** passed (30 retired). Fetch is mocked; the suite made no live score-board posts.
- M1.75 and M1.75.1 release/QA hashes were rechecked after this freeze and are unchanged.

## Screenshots

Gitignored under `test-output/m1.75.2/screens/` (also under `/tmp/wall-seams/`). Not pushed.

- 4-tile horizontal strips, old vs new moss side by side (stacked): `moss_tile_strip_before_after.png` and a 2× nearest-neighbour copy `moss_tile_strip_before_after_2x.png`
- Long moss wall on Basalt Depths (seed 1, floor 10), close and a few cells back, plus the along-wall glance: `wall_{before,after}_basalt_moss_{faceon,along,far}.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | notes |
|---|---|---:|---|
| `assets/walls.png` | `571dfb4a2fcc92047a54799fa7e9f96938c417d9` | 171336 | 1280×384, 8-bit palette; only the moss tile (row 0, col 4) changed. Was `a89eab312663083b7b5ccfb5df42b274bd73135d`, 174577 B. |

No other PNG changed.

## Decisions

- Fix the art, not the renderer (Jacob confirmed the renderer is fine).
- Even 3-panel spacing with a single wrap joint, rather than stretching the old narrow side panels (that smeared the vines).
- Leave every other wall tile alone; only moss was clearly broken.
- Text/HTML only on the push; `walls.png` is listed above for Mr Lead.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Thu 26 Nov 2026, 9:19 PM
- **Official freeze:** 9:27 PM (`node tools/release.mjs m1.75.2`)
- **Official `npm test`:** about 9:28–9:36 PM (about 8 minutes)
- **Wall-clock, start to freeze:** about 8 minutes
- **Model turns (approx.):** about 15
- **Tool calls (approx.):** about 45 (seam inspection, tile rebuild, pack, official suite, this handoff, the text/HTML push). Tokens: not available
