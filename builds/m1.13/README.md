# Labyrinth Remake — M1.13 prototype (placeholder title)

Release build (no debug hook unless `?debug`); QA build in `../m1.13-qa/`.

## What changed since M1.12.2

- **Mob HP: +1 base HP per floor** below the first (BEEFY elites get ×2.5 of that). This replaces the old ×1.06-per-floor rule past floor 8. A Screamer has 3 HP on floor 1, 12 on floor 10 and 22 on floor 20. Bosses, the Treasure Knight, Skitters, egg sacs and smiling masks keep their own rules.
- **Six more elite modifiers** (from floor 4; BLINK from 5), 11 in all:
  - SHIELDED: its first 2 hits only break a shield.
  - SPLITTER: splits into 2 smaller copies (1/3 HP) when it pops.
  - VAMPIRE: heals 1 each time it bites you.
  - EXPLOSIVE: blows up after a short fuse when it pops (1 heart within 1.3 cells).
  - BLINK: teleports next to you every 5-8 s.
  - FROST: its bite slows you for 2 s.
- **Googly worms:** 1-3 small worms with big wobbly eyes crawl around each floor in random bright colours. They are decorations only (no hitbox).
- **Face-hug image:** when a Skitter jumps you, the screen now shows it sprawled across your face from below, legs reaching past the edges.

Frozen build; sha256 in `../SHA256SUMS`.
