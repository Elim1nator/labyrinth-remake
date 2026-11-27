# Kersplat Labyrinth: The Descent — M1.75

Release build (no debug hook unless `?debug`); QA build in `../m1.75-qa/`.

## What changed since M1.74.1

- **The Rattle Sovereign** replaces the Luggernaut in the same boss slot (floors 10, 25, …, map letter J). It walks and shoots skulls.
- Three phases at 75%, 50% and 25% HP. A hit that would pass a threshold stops there, so a huge hit cannot skip a phase.
- At each threshold it collapses into a big bone pile (invulnerable) and scatters 2–3 smaller piles. A small pile rebuilds into a Rattlebone after 4.5 s unless you smash it first. Then the Sovereign reforms (about 5.5 s if you leave the piles alone) and keeps fighting.
- "IT COLLAPSES! SMASH THE PILES!" appears in the top message band, clear of the touch buttons.
- Base HP 48 (the Luggernaut was 45), walk speed 1.05, skull every 2.2 / 1.9 / 1.6 / 1.4 s by phase after a 0.4 s tell. Boss loot, arena lock, the sealed portal and the other boss hooks are unchanged. The Luggernaut is retired (its PNG is left on disk, no longer packed).
- Art: Jacob's green-screen walk, collapse, front pose and skull sheets, keyed, nearest-neighbour scaled and feet-centred.

Frozen build; sha256 in `../SHA256SUMS`.
