# M1.66 handoff

## What was asked
1. **Jailer's Eye** — a glass eye that opens fences as if they were doors. Stone Keep only, rare.
2. **Boss cut-scenes** — a clear line of sight to the boss; lift fog for the intro, then restore the exact previous fog (including item and Slick Man effects).
3. **Coin-room CONTINUE farm** — after the Music Box opens a coin door and you take the reward, quit + CONTINUE was respawning the loot.
4. **Shared high score board** — every POST includes `version`; GET shape unchanged; local fallback on error/404; All versions / This version toggle.

## The work
- Fences are existing tile type `t===3` / map letter `F` (see-through iron bars). No new gate type.
- The Eye is a run item (`ITEMS.jailer`, theme `STONE KEEP`, max 1, weight 0.4, `onceFloor:true`). It drops from the theme-run-item path (loot, shop, coin doors, boss, skip) but not the slot machine (slots do not roll run items). While held, fences open like doors on walk or USE, play `SFX.door()`, show “THE FENCE YIELDS!”, and stay open / held. Opened fences persist on CONTINUE via `sv.fences`.
- Original 24×24 icon packed as `assets/items.png` tile 39 at (216,72): a front-facing glass prosthetic eye with a thin brass rim, teal iris, pupil, and gloss highlights. 36,594 bytes, 240×96, 40 tiles, 276 opaque pixels. Do not push the PNG; report the path and hashes for Mr Lead.
- Drop check on seeds 1–200 × L2–24: 16/199 Stone Keep floors (8.04%), 0 off-theme, 0 doubles.
- Coin-room loot: `sv.coinTaken=levelIdx` / `G.coinTaken`; skip placing that room's loot on CONTINUE. Paid-open state for non-Music-Box coin doors is unchanged.
- Intro camera (`pickIntroCam` / `applyIntroView`) prefers a clear raycast vantage near the player's intro end; if none is found it keeps the view and skips wall rendering between the camera and the boss. Fog is set to `fogLift` for the cut-scene and `VIEW.cur` is restored to `fogWas` when the intro ends. A new floor resets `VIEW.cur` to `viewDist()` so fog does not leak across floors. During the intro, the debug `enemyRect` is the boss (not a closer hallway corpse).
- High scores: relative `/api/labyrinth/` only (no absolute host). POST body is `{name,score,floor,seed,version}` with the build string, validated as at most 16 characters from `[A-Za-z0-9._-]`. GET is still `?limit=N`; the client asks for 50, filters All vs This version, and shows the top 10. A missing `version` on an old row is unknown (not this build). 404, error, or an unreachable API still falls back to the local top 10. The toggle is on the board (touch, keyboard, gamepad; not hidden behind touch buttons).

## Freeze
- Tests: **618/618** passed (30 retired pre-M1.23/M1.31 checks), including the official frozen QA build.
- Release `builds/m1.66/index.html` 1668.6 KB (1,708,601 bytes), sha256 `c92e12d6fc3a1a878234ecab103fdacbb172e9538d9ff3202bafe673fc0091f0`.
- QA `builds/m1.66-qa/index.html` 1668.6 KB (1,708,599 bytes), sha256 `760eace0fefa02570b0beaf046db9744a924b498e07f575dc986633ec78aca63`.
- Main was still `c878d07` (M1.64) at freeze; this branch stays based on Grok-Code-8 tip `788cdd17` (M1.65).
- Art: `assets/items.png` 36,594 bytes, git blob `c8cacbd5eaf43ad435899605f17442d519d56739`, sha256 `a17c3b50a1a67a0eed0bc54dd4e411ca434b77cf78d958e0147a585cf00e007a`. Not pushed.
- Screenshots: `/workspace/labyrinth-main/m166/` (`m166_jailers_eye.png` and `m166_intro_{king,lugg,masque,brood,yellow,owl}.png`).
