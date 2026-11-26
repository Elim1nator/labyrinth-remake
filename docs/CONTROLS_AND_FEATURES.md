# Controls and features (M1.52)

## Keyboard and mouse

| Action | Keys |
|---|---|
| Move / strafe | W A S D (↑ ↓ also move forward/back) |
| Turn | Mouse (click the game to lock the pointer), or ← → |
| Run | Shift |
| Throw a balloon | Space, Ctrl or left click |
| Use (doors, slot machine, shop) | E or Enter |
| Use the held item | Q or right click |
| Switch backpack slot | F, or tap a slot of the item bar |
| Full-screen map | M or Tab |
| Item screen (read your items) | I (arrows / WASD or click to pick; I or Esc closes) |
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
| Switch backpack slot | RB |
| Map | Back / View |
| Item screen | LB or D-pad up (d-pad picks, B or LB closes) |
| Pause | Start |
| Recentre | R3 (click the right stick) |
| Back in menus | B |

On-screen prompts switch to gamepad buttons when a pad is in use.

## Touch (phones and tablets, landscape)

- Floating stick on the left half (appears where your thumb lands; push far to run).
- Drag on the right half to look; double-tap there to recentre.
- Buttons: THROW, USE (shown only when something usable is in front), ITEM, MAP and pause.
- Tap a slot of the item bar to pick it (Backpack).
- Tap the minimap to open the full map.
- Tap the hearts / coins panel to open the item screen (tap an item to read it, tap outside to close).
- Portrait shows a "turn your phone sideways" screen and pauses.
- Starting from the title requests fullscreen once.

## Pause menu

RESUME, SOUND (on/off), LOOK SPEED (50%–200%, ◄ ► arrows), INVERT Y. Settings are saved in
`localStorage` (`labyrinthRemake.settings.v1`).

## Map

A corner minimap (colour-coded keys, doors, exit and pits; monsters are a red X, hearts a pink heart, items a green ring, coins a small plus) and a full-screen map
(M / Tab / Back / MAP button / tap the minimap).

## Items and pickups (M1.23)

- **Coins** (from the floor, popped mobs and coin bags), **hearts**, **gold keys** that open locked doors.
- **Run items** work the moment you pick them up and last the whole run (saved with it). Picking
  up another of the same stacks it, up to its max. They show as an icon row under the item slot.
  Floor 1 always has Running Shoes; every later floor hides one; secret rooms, the Treasure Knight,
  bosses, coin doors and Old Murkle have more.

| Item | Effect | Max |
|---|---|---|
| Running Shoes | run 12% faster | 3 |
| Dumbbell | +1 balloon damage | 3 |
| Cheeseburger | you grow bigger: your view (and throw) is higher up; hearts unchanged | 2 |
| Coffee | throw 18% faster | 3 |
| Reading Glasses | +1 sight in the dark | 3 |
| Heart in a Jar | +1 max heart | 3 |
| Baseball Glove | balloons fly 25% faster and farther | 2 |
| Rubber Duck | balloons bounce off a wall (once per duck) | 2 |
| Pocket Watch | enemy shots 20% slower | 2 |
| Garlic | a monster that bites you takes 1 damage (2 with two) | 2 |
| Leather Jacket | 20% chance to shrug off a hit (40% with two) | 2 |
| Fridge Magnet | pulls in coins from 3 cells (6 with two) | 2 |
| Compass | the key and exit show on your map | 1 |
| Old Map | every floor starts fully mapped | 1 |
| Four-Leaf Clover | coins are worth double | 1 |
| Vitamins | +1 heart on every new floor | 1 |
| Party Hat | throw 3 balloons at once | 1 |
| Balloon Pump | big balloons that splash around | 1 |
| Hand Mirror | bounces 3 enemy shots back each floor (6 with two) | 2 |
| Bubble Wrap | blocks the first hit each floor (two hits with two) | 2 |
| Wax Wings | float over pits | 1 |
| Ice Cube | balloons chill monsters (slower for 1.5 s) | 1 |
| Rubber Boots | webs, frost, goo, Lichen Face spores and Bather puddles can't touch you | 1 |
| Jailer's Eye | fences open like doors; Stone Keep only, rare (M1.66) | 1 |

- **Balloon colours** are run items too, and they stack: every colour you own is on every balloon
  (the HUD balloon box shows a dot per colour).

| Colour | Effect |
|---|---|
| Red | faster, flies twice as far |
| Green | poison: 2 more damage ticks |
| Yellow | leaves a puddle that hurts monsters |
| Black | explodes on hit (1 damage around it), and hurts you too if you are within about a cell |
| Purple | pierces through up to 4 monsters |
| Pink | homes in on the nearest monster ahead |

- **Use-items** go in the item slot and are used with Q / Y / ITEM: Healing Herb (+2 hearts),
  Warding Bell (stuns monsters around you), Flare (lights up the dark), Freeze Pop (monsters slow
  down for the floor), Firecracker (3 damage to everything near you), Mourner's Veil (blinds every
  mob in view for 5 s), Plunger (drop to the next floor through a black hole; only found on Baths floors), Music Box (plays a tune that opens every door for the floor; only found on Timber Attic floors). Elites drop them. The
  Backpack (a shop item) adds a second slot, switched with F / RB / a tap on the bar.
- **Vaults** (from level 4): a second locked room with a spare key and a heart.
- Item icons are in `assets/items.png` (see `assets/README.md`).

## Shop (Old Murkle)

Appears every even floor from floor 2 (never the tutorial). Talk to him with E / X / USE / a
tap. The shop is modal and pauses the game. He sells three run items and two use-items per floor,
plus a Backpack (see [BALANCE.md](BALANCE.md)). While it is open the
HUD (hearts, coins, keys, balloon type, item slots) stays visible; the panel covers the minimap.

## Slot machine

Found on floor 3 and on about 45% of other floors from floor 2 (never the tutorial). Use it
with E / X / USE. In-game coins only: a spin costs 3 coins, with no per-floor limit. The odds
are printed on the machine (see [BALANCE.md](BALANCE.md)).

## Pits, secret rooms and Rattlebone

- **Pits** from floor 3 (max 6): falling in is fatal. They show dark on the floor and on both
  maps. Ground mobs path around them; flyers cross over.
- **Secret rooms** on every generated floor: a cracked wall opens after 3 balloon hits and
  hides a coin bag or a run item (a use-item if every run item is already maxed), usually with a mob.
- **Rattlebone** from floor 6: at 0 HP it becomes a bone pile, rattles at 3 s and reforms at
  4.5 s unless you smash the pile with a balloon.
- **Hazewisp** drifts through fences and closed doors, and flies over pits.
- **The Lichen Face** (M1.52) hovers and drifts toward you on Mossy Cellar floors (3 HP). When it pops it leaves
  a slowing patch of spores (flyers and Rubber Boots ignore it). **Mourner's Veil** blinds every mob
  in your view for 5 s; blinded mobs wander and show a dark mark.
- **The Bather** (M1.57) slowly chases you on Tiled Baths floors (4 HP, marble statue art; at least one per Baths floor, two from floor 5) and leaves slick, pool-water-blue damaging puddles (flyers and Rubber Boots ignore them). **Plunger** opens a black hole at your feet and drops you to the next floor, then is used up (blocked on a sealed boss floor or the last floor). It only appears as loot or in the shop on floors labeled Baths; a Plunger you already hold still works on any floor.
- **The Slick Man** (M1.57) lumbers toward you on Slate Halls floors (10 HP; at least one per Slate floor, two from floor 5). It reflects about 30% of your balloons back at you, and while it is within 10 cells the fog thickens to 5 blocks no matter what sight items you have.
- **The Rafter Doll** (M1.62) is a small, fast cracked porcelain doll on Timber Attic floors (5 HP, half a normal mob's size; at least one per Timber floor, two from floor 5). It dashes in, bites, and runs away. The bite Rusts you for 15 s: your throws are slower and don't go far. **Music Box** plays an eerie tune for the rest of the level and permanently opens every door, including locked doors and hidden walls, then is used up. CONTINUE keeps the doors open and the tune; a coin door opened this way still gives its room reward. It only appears as loot or in the shop on Timber Attic floors; a Music Box you already hold still works on any floor.
- **The Jailer's Eye** (M1.66) is a rare Stone Keep run item (at most one per floor). While you hold it, iron fences open like doors on walk or USE, stay open, and stay open on CONTINUE. It does not appear on other themes.


## Treasure Knight, masks and items (M1.11)

A Treasure Knight guards every floor from 2: hit him when his shield is down or while he is
dazed after charging into a wall; he drops a run item (M1.23; it was a golden power-up). Smiling
Comedy masks just follow you and can't be hurt (balloons pass straight through them, M1.27); frowning Tragedy masks attack. On both maps every
monster is the same red mark.

## Coins: pits, doors, shrines, trapdoors (M1.12)

Next to a pit, E tosses a coin in (10 / 50 / 100 coins unlock pit spiders, big spiders and the
Broodmother on floor 15). Coin doors, shrines and trapdoors ask for coins with E. Old Murkle's
second page (RARE WARES >) sells the Piggy Bank and a Mystery Box.

## The King in Yellow (floor 20)

Find the torn play script on floor 20 and place it on the lectern in his hall (E / USE) to summon him.
Step off the Yellow Sign quickly, out of the dark pools, and away from the twin suns.

## Boss floors

Every 5th floor a boss guards the portal: the Screamer King (5, 20, 35, ...; M1.26, was King Gloop), Luggernaut (10, 25, ...)
and Coghoot (15, 30, ...). The band says "BOSS FLOOR!" at the start. The portal is barred and
dim (also on both maps) until the boss falls; the exit door itself needs no key. The boss stays
in its arena room and wakes when you walk in. Opening its door plays a 5-second cut scene: you are pulled
inside, every door slams and locks until the boss falls, and "VS <BOSS>" comes up. From M1.66 the camera keeps a clear line of sight to the boss, the fog lifts for the intro, and the previous fog is restored when the fight starts. While it fights, its name and a health bar show
in the message band. Once the cut scene ends the barred portal vanishes (M1.26). Beat the boss for coins, a run item (a heart once those are maxed) and a use-item,
and the open portal appears (a few cells away if you're standing on its spot).
CONTINUE on a boss floor restarts the fight.

## Start floors (M1.30)

Beat a boss and the floor after it (6, 11, 16, ...) becomes a starting floor for every later run (saved in
`localStorage`, `labyrinthRemake.unlocks.v1`; cheated runs don't unlock). On the title, START FLOOR: < N >
picks it (left/right, click or tap), and you start with one random run item for every 2 floors skipped. A deeper
start scores 1000 per floor past the floor you started on, plus kills, elites and coins as usual.

## Floors, score and high scores

- Floor 1 is a hand-built tutorial; floors 2+ are procedurally generated, and floors are
  endless (up to 10,000). Every floor start is auto-saved (`labyrinthRemake.save.v1`) and the
  title offers CONTINUE. Permanent shop purchases are saved with the run.
- Death ends the run and shows the score, then name entry: type on a keyboard, use the d-pad
  letters plus A/B on a gamepad, or tap the box on touch. The name box always starts empty.
- The HIGH SCORES page (also on the title) uses the same-origin API
  ([research/highscore-api.md](research/highscore-api.md)); otherwise a LOCAL top 10
  (`labyrinthRemake.localScores.v1`). From M1.66 each posted score includes this build's
  version. A toggle on the board (tap the tabs, left/right / A/D / Q/E / Tab, or the
  shoulder buttons / d-pad) switches All versions and This version; old rows with no
  version count as unknown. The tabs stay in the panel, not behind the touch buttons.

## Revive (M1.18)

On the death screen, R (gamepad X/Y, or tap the button) revives you for 10 coins × your deaths this run.

## Cheat console (M1.16)

Type `cheat` while playing to open it; `help` lists the commands (`jump N` goes to floor N, `give NAME` gives any item, `items` lists yours). Cheated runs are not sent to the high scores.

## URL options

| Option | Effect |
|---|---|
| `?seed=<text>` | Reproducible run. Any text is hashed into the seed; the level-clear screen shows a shareable seed link. |
| `?debug` | Exposes the `window.__game` test hook in the release build (the QA builds always have it). |
