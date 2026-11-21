# Labyrinth Remake — M1.8 prototype (placeholder title)

A single-file browser maze shooter, inspired by early-90s maze shooters. Open `index.html` in a browser.
This is the **release** build: it exposes no debug hook unless the URL has `?debug`. The QA build (hook always on) is `../m1.8-qa/`.

## What changed since M1.7
- **Endless floors.** There is no final win any more: every exit leads to the next floor (up to floor 10,000, the score API's limit). Saves and CONTINUE work on any floor.
- **Fair scaling with caps.** Floors 1–8 keep their M1.7 layouts. Past floor 8:
  - mobs per floor go up to a maximum of 22 (reached on L13)
  - coins are capped at 30
  - mob HP rises 6% per floor up to ×1.6 (L18)
  - elite chance is capped at 60% (L12); elites have two modifiers from L8
- **Deeper wall styles.** A new wall texture unlocks every 4 floors past 8. Each deeper floor is built around an unlocked deep style, the newest about half the time. All textures are original procedural pixel art, generated once and cached.

  | From floor | Style |
  |---|---|
  | L9 | Basalt |
  | L13 | Rusted iron |
  | L17 | Crystal |
  | L21 | Glyph stone |
  | L25 | Void runes |

- **Score.** 1,000 per floor below the first, plus 50 per monster popped, 100 more per elite, and 5 per coin picked up. It is capped at floor × 100,000 and at 10,000,000. The score shows on the pause, level-clear and death screens.
- **Death ends the run** and shows your score. Next you can enter a name (1–16 letters, digits, space, `_` `.` `-`). The box always starts empty. Then the high score page opens; it can also be opened from the title (HIGH SCORES).
- **High scores.**
  - The game talks to a same-origin API using relative paths only (`/api/labyrinth/health`, `/api/labyrinth/scores`). No credentials are stored in the game.
  - Entries are checked against the server's rules before sending.
  - If you send too many scores (429), you get a friendly "wait a minute, then try again" message and can retry.
  - When the board can't be reached (file://, offline, server down), a local top 10 is kept in this browser and labelled LOCAL.
- **Slot machine.**
  - Appears on floor 3 and on about 45% of the other floors from floor 2 (never the tutorial). Use it with E / gamepad X / the touch USE button.
  - It uses in-game coins only. Spins cost 5, 10 and 15 coins, with at most 3 spins per floor.
  - The odds are printed on the machine:

    | Result | Chance |
    |---|---|
    | Nothing | 55% |
    | Coins back (×1) | 20% |
    | Jackpot (×3) | 5% |
    | +1 heart (1 coin if your hearts are full) | 10% |
    | Random power-up | 10% |

  - Expected coin return is 0.35 × the cost, so you can't farm coins with it.

Controls are as in M1.7 (WASD + mouse, Space/Ctrl/click to throw, E use, Q item, M/Tab map, Shift+M minimap, P/Esc pause; gamepad; touch).
Frozen build; sha256 in `../SHA256SUMS`.
