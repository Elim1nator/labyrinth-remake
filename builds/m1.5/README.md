# Labyrinth Remake — M1.5 prototype (placeholder title)

Inspired by early-90s maze shooters. Not monetized. All art and sound are original and made in code inside `index.html`. It is one self-contained file and makes no network requests.

M1.5 builds on M1.4 (elite mobs and power-ups, which already include all of M1.3). It adds the approved fixes from the M1.3 QA report, a Screamer redraw, a balance pass, minimap and seed-link fixes, and a full-screen map.

## Run
Open `index.html` in any modern browser. `index.html?seed=4242` plays a fixed map set; any text works as a seed.

## Controls
| Action | Keyboard / mouse | Gamepad (standard) | Touch |
|---|---|---|---|
| Move / strafe | WASD or ↑/↓ (A/D strafe) | Left stick | Stick under your left thumb |
| Turn / look | Mouse (click to lock), ←/→ | Right stick | Drag on the right side |
| Re-centre view | C or middle mouse | R3 | Double-tap the look side |
| Run | Shift | — | Stick pushed 80%+ |
| Throw | Space, Ctrl, left click | A or RT | THROW button |
| Use / open door | E or Enter | X | USE button |
| Use item | Q or right mouse | Y | ITEM button |
| **Full-screen map (new)** | **M or Tab** (again, Esc or a click closes it) | **Back / View** (again, B, A or Start closes it) | **MAP button** under the minimap, or tap the minimap; tap anywhere to close |
| Hide / show minimap | **Shift+M** (M used to do this) | — | — |
| Pause | Esc or P | Start | Pause button |

## Changelog (from M1.4)
**Fixes (QA report on M1.3)**
1. **M13-A1:** the phone pause button was scaled twice in `layout()` and had shrunk to 19–28 px. It now uses `43.5*s` and is 36–52 px at every tested size (43 px at 844x390). The new MAP button uses the same rule. The ITEM button never had this problem (it sizes from the screen height): 49–74 px.
2. **M13-A2:** throws at pitch 36 or more used to splash on the ceiling about 3 cells out. The throw vz cap is now 2.40 (was 2.45): the peak is 0.956, under the 0.97 ceiling check, and steep throws carry about 7.5 cells. The ceiling splash remains as a safety net.
3. **M13-A3:** a Hazewisp sitting in a fence cell could bite but couldn't be hit. Now a balloon in that fence cell checks the mob before the fence, so it can be hit there (it still bites from there). A wisp behind a fence is still shielded, and a balloon that misses is still stopped by the fence. The ranged elite version follows the same rule both ways: its own shots can leave the fence cell it is in.
4. **M13-A4:** the pause-menu LOOK SPEED row now has visible ◄ ► boxes that decrease and increase it (50%–200%; the box at the limit is dimmed). Tapping or clicking the label only selects the row. Keyboard and gamepad ←/→ are unchanged.

**Screamer redraw (original art, drawn from the description)**
- Ears are now broad, floppy lobes about as tall as the head (75–90% in every frame), each with a dark cupped hollow and a lit rim. They still flap through 4 frames.
- The O-mouth is about a third of the face width (13 px of about 40; it was about a fifth) and sits near the chin; it opens wider when screaming.
- The eye glints are gone; the sockets are deep and dark.
- Colour, size, hover, hitbox (0.30) and the elite/beefy outlines are unchanged.

**Balance**
- SPRINGLE now first appears on level 3; level 2 introduces only the KETTLEGRUMP.
- Level 5 always has a CLUNKBOT plus a KETTLEGRUMP and one extra mob (11 instead of 10). Mean total mob HP over 400 seeds: L4 43.0, L5 44.6, L6 46.1.

**Minimap and seed links**
- Minimap colours are now distinct (every mob, item and player marker pair is at least 60 apart in RGB): CLUNKBOT is steel grey `#c4cad6` (was blue like the Screamer), ZAPFLY is lime `#b6ff2e` (was the key's yellow), SPRINGLE is `#ff7020` (was close to coin gold).
- A `?seed=` link no longer gets silently ignored when a save exists. The title shows "LINK SEED n - NEW GAME PLAYS IT", NEW GAME is preselected, and CONTINUE is still offered with its own seed ("CONTINUE - LEVEL 3 (SEED 4242)").

**Full-screen map (new)**
- Opens over the whole screen and pauses the game while open (mobs, balloons, shots and timers all stop).
- Shows explored tiles only (the same fog as the minimap): walls, doors, locked doors, fences and the exit. It also shows keys, coins, hearts, power-ups and monsters standing on explored tiles.
- Your position has a pulsing ring and a facing arrow.
- It has a legend (map symbols plus each monster's colour), the level name, "EXPLORED n%", and a close hint for the current input.
- The touch MAP button sits under the minimap. It clears the message band, HUD, item bar and other buttons at all 11 tested sizes.

## Known limits
- Level 3's average mob HP (23.4) is a little below level 2's (24.9), now that the 5-HP Kettlegrump leads level 2 and the 2-HP Springle arrives on level 3. Mob counts were left alone, since difficulty tuning (B1) isn't approved.
- On desktop, Esc while the mouse is captured releases the capture first (a browser rule); press M, Tab or click to close the map in that case.
