# Labyrinth Remake — M1.14.2 prototype (placeholder title)

Release build (no debug hook unless `?debug`); QA build in `../m1.14.2-qa/`.

## What changed since M1.14.1

- **Treasure Knight HP:** 25 + 3 per floor, no cap (28 on floor 2, 55 on floor 10, 85 on floor 20, 145 on floor 40). He always out-tanks a Clunkbot (base + 1 per floor).
- **New attack, shield slam:** when you are within about 2 cells, he raises his shield (0.6 s warning) and slams it down. A ring of cracks spreads across the floor; inside 2.2 cells you take 2 damage and are knocked back about 1.6 cells. 5 s cooldown.
- **Yellow Sign fix:** its mark (reversed controls) now lands even if another hit made you briefly invulnerable.

Frozen build; sha256 in `../SHA256SUMS`.
