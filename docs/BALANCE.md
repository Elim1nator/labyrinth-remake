# Balance (M1.63)

`L` = floor (level) number. Floor 1 is the tutorial.

## Mobs

| Mob | HP | Speed | Notes | First floor |
|---|---|---|---|---|
| Screamer | 3 | 1.55 | hit radius 0.30, screams on sight; flies over pits | L1 |
| Kettlegrump | 5 | 1.1 (charge 3.9) | charges | L2 |
| Springle | 2 | 1.9 | hops | L3 |
| Hazewisp | 4 | 0.95 | passes through fences and closed doors; flies over pits | L3 |
| Clunkbot | 8 | 0.7 | slow tank | L4 |
| Zapfly | 1 | 2.6 | fast, fragile; flies over pits | L5 |
| Rattlebone | 4 | 1.25 | collapses into a bone pile (see below) | L6 |
| Lichen Face | 3 | 1.65 | flies (slow hover bob); leaves a slowing spore patch (radius 0.36, 5 s) on the floor below; flyers and Rubber Boots ignore it. At least 1 per Mossy Cellar floor, 2 from L5 | Mossy Cellar (floors 2-8) |
| The Bather | 4 | 1.0 | pale marble statue; leaves pool-blue slick damaging puddles (radius 0.34, 4.5 s) that also sap traction; flyers and Rubber Boots ignore them. At least 1 per Baths floor, 2 from L5 | Tiled Baths (floors 2-8) |
| The Slick Man | 10 | 0.8 | dark slimy stone; reflects player projectiles 30%; forces view distance to 5 blocks while within 10 cells (overrides glasses and flares). At least 1 per Slate floor, 2 from L5 | Slate Halls (from floor 17) |
| The Rafter Doll | 5 | 2.3 | cracked porcelain doll, drawn at half size (sz 0.5) with a matching hitbox; fast hit-and-run; bite applies Rust for 15 s (slower, short-range throws). At least 1 per Timber Attic floor, 2 from L5 | Timber Attic (floors 2-8) |

Pools: L2 Screamer + Kettlegrump; L3 adds Springle and Hazewisp; L4 adds Clunkbot; L5+ adds
Zapfly; L6+ adds Rattlebone. Featured (weighted) mobs: L2 Kettlegrump; L3 Springle, Hazewisp,
Kettlegrump; L4 Clunkbot; L5 Zapfly, Clunkbot, Kettlegrump. On a **Mossy Cellar** theme (floors 2-8
when the seed picks that early theme), the Lichen Face is added to the pool and is featured (a second
one from L5). It does not appear on the tutorial or on deep-theme floors. On a **Tiled Baths** theme, the Bather is added the same way. On a **Slate Halls** theme (a deep style from floor 17), the Slick Man is added to the pool and featured the same way. On a **Timber Attic** theme (the wood-wall early style on floors 2-8), the Rafter Doll is added the same way.

**Rattlebone:** guaranteed as one of the placed mobs on L6, then about 1 in 7 mobs. At 0 HP it
becomes a bone pile: it rattles a warning at 3 s and reforms at 4.5 s unless a balloon smashes
the pile. Smashing the pile is the real kill (50 points and a coin, plus the elite bonus if it
had modifiers).

## Floor contents

| Item | Formula |
|---|---|
| Mobs | `3 + L + floor(L/2) + (1 on L3 and L5)`, max 22 (reached on L13) |
| Coins | `min(30, 8 + 2L)` |
| Hearts | 1, or 2 from L5 |
| Fences | `2 + min(5, L)` |
| Items | tutorial: Running Shoes; then 2, or 3 from L5: the first is a run item (while any are left), the rest use-items |
| Vault | from L4 |
| Pits | from L3: `min(6, 1 + floor(L/2))` (2 on L3, cap reached on L10) |
| Shop (Old Murkle) | every even floor from L2 |
| Secret room | every generated floor (L2+), behind a cracked wall |
| Map size | `(25 + 2·min(7, L)) × (21 + 2·min(5, L))` |
| Room placement tries | `30 + 5·min(L, 12)` |

No empty rooms: a room with no mob gets a mob or decorations. Decorations (plant, table, bones,
skull, candles, mushrooms, crate, urn) have no hitbox.

**L3 floor rule (M1.7):** for any seed, level 3's total and elite-adjusted mob HP is never
below level 2's. Weak mobs on L3 are swapped for Kettlegrumps (keeping at least one Springle
and one Hazewisp, and never swapping a Lichen Face); if still short, extra Kettlegrumps are placed far from the start.

**Pits:** falling in is fatal. Ground mobs path around them; flyers (Screamer, Zapfly,
Hazewisp) cross over. They never block the only route and never sit on the spawn or on loot.

**Secret rooms:** a subtly cracked wall opens after 3 balloon hits. The room holds a coin bag
(10 coins, 60%) or a run item (40%; M1.23), and 90% also have a mob. The opened state is saved for
that floor.

## Level layout (M1.36)

"Rooms and mazes" (Bob Nystrom's approach) with a growing-tree corridor fill, partial braiding and a distance map for content.
Every knob is in `GEN` in the game (`genCfg()` sizes it per floor; the layout itself is `genLayout()`):

| Knob | Value | What it does |
|---|---|---|
| width x height | 25x21, +2/+2 per floor to 39x31 | map size (the generator handles up to ~151x151 in ~15 ms) |
| roomAttempts | 30 + 5 per floor (to floor 12) | random room placements tried; overlapping or touching ones are rejected |
| roomMin / roomMax | 3 / 7 (9 from floor 4) | odd room sizes, placed on odd coordinates |
| newestBias | 0.8 | growing tree: grow from the newest corridor cell 80% of the time (long winding halls), a random one otherwise (branchy) |
| extraConnectorChance | 0.08 | after the spanning merge, each unused connector opens with this chance (loops); never two openings side by side |
| maxStubLength / keepDeadEndChance | 3 / 0.25 | dead-end branches are trimmed back; a quarter stay as nooks of at most 3 cells, the rest go |
| braidChance | 0.1 | a remaining dead end knocks through its end wall into the next corridor |
| criticalPathLoops | 1-2 | loops that leave the critical path and rejoin it 8+ tiles further on |
| bands | path 0-1, near 2-6, far 7+ | content placement by distance from the critical path |
| maxDeadEnds, minPath, maxPath | 12, 0.45 and 3 x (w+h) | validation; a failing seed is thrown away and the next one used |

- **Start and exit:** BFS from a random floor tile to its farthest tile A, then from A to its farthest tile B. The entrance is the
  nearest roomy room (15+ cells) to A, the exit the room nearest B, sealed to one locked door. The critical path is the shortest
  route between them.
- **Content:** the key sits 2-6 tiles off the critical path, reachable without the lock (in the farther 60% of such spots).
- **Monsters, rooms first (M1.39):** every room except the start, shop, treasure room and arena gets 1 monster; rooms past the first 40% of the route get 2 (25+ cells) or 3 (45+), moved in from the corridors. New monsters only fill rooms that would otherwise have none (cap 22, up to 30 for that). Nothing within 7 steps of the start.
  Mobs are placed mostly on or near the path, weighted towards its far end, so rooms get busier as you go. Coins sit just off
  the path; hearts and the secret room prefer far pockets (7+) and dead-end nooks.
- **Room tags:** start, exit, treasure (the room farthest off the path: the locked vault from floor 4, else a room with a heart
- **Boss arenas (M1.40):** a fixed 13 x 11 design from `ARENAS` (Rotunda, Pillar Hall, Pit Ring, Crossroads) placed first, against the left or right edge; it is the exit room, keeps all its doors, and the start is the roomy room farthest from it. Pits in the design are deadly like any pit.
  and 2 coins), shrine (off the path, from floor 3; the shrine prefers it), arena (boss floors: the exit room if it has 35+
  cells, else a big room in the last 40% of the route).

## Lichen Face and Mourner's Veil (M1.52)

The Lichen Face has 3 base HP (`3 + (L-1)` like other regular mobs), speed 1.65, and flies: it hovers at flyer height with a slow bob and drifts toward you. Pits, puddles and spores do not affect it. A quiet procedural moan plays when it spots you, and it has its own pop sound.
On death it leaves a spore patch (radius 0.36, the size of a slime puddle, life 5 s) that slows the player
and ground mobs. Flyers and mid-hop airborne mobs skip it; Rubber Boots skip it too. `SPORE` in the game.

Mourner's Veil is a use-item: every mob in the player's current sight radius and line of sight gets `blindT = 5`
and wanders instead of chasing. The Warding Bell's `stunT` still freezes a mob (stun is checked first).
Bosses and the Treasure Knight wander too if they are in range. `VEIL` in the game.

## Hexeye (M1.47)

From floor 12 in the monster pools. HP 5, slow flyer (crosses pits). Stares when it sees you within 4.2 cells: 2 s of whine,
red eye and red fog, then 1 heart if you are still in range (psychic: ignores the jacket, bubble wrap, garlic and mirror);
3.5-5.5 s between stares; hovers about 2.6 cells away. `HEXEYE` in the game.

## Pits (M1.47)

Pit spots per floor: none on floors 1-2, then 1 + floor/2 up to 6, and from floor 13 6 + (floor - 12)/4, at most 10. From floor 8
a growing share are 2x1 / 2x2 (5% per floor past 6, at most 60%), from floor 14 up to 3x3. From floor 14, 40% of floors get a pit
room: all pit except 1-cell paths between its doors. `PITGEN` in the game.

## Infernal mobs (M1.28)

Powered mobs (elites) are called **INFERNAL <NAME>** (the band shows the name and powers when you spot or hit one) and wear a
1-pixel glow in their power's colour (2 px from 3 cells, 3 px from 5). Tuning lives in `INF` and `MODS` in the game.

| Power | From floor | Effect |
|---|---|---|
| Poisonous | 3 | bite poisons you: 1 damage every 2 s for 6 s, never your last heart |
| Armoured | 4 | half your hits clank off |
| Blinding | 5 | bite blinds you for 5 s (you see ~2 cells) |
| Withering | 6 | bite withers you: 1 damage every 2 s for 6 s (can kill) |
| Tosser | 3 | bite throws you ~1.8 cells |
| Thief | 3 | bite steals your held use-item (killing it drops the item) |
| Quicksand (was Frost) | 4 | bite slows you for 2.5 s |
| Bulwark | 5 | takes at most 1 damage per hit |
| Rust | 4 | bite stiffens your arm: throws 50% slower for 6 s |
| Sapper | 3 | bite drains 3 coins |
| 1UP | 6 | gets back up once at full health |
| Cloaked | 5 | almost invisible (and no glow) until hit or within 1.6 cells |
| Ender (was Blink) | 5 | teleports next to you every 5-8 s |
| Ghastly | 4 | fireballs every 3.5-5 s (hit: 1 damage + burning) |
| Lifesteal (was Vampire) | 4 | heals 1 per bite |
| Sprint (was Fast) | 1 | +40% speed |
| Storm | 6 | every 6-9 s marks your spot; 0.9 s later lightning strikes it (1 damage within 0.75) |
| Webber | 4 | every 5-7 s a web at your feet (slows while you stand in it, 4 s) |
| Vengeance | 5 | 35% of your hits zap you back for 1 (within 6 cells) |
| Weakness | 4 | bite weakens you: half your hits do nothing for 6 s |
| Berserk | 5 | bites for double, loses 1 HP per bite |
| Explode (was Explosive) | 4 | blows up when it dies |
| Potions | 5 | lobs potions every 4-6 s: a 3.5 s splash of poison, slowness or blindness |
| Mama | 4 | first hit: 15% chance of 3 babies (1/4 HP, no loot) |
| Molten | 6 | bite sets you on fire (1 per 1.5 s for 4.5 s); ignores blasts; leaves a 5 s fire patch when it dies |
| Archer | 3 | a volley of 3 arrows every 3.5-5 s |
| Necromancer | 7 | homing wither skulls every 4-6 s (hit: 1 damage + wither) |
| Firework | 4 | sparks burst when hit (1 damage if you're within 1.5) |
| Gravity | 5 | bite levitates you for 3 s (higher view, 60% speed, you float over pits) |
| Flying | 3 | flies over pits |
| ~~Mounted~~ | - | removed in M1.56 (never rolled); used to ride a Clunkbot, Kettlegrump or Springle |
| Morph | 7 | every 10-16 s, 40% chance to turn into another monster (keeps its powers) |
| Ghost | 4 | a Hazewisp ghost rises when it dies |
| Confusing | 5 | bite reverses your controls for 3 s |

Still in the pool from before: Ranged, Slime Trail, Beefy, Regen, Shielded, Splitter. Power icons: `assets/mods.png`.
Rubber Boots also stop webs, potion slowness and Lichen Face spores.

## Elites

- Chance per mob: 5% × L, capped at 60% (reached on L12). 0% on the tutorial.
- Two modifiers: 50% on L6, 75% on L7, 100% from L8.
- Loot: one modifier drops 2 coins plus a 50% chance of a use-item; two modifiers drop 4 coins
  plus a use-item.

| Modifier | Effect |
|---|---|
| RANGED (#ff6a7a) | Fires a mob-specific projectile (speed / cooldown / wind-up): Kettlegrump steam 4.2 / 2.6 s / 0.5 s, Zapfly zap 7 / 2.1 s / 0.35 s, Clunkbot laser 9.5 / 3.2 s / 0.75 s, Screamer sonic 5 / 2.8 s / 0.5 s, Hazewisp homing wisp 3.2 / 3 s / 0.55 s, Springle fluff 5.5 / 2.4 s / 0.4 s. Max 40 enemy shots in flight. |
| SLIME TRAIL | Drops a puddle every 0.7 cells; puddles last 9 s (max 40); 1 heart of damage, then 1.5 s cooldown. |
| BEEFY | 1.5× size, 2.5× HP, 0.82× speed, bites for 2 hearts. |
| FAST | +40% speed. |
| REGEN | Heals 1 HP every 2.5 s while not hit. |

## Items (M1.23)

M1.39: stat items stack without a limit (`STACK` = 99). Safety ceilings in `ITEM_FX`: speed and balloon speed x3, throw delay 0.08 s, cheeseburger growth and eye lift, enemy shots x0.25 at slowest, jacket chance 1-0.8^n up to 80%.

Full list with effects in [CONTROLS_AND_FEATURES.md](CONTROLS_AND_FEATURES.md#items-and-pickups-m123).
Tuning lives in `ITEMS` (name, max, shop price) and `ITEM_FX` in the game.

- **Run items** (23 + 6 balloon colours) last the whole run and stack up to their max. When all
  copies of an item are owned it no longer turns up; a maxed one you still find is worth 5 coins.
- Stacking numbers: Running Shoes +12% speed each; Dumbbell +1 damage each; Coffee ×0.82 throw
  cooldown each (0.80 s → 0.66 / 0.54 / 0.44 s); Cheeseburger eye +0.12 and body radius +0.03
  each; Glasses +1 sight each; Baseball Glove ×1.25 / ×1.5 balloon speed; Pocket Watch ×0.8 enemy
  shot speed each; Garlic 1 damage per Garlic to a biter (you're still bitten); Leather Jacket 20%
  per jacket; Fridge Magnet 3 cells per magnet; Hand Mirror 3 bounced shots per mirror per floor;
  Bubble Wrap 1 blocked hit per wrap per floor; Rubber Duck 1 wall bounce per duck.
- Balloon colours all apply at once. Red: speed 9.6 (water 6.6). Green: 2 poison ticks 1 s apart.
  Yellow: 4 s puddle (radius 0.55, 1 damage / 0.8 s to mobs). Black: 1 damage within 1.2 cells of
  where it pops (walls block it), and 1 heart to you if you're inside that. Purple: passes through
  up to 4 monsters. Pink: turns up to 3.2 rad/s toward the nearest monster within 6 cells ahead.
  Ice Cube: hit monsters move at half speed for 1.5 s.
- Use-items (one slot, two with the Backpack): Healing Herb +2 hearts; Warding Bell stuns within
  4.5 cells; Flare: 16 cells of sight for 8 s; Freeze Pop: monsters and their shots at 60% speed for
  the floor; Firecracker: 3 damage within 2.4 cells (walls block it), never to you;
  Mourner's Veil: blinds every mob in view for 5 s.

## Shop (Old Murkle)

A hooded merchant appears every even floor from L2 (never the tutorial). Each floor he offers
three run items (at their price, 20–50 coins) and two use-items (10 coins each), plus the
Backpack (30 coins, a second use-item slot). RARE WARES: Piggy Bank 40, Mystery Box 25
(30% a run item, 40% a use-item, else a heart and 10 coins).

## Screamers (M1.19.1)

- Every Screamer fires the sonic ring (as RANGED, but cooldown ×1.4, first shot 0.6–1.8 s after waking).

## Sight (M1.17)

- View distance 5 cells (fog starts at 30% of it, fully hazy at 100%). Owl Eyes +1 each (max 3, rare wares 45 + 30n), Torch +3 (floor), Candle Lantern +2 (floor), Flare: 16 for 8 s.

## The King in Yellow (M1.14)

- Floor 20 only. HP 70 × round bonus + 5 per floor (193). Attack every 2.4 s (1.6 s furious), 0.6 s tell. Sign: 1.1 s fuse, radius 0.75, 1 heart + 3 s reversed controls. Robes: 5 (7) rags, 1 heart + 1.5 s slow. Carcosa: 6 s, 2 homing suns. Hali: 3 (4) pools, radius 0.7 (0.9), 8 s, 1 heart per 1.2 s.

## Mob HP and elites (M1.13)

- Regular mob max HP = base + (floor − 1); BEEFY = ceil(that × 2.5); SPLITTER children 1/3. Replaces the M1.8 ×1.06 per floor past 8 (`deepHpMul` is no longer applied).
- Elite modifiers: RANGED 3, SLIME 3, BEEFY 3, FAST 2, REGEN 1, SHIELDED 2, SPLITTER 2, VAMPIRE 2, EXPLOSIVE 2, FROST 2 (floor 4+), BLINK 1 (floor 5+) (weights).

## Coins and pits (M1.12)

- Pit milestones 10 / 50 / 100 (whole run). Skitters: 1 HP, 4.4 cells/s, one every 14–22 s near a pit (cap 1, 2 from floor 12); face-hug 3 s. Brood Spiders: 8 HP (× deep HP), 1.9 cells/s, one every 26–36 s (cap 2), elite rules apply.
- Grand Masque 55 HP (happy 4 s / sad 5 s; 3 gold balls every 1.6 s; 2 Tragedy masks every 9 s, max 3; barrage every 22 s: 2 shots/s for 10 s). Broodmother 60 HP (web 3 s slow ×0.5; egg sac 4 HP, bursts after 10 s into 2 Skitters + 1 Brood Spider, max 3 sacs; summons).
- Coin door 45% of floors from 2 (if a spot fits): 5/10/20 coins; loot 30% a run item, 8% Piggy Bank, else a use-item; 22% a mob (40% of those a Treasure Knight). Shrine 35% (floor 3+): 15 coins, 15% curse. Trapdoor 30% (not boss floors): 15 coins.

## Treasure Knight and items (M1.11)

- Treasure Knight (M1.29): charges only with a clear body-wide run at you; after a wall slam his charge cooldown is x1.5, he moves x1.7 for 2 s after the daze, and his ground slam is ready.
- Treasure Knight: every floor from 2; HP `10 + 3·(L − 2)` (M1.17.1, no cap); overhead sword slam within 2 cells (1.2 s tell; a dust ring rolls out at 3.2 cells/s to 3 cells, 2 damage + knockback on contact; 5.5 s cooldown, M1.19.1); walks 1.15 cells/s; shield 1.5–2.1 s (70% chance when a balloon flies within 2.8 cells, 2.2 s cooldown); charge every 4.2 s after a 0.7 s tell, 6.5 cells/s, dazed 1.3 s on a wall; drops a run item + 5 coins (M1.23); counts as an elite.
- Comedy masks: 35% of masks; unkillable, harmless, keep ~1.3 cells away. Tragedy masks: Zapfly stats (1 HP, 2.6 cells/s).
- The Treasure Knight drops a run item (M1.23; was a golden power-up). Bosses drop a run item (a heart once everything is maxed) and a use-item.
- Damage per hit: 1 + Dumbbells (×2 with the Piggy Bank).

## Bosses (M1.10)

A boss guards the portal on every 5th floor (5, 10, 15, ...), in turn:

| Boss | Base HP | Moves | Attacks | Phases |
|---|---|---|---|---|
| The Screamer King (M1.26; was King Gloop) | 36 | Flies; hovers 2.2–3.4 cells from you (0.9 cells/s) | Every 3 s (0.6–0.8 s tell, mouth open): one huge purple orb (2.6 cells/s, 2 damage, wider hit) or a fan of 5 small purple orbs (7 when furious) | Calls plain Screamers only: a wave of 3 at 2/3 and 1/3 health, one more every 13 s while fewer than 3 are left |
| The Rattle Sovereign (M1.75; was Luggernaut) | 48 | Walks at you (1.05 cells/s) | One skull projectile (4.2 cells/s, 1 heart, no wither) after a 0.4 s telegraph. Fire cadence 2.2 / 1.9 / 1.6 / 1.4 s in phases 0–3 (times `cdMul`) | At 75%, 50% and 25% HP it collapses into a big bone pile (invulnerable). A hit that would pass a threshold stops at that threshold, so overkill cannot skip a phase. It scatters 2–3 smaller piles that rebuild as Rattlebones after 4.5 s (`BONES.reform`) unless a balloon smashes them first. After every small pile is smashed or rebuilt it plays a 1.0 s reform (`SOV.riseT`; collapse anim 0.6 s overlaps the wait). Unsmashed, about 5.5 s down in total. Then it keeps fighting. A message (`IT COLLAPSES! SMASH THE PILES!`, 30 characters) shows in the top HUD band, clear of the touch buttons. |
| Coghoot | 40 | Flies circles about 3 cells from you (1.7 cells/s) | 3 homing gears or a swoop (5 cells/s) every 2.6 s | Furious at 1/2: rings of 8 gears, ×1.25 speed |

- Contact and every shot cost 1 heart. A boss never leaves its arena. It wakes when you step into the arena, or see it from within 7 cells.

**The Rattle Sovereign (M1.75)** replaces the Luggernaut in the same boss slot (floors 10, 25, …; map letter `J`). Base HP 48 (the Luggernaut was 45); floor and tier HP scale the same way (`ceil(base × hpMul) + 5 × (floor − 1)`). Constants live in `SOV` (`src/index.html`) and are repeated here:

- Thresholds: 75%, 50%, 25% of `maxHp`, rounded (`Math.round`). `hitBossOnce` / a single balloon cannot jump past the next one.
- Big pile: states `sovfall` (0.6 s), `sovdown` (until every small pile is smashed or has rebuilt), `sovup` (1.0 s, collapse frames in reverse). No damage and no contact bite in those states.
- Small piles: 2 or 3 (`SOV.pilesMin` / `pilesMax`), drawn with the regular Rattlebone `bonePile` sprite and scale (`h:.2`, including the tell/glow frame). They are Rattlebone (`skeleton`) ents in `state='pile'`, so they use the existing 4.5 s rebuild / smash rules. `sovpile.png` is left in the repo but is no longer packed.
- Skulls: kind `sovskull` (new art, not the Infernal wither `skull`). 4.2 cells/s, 1 heart, 3.6 s life.
- Loot, arena lock, wake, the sealed portal and `BOSS_LOOT` (15 coins + a run item + a use-item) are unchanged. The Luggernaut is retired (`assets/mobs/lugg.png` is left on disk, no longer packed).

- Boss HP = ceil(base × round bonus) + 5 × (floor − 1) (M1.13.1). Each full round of three adds a tier: HP +40% (max ×3, from floor 80), attacks 8% more often (max 1/0.6), speed +6% (max ×1.3). Floor 20's King Gloop has 51 HP; floor 80's has 108.
- At 0.8 s per throw, a floor-5 Screamer King takes at least 29 s of hits.
- Loot: 15 coins spray out, plus a run item (a heart once all are maxed) and a use-item (M1.23). The boss counts as a kill and an elite (+150 score). The score formula is unchanged.
- Arena: the exit room if it has 35+ cells (so the boss stands by the portal), else the biggest room (never the start, shop, slot or vault room). Other mobs move out and no pits are dug there. Once you are inside, its doors lock until the boss falls (M1.10.1).
- The exit door on a boss floor is not locked and its key is not placed (with a vault, the vault keeps its lock and the open-area key opens it).

## Endless floors (M1.8)

- The floor limit is 10,000. M1.8 scaling still applies on top of the M1.9 floor features above.
- Mob HP past L8: × `(1 + 0.06·(L − 8))`, max ×1.6 (reached on L18).
- Caps: 22 mobs, 30 coins, 60% elite chance.
- Deep wall styles unlock every 4 floors: L9 basalt, L13 rusted iron, L17 slate, L21 glyph
  stone, L25 ember rock, L29 sandstone, L33 granite, L37 cobblestone, L41 limestone, L45 dripstone,
  L49 chasm shale, L53 ironbound (M1.20). A deep floor uses one unlocked style, the newest about half the time.
- Wall cells vary (M1.37): ~92% plain, ~5% a pillar in the middle of the wall (M1.38), ~3% glowing rune (cosmetic only; no damaged walls or torches).

## Score

```
score = 1000·(L − 1) + 50 per mob popped + 100 extra per elite + 5 per coin
score = min(score, L·100,000, 10,000,000)
```

The cap keeps every score valid for the high score API. The formula is unchanged in M1.9 and M1.10 (a boss scores as a mob plus an elite).

## Slot machine

- Appears on L3 always, on about 45% of other floors from L2, never on the tutorial.
- A spin costs 3 coins, with no per-floor limit. The odds are printed on the machine.

| Result | Chance | Payout |
|---|---|---|
| Nothing | 62% | — |
| Coins +5 | 14% | 5 coins |
| Heart | 8% | +1 heart |
| Use-item | 6% | random use-item |
| Jackpot | 2% | 25 coins spray out across the room |
| Three skulls (crit fail) | 8% | `min(8, 1 + floor(L / 3))` monsters appear next to the machine |

Expected coin return: (0.14 × 5 + 0.02 × 25) / 3 = **0.40 × cost**. Three 100,000-spin
simulations returned 0.397 / 0.420 / 0.407 × cost. Even counting the coin each crit-fail
monster can drop, the return stayed below 1×, so the machine can't be used to farm coins.
Hearts and use-items are the real prize.

## Brick Halls: Mortared Man and Masonry Trowel (M1.53)
- Mortared Man: 4 base HP (scales like other mobs), slides 1.2 cells/s along wall faces; sight 9 cells. Fires when the angle between your view and it is wider than acos(0.8) = 37 deg (just off screen): 0.45 s mouth opening, mortar glob at 5.2 cells/s, mouth open 1.6 s, then 2.2-3.4 s before it can fire again. Only damageable while the mouth is open; no contact bite. One featured per Brick Halls floor (two from floor 5) plus the normal pool.
- Masonry Trowel: max 1, 30 coins in the shop; only in the item pool on Brick Halls floors.

## Tiled Baths: the Bather and the Plunger (M1.57)

The Bather has 4 base HP (`4 + (L-1)` like other regular mobs), speed 1.0, and slowly chases you, leaving slick puddles (`BATHER`: radius 0.34, life 4.5 s, spaced 0.55 cells). The puddles are drawn in pool-water blue (`#3FC8E6` with a paler highlight), deal 1 heart (with the usual goo cooldown) and apply a short ice-like slide (`slickT` 1.4 s). Rubber Boots ignore both; flying mobs are not affected. A quiet wet voice plays when it spots you, with dripping footsteps while it walks. Art: `assets/mobs/bather.png` (4 statue walk frames, same 120 px height as the earlier sheet).

The Plunger is a use-item: it opens a black hole at your feet and drops you exactly one floor, then is used up. A held key or button cannot chain another drop. It is blocked (and not consumed) on a sealed boss floor or when you are already on the last floor (`MAX_FLOOR`). It only appears on floors whose theme label says Baths (Tiled Baths). Every drop source (normal loot, elite drops, coin doors, secret rooms, shrines, the slot machine, boss loot and Old Murkle's shop) rerolls it to another use-item on any other theme. A Plunger you already hold still works on any floor. On Baths floors it is uncommon (about a third the weight of other use-items) and at most one is placed per floor.

## Slate Halls: the Slick Man (M1.57)

The Slick Man has 10 base HP (`10 + (L-1)`, same +1-per-floor scaling), about 2.5× a typical 4-HP regular and above Clunkbot's 8. Speed 0.8 (it lumbers). Map letter `d`. It uses the earlier hunched 5-frame walk sheet (`assets/mobs/slickman.png`). 30% of player projectiles (water balloons and the like, not thorns) bounce back toward you, can hurt you, and play a spark plus a wet-stone clack (`SLICK.reflect`). While a living Slick Man is within 10 cells, view distance is clamped to 5 (`SLICK.fog`) even if you have glasses or a flare; `VIEW.cur` lerps to the new value (`fogLerp` 3.2) so the fog thickens and lifts smoothly when it dies or you move out of range. The 10-cell trigger is wider than the 5-block fog so you feel the clamp as it approaches, rather than locking the whole floor. A low, wet stone voice plays when it spots you, with heavy wet footsteps while it walks.

## Featured theme minimum (M1.58)

On a Tiled Baths, Mossy Cellar, Slate Halls, Brick Halls or Timber Attic floor the theme mob is featured first (`feat.unshift`) and a second copy is featured from floor 5. It also stays in the random pool, so floors often have more than the minimum. After later steps (Rattlebone swaps from floor 6, shop and boss-arena moves that can drop a monster), a final pass restores the minimum if it was lost: **1 on L2–4, 2 from L5**. Real-flow checks count placed entities after `startLevel`, not just pool or map-letter membership.

From M1.60 the L3 kettle-swap and the L6+ Rattlebones swap themselves skip every featured theme mob (`THEME_MOBS`: Bather, Lichen Face, Slick Man, Mortared Man, Rafter Doll), so they are not turned into a Kettlegrump or a Rattlebone in the first place. The elite `ranged` modifier is only rolled for monsters that have a `RANGED` attack table entry.

## Spirit Slate (M1.59)
- Run item, max 1, 40 coins; in the item pool only on Slate Halls floors (deep theme, floor 17+). Shows every live monster on both maps regardless of fog of war.

## Timber Attic: the Rafter Doll and the Music Box (M1.62)

The Rafter Doll has 5 base HP (`5 + (L-1)` like other regular mobs), speed 2.3, and is drawn at half a normal mob's size (`sz: 0.5`, with `h` 0.62 and `hitR` 0.30 scaled the same way so the hitbox matches). It dashes in, bites (reach 0.28), then flees for 1.15 s at 1.45× speed before chasing again. The bite applies the existing **Rusted** status for 15 s (`DOLL.rustT`). While rusted, throw cooldown is ×1.5 (`INF.rustMul`), balloon speed is ×0.6 and lifetime ×0.55, so throws are slower and fall short. The RUSTED pill is drawn in the existing status row (left of the view, under the HUD, clear of the bottom-right touch buttons). The doll has no `RANGED` entry, so it never rolls the ranged elite. Art: `assets/mobs/rafterdoll.png` (2 walk frames at 120 px tall, feet-centred and bottom-aligned, 10 frames/s). It only appears on Timber Attic floors, with the usual featured minimum (1, or 2 from floor 5), and is skipped by the L3 and Rattlebones swaps.

The Music Box is a use-item: it plays an eerie, slightly detuned music-box melody for the rest of the level (WebAudio sine bells a few cents sharp and flat) and permanently opens every door on that floor, including locked and coin doors and the hidden cracked wall. It is used up. It only appears on floors whose theme label says Timber (Timber Attic). Every drop source (normal loot, elite drops, coin doors, secret rooms, shrines, the slot machine, boss loot and Old Murkle's shop) rerolls it to another use-item on any other theme. A Music Box you already hold still works on any floor. On Timber floors it is uncommon (about a third the weight of other use-items) and at most one is placed per floor.

From M1.65 the doll keeps its half-size sprite, but balloon hit height is at least 0.58 (`DOLL.hitH`) so a level-aimed throw lands at mid range (the scaled 0.31 height sat under the balloon). Bite reach is unchanged (0.52). A shield block skips the Rust as well as the damage. The Music Box effect (open doors, cracked wall, tune) is written into the floor save and restored on CONTINUE. Jumping to the same floor resets the music. Opening a coin door with the box grants the item that was in that room (the same run item, power-up, piggy bank or bag you would have picked up inside).
From M1.66, once that coin-room reward has been taken, CONTINUE does not place it again (`coinTaken` is saved for that floor). Doll balance is unchanged.

## Stone Keep: the Jailer's Eye (M1.66)
The Jailer's Eye is a run item (max 1): while you hold it, iron fences (tile type 3, map letter F) open like doors on walk or use, stay open, and remain open on CONTINUE. It only appears on Stone Keep floors, from every usual source including the shop, at most one per floor, at weight 0.4 (16/199 = 8.04% of Stone Keep floors on seeds 1–200 × L2–24; never off-theme, never two on one floor). The slot machine does not drop run items, so it will not award the Eye.

## Boss cut-scenes (M1.66)
The intro camera prefers a vantage with a clear line of sight to the boss; if none is found it keeps the view and skips wall rendering between the camera and the boss. Fog is lifted for the cut-scene, then the exact previous fog is restored, including item and Slick Man clamps. A new floor no longer inherits the previous floor's fog distance.

## Shared high scores (M1.66)
Each POST includes a `version` field (the build string, at most 16 characters from `[A-Za-z0-9._-]`). The board can show All versions or This version (client-side filter; a missing version on an old row is unknown). GET still uses `/api/labyrinth/scores?limit=N` (the client asks for 50, from M1.74.1 for 100, the API maximum, then shows the top 10 after filtering). A 404, error, or unreachable API still falls back to the local top 10.




## Weeping Gargoyle (M1.63)
- Statue: 10% of rooms with 40+ cells (not the start, shop, arena or pit room), centred. Separate RNG, so other floor layouts are unchanged.
- Stone Keep: each statue in a monster room is alive 50% of the time; each other regular monster (not featured, theme, boss or Treasure Knight) becomes a gargoyle 10% of the time. 6 base HP (scales), wake 3 cells with line of sight, sleep past 8 cells, bursts of 3 Screamer rings 0.3 s apart, 2.4-3.4 s recharge.

## Debt Collector (M1.65, art M1.78)
- Old Vaults only, 1 per floor (featured + guaranteed). 6 base HP (scales), speed 1.35, contact every 1.5 s: steal 3 coins (or 2 hearts at 0 coins). Paid off at 12 coins: passive, unhurtable, opens the floor's shop within 1.6 cells when faced. Killed while owed: drops what it took. M1.78 walk art: 3 frames (75×132, k 1.5), ping-pong 0-1-2-1; idle and paid use the planted mid frame.

## Icy Prison (M1.68)
- Chance per generated non-boss floor >= 3: min(45%, 6% + 2% x (floor - 3)); none within 4 floors after an icy floor (deterministic per run seed). Cold: move x0.85, throw cooldown x1.25.

## Ice Wizard and Frozen Wand (M1.69)
- Ice Wizard: 1 per Icy Prison floor (farthest room), HP 30 + 4 x floor, speed 0.9, keeps 3-6 cells away; casts every 1.6-2.4 s (0.45 s wind-up): 65% three small orbs (speed 6, 1 heart), 35% one big orb (speed 3.2, bursts for 1 heart within 1.3 cells + 0.8 s slow). Blizzard every 14-22 s for 5-10 s (view 3 tiles). Shields at 75/50/25% HP with 2-5 ice spikes (2 HP, speed 2.6, bite 1 heart every 1.4 s, aim 1.2 cells behind you); no damage to him while any spike lives.
- Frozen Wand: dropped by the Ice Wizard (8 coins instead if you already have it). Balloons +1 damage; they bounce (35% speed back off monsters/walls, 45% forward off the floor) and roll for 2.6 s, harmless.

## Snowman (M1.70)
- Icy Prison only (featured + pool; guaranteed 1, 2 from floor 5). 4 base HP, speed 1.05. Natural ranged like the Screamer: snowball speed 6, 1 heart, 0.45 s wind-up, cooldown 1.9 x 1.4 s; normal contact bite.

## Paid coin doors and the score board (M1.73.1)
- Paying a coin door writes the post-payment coin total into the floor save with `coinPaid`, so CONTINUE no longer refunds the first payment. The door still stays open and is not charged again.
- The high-score board GET is cached for the page load; All/This filters on the client. A 429 on GET or POST falls back to the local top 10 with no retry loop.

## CONTINUE coins, score board retry, ice spikes (M1.74.1)
- The floor save keeps the floor-start coins. Coin changes that CONTINUE keeps go in `sv.coinAdj`: coin door price, Ferryman +3, shop run items, permanent buys and the Mystery Box price, claimed coin-room bags (+10) and maxed coin-room items (+5), and the revive cost. CONTINUE coins = `coins + coinAdj - coinDebt`; below 0 the rest is owed (`sv.coinDebt`) and repaid by the first floor coins and non-loot coin bags you pick up. Debt does not carry to the next floor. This replaces the M1.73.1 total, which let a floor's coins be collected twice.
- A failed board load is retried on a later open after `HS_RETRY_MS` = 60 s (a retry is 2 requests, inside the live API's 5 a minute). GET asks for `limit=100`.
- Ice spikes aim for the open spot nearest straight behind you (offsets up to 180 degrees, line of sight from you) and keep at least `ICEWIZ.spikeMin` = 0.5 cells away; bite range stays 0.6.

## Snowball (M1.74)
- Rare Snowman drop only (`noPool`, max 1 per run): 7% per kill (`SNOWBALL.drop`), skipped if you already hold one or one is already on the floor. Isolated 1000-roll checks and an Icy Prison seed sweep are in the M1.74 tests.
- While held, player shots set `snow`: sprite is Jacob's snowball (not a coloured balloon or the Frozen Wand ice tint), colour flags and damage are unchanged, Frozen Wand still adds +1 and bounce (bounce skips the puff, as it skipped the splash).
- On hit: `e.slowT = max(slowT, 1)` (`ITEM_FX.snow`). Regular monsters move at `SPIDERS.goldWebMul` = 55% speed; the Mortared Man, Ice Wizard and ice spikes already use 50% when `slowT>0`. White `snowPuff` particles and `SFX.puff` replace `splash`.

## Ferryman's Coin (M1.74)
- Not in the general item pool (`noPool`, max 1). A Debt Collector kill has a 30% chance to drop it (`FERRY.drop`), skipped if you already hold it, one is already on the floor, or the shop already stocks it this floor.
- Every Old Vaults shop always stocks it at price 40. If a kill-drop is sitting on the floor, the shop hides it so only one copy is offered. Once you own it the shop still lists it but `shopRows` marks it owned ("SOLD OUT, WANDERER.").
- Held effect: +3 coins (`FERRY.coins`) when you key-unlock a locked door, when the Master Key opens a locked door, or when you pay a coin door, and for each locked or coin door the Music Box opens (not fences, not Treasure Knight smashes, not `applyPaidCoinDoors` / `applyOpenedLocks` on CONTINUE).

## Master Key (M1.74)
- Not in the general item pool or the shop (`noPool`, max 1). On each Deep Labyrinth floor (`/Deep Labyrinth/i` on `themeNow()`, the early-floor `THEMES` name; later `DEEP_THEMES` are not this theme) there is a 15% chance it is placed as a floor item (`MASTERKEY.drop`), skipped if you already hold it or one is already on the floor. Deterministic per seed and floor (`hashSeed(G.seed+':masterkey:'+(G.levelIdx+1))`). Placement tries `freeFloorCell(6)||freeFloorCell(3)||freeFloorCell(1)` so a successful roll is not dropped for lack of a far cell.
- Held effect: permanent, never used up. Locked doors open on USE without spending a key. Keys still pick up. Coin doors and fences are unchanged. Ferryman payout still applies to a Master Key unlock of a locked door.
- Opened locked doors persist on CONTINUE (`G.lockOpened` / `sv.locks` / `applyOpenedLocks`, no payout), for any unlock (key or Master Key).

## The Turned Face (M1.74)
- Deep Labyrinth only. Exactly one per such floor, guaranteed, spawned after `addFloorExtras` in the room farthest from the start (so layouts and seeds stay unchanged). Not in `MOB_POOLS`; excluded from `rollMods`, kettle and Rattlebones swaps, `ensureThemeMob` counts, `enemiesTotal` / kill counts and floor-clear requirements (`MOBS.turnedface`: `extra`, `ethereal`, `noKill`). `scaleMob` skips `noKill` only (Ice Wizard HP scaling is unchanged).
- Speed 0.9 cells/s (walk is 2.7). Alpha 0.55, bob 0.07 (in code; one-frame sheet). Ignores walls, doors and collision; `noDepth` so it draws through walls (fog still applies). Start freeze 2.5 s; also frozen in intro / pause / menus. Cannot be damaged. Contact bite 1 heart, cooldown 1.5 s, then fades back 3 tiles at 2.2× speed. Shield / Bubble Wrap block it like other contact damage.

## Frozen Screamer (M1.71)
- Icy Prison only (featured, guaranteed 1, pool). 4 base HP, speed 1.45, flies; natural sonic rings like the Screamer (2 hearts), bite 2 hearts. On death: a regular Screamer (scaled to the floor) spawns where it was; the Frozen Screamer itself drops nothing.

## Icy Prison monsters (M1.72)
- Every regular monster on an Icy Prison floor is re-rolled as Snowman (3/5) or Frozen Screamer (2/5) with its own RNG, after all other placement; then the Snowman (1, 2 from floor 5) and Frozen Screamer (1) minimums and the Ice Wizard are placed. Mid-floor spawns use the same 3:2 pool. Bosses never appear (icy floors are never boss floors); the Treasure Knight is kept.

## Broodmother (M1.73)
- Trigger: run pit coins >= 100 (PITS.milestones[2]). The first boss floor loaded after that (not the King in Yellow's floor 20) becomes the Broodmother's; `perm.broodFloor` records it for the rest of the run.

## Obsidian Column (M1.76)
- Rare Basalt Depths floor spawn only (`noPool`, max 1 per run, `theme:'BASALT DEPTHS'`): 12% per Basalt floor (`OBSIDIAN.drop`), skipped if you already hold one or one is already on the floor. Deterministic per seed and floor (`hashSeed(G.seed+':obsidian:'+(G.levelIdx+1))`). Placement tries `freeFloorCell(6)||freeFloorCell(3)||freeFloorCell(1)`, the same as the Master Key.
- Held effect: a **60 s** cooldown (`OBSIDIAN.cd`). When the cooldown is ready, the next throw is an obsidian shard instead of a balloon. The shard does **+2** damage on top of base damage (1 + dumbbell, doubled by a piggy spend). Balloon colour effects, the Frozen Wand's +1 and bounce, the Snowball slow/puff, and the Balloon Pump giant splash do not apply to the shard. A Party Hat throw fires shards in every direction of that throw. The effect-row icon glows when a shard is ready (clear of the touch buttons). The first throw after picking it up is a shard; the cooldown is kept across floors in the same run.

## Skittering Creep (M1.76, art M1.78)
- M1.78 walk art: 5 frames (177×132, k 1.5), cycle 0-1-2-3-4; logic and size (`h` 0.30, 2 HP, 5.2 cells/s) unchanged.
- Basalt Depths pits only. Uses the pit-Skitter cadence and cap (`SPIDERS.skitEvery` 14–22 s, `skitCap` 1, +1 from floor 12) and `pitSpawnCell(9)`, but **always** runs, even when `spiderLvl` is 0 (no coins tossed into pits). Coin-toss Skitters and Brood Spiders are unchanged and still require the 10 / 50 coin milestones.
- 2 HP (unscaled, like the Skitter's 1 HP), speed **5.2** cells/s (Skitter is 4.4), height 0.30, hit radius 0.28, contact bite **1 heart** (not a face-hug). Voice `chitter`. Pit-spawned creeps drop nothing (`noLoot`), the same as pit spiders. First spawn on a floor: "A CREEP CRAWLS OUT OF THE PIT!"

## The Awakened Deep (M1.77)
Replaces the rotating `BOSS_ORDER` boss **on Basalt boss floors only** (the usual floor 10, which is always Basalt, plus any later 5th floor that rolls Basalt). The Rattle Sovereign stays in `BOSS_ORDER` and still appears on non-Basalt floors 25, 40, …. Map letter `!`. The floor is named **BASALT HEIGHTS** (Obsidian Column and creeps still treat it as Basalt via `basaltFloor()`).

- Base HP **50** (the Sovereign is 48). Floor and tier HP scale the same way (`ceil(base × hpMul) + 5 × (floor − 1)`). Walk speed **1.0** cells/s (Sovereign 1.05). Height 1.08, hit radius 0.55, body radius 0.44.
- Phases at **75%, 50% and 25%** HP (`DEEP.thresh`). A hit that would pass a threshold **clamps** there (`deepNextHp`), so overkill cannot skip a phase. The Deep does not collapse; it just fights faster.
- Fireball: **0.55 s** cast (`DEEP.tele`), then one shot (`deepfire`) at **4.0** cells/s, range **7.2** cells, cadence **2.3 / 2.0 / 1.7 / 1.45 s** in phases 0–3 (times `cdMul`). Explodes on impact (solid pit or wall) or at end of range. Area damage **1 heart** in a **1.15**-cell radius (`DEEP.blastR`).
- Holes: each exploded floor tile (`t===0`) can become a solid pit (`t===11`) if it would not cut the path between the player and the boss, would not trap the player, and is not the player's or the boss's tile. Cap **14** fireball-holes per fight (`DEEP.holeCap`). Original wall-pits do not count against the cap.
- Skittering Creeps on this floor: **8–12 s** (`DEEP.creepEvery`), cap **2** (`DEEP.creepCap`), +1 while the Deep is furious. Same creep as M1.76 (2 HP, 5.2 cells/s, 1-heart bite). Other Basalt floors keep the M1.76 cadence (14–22 s, cap 1, +1 from floor 12).
- Floor: every `t===1` wall and any falling `t===6` pit becomes a solid pit (`t===11`). Doors and fences become open floor. No ceiling (`L.openSky`); the top of the view fades into the fog. Solid pits block like walls (`solidAt`) and do not trigger a fall (`pitUnder` stays on `t===6` only).
- Defeat and loot match the other bosses (15 coins plus a run item and a use-item, sealed portal opens). Defeat banner: `THE DEEP IS DEFEATED! THE STAIRS APPEAR!` (40 characters). Constants live in `DEEP` (`src/index.html`) and are repeated here.

