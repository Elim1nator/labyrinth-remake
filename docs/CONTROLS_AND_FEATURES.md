# Controls and features (M1.8)

## Keyboard and mouse

| Action | Keys |
|---|---|
| Move / strafe | W A S D (↑ ↓ also move forward/back) |
| Turn | Mouse (click the game to lock the pointer), or ← → |
| Run | Shift |
| Throw a balloon | Space, Ctrl or left click |
| Use (doors, slot machine) | E or Enter |
| Use the held item | Q or right click |
| Full-screen map | M or Tab |
| Hide / show minimap | Shift+M (saved) |
| Pause menu | P or Esc |
| Mute / unmute | N (saved) |
| Recentre the view (look level) | C or middle click |

Mouse up/down looks up and down (pitch). Losing focus, hiding the tab or losing pointer lock
pauses the game and clears held inputs; one click resumes.

## Gamepad (standard mapping)

| Action | Control |
|---|---|
| Move | Left stick (push far to run) |
| Look (turn and pitch) | Right stick |
| Throw | A or RT |
| Use | X |
| Item | Y |
| Map | Back / View |
| Pause | Start |
| Recentre | R3 (click the right stick) |
| Back in menus | B |

On-screen prompts switch to gamepad buttons when a pad is in use.

## Touch (phones and tablets, landscape)

- Floating stick on the left half (appears where your thumb lands; push far to run).
- Drag on the right half to look; double-tap there to recentre.
- Buttons: THROW, USE (shown only when something usable is in front), ITEM, MAP and pause.
- Tap the minimap to open the full map.
- Portrait shows a "turn your phone sideways" screen and pauses.
- Starting from the title requests fullscreen once.

## Pause menu

RESUME, SOUND (on/off), LOOK SPEED (50%–200%, ◄ ► arrows), INVERT Y. Settings are saved in
`localStorage` (`labyrinthRemake.settings.v1`).

## Map

A corner minimap (colour-coded keys, doors, exit, mobs, items) and a full-screen map
(M / Tab / Back / MAP button / tap the minimap).

## Items and pickups

- **Coins** (from the floor and from popped mobs), **hearts**, **gold keys** that open locked doors.
- **Power-ups** (one held in the item bar, use with Q / Y / ITEM): SPEED SNEAKERS,
  SHIELD BUBBLE, TRIPLE BALLOON, FREEZE POP, COIN MAGNET, GIANT BALLOON. Details in
  [BALANCE.md](BALANCE.md).
- **Vaults** (from level 4): a second locked room with a spare key and a heart.

## Slot machine

Found on floor 3 and on about 45% of other floors from floor 2 (never the tutorial). Use it
with E / X / USE. In-game coins only: spins cost 5, 10 and 15 coins, at most 3 per floor. The
odds are printed on the machine (see [BALANCE.md](BALANCE.md)).

## Floors, score and high scores

- Floor 1 is a hand-built tutorial; floors 2+ are procedurally generated, and floors are
  endless (up to 10,000). Every floor start is auto-saved (`labyrinthRemake.save.v1`) and the
  title offers CONTINUE.
- Death ends the run and shows the score, then name entry: type on a keyboard, use the d-pad
  letters plus A/B on a gamepad, or tap the box on touch. The name box always starts empty.
- The HIGH SCORES page (also on the title) uses the same-origin API
  ([research/highscore-api.md](research/highscore-api.md)); otherwise a LOCAL top 10
  (`labyrinthRemake.localScores.v1`).

## URL options

| Option | Effect |
|---|---|
| `?seed=<text>` | Reproducible run. Any text is hashed into the seed; the level-clear screen shows a shareable seed link. |
| `?debug` | Exposes the `window.__game` test hook in the release build (the QA builds always have it). |
