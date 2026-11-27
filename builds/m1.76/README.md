# Kersplat Labyrinth: The Descent — M1.76

Release build (no debug hook unless `?debug`); QA build in `../m1.76-qa/`.

## What changed since M1.75.2

- Jacob asked to keep the old moss wall art. `assets/walls.png` is restored to the pre-M1.75.2 tile (the vine-covered stone on Basalt Depths). The wall renderer is unchanged.
- New run item, the **Obsidian Column**: rare 12% floor spawn on Basalt Depths only (max 1 per run, not in the usual pool). Once per minute, the next throw after a 60 s cooldown is an obsidian shard instead of a balloon, dealing +2 damage on top of your base damage. The column icon in the effect row glows when a shard is ready. Temporary pixel art for the icon and shard.
- New mob, the **Skittering Creep**: on Basalt Depths it climbs out of pits on the same timer and cap as pit Skitters, even if you have tossed no coins. Coin-toss pit spiders still work. 2 HP, 5.2 cells/s, 1-heart bite, chittering voice, no pit loot. Walk art from Jacob's 5-frame sheet.

Frozen build; sha256 in `../SHA256SUMS`.
