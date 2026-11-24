# Kersplat Labyrinth: The Descent — M1.19.1

Release build (no debug hook unless `?debug`); QA build in `../m1.19.1-qa/`.

## What changed since M1.19

- **Treasure Knight slam, reworked.**
  - When you are close, he raises his sword straight up in both hands and flashes for 1.2 s (was a 0.6 s shield raise).
  - Then he slams it down: the floor cracks and a ring of dust clouds rolls outward from him (3.2 cells/s, out to 3 cells).
  - The ring does the hit (2 damage + knockback) when it reaches you, so you can back off or time it. Walls block it.
  - The cooldown is now 5.5 s.
- **Every Screamer shoots** its sonic ring now, with the usual flashing tell but no elite aura or icons. Non-elite Screamers fire 40% less often than RANGED elites, and their first shot comes 0.6–1.8 s after they spot you.

Frozen build; sha256 in `../SHA256SUMS`.
