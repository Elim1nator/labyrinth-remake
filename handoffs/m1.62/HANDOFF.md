# M1.62 handoff

## Theme
**Timber Attic** is the existing early-floor theme with wood wall texture (`base:'W'`, rooms `W`/`#`/`M`). No new theme was added.

## What landed
- **Music Box** (use-item): on use, plays a slightly detuned WebAudio music-box melody for the rest of the level and permanently opens every door (locked, coin, boss-lock) plus the hidden cracked wall. Used up. Theme-only drops, same pattern as the Plunger (weight 1, at most one per Timber floor, shop included). Icon in `assets/items.png`.
- **The Rafter Doll** (5 HP, speed 2.3, `sz: 0.5`): small and fast, hit-and-run, bite applies Rust for 15 s (slower throws, short range via `INF.rustSpd` / `INF.rustLife`). Featured minimum via `ensureThemeMob` / `THEME_MOBS`. No `RANGED` entry. 2-frame walk at 10 frames/s.

## Art
- `assets/mobs/rafterdoll.png` (new): 2 frames, 132 x 120, white background flood-filled from the edges, black outline kept, feet-centred and bottom-aligned.
- `assets/items.png`: Music Box icon in the next free 24 x 24 slot.

## Freeze
- Tests: **591/591** passed (30 retired pre-M1.23/M1.31 checks).
- Release `builds/m1.62/index.html` 1603.2 KB (1641685 bytes), sha256 `996bbfad8f302f87a8348757c90d403d8f959c1e27cec359df70403007e9e346`.
- QA `builds/m1.62-qa/index.html` 1603.2 KB (1641683 bytes), sha256 `70836f749883b602eb41616bf51e72b13fffc0b15003224465decc0023e833e0`.
- Main's frozen `builds/m1.61/` is unchanged.

## Art blobs (for Mr Lead; not pushed on Grok-Code-7)
- `assets/mobs/rafterdoll.png`: 17146 bytes, 132×120, 2 frames of 66×120. git hash-object `cd3ca9b6fca9316cfc6c72d9faee83bcf4281e14`. sha256 `bad0646c654dda560c4fe5bf4f205b5b299b798ba1639d15697b151b9505b381`.
- `assets/items.png`: 35901 bytes (still 240×96; Music Box is tile 38 at 192,72). git hash-object `45b398e023640d3620583b1a2a02614711d49a9b`. sha256 `44fc5182de70e709342f51c6251a3aee5f9dcf8d12e5b43d2d12c9519069f083`.
