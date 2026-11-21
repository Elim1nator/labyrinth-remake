# Procedural maze + rooms generation — research notes (M1.3)

> Written for M1.3. Later balance changes (mob pools, counts, elites, endless floors) are in [../BALANCE.md](../BALANCE.md).

Goal: grid maps for a raycaster made of rooms joined by maze corridors, with sliding doors,
key/locked-door gating that is always solvable, see-through fence walls, an exit portal,
enemy/pickup placement scaled by level, a reproducible seed, and no network use (the code
has to sit inline in one HTML file).

## Candidates looked at

| Approach | Source | License | Notes |
|---|---|---|---|
| **Rooms and Mazes** (Bob Nystrom, 2014): place random odd-sized rooms, flood the gaps with growing-tree mazes, join regions through "connector" walls (spanning tree plus a few extra loops), then remove dead ends | Bob Nystrom's article "Rooms and Mazes: A Procedural Dungeon Generator" and his reference code in the Hauberk roguelike | **MIT** (reference code) | Exactly the "rooms + maze corridors" look. Odd-aligned grid suits a 1-cell-wall raycaster map. It is connected by construction, has natural door spots (connectors), and loops are tunable. About 150 lines of JS. |
| rot.js `ROT.Map.Digger` (Tyrant-style digging) and `ROT.Map.Uniform` (rooms, then connect) | rot.js manual and repository | **BSD-3-Clause** | Mature, has seeded RNG, rooms report door positions. But it's a big toolkit; inlining the map module plus RNG plus deps adds about 20–30 KB, and its corridors are straight digger tunnels, not mazes. |
| rot.js maze generators (`DividedMaze`, `EllerMaze`, `IceyMaze`) | same as above | BSD-3-Clause | Pure mazes with no rooms. Would need our own room carving on top. |
| BSP dungeon (recursive split, a room per leaf, connect siblings) | RogueBasin wiki article "Basic BSP Dungeon generation" | Algorithm description (no code licence issue) | Very even, "boxy" layouts with straight L-corridors. No maze feel. |

## Choice

**Our own JavaScript implementation of Nystrom's "Rooms and Mazes" algorithm**, written from
the article's description, so no third-party code is copied or inlined. The reference
implementation is MIT-licensed anyway, so there is no licence risk either way. We credit the
algorithm in a code comment and in the README.

Why: it produces exactly what the design asked for (rooms *and* maze corridors), it is connected
by construction, its connector cells are natural places for sliding doors, it is small enough
to inline (no network, single file), and it is easy to make deterministic from a seed.

## Our additions on top of the base algorithm

- Seeded PRNG (mulberry32), plus an FNV-1a hash of `seed:level` for per-level seeds, and a
  deterministic retry sub-seed if a layout is rejected.
- Map size and room size grow with the level number (27x23 at level 2 up to 39x31).
- Connectors touching a room become **sliding doors** only where both side cells are wall,
  so door planes render flush. Corridor-to-corridor connectors become plain floor.
- About 12% of dead ends are kept so corridors still feel maze-like; the rest are removed.
- **Exit room:** the room farthest from the start (by BFS) that can be "sealed" to exactly one
  door, with every other cell still reachable. That door becomes the **locked door**.
- **Vault (level 4+):** a second sealed room with its own locked door holding a spare key and
  a heart. All keys are generic gold keys, and every opening order still reaches the exit, so
  there are no soft-locks.
- The **key** goes in the far third of the area reachable from the start without passing any
  locked door.
- **Fences** replace a few single wall cells that separate two floor cells and have walls on
  both sides, as see-through windows. Being walls, they never change connectivity.
- **Enemies and pickups:** counts scale with the level number. Enemies spawn at least 7 BFS
  steps from the start. The enemy pool widens per level (2: Springle and Kettlegrump; 3: +
  Hazewisp; 4: + Clunkbot; 5+: + Zapfly) and always includes the screamer.
- **Verification:** the test suite generates 500+ seeds, then runs an independent flood fill
  and a full state search over keys and locked doors in Node. It checks that every floor cell
  is reachable, every item and enemy is on reachable floor, the exit is reachable, and that
  no order of opening doors can soft-lock the player.
