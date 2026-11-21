# Labyrinth Remake — M1.3 prototype (placeholder title)

Inspired by early-90s maze shooters. Not monetized. All art and sound are original and made in code inside `index.html`.

(This README was re-created on 2026-11-20 after a workspace reset; `index.html` was restored byte-for-byte, sha256 `e9a7fd13e609acd97ca48c546cf630b749b0a78c0a3316bd4a31562d5feaf697`.)

## Run
Open `index.html` in any modern browser. It is one self-contained file and makes no network requests.
- `index.html?seed=4242` plays a fixed map set. Any text works: `?seed=hello` is hashed to a number.
- Without `?seed=`, every new game gets a random seed.
- The seed is shown in the pause menu and stored in the auto-save, so CONTINUE gives you back the same maps.

## Controls
| Action | Keyboard / mouse | Gamepad (standard) | Touch |
|---|---|---|---|
| Move / strafe | WASD or ↑/↓ (A/D strafe) | Left stick | Stick under your left thumb |
| Turn | Mouse (click to lock) or ←/→ | Right stick | Drag on the right side |
| Look up / down | Mouse Y | Right stick Y (curved, ~1.1 s full range) | Drag up/down (12 px dead zone, axis lock) |
| Re-centre view | C or middle mouse | R3 | Double-tap the look side |
| Run | Shift | — | Stick pushed 80%+ |
| Throw | Space, Ctrl, left click | A or RT | THROW button |
| Use / open door | E or Enter | X | USE button |
| Pause | Esc or P | Start | Pause button |
| Pause menu rows | ↑/↓, Enter; ←/→ adjust LOOK SPEED, toggle SOUND / INVERT Y | D-pad | Tap |
| Resume | Esc / RESUME / click outside the panel or on the letterbox bars | B / Start | Tap outside the panel or on the bars |

## The mobs
| Mob | HP | Speed | Behaviour | First level |
|---|---|---|---|---|
| SCREAMER | 3 | 1.55 | Hovers, screams, bites | 1 |
| SPRINGLE | 2 | 1.9 | Hops | 2 |
| KETTLEGRUMP | 5 | 1.1 (charge 3.9) | Charges, puffs steam | 2 |
| HAZEWISP | 4 | 0.95 | Semi-transparent, passes fences | 3 |
| CLUNKBOT | 8 | 0.7 | Slow, tanky | 4 |
| ZAPFLY | 1 | 2.6 | Fast, erratic darts | 5 |

## Changelog (from M1.2)
1. 480x300 internal resolution, 64x64 textures, redrawn sprites, new 5x7 font, re-laid-out HUD.
2. Five new mobs (table above), introduced on levels 2–5.
3. Procedural levels 2–8 ("Rooms and Mazes"): rooms, maze corridors, doors, locked exit room, a vault from level 4, fences, scaled enemies; `?seed=`, seed in pause menu and save. Level 1 stays the tutorial.
4. Fixes: balloon capped below the ceiling, no double balloon, letterbox tap resumes, pause title/strips don't resume, LOOK SPEED clamps.
5. Screamer redrawn: slate-blue, wide, sideways blade ears, O-mouth; tighter hitbox.
6. Feel: pad pitch curve, touch axis lock + dead zone, re-centre (C / middle mouse / R3 / double-tap), longer empty-hand frame, see-through HUD over enemies when looking down.

## Credits
Map generation follows Bob Nystrom's "Rooms and Mazes" (2014) (reference code MIT). Our code is written from the article's description. Everything else is original.
