# M1.75 handoff

The Rattle Sovereign replaces the Luggernaut, cut from main at M1.74.1 (`447992a2`). Branch `Grok-Code-16`. No PR, no merge, no force-push. Grok-Code-14 and Grok-Code-15 were left alone.

## What changed

The new boss sits in the Luggernaut's slot (floors 10, 25, …; map letter `J`; type id `sovereign`). It walks, shoots skulls (`sovskull`, new art — not the Infernal wither `skull`), and has three phases at 75%, 50% and 25% of max HP (`Math.round`). A hit that would pass a threshold clamps there, so overkill cannot skip a phase.

At each threshold it collapses into a big bone pile and cannot be hurt (and does not bite) while down. It scatters 2–3 smaller piles. A small pile is a Rattlebone (`skeleton`) in `state='pile'` and rebuilds after 4.5 s (`BONES.reform`) unless a balloon smashes it first. Then the Sovereign reforms and keeps fighting. Times in `SOV` / `docs/BALANCE.md`: collapse `fallT` 0.6 s, wait until every small pile is smashed or rebuilt, reform `riseT` 1.0 s (about 5.5 s if you leave the piles alone; tests measured 5.6 s). The message `IT COLLAPSES! SMASH THE PILES!` (30 characters, ≤42) sits in the top HUD band, clear of the touch buttons.

Boss loot, arena lock, wake, the sealed portal and `BOSS_LOOT` (15 coins + a run item + a use-item) are unchanged. The Luggernaut is retired from `MOBS`, `BOSS_ORDER`, the atlas pack, `SPR`, AI and tests (version-gated). `assets/mobs/lugg.png` is left on disk, no longer packed.

## Balance (`SOV`)

- Base HP 48 (Luggernaut was 45). Floor and tier HP scale unchanged: `ceil(base × hpMul) + 5 × (floor − 1)`.
- Walk speed 1.05 cells/s.
- Skull: 4.2 cells/s, 1 heart, no wither, 0.4 s telegraph. Cadence 2.2 / 1.9 / 1.6 / 1.4 s in phases 0–3 (times `cdMul`).
- Thresholds: 75%, 50%, 25%. Clamp, then invulnerable in `sovfall` / `sovdown` / `sovup`.
- Small piles: 2–3, spread about 0.95 cells, smash or rebuild in 4.5 s.
- Collapse 0.6 s + wait + reform 1.0 s.

## Art

Jacob's green-screen JPGs (`walk_sheet.jpg` 5 frames, `collapse_sheet.jpg` 4 frames in a mid-row, `front_pose.jpg`, `skull_projectile.jpg`) were chroma-keyed (including dark green fringe), scaled nearest-neighbour, feet-centred, and packed with `node tools/assets.mjs pack`. Walk and collapse share a 98×105 destination; the close-up front pose is scaled to that height (sheet width 98 so the arms are not cropped). The small pile is a smaller copy of the crowned full-pile frame (42×47). The skull is 18×24, `k:1` (mobs `k:1.5`). Original filenames only.

PNGs were **not** pushed (text/HTML only). Blob SHAs below are for Mr Lead to upload:

| path | git blob SHA | bytes | pixels |
|---|---|---:|---|
| `assets/mobs/sovereign.png` | `ba44ec30377adba2e21e2556dd90a72004a31f70` | 46609 | 490×105 (5 walk frames) |
| `assets/mobs/sovereign_idle.png` | `ba5091507fde794dc0b0e25a0c9f1d7c9a38c488` | 11557 | 98×105 (front / idle / attack) |
| `assets/mobs/sovereign_fall.png` | `26a97780556ea4743dcbb926d6cc72399c3750c8` | 24709 | 392×105 (4 collapse frames; play reverse to reform) |
| `assets/mobs/sovpile.png` | `9e5eb0a13422bd9b3dcb39091d9868a327f5c7fe` | 3936 | 42×47 (small pile) |
| `assets/boss/shot_sovskull.png` | `10595495d7ee9166e4d25499aab1c68717c3e570` | 940 | 18×24 |

## Freeze

Main was rechecked immediately before numbering and again before this handoff: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, so this is **M1.75**.

- Official freeze: `node tools/release.mjs m1.75` at **8:01 PM America/Vancouver** (a re-freeze after adding `SPR.sovereign_idle` / `SPR.sovereign_fall` aliases so `api.atlasPng` matches the atlas / `MOB_SHEETS` names; src was not changed after that freeze).
- Release `builds/m1.75/index.html` 1989.5 KB (2,037,237 bytes), sha256 `85a18a3d448938742326b1998c24d8fe32bfdbc949c504be746233599c2a177c`.
- QA `builds/m1.75-qa/index.html` 1989.5 KB (2,037,235 bytes), sha256 `e1ce520163dfeb89eb3a0bd31a86afc20a6e4c2c8db382ae107f37caa240c1f8`.
- Official `cd tests && npm test` on the frozen QA build: **690/691** passed (30 retired pre-M1.23 / pre-M1.31 checks). All nine new M1.75 checks pass. Fetch is mocked; the suite made no live score-board posts.

The one failure is `M1.3 Zapfly flies fast and erratically` (path 3.43 vs displacement 2.27, 2 sharp turns). It is an existing random-path check, unrelated to this boss. The A1 touch-START fullscreen flake did not show on this run.

Headless screenshots (from that official run):

- `test-output/m1.75/screens/m175_walking.png`
- `test-output/m1.75/screens/m175_shooting_skull.png`
- `test-output/m1.75/screens/m175_collapsed_piles.png`
- `test-output/m1.75/screens/m175_rattlebone_rebuild.png`
- `test-output/m1.75/screens/m175_reformed.png`

These live under gitignored `test-output/` and were not pushed.

## Decisions

- Official in-game name of the retired boss is **Luggernaut** (the brief's "Luggernaught" was treated as a typo).
- Type id `sovereign`, map letter `J` kept, `BOSS_ORDER = ['king','sovereign','owl']`.
- The Sovereign itself is never put in `state='pile'` (that would smash/kill it and `reform()` would refill its HP). Collapse uses `sovfall` / `sovdown` / `sovup`.
- New skull kind `sovskull` rather than reusing the Infernal wither skull.
- Collapse message lives in the existing top band (`setMsg`), never over the touch buttons.
- Walk sheet cells are uneven, so frames were sliced by content clusters, not equal 563 px cuts. Collapse is a horizontal mid-row of 4, not a 2×2 of 704.
- Front pose is a close-up; it is scaled to the walk/collapse dest height, not used to size the union bbox (that blew walk frames up).
- `api.hitBoss(n)` is n ticks of 1 damage, so a huge tick count cannot kill the Sovereign (it clamps, then the rest bounce off the pile). Tests that must actually drop a Sovereign use `api.hitBossOnce` / `api.defeatBoss` (and then advance so the death pop unseals the portal). Floor 1000 is a Sovereign floor (`floor % 15 === 10`).
- Dual `SPR` keys (`sovereignIdle` / `sovereign_idle`, and the same for fall) so draw code, `frameSig`, and `atlasPng` all resolve.
- `lugg.png` is left on disk and untracked by the atlas, not deleted.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. The session included a context compaction and a later mid-work interruption (a full-suite spawn aborted around 8:23 PM); work resumed on the same branch and freeze. Wall-clock is America/Vancouver (UTC-7).

- **Session start:** Thu 26 Nov 2026, 7:33 PM
- **Official freeze:** Thu 26 Nov 2026, 8:01 PM (`node tools/release.mjs m1.75`, the re-freeze after the SPR aliases)
- **Wall-clock, start to freeze:** about 28 minutes
- **Official `npm test` after the test-side portal/evaluate fixes:** 8:24–8:31 PM (about 7 minutes; earlier official runs crashed or were interrupted before a complete count)
- **Model turns (start to freeze, approx.):** about 50, including the first compaction
- **Tool calls (start to freeze, approx.):** about 140 (art processing, game/tests, pack, freeze, GitHub list_commits). Tokens: not available
- **After freeze (test fixes, suite reruns, this handoff, the text/HTML push):** about 25 more model turns and about 60 tool calls, plus the interruption/resume. Tokens: not available
