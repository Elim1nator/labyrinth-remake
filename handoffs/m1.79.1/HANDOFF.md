# M1.79.1 handoff

Follow-up fix on `Grok-Code-16` from the M1.79 tip `84e258e8f0159f58c00cb5f8e23dc531142179bc`. Mr Lead has not uploaded the M1.79 PNGs yet; the packed M1.79 sheets were kept locally, cleaned, and are listed below for upload. No PR, no merge, no force-push. Local checkout was synced to that tip first. M1.79 and earlier builds are left intact. Grok-Code-14 and Grok-Code-15 were not touched.

Main was rechecked before numbering: still M1.74.1 at `447992a`, and M1.75–M1.79 are not on main, so this is **M1.79.1**.

## What changed

### Skittering Creep green-screen despill

Jacob's `creep_v3.png` (and the packed `assets/mobs/creep.png` from M1.79) had leftover green-screen spill: **919** pixels with alpha > 0, G > R+25 and G > B+25 (48 with alpha < 24, 871 with alpha ≥ 24), e.g. (0,82,0,98) and (0,39,0,255). They showed as a faint green fringe on the legs in `m179_near.png`.

Cleanup in `assets/mobs/creep.png` only, with no re-pack of frame geometry:

- 48 near-transparent (alpha < 24) green strays were dropped (alpha set to 0).
- The other 871 had G replaced with a nearby dark-purple body colour: the median RGB of neighbouring non-green, non-eye/tooth pixels (radius 4, alpha ≥ 128, luminance < 140). All 871 had such neighbours, so the max(R,B) fallback was not needed.
- Eyes, teeth and every other body colour were left untouched (497 eye/tooth-like pixels before and after; 0 non-green pixels changed). After the pass, **0** green-dominant pixels remain.

Logic, `animFrame` (`((e.ph*14)|0)%4`), atlas (`frames` 4, k 1.5), world height (0.30) and packing (four 147×132 cells, shared baseline) are unchanged.

### Awakened Basalt and Collector check

The four new Awakened Basalt sheets had **0** green-dominant pixels (source and packed). They did have near-transparent (alpha < 24) white-ish matte crumbs at the silhouette, which were dropped the same way as the Creep's green strays:

| file | green before / after | white-ish alpha < 24 before / after |
|---|---:|---:|
| `assets/mobs/deep.png` | 0 / 0 | 25 / 0 |
| `assets/mobs/deep_idle.png` | 0 / 0 | 18 / 0 |
| `assets/mobs/deep_cast.png` | 0 / 0 | 7 / 0 |
| `assets/mobs/deep_attack.png` | 0 / 0 | 9 / 0 |

Mid-alpha light-gray edges that match the interior stone were left alone (they are antialiasing of the rock, not a keying halo). Shared baseline, centring, k 1.6 and world height 1.08 are unchanged. The fireball is unchanged.

The M1.78 Debt Collector (`assets/mobs/collector.png`, blob `fa3d4f6f124414a0f5ef546731d8f6b0439da835`, 32147 B) has no green-dominant spill and no white-ish halo; it is unchanged since `f8066c81`.

### Test

A new M1.79.1 check scans every packed frame of every `assets/mobs/` sheet in the atlas: no frame may have a green-dominant semi- or opaque pixel (alpha ≥ 24, G > R+25 and G > B+25). After checking every mob/boss sheet, the only intentional hits are the lime-green eyes on the bone pile (`bonePile`, 6 pixels across 2 frames) and the Rattlebone skeleton (`skeleton`, 12 pixels across 4 frames); those two names are whitelisted. The Lichen Face does not trip the threshold. (Boss *props* under `assets/boss/`, such as goo and the portal, also have intentional green and were not part of this test.)

## Freeze

- Official freeze: `node tools/release.mjs m1.79.1` at **10:23 AM America/Vancouver (UTC-7)**.
- Release `builds/m1.79.1/index.html` 2417.0 KB (2,475,051 bytes), sha256 `f70a9d799699363cdbf0b6d7b22f7962671a82d6588f31f48746d33d304b9beb`, git blob `05cbedb9fa22245e8d2ddfef4939fa0ae5642fea` (same as packed `src/index.html`).
- QA `builds/m1.79.1-qa/index.html` 2417.0 KB (2,475,047 bytes), sha256 `4887923ce401e5e7bd6f8f01ac3309b4368bf3afc8dc8cb0647ed2f7eb042356`, git blob `b949fec89ff948d1b5eac2c1b17b1fb363b331e7`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **746/746** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts. Three new checks (despill scan, near screenshot, edge-zoom crop) sit on top of the M1.79 743.
- M1.79 release/QA hashes were rechecked after this freeze and are unchanged (`6e16a1dc` / `997cf0bb`). M1.78 is also unchanged (`b27e3b37`).

## Screenshots

Gitignored under `test-output/m1.79.1/screens/` (also copied to `/workspace/labyrinth-main/m179.1/`). Not pushed.

- Near in-game, same camera as `m179_near.png` (seed 1, floor 11, Basalt Depths, creep at `p.x+1.15`): `m1791_near.png`
- Edge zoom of the creep's legs from that near shot (crop 460,685 380×115, 6× nearest-neighbour, 2280×690): `m1791_edge_zoom.png`

The near shot has 0 green-dominant pixels in the creep region (the M1.79 near view showed a faint green fringe on the claws). Eyes and teeth are intact.

## PNGs (for Mr Lead — not pushed)

All PNGs changed since `f8066c8167ddcaef1c7e3c708e813e6c302f8427`. Collector is unchanged and not listed.

| path | git blob SHA | bytes | notes |
|---|---|---:|---|
| `assets/mobs/creep.png` | `d310eed56c2d621f667e73792a20c3afda2d0844` | 80815 | M1.79 4-frame walk after despill (was `25c30a86d4434dfeb5cf4eca8de705d0fc00d39f`, 80966 B). 588×132 (147×132 per frame), k 1.5. 919 green-dominant pixels → 0. |
| `assets/mobs/deep.png` | `0a34bfc2810fe0c2b1bff3131076927026fe6815` | 121135 | M1.79 4-frame walk after dropping 25 near-transparent white-ish crumbs (was `383b48d9aeaf72c230efb4dc45932414797ecb39`, 121285 B). 428×208 (107×208 per frame), k 1.6. |
| `assets/mobs/deep_idle.png` | `50aabffd868ed28a162afb4fd3cc6df26b782ee3` | 36177 | Idle after dropping 18 crumbs (was `8eb6600668d73d39d27cd4371402d78add38a613`, 36252 B). 133×208, k 1.6. |
| `assets/mobs/deep_cast.png` | `ecc1b6776885b30770fe633edcbdef6a537729ca` | 35550 | Cast after dropping 7 crumbs (was `21cbd45ed01fc2aaf16849515f24ca391a0c25b9`, 35589 B). 119×208, k 1.6. |
| `assets/mobs/deep_attack.png` | `08d8c008ff3074dd418d7b37cb5965febe28b6e0` | 40589 | Attack after dropping 9 crumbs (was `56e6fd8cc6b319a8aba3f3dcc6ba061be0082fac`, 40618 B). 201×208, k 1.6. |

## Decisions

- Despill to nearby dark-purple body colour rather than only `G = max(R,B)`, so legs stay in the same family as the carapace instead of going to pure black or a slightly cyan `max(R,B)` on pixels like (11,79,22). All 871 opaque/semi pixels had usable neighbours, so the fallback was unused.
- Drop only alpha < 24 green (Creep) or white-ish (Basalt) strays. Do not touch eyes, teeth, or non-green body pixels, and do not darken the Basalt's mid-alpha light-gray stone AA.
- Scope the new test to shipped `assets/mobs/` frames (mob and boss character art). Whitelist only `bonePile` and `skeleton` after scanning every sheet.
- Leave Collector bytes untouched (already clean since M1.78).
- Keep M1.79 packing, names, logic and on-screen sizes as they are.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 10:16 AM
- **Official freeze:** 10:23 AM (`node tools/release.mjs m1.79.1`)
- **Official `npm test`:** 10:23 AM–10:31 AM (about 8 minutes)
- **Wall-clock, start to freeze:** about 7 minutes
- **Model turns (approx.):** about 8
- **Tool calls (approx.):** about 40 (sync, spill analysis, despill, tests, official suite, this handoff, the text/HTML push). Tokens: not available
