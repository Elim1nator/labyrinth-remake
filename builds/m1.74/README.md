# Kersplat Labyrinth: The Descent — M1.74

Release build (no debug hook unless `?debug`); QA build in `../m1.74-qa/`.

Built on M1.73.1 (paid coin doors keep their cost; the score board is cached).

## What changed since M1.73.1

- The **Snowball** is a rare Snowman drop (7% per kill, at most one per run). While you hold it, thrown balloons become snowballs: they use the snowball sprite and hand, still carry every balloon colour you own, slow a target for 1 second, and puff instead of splashing. The Frozen Wand's +1 damage and bounce still apply.
- The **Ferryman's Coin** is an Old Vaults run item (max 1). A Debt Collector has a 30% chance to drop it, and every Old Vaults shop always stocks it for 40 coins (marked sold once you own it). Opening a locked or coin door (including those the Music Box or the Master Key opens) gives +3 coins. Fences and a CONTINUE-restored paid coin door or previously opened locked door do not pay out.
- The **Master Key** is a rare Deep Labyrinth floor item (15% chance per such floor, at most one per run). It lasts forever. While you hold it, locked doors open like normal doors and do not spend a key. Coin doors and fences are unchanged.
- **The Turned Face** is a special Deep Labyrinth mob: exactly one per such floor, guaranteed. It slowly floats straight at you through walls and cannot be hit. Touching it costs a heart, then it fades back. A shield that blocks contact damage also blocks it.

Frozen build; sha256 in `../SHA256SUMS`.
