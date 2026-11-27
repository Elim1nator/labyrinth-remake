# Kersplat Labyrinth: The Descent — M1.79.5

Release build (no debug hook unless `?debug`); QA build in `../m1.79.5-qa/`.

## What changed since M1.79.4

Icy Prison walls on the minimap and full-screen map are a solid pale icy blue. The three ice wall textures added in M1.68 had no MAPCOL entry, so those cells were empty and the 3D view showed through them. Every other theme already had an opaque colour.

The Ice Wizard is a real boss on every Icy Prison floor: a 13×11 arena, a VS intro, a boss HP bar, and stairs that stay sealed until he falls. He keeps his name, art, casts and Frozen Wand. He is not in the normal mob pools and does not replace the every-5th-floor bosses or the Yellow, Masque, Brood or Awakened Basalt fights.

His ice bubble now actually rises at 75%, 50% and 25% health (a hit cannot skip a phase). Damage is blocked until you shatter the ice spikes around him.

Frozen build; sha256 in `../SHA256SUMS`.
