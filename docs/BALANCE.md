# Balance (M1.17)

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

Pools: L2 Screamer + Kettlegrump; L3 adds Springle and Hazewisp; L4 adds Clunkbot; L5+ adds
Zapfly; L6+ adds Rattlebone. Featured (weighted) mobs: L2 Kettlegrump; L3 Springle, Hazewisp,
Kettlegrump; L4 Clunkbot; L5 Zapfly, Clunkbot, Kettlegrump.

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
| Power-ups | 1 in the tutorial; 2, or 3 from L5 |
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
and one Hazewisp); if still short, extra Kettlegrumps are placed far from the start.

**Pits:** falling in is fatal. Ground mobs path around them; flyers (Screamer, Zapfly,
Hazewisp) cross over. They never block the only route and never sit on the spawn or on loot.

**Secret rooms:** a subtly cracked wall opens after 3 balloon hits. The room holds a coin bag
(10 coins, 60%) or a power-up (40%), and 90% also have a mob. The opened state is saved for
that floor.

## Elites

- Chance per mob: 5% × L, capped at 60% (reached on L12). 0% on the tutorial.
- Two modifiers: 50% on L6, 75% on L7, 100% from L8.
- Loot: one modifier drops 2 coins plus a 50% chance of a power-up; two modifiers drop 4 coins
  plus a power-up.

| Modifier | Effect |
|---|---|
| RANGED (#ff6a7a) | Fires a mob-specific projectile (speed / cooldown / wind-up): Kettlegrump steam 4.2 / 2.6 s / 0.5 s, Zapfly zap 7 / 2.1 s / 0.35 s, Clunkbot laser 9.5 / 3.2 s / 0.75 s, Screamer sonic 5 / 2.8 s / 0.5 s, Hazewisp homing wisp 3.2 / 3 s / 0.55 s, Springle fluff 5.5 / 2.4 s / 0.4 s. Max 40 enemy shots in flight. |
| SLIME TRAIL | Drops a puddle every 0.7 cells; puddles last 9 s (max 40); 1 heart of damage, then 1.5 s cooldown. |
| BEEFY | 1.5× size, 2.5× HP, 0.82× speed, bites for 2 hearts. |
| FAST | +40% speed. |
| REGEN | Heals 1 HP every 2.5 s while not hit. |

## Power-ups

Once used, a power-up lasts for the rest of the floor. Several can run at once; they all end
when the next floor starts. Active effects show as a HUD icon row (no countdown).

| Power-up | Effect |
|---|---|
| SPEED SNEAKERS | 1.35× move speed (was 1.6× for 10 s) |
| SHIELD BUBBLE | Absorbs 3 hits (was all damage for 8 s) |
| TRIPLE BALLOON | Three balloons, ±10° spread |
| FREEZE POP | Enemies and their shots move at 60% speed (was 35% for 8 s) |
| COIN MAGNET | Pulls coins within 6 cells |
| GIANT BALLOON | 1 damage splash within 1.2 cells (2 on a direct hit); blocked by walls, doors and fences (was 2 within 1.4 cells for 9 s) |

## Balloon types

The default Water balloons are always owned. The other types are permanent shop items, saved
with the run. Throw cooldown is 0.80 s (was 0.42 s).

| Type | Price | Effect |
|---|---|---|
| Water (default) | — | Speed 6.6 |
| Red | 35 | Faster (speed 9.6) and longer range |
| Green | 45 | Poison: 2 extra damage ticks, 1 s apart (a new hit restarts them) |
| Yellow | 50 | Leaves a 4 s puddle (radius 0.55) that deals 1 damage per 0.8 s to mobs, never to you |

## Shop (Old Murkle)

A hooded merchant appears every even floor from L2 (never the tutorial). Permanent items are
saved with the run. He also offers two random one-use power-ups at 10 coins each, once per
floor.

| Item | Price | Effect |
|---|---|---|
| Red Balloons | 35 | See above |
| Green Balloons | 45 | See above |
| Yellow Balloons | 50 | See above |
| Backpack | 30 | A second power-up slot |

The four permanent items cost 160 coins together. Floors 2–8 place 200 coins if you collect
every coin and pop every mob (before elite loot, secret-room bags and the slot), so a full
shop spend is a long-run investment rather than a first-shop impulse buy.

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
- Coin door 45% of floors from 2 (if a spot fits): 5/10/20 coins; loot 12% golden, 8% Piggy Bank, else a power-up; 22% a mob (40% of those a Treasure Knight). Shrine 35% (floor 3+): 15 coins, 15% curse. Trapdoor 30% (not boss floors): 15 coins.
- Rare wares: Heart Container 60+30n, Strong Arm 80+40n, Quick Hands 70+35n, Piggy Bank 40, Golden Wonder 150, Mystery Box 25.

## Treasure Knight and items (M1.11)

- Treasure Knight: every floor from 2; HP `25 + 3·(L − 1)` (M1.14.2, no cap); shield slam within 2.2 cells (0.6 s tell, 2 damage + knockback, 5 s cooldown); walks 1.15 cells/s; shield 1.5–2.1 s (70% chance when a balloon flies within 2.8 cells, 2.2 s cooldown); charge every 4.2 s after a 0.7 s tell, 6.5 cells/s, dazed 1.3 s on a wall; drops a golden power-up + 5 coins; counts as an elite.
- Comedy masks: 35% of masks; unkillable, harmless, keep ~1.3 cells away. Tragedy masks: Zapfly stats (1 HP, 2.6 cells/s).
- Power-ups: 14 kinds (Herb and Bell act at once; the rest last the floor). Golden versions: 12 kinds (not Herb/Bell).
- Permanent items: Heart Container (max 3), Strong Arm (max 2, +1 damage each), Quick Hands (max 2, −20% throw cooldown each). Secret-room power-ups are a permanent item 35% of the time; bosses drop one instead of a heart (a heart once all are maxed).
- Damage per hit: 1 + Strong Arm, +1 with the Rock Sack. Thorn Vest: 3 damage to the biter.

## Bosses (M1.10)

A boss guards the portal on every 5th floor (5, 10, 15, ...), in turn:

| Boss | Base HP | Moves | Attacks | Phases |
|---|---|---|---|---|
| King Gloop | 36 | Hops at you (0.9 cells/s, faster in the air) | Fan of 5 jelly blobs every 3.2 s (0.6 s tell) | 2 minions at 2/3 and 1/3 HP (max 4 alive); furious at 1/2: fan of 7, faster hops, landings leave goo |
| Luggernaut | 45 | Walks at you (1.0 cells/s) | Sock fan (3, 5, then 2 fast ones) or a charge (4.6 cells/s, stunned 0.7 s on a wall) every 2.4 s | A suitcase bursts at 2/3 and 1/3 HP: ring of 10 socks + 3 coins; speed ×1.35, then ×1.75; shorter target |
| Coghoot | 40 | Flies circles about 3 cells from you (1.7 cells/s) | 3 homing gears or a swoop (5 cells/s) every 2.6 s | Furious at 1/2: rings of 8 gears, ×1.25 speed |

- Contact and every shot cost 1 heart. A boss never leaves its arena. It wakes when you step into the arena, or see it from within 7 cells.
- Boss HP = ceil(base × round bonus) + 5 × (floor − 1) (M1.13.1). Each full round of three adds a tier: HP +40% (max ×3, from floor 80), attacks 8% more often (max 1/0.6), speed +6% (max ×1.3). Floor 20's King Gloop has 51 HP; floor 80's has 108.
- At 0.8 s per throw, a floor-5 King Gloop takes at least 29 s of hits.
- Loot: 15 coins spray out, plus a heart and a random power-up. The boss counts as a kill and an elite (+150 score). The score formula is unchanged.
- Arena: the exit room if it has 35+ cells (so the boss stands by the portal), else the biggest room (never the start, shop, slot or vault room). Other mobs move out and no pits are dug there. Once you are inside, its doors lock until the boss falls (M1.10.1).
- The exit door on a boss floor is not locked and its key is not placed (with a vault, the vault keeps its lock and the open-area key opens it).

## Endless floors (M1.8)

- The floor limit is 10,000. M1.8 scaling still applies on top of the M1.9 floor features above.
- Mob HP past L8: × `(1 + 0.06·(L − 8))`, max ×1.6 (reached on L18).
- Caps: 22 mobs, 30 coins, 60% elite chance.
- Deep wall styles unlock every 4 floors: L9 basalt, L13 rusted iron, L17 crystal, L21 glyph
  stone, L25 void runes. A deep floor uses one unlocked style, the newest about half the time.

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
| Power-up | 6% | random power-up |
| Jackpot | 2% | 25 coins spray out across the room |
| Three skulls (crit fail) | 8% | `min(8, 1 + floor(L / 3))` monsters appear next to the machine |

Expected coin return: (0.14 × 5 + 0.02 × 25) / 3 = **0.40 × cost**. Three 100,000-spin
simulations returned 0.397 / 0.420 / 0.407 × cost. Even counting the coin each crit-fail
monster can drop, the return stayed below 1×, so the machine can't be used to farm coins.
Hearts and power-ups are the real prize.
