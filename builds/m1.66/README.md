# Kersplat Labyrinth: The Descent — M1.66

Release build (no debug hook unless `?debug`); QA build in `../m1.66-qa/`.

## What changed since M1.65 (the Debt Collector)

- Grok-Code-8/9 fixes (numbered M1.65 there): the Rafter Doll is hittable at level aim; the Music Box is saved for CONTINUE, resets on a cheat jump, and a coin door it opens gives its reward.

- Jailer's Eye: a rare Stone Keep run item that opens iron fences as if they were doors; opened fences stay open on CONTINUE.
- Boss cut-scenes keep a clear line of sight to the boss, lift the fog for the intro, and restore the exact previous fog afterward (including the Slick Man clamp).
- Coin-room loot granted by the Music Box is not respawned on CONTINUE.
- The shared high score board records each build's version, can filter All versions vs This version, and still falls back to a local top 10 if the API is down.

Frozen build; sha256 in `../SHA256SUMS`.
