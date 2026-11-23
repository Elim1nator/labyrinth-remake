# Controls and features (M1.10)

## Keyboard and mouse

| Action | Keys |
|---|---|
| Move / strafe | W A S D (↑ ↓ also move forward/back) |
| Turn | Mouse (click the game to lock the pointer), or ← → |
| Run | Shift |
| Throw a balloon | Space, Ctrl or left click |
| Use (doors, slot machine, shop) | E or Enter |
| Use the held item | Q or right click |
| Switch balloon type | R (Shift+R for the previous type), 1–4 (Water, Red, Green, Yellow), or the mouse wheel |
| Switch backpack slot | F, or tap a slot of the item bar |
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
| Switch balloon type | LB |
| Switch backpack slot | RB |
| Map | Back / View |
| Pause | Start |
| Recentre | R3 (click the right stick) |
| Back in menus | B |

On-screen prompts switch to gamepad buttons when a pad is in use.

## Touch (phones and tablets, landscape)

- Floating stick on the left half (appears where your thumb lands; push far to run).
- Drag on the right half to look; double-tap there to recentre.
- Buttons: THROW, USE (shown only when something usable is in front), ITEM, BALL (shown once
  you own more than one balloon type), MAP and pause.
- Tap a slot of the item bar to pick it (Backpack).
- Tap the minimap to open the full map.
- Portrait shows a "turn your phone sideways" screen and pauses.
- Starting from the title requests fullscreen once.

## Pause menu

RESUME, SOUND (on/off), LOOK SPEED (50%–200%, ◄ ► arrows), INVERT Y. Settings are saved in
`localStorage` (`labyrinthRemake.settings.v1`).

## Map

A corner minimap (colour-coded keys, doors, exit, mobs, items, pits) and a full-screen map
(M / Tab / Back / MAP button / tap the minimap).

## Items and pickups

- **Coins** (from the floor, popped mobs and coin bags), **hearts**, **gold keys** that open locked doors.
- **Power-ups** (held in the item bar, use with Q / Y / ITEM): SPEED SNEAKERS, SHIELD BUBBLE,
  TRIPLE BALLOON, FREEZE POP, COIN MAGNET, GIANT BALLOON. Once used they last the rest of the
  floor and show as a HUD icon row. The Backpack (a shop item) adds a second slot, switched
  with F / RB / a tap on the bar. Details in [BALANCE.md](BALANCE.md).
- **Balloon types:** Water balloons are the default. Red, Green and Yellow are bought from the
  shop and switched with R / 1–4 / mouse wheel / LB / BALL.
- **Vaults** (from level 4): a second locked room with a spare key and a heart.

## Shop (Old Murkle)

Appears every even floor from floor 2 (never the tutorial). Talk to him with E / X / USE / a
tap. The shop is modal and pauses the game. He sells permanent balloon types and a Backpack,
plus two one-use power-ups per floor (see [BALANCE.md](BALANCE.md)). While it is open the
HUD (hearts, coins, keys, balloon type, item slots) stays visible; the panel covers the minimap.

## Slot machine

Found on floor 3 and on about 45% of other floors from floor 2 (never the tutorial). Use it
with E / X / USE. In-game coins only: a spin costs 3 coins, with no per-floor limit. The odds
are printed on the machine (see [BALANCE.md](BALANCE.md)).

## Pits, secret rooms and Rattlebone

- **Pits** from floor 3 (max 6): falling in is fatal. They show dark on the floor and on both
  maps. Ground mobs path around them; flyers cross over.
- **Secret rooms** on every generated floor: a cracked wall opens after 3 balloon hits and
  hides a coin bag or a power-up, usually with a mob.
- **Rattlebone** from floor 6: at 0 HP it becomes a bone pile, rattles at 3 s and reforms at
  4.5 s unless you smash the pile with a balloon.
- **Hazewisp** drifts through fences and closed doors, and flies over pits.

## Boss floors

Every 5th floor a boss guards the portal: King Gloop (5, 20, 35, ...), Luggernaut (10, 25, ...)
and Coghoot (15, 30, ...). The band says "BOSS FLOOR!" at the start. The portal is barred and
dim (also on both maps) until the boss falls; the exit door itself needs no key. The boss stays
in its arena room and wakes when you walk in. Opening its door plays a 5-second cut scene: you are pulled
inside, every door slams and locks until the boss falls, and "VS <BOSS>" comes up. While it fights, its name and a health bar show
in the message band. Beat it for coins, a heart and a power-up, and the portal opens.
CONTINUE on a boss floor restarts the fight.

## Floors, score and high scores

- Floor 1 is a hand-built tutorial; floors 2+ are procedurally generated, and floors are
  endless (up to 10,000). Every floor start is auto-saved (`labyrinthRemake.save.v1`) and the
  title offers CONTINUE. Permanent shop purchases are saved with the run.
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
