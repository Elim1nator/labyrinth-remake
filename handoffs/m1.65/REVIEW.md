# M1.65 review

Follow-up to the M1.62 playtest in `handoffs/m1.62/REVIEW.md` (local playtest copy). Checks to confirm after freeze:

- Level-aimed balloons (pitch 0) hit the Rafter Doll at 1.5, 2.5 and 3.5 cells. Sprite stays half size.
- The doll's bite still connects; a shield block does not apply Rust or take a heart.
- After using the Music Box, CONTINUE restores open doors, the cracked wall and the tune.
- Jumping to the same floor after using the box does not freeze (`musicTick`).
- A coin door opened by the box grants the loot that was in its room.
- Untouched: Music Box drop rate, boss-floor seals, seed 138 L7 skeleton.
