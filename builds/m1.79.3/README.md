# Kersplat Labyrinth: The Descent — M1.79.3

Release build (no debug hook unless `?debug`); QA build in `../m1.79.3-qa/`.

## What changed since M1.79.2

Wax Wings (and the same levitation that already floats over regular pits) now let the player cross interior Basalt Heights pits and fireball holes. Those cells stay solid for everyone else, so without wings they still block like a wall. The outer map-edge ring of Heights pits stays solid for everyone, including a winged player; you cannot leave the map.

If wings or levitation expire or are lost while you are over an interior Heights pit, you start a fall, the same as when they run out over a regular falling pit.

Flying mobs that already crossed regular pits also cross interior Heights pits. Walking mobs, creeps and the Awakened Basalt still treat them as solid. Balloons fly over interior Heights pits the same way they already fly over regular pits. The connectivity guard, hole cap, minimap and pit rendering are unchanged.

Frozen build; sha256 in `../SHA256SUMS`.
