# M1.60 handoff

## What was wrong
`rollMods` could give any elite, including `ranged`, to any mob. The fire code then read `RANGED[e.type].tele`, but the table only covered Kettlegrump, Tragedy Mask, Clunkbot, Screamer, Brood Spider, Hazewisp, Springle and the Mortared Man. A ranged Rattlebone, Hexeye, Lichen Face, Bather or Slick Man crashed on first fire (`TypeError` reading `tele`). Mr Playtest saw this on 239 of 2,200 floors (repro seed 5 L5; real play seed 25 L7 and seed 19 L8).

The L3 kettle-swap skipped lichen, bather and slickman but not mortar, so some Brick Halls L3 floors lost their Mortared Man (seeds 34, 61, 94, 164). The L6+ Rattlebones swap could still turn a featured theme mob into a skeleton (seed 191 L7 lost its Mortared Man; Bathers on L6+ could be swapped too). M1.58's `ensureThemeMob` already restores the minimum after the Rattlebones / shop / arena steps inside `genTry`, and it did fix seed 191 L7 (0 mortar on M1.57, 2 on M1.58/M1.59). It could not cover the L3 misses, because `l3Floor` runs *after* `genLevel` returns. The swap lists themselves also needed to skip every theme mob.

## The fix
- `rollMods(R, floor, type)` omits `ranged` when the type has no `RANGED` entry. Spawn and HP-accounting call sites pass the type.
- The elite fire block and `fireAt` no-op if the entry is missing, so a leftover or morphed flag cannot throw.
- `THEME_MOBS` (lichen, bather, slickman, mortar) is skipped by `l3Floor` and the Rattlebones swap. `ensureThemeMob` is unchanged.

## Art
`bather.png` was not changed in this release (Mr Lead's recut blob should already be on Grok-Code-6).

## Freeze
- Tests: **578/578** passed (30 retired pre-M1.23/M1.31 checks).
- Release `builds/m1.60/index.html` 1576.9 KB (1614767 bytes), sha256 `cba9ed0f1a199aea5e49d2a0428e947202e658f330ae3022f10a74805831e947`.
- QA `builds/m1.60-qa/index.html` sha256 `a1c0018ce4b1fcd9e2e717422a0cebc97aeb7812f607a9a85cd6c8d2e9e09082`.
- Main's frozen `builds/m1.59/` is unchanged.

## Art
`assets/mobs/bather.png` was not changed in this release. Blob `b56dd15b3d70bdf4f5e61ae44bbde99a0e0efd29` was already on Grok-Code-6 (Mr Lead, 3736ec03).

