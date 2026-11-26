# Kersplat Labyrinth: The Descent — M1.60

Release build (no debug hook unless `?debug`); QA build in `../m1.60-qa/`.

## What changed since M1.59

- The elite `ranged` modifier is only rolled for monsters that have a `RANGED` attack table. A missing entry can no longer crash the game when that monster tries to fire.
- The L3 kettle-swap and the L6+ Rattlebones swap skip every featured theme mob (including the Mortared Man), so they are not turned into a Kettlegrump or a Rattlebone. The M1.58 guaranteed minimum still applies after later generation steps.

Frozen build; sha256 in `../SHA256SUMS`.
