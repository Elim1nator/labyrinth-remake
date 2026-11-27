# Kersplat Labyrinth: The Descent — M1.79.1

Release build (no debug hook unless `?debug`); QA build in `../m1.79.1-qa/`.

## What changed since M1.79

Green-screen clean-up on the M1.79 art. Logic, names, frame counts and on-screen sizes are unchanged.

- Jacob's Skittering Creep sheet (`creep_v3.png`) had leftover green-screen spill (919 pixels with alpha > 0, G > R+25 and G > B+25). They showed as a faint green fringe on the legs. In `assets/mobs/creep.png`, 48 near-transparent (alpha < 24) green strays were dropped and the other 871 had G replaced with a nearby dark-purple body colour. Eyes, teeth and other body colours are unchanged. 0 green-dominant pixels remain.
- The four Awakened Basalt sheets had no green-dominant spill. Near-transparent (alpha < 24) white-ish matte crumbs at the silhouette were dropped (25 / 18 / 7 / 9 on walk / idle / cast / attack). Mid-alpha light-gray stone edges were left alone. The M1.78 Debt Collector is unchanged (no spill, no halo).
- A test now checks that no shipped mob/boss PNG frame in `assets/mobs/` has green-dominant semi- or opaque pixels (the bone pile and the Rattlebone skeleton are whitelisted for their lime-green eyes).

Frozen build; sha256 in `../SHA256SUMS`.
