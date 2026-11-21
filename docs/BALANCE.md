# Balance (M1.8)

`L` = floor (level) number. Floor 1 is the tutorial.

## Mobs

| Mob | HP | Speed | Notes | First floor |
|---|---|---|---|---|
| Screamer | 3 | 1.55 | hit radius 0.30, screams on sight | L1 |
| Kettlegrump | 5 | 1.1 (charge 3.9) | charges | L2 |
| Springle | 2 | 1.9 | hops | L3 |
| Hazewisp | 4 | 0.95 | passes through fences | L3 |
| Clunkbot | 8 | 0.7 | slow tank | L4 |
| Zapfly | 1 | 2.6 | fast, fragile | L5 |

Pools: L2 Screamer + Kettlegrump; L3 adds Springle and Hazewisp; L4 adds Clunkbot; L5+ adds
Zapfly. Featured (weighted) mobs: L2 Kettlegrump; L3 Springle, Hazewisp, Kettlegrump; L4
Clunkbot; L5 Zapfly, Clunkbot, Kettlegrump.

## Floor contents

| Item | Formula |
|---|---|
| Mobs | `3 + L + floor(L/2) + (1 on L3 and L5)`, max 22 (reached on L13) |
| Coins | `min(30, 8 + 2L)` |
| Hearts | 1, or 2 from L5 |
| Fences | `2 + min(5, L)` |
| Power-ups | 1 in the tutorial; 2, or 3 from L5 |
| Vault | from L4 |
| Map size | `(25 + 2·min(7, L)) × (21 + 2·min(5, L))` |
| Room placement tries | `30 + 5·min(L, 12)` |

**L3 floor rule (M1.7):** for any seed, level 3's total and elite-adjusted mob HP is never
below level 2's. Weak mobs on L3 are swapped for Kettlegrumps (keeping at least one Springle
and one Hazewisp); if still short, extra Kettlegrumps are placed far from the start.

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

| Power-up | Duration | Effect |
|---|---|---|
| SPEED SNEAKERS | 10 s | 1.6× move speed |
| SHIELD BUBBLE | 8 s | Blocks all damage |
| TRIPLE BALLOON | 10 s | Three balloons, ±10° spread |
| FREEZE POP | 8 s | Enemies and their shots move at 35% speed |
| COIN MAGNET | 12 s | Pulls coins within 6 cells |
| GIANT BALLOON | 9 s | 2 damage splash within 1.4 cells (blocked by walls, doors, fences) |

## Endless floors (M1.8)

- Floors 1–8 are unchanged from M1.7. The floor limit is 10,000.
- Mob HP past L8: × `(1 + 0.06·(L − 8))`, max ×1.6 (reached on L18).
- Caps: 22 mobs, 30 coins, 60% elite chance.
- Deep wall styles unlock every 4 floors: L9 basalt, L13 rusted iron, L17 crystal, L21 glyph
  stone, L25 void runes. A deep floor uses one unlocked style, the newest about half the time.

## Score

```
score = 1000·(L − 1) + 50 per mob popped + 100 extra per elite + 5 per coin
score = min(score, L·100,000, 10,000,000)
```

The cap keeps every score valid for the high score API.

## Slot machine

- Appears on L3 always, on about 45% of other floors from L2, never on the tutorial.
- Spin costs 5, 10, 15 coins (rising per spin), at most 3 spins per floor.

| Result | Chance | Payout |
|---|---|---|
| Nothing | 55% | — |
| Coins back | 20% | 1× cost |
| Jackpot | 5% | 3× cost |
| Heart | 10% | +1 heart (1 coin if hearts are full) |
| Power-up | 10% | random power-up |

Expected coin return: 0.20 × 1 + 0.05 × 3 = **0.35 × cost** (simulations: 0.349 / 0.364 /
0.359 for the three costs), so the machine can't be used to farm coins. Hearts and power-ups
are the real prize.
