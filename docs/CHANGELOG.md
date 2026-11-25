# Changelog

All builds are single HTML files in `builds/<milestone>/`; checksums in `builds/SHA256SUMS`.
Test counts are the number of passing checks in `tests/m1.test.mjs` for that build.

## M1.44: every balloon colour is its own art
- All 7 balloon colours (blue, red, green, yellow, black, purple, pink), thrown and in your hand, are now in the PNGs: `assets/balloon.png` has one balloon per colour and `assets/hand.png` has the 4 arm frames for each colour (28 frames). The recolouring code is gone; everything looks exactly as in M1.43. See assets/README.md.
- QA build `m1.44-qa` (debug hook on).

## M1.43: the arm and balloons are PNGs
- The first-person arm (idle, wind-up, throw, empty) and the thrown balloon now come from `assets/hand.png` and `assets/balloon.png` instead of drawing code, pixel-identical to M1.42. The other balloon colours are still made by recolouring the blue pixels. See assets/README.md, "Editing the arm and balloons".
- QA build `m1.43-qa` (debug hook on).

## M1.42: the EXIT sign hangs from the ceiling
- The EXIT sign over the stairwell now hangs from the ceiling on two short chains (the sign frames in `assets/boss/portal.png` / `portalS.png` are 36 x 15 with the chains).
- QA build `m1.42-qa` (debug hook on).

## M1.41: a real stairwell; the Screamer King's ears
- The exit is now an actual hole in the floor: a stone-lipped stairwell with 5 steps going down along one side, stone walls around it and a dark passage at the bottom, drawn by the floor renderer like the pits. You go down from the side with open floor. Only the EXIT sign remains as a sprite, floating over the hole (green; red while a boss lives, when an iron grate covers the well). The sign art is `assets/boss/portal.png` / `portalS.png` (now 36 x 12 per frame).
- The Screamer King's ears now shear up and down from the joint instead of rotating, so the skull and ears meet exactly in every frame (no bits of head poking out under an ear).
- QA build `m1.41-qa` (debug hook on).

## M1.40: boss arenas, stairs down, the Screamer King's ears
- Boss floors get a fixed arena design, 13 x 11 (bigger than any random room), set against the left or right edge of the map: THE ROTUNDA (a round room with four pillars), THE PILLAR HALL (2x2 pillar blocks to hide behind), THE PIT RING (a ring of deadly pits around the portal) or THE CROSSROADS (L-shaped walls and pits). The boss and the exit sit where the design puts them; you start as far from the arena as the floor allows. The arena keeps all its doors (they all slam shut when the fight starts) and the exit opens when the boss falls. Designs are in `ARENAS` in the game.
- The exit is now a round staircase spiralling down, with the EXIT sign over it on an iron post (green when open, red with an iron grate over the well while a boss lives). Messages say "THE STAIRS" instead of "THE PORTAL". The art is still `assets/boss/portal.png` / `portalS.png`.
- The Screamer King's ears stay attached to his head in every frame (each ear reaches in under the skull, and the flap is a little smaller).
- The screamers the Screamer King calls are 60% size.
- Normal floors: a test now checks that the exit room always has exactly one way in, a locked door, and that a key can be found without passing any lock.
- QA build `m1.40-qa` (debug hook on).

## M1.39: rooms get their monsters; items stack freely; masks rock again
- Monster placement, rooms first: every room except the start, shop, treasure room/vault and boss arena gets at least one monster, and rooms later on the route get 2 (25+ cells) or 3 (45+). Monsters are moved in from the corridors first; new ones are added only so that every room has one (the 22 cap can rise to 30 for that). The secret room keeps its guard, nothing spawns within 7 steps of the start, and decorations no longer count as filling a room. Across 100 test floors: no empty rooms (was 42% with no monsters), about the same number of monsters per floor.
- Stat items have no stack limit (running shoes, dumbbell, cheeseburger, coffee, glasses, heart in a jar, glove, duck, watch, garlic, jacket, magnet, mirror, bubble wrap). The pickup message and shop show how many you have ("x4", "YOU HAVE 4") instead of "1/3". Safety ceilings: speed and balloon speed up to x3, throw delay down to 0.08 s, cheeseburger growth and eye height capped, enemy shots no slower than x0.25, jacket 20% / 36% / 49% ... up to 80%. More than 8 hearts show as one heart and a count.
- The masks (Tragedy, Comedy, Grand Masque) rock back and forth again: frames tilt 0 / -8 / 0 / +8 degrees (Grand Masque ±7), with a 1 px bob.
- QA build `m1.39-qa` (debug hook on).

## M1.38: pillars in the middle of the wall
- The pillar variation is now a single pillar standing in the middle of the wall (shaft with a capital and base, a soft shadow beside it) instead of half-pilasters at both edges with a recessed bay. The wall around it stays plain.
- QA build `m1.38-qa` (debug hook on).

## M1.37: cleaner doors and walls
- Doors no longer include a strip of wall around them (it slid along with the door when it opened). The door leaf from `assets/doors.png` now fills the whole doorway; locked doors keep the gold lock and bands.
- Wall variations are just pillar bays (~5% of wall cells) and, now and then, a glowing rune carved into the plain wall (~3%; each wall style has its own rune colour). The damaged walls and the wall torches are gone.
- Tests: the two M1.20 variation checks retire; new checks for the variation mix, runes on plain walls and frameless doors. The elite-glow probe also clears pickups and avoids runes in view.
- QA build `m1.37-qa` (debug hook on).

## M1.36: new level generator
- Floors are built with "rooms and mazes" (Bob Nystrom's approach): rooms placed first, a growing-tree maze in the space between (newest cell 80% of the time), regions merged outward from a random room, then 8% of the spare connectors opened as loops. Dead ends are trimmed to nooks of at most 3 cells (a quarter kept), 10% of the rest braided into the next corridor.
- The entrance and exit are found with a double BFS (they sit at opposite ends of the floor), and 1-2 loops branch off the critical path and rejoin it.
- Content uses a distance map from the critical path: the key 2-6 tiles off it (never behind the lock), mobs weighted towards the far end of the route, coins just off the path, hearts and the secret room in far pockets and nooks. Rooms are tagged start / exit / treasure / shrine / arena; there is a treasure room on every floor, and the boss arena is a big room near the exit.
- Every floor is validated (exit and every room reachable, at most 12 dead ends, a critical path of sensible length) and regenerated from the next seed if a check fails. All knobs are in `GEN`; see BALANCE.md, Level layout. Every generated floor changes.
- Tests: the M1.31 dead-end check retires; layout-dependent checks (the knight's charge and slam, elite glow and icons, brick contrast) find a clear spot instead of fixed coordinates.
- QA build `m1.36-qa` (debug hook on).

## M1.35: knight smashes doors and fences; doors match their walls
- The Treasure Knight's charge now crashes through doors and fences and keeps going (it used to stop dead and get dazed), and the dust ring from his ground slam breaks any door or fence it reaches. Smashed doors and fences become open floor for the rest of the floor. Locked and coin doors break too; boss-arena doors hold.
- Every wall style has its own door: oak planks in brick halls, a teal panel in the baths, a barn door in the attic, riveted iron in basalt and rust, a carved slab in sandstone, glowing seams in the ember core, and so on. A door takes the style of the wall it sits in, framed by that wall. Locked doors keep the gold lock plate and gold bands, so they still read as locked.
- The art is `assets/doors.png`: one door tile per wall style (the see-through frame shows the wall) plus a shared `lock` tile laid on top for the locked version.
- QA build `m1.35-qa` (debug hook on).

## M1.34: wall art rolled back
- The wall textures go back to the M1.21-M1.24 art (`assets/walls.png`); the M1.25 hand-made wall sheet is retired. Item icons and the bolder secret-wall crack from M1.25 stay.
- QA build `m1.34-qa` (debug hook on).

## M1.33: new Screamer King and Grand Masque art
- The Screamer King is now a crowned, fanged blue-stone skull with stone wings, and the Grand Masque's tragedy and comedy faces are polished gold with glowing red eyes and mouths (from your reference art). Same sheet sizes and animations: the King's wings flap at the shoulder and the purple orb still glows in his mouth while he charges; the masks still bob and tilt.
- QA build `m1.33-qa` (debug hook on).

## M1.32: new monster art
- New art (same sizes and frame counts) for the tragedy and comedy masks, the Grand Masque (both faces), the King in Yellow, the Broodmother, pit skitters, brood spiders, the face-hug overlay (now a proper top-down spider), egg sacs (grow over 4 frames), Springle, Hazewisp, the Luggernaut, Clunkbot and the King in Yellow's rag shot. Darker, grittier palettes; red eyes stay the danger accent. Hazewisp's third frame sits 1 px lower so all 4 frames differ.
- The Screamer King and the wall textures are unchanged.
- QA build `m1.32-qa` (debug hook on).

## M1.31: less backtracking (level layout)
- No more corridors that lead nowhere. Long dead-end corridors (6+ cells) now break through into another corridor or room and loop back (85% of the time where one wall allows it); every other dead end, including the little spurs, is pruned away. Sealing the exit room and the vault no longer leaves the corridors that led to their other doors as dead ends.
- Corridors run straighter (75% chance to keep going, was 60%) and a few more loops connect different areas (6% of the possible links, at least 2).
- Across 96 test floors: dead-end tips 5.5 -> 1.3 per floor (what's left is the secret-room pocket and the slot / shop alcoves), longest dead end 59 -> 1 cell.
- Every generated floor still has a secret room and no empty rooms: an attempt that misses either is thrown away and the next one is used. Coin-door closets can now be as small as 1 x 1 (tighter layouts have fewer big rock blocks), so coin doors still turn up on ~45% of floors.
- BEEFY's glow is now yellow-lime (#e0ff40): the orange it had blended into the new brick art.
- Tests: the two checks that pinned floors to their older layouts retire from M1.31 on; layout-dependent checks pick clear spots; the coin-door check counts run items as loot and stands on the right side of a 1-cell closet.
- QA build `m1.31-qa` (debug hook on).

## M1.30: start floors (progress between runs)
- Beating a boss (in a run without cheats) unlocks the floor after it (6, 11, 16, ...) as a starting floor, kept across runs.
- The title gets a START FLOOR: < N > row (left/right, a click or a tap cycles it; it remembers your last pick). Starting deeper gives one random run item for every 2 floors skipped (floor 6: 2, floor 11: 5, floor 16: 7).
- A deeper start scores only the floors you play (1000 per floor past your start floor), so high scores stay fair.
- The title's controls line no longer mentions the old R balloon key.
- QA build `m1.30-qa` (debug hook on).

## M1.29: playtest fixes (stuck input, knight corners, map markers)
- Stuck walking fixed: a walk key whose release got lost (focus or mouse lock went away mid-stride) is let go after 0.4 s once it stops auto-repeating; coming back to the window starts with no keys held; a mouse button let go outside the window is let go; losing focus without a blur event (some embeds) now pauses too.
- Treasure Knight: he only charges when his whole body has a clear run at you, so baiting him into corners no longer works; after a wall slam his next charge waits longer, he hurries back (70% faster for 2 s) and his ground slam is ready if you stay close.
- Maps: monsters are a red X, hearts a pink heart, items a green diamond/ring, coins a small plus (hearts and monsters used to be look-alike red squares); the full map legend matches.
- Test fix: the Kettlegrump charge check no longer depends on its random first-charge delay.
- QA build `m1.29-qa` (debug hook on).

## M1.28: Infernal mobs
- Elites are now **Infernal** mobs ("INFERNAL CLUNKBOT: POISONOUS + STORM") with 40 powers: 29 new (Poisonous, Armoured, Blinding, Withering, Tosser, Thief, Bulwark, Rust, Sapper, 1UP, Cloaked, Ghastly, Storm, Webber, Vengeance, Weakness, Berserk, Potions, Mama, Molten, Archer, Necromancer, Firework, Gravity, Flying, Mounted, Morph, Ghost, Confusing), 5 renamed (Sprint, Lifesteal, Explode, Ender, Quicksand) and the 6 earlier ones. Full table in `docs/BALANCE.md`.
- Player status effects: poison, wither, burning, blindness, weakness, rust, levitation, confusion, slowness (screen tint + timer pills under the item row).
- Elite glow is 1 pixel up close (was 3). Power icons now come from `assets/mods.png`; new projectiles `shot_arrow`, `shot_fireball`, `shot_skull`, `shot_potion`.
- QA build `m1.28-qa` (debug hook on).

## M1.27: balloons pass through Comedy masks
- Smiling Comedy masks no longer stop your balloons: they fly straight through (pink balloons don't home in on them either). They still can't be hurt.
- QA build `m1.27-qa` (debug hook on).

## M1.26: the Screamer King
- King Gloop is replaced by **the Screamer King** (floors 5, 20, 35, ...): a crowned, purple Screamer that flies and hovers just out of reach. With his mouth open he spits either one huge purple orb (slow, 2 damage, hard to dodge) or a fan of small purple orbs (5, or 7 when furious). His minions are plain Screamers: a wave of 3 at 2/3 and 1/3 health, and he calls one more every 13 s while fewer than 3 are around.
- On every boss floor the barred portal vanishes once the boss intro ends (or you're locked in) and the open portal appears when the boss dies; if you're standing on its spot it appears 3-5 cells away instead.
- New art: `assets/mobs/king.png` (8 frames) and `assets/boss/shot_porb.png`, `shot_bigorb.png`. A deeper royal scream.
- QA build `m1.26-qa` (debug hook on).

## M1.25: new wall and item art
- New hand-made art for all 20 wall textures (`assets/walls.png`) and all 34 item icons (`assets/items.png`), scaled from your sheets: walls 200 px -> 64 px tiles, icons 164 px -> 24 px with the backdrop removed. The fence's dark gaps stay see-through. The secret-wall crack is drawn a little bolder so it still reads on the busier art. Damaged / pillared / torch variations, cracks and dents are still made from the new tiles.
- QA build `m1.25-qa` (debug hook on).

## M1.24: boss props and projectiles in PNG files
- Portals, the King in Yellow's lectern, Yellow Signs and Hali mist, King Gloop's goo, the Treasure Knight's slam crack, the play script and all 14 projectiles now come from `assets/boss/*.png`. Pixel-identical to M1.23; their drawing code is removed.
- QA build `m1.24-qa` (debug hook on).

## M1.23: item revamp
- Power-ups, permanent items, golden items and balloon-type switching are gone. In their place:
  - 23 **run items** that work on pickup, last the whole run and stack: Running Shoes, Dumbbell, Cheeseburger (you grow, your view is higher), Coffee, Reading Glasses, Heart in a Jar, Baseball Glove, Rubber Duck, Pocket Watch, Garlic, Leather Jacket, Fridge Magnet, Compass, Old Map, Four-Leaf Clover, Vitamins, Party Hat, Balloon Pump, Hand Mirror, Bubble Wrap, Wax Wings, Ice Cube, Rubber Boots.
  - 6 **balloon colours** that stack on every balloon: Red (fast, far), Green (poison), Yellow (puddle), Black (explodes; hurts you up close), Purple (pierces), Pink (homes in).
  - 5 **use-items** for the Q slot: Healing Herb, Warding Bell, Flare, Freeze Pop, Firecracker.
- Run items come from floors (Running Shoes on floor 1), secret rooms, coin doors, the Treasure Knight, bosses and Old Murkle (3 per visit); use-items from elites, floors and the shop.
- The HUD shows your run items in a row (with stack counts) and your balloon colours as dots.
- Item icons are `assets/items.png`. Checks of the old item behaviour are retired from M1.23 on (they still run on older builds).
- QA build `m1.23-qa` (debug hook on).

## M1.22: monster and boss art in PNG files
- All monsters, bosses, the Treasure Knight, spiders, worms and the face-hug overlay come from `assets/mobs/*.png` (one strip of frames per creature). Pixel-identical to M1.21; their drawing code is removed.
- The game reads the embedded PNGs itself at startup (a small built-in PNG reader), so there is no loading delay. `tools/assets.mjs pack` accepts any PNG an editor saves and converts it.
- Worm colours are swapped from one pink template; a missing sheet shows a magenta check.
- QA build `m1.22-qa` (debug hook on).

## M1.21: wall art in PNG files
- All 20 wall textures now come from `assets/walls.png` (10 x 2 tiles of 64 x 64), embedded into the single HTML file by `tools/assets.mjs pack` (releases pack automatically). Pixel-identical to M1.20.
- The wall-drawing code is gone; shading, damaged / pillared / torch variations, cracks and dents are still made in code from the PNG tiles.
- Missing art shows magenta check walls instead of crashing. The size limit is now 1 MB (the build is about 565 KB).
- QA build `m1.21-qa` (debug hook on).

## M1.20: realistic stone walls
- Crystal (L17) and void runes (L25) replaced by blue slate (SLATE HALLS) and ember rock with glowing joints (THE EMBER CORE).
- 7 new stone styles, one every 4 floors: sandstone (L29), granite (L33), cobblestone (L37), limestone (L41), dripstone (L45), chasm shale (L49), ironbound stone (L53).
- Every wall style has 4 looks per cell: plain (~72%), damaged (~14%), structural pillared bay (~9%), decorative bay with a torch or a glowing sigil (~5%).
- QA build `m1.20-qa` (debug hook on).

## M1.19.2: knight legs fix
- The overhead-sword frame now draws his legs.
- QA build `m1.19.2-qa` (debug hook on).

## M1.19.1: knight sword slam, shooting Screamers
- Knight: 1.2 s two-handed overhead wind-up (flashing), then a rolling dust ring that hits for 2 + knockback.
- All Screamers fire their sonic ring (no elite aura).
- QA build `m1.19.1-qa` (debug hook on).

## M1.19: title theme
- Hand-written 16-bar 8-bit menu theme (A minor, 108 BPM, lead, bass, arpeggio, drums).
- QA build `m1.19-qa` (debug hook on).

## M1.18: music for every floor, revive
- Original seed-composed 8-bit song per floor (quiet; darker on boss floors).
- Revive after death for 10 coins x deaths this run (full hearts, 2 s safety).
- QA build `m1.18-qa` (debug hook on).

## M1.17.1: audible ambience, gentler first knight
- Ambience drone moved to ~165-235 Hz, louder occasional sounds. Treasure Knight HP 10 + 3 per floor after floor 2.
- QA build `m1.17.1-qa` (debug hook on).

## M1.17: fog of war, sight items, ambience, damage indicators
- 5-cell view in a per-floor haze; minimap fills only what you've seen. Torch (+3), Flare (8 s), Owl Eyes (+1 each, max 3), Candle Lantern now +2.
- Per-floor eerie ambience. Red damage numbers, directional blood splotches, "-x" under the hearts.
- QA build `m1.17-qa` (debug hook on).

## M1.16: cheat console
- Type `cheat` to open a console: jump N, heal, god, coins N, give/gold/perm ITEM, kill, boss, pit N. Cheated runs are not submitted to the high scores.
- Fix: Golden Wonder purchase on a brand-new game.
- QA build `m1.16-qa` (debug hook on).

## M1.15: Kersplat Labyrinth: The Descent
- New name on the title screen, page title and home-screen name; placeholder/prototype text removed (version shown small). `tools/release.mjs` now reads the version from `var VERSION`.
- Pit spiders drop no coins or items.
- QA build `m1.15-qa` (debug hook on).

## M1.14.2: tougher Treasure Knight, shield slam
- Knight HP 25 + 3 per floor (no cap). Shield slam within ~2 cells: 0.6 s tell, crack ring, 2 damage + knockback, 5 s cooldown.
- QA build `m1.14.2-qa` (debug hook on).

## M1.14.1: pit shafts, centred coin toss, lectern shatters
- Pits render as stone shafts fading into darkness; tossed coins land dead centre and fall in; the lectern breaks when the King appears.
- QA build `m1.14.1-qa` (debug hook on).

## M1.14: the King in Yellow (floor 20)
- Gold-brick floor; find the play script, place it on the lectern to summon him. Attacks: Yellow Sign (reversed controls), tattered robes, Carcosa (tint, scrambled map and text, twin suns), Lake of Hali pools. King Gloop's 3rd round moves to floor 35.
- QA build `m1.14-qa` (debug hook on).

## M1.13.1: bosses scale with depth
- Boss HP + 5 per floor below the first (on top of +40% per round). Luggernaut on floor 10: 90 (was 45).
- QA build `m1.13.1-qa` (debug hook on).

## M1.13: +1 HP per floor, more elite modifiers, googly worms, face-hug image
- Regular mobs +1 base HP per floor (replaces x1.06 past floor 8).
- Elite modifiers SHIELDED, SPLITTER, VAMPIRE, EXPLOSIVE, BLINK, FROST (floor 4+).
- 1-3 random-colour googly worms per floor (decoration).
- New sprawled-spider face-hug overlay.
- QA build `m1.13-qa` (debug hook on).

## M1.12.2: own looks for the small spiders
- Skitter: small, mostly black, long thin legs. Brood Spider: glossy black widow with a red hourglass.
- QA build `m1.12.2-qa` (debug hook on).

## M1.12.1: spider redraw
- Broodmother, Brood Spiders and Skitters redrawn after the reference art (X-patterned abdomen, red eye cluster, fangs, spiked legs).
- QA build `m1.12.1-qa` (debug hook on).

## M1.12: coins into pits, spiders, floor-15 bosses, coin doors, shrines, trapdoors, piggy bank, rare wares
- Toss coins into pits (E); 10 unlocks Skitters (face-huggers), 50 Brood Spiders, 100 by floor 15 the Broodmother (webs, egg sacs, Golden Web drop). Otherwise floor 15 is the Grand Masque (laughs = invincible, weeps = vulnerable, gold balls, Tragedy masks, 10 s barrage). Coghoot moves to floor 30.
- Coin doors (5/10/20) with a side room, shrines (15 coins, blessing or rare curse), coin trapdoors (15 coins, next floor; not on boss floors), Piggy Bank (coin per throw, double damage), rare wares page in the shop.
- Test file size limit raised to 400 KB.
- QA build `m1.12-qa` (debug hook on).

## M1.11.1: mask redraw
- Comedy and Tragedy masks redrawn as classic theatre masks (shield-shaped face, crescent eyes, wide grin or frown).
- QA build `m1.11.1-qa` (debug hook on).

## M1.11: masks, Treasure Knight, golden and new items (431 checks)
- **Comedy and Tragedy masks** replace the Zapfly (floors 5+). Golden theatre masks with black eyes and a wide mouth. About a third smile (Comedy): they follow you around, never attack and can't be hurt. The rest frown (Tragedy) and fight like the old Zapfly.
- **Treasure Knight**, a mini-boss on every floor from 2. HP 10 on floor 2, +1 per floor (max 40). His name and health bar show in the message band.
  - Raises his shield when a balloon flies at him: no damage gets through, but he can't move.
  - Telegraphs, then charges straight across the room at 6.5 cells/s. Hitting a wall leaves a round crack in it and dazes him for 1.3 s: your opening.
  - Drops a **golden power-up** (plus 5 coins). A golden one is yours for good and switches on at the start of every floor. Once you own it, the ordinary kind of that power-up no longer turns up anywhere. If CONTINUE restarts that floor, he doesn't come back for a second drop.
- **8 new power-ups:**
  - Thorn Vest: the next bite is absorbed, the biter takes 3 damage and is knocked back, then the vest is used up. A golden one works once per floor.
  - Rock Sack: rocks instead of balloons, fast and flat, 2 damage a hit.
  - Lucky Clover: coins count double.
  - Healing Herb: +2 hearts at once.
  - Mirror Charm: bounces 3 enemy shots back.
  - Candle Lantern: lights up the whole map.
  - Wax Wings: float safely over pits.
  - Warding Bell: knocks back and stuns nearby monsters for 2 s.
- **3 permanent items**, found in secret rooms (about a third of the secret power-ups) and dropped by bosses (instead of their heart):
  - Heart Container: +1 max heart, up to 8. Past 5, hearts show at half size.
  - Strong Arm: +1 damage, up to 2.
  - Quick Hands: throws 20% faster, up to 2.
- **Maps**: every monster (bosses too) shows as the same red mark on the minimap and the full map, so the map no longer tells you what is coming.
- QA build `m1.11-qa` (debug hook on).

## M1.10.2: boss cut scene (416 checks)
- Opening a boss room door plays a 5 s cut scene: you are pulled in, the doors slam and lock (sound + shake), the view turns to the boss with "VS <NAME>". Then the fight starts.
- QA build `m1.10.2-qa` (debug hook on).

## M1.10.1: boss arenas lock (413 checks)
- Entering a boss arena locks all its doors until the boss falls; keys don't open them.
- QA build `m1.10.1-qa` (debug hook on).

## M1.10: bosses (412 checks)
- A boss guards the portal on every 5th floor, in turn **King Gloop** (hopping jelly king: jelly fans, minions at 2/3 and 1/3 HP), **Luggernaut** (stack of biting suitcases: sock fans and charges, loses a suitcase at 2/3 and 1/3 HP) and **Coghoot** (clockwork owl: flies, homing gears, swoops). All get furious at half HP.
- Each round of three is tougher: +40% HP (max ×3), attacks more often (max 1/0.6), +6% speed (max ×1.3).
- Arena: the exit room if it has 35+ cells, else the biggest room; the boss never leaves it and wakes when you walk in. No pits or other mobs inside.
- The portal is barred (in the world and on both maps) until the boss falls; the boss floor's exit door needs no key.
- Boss name and health bar inside the message band; loot of 15 coins, a heart and a power-up; +150 score (kill + elite); the clear screen names the boss.
- Floors without a boss are generated exactly as in M1.9.1.
- Tests: `ONLY=m110 node m1.test.mjs m1.10` runs selected groups.
- QA build `m1.10-qa` (debug hook on).

## M1.9.1: fixes for the M1.9 known issues (390 checks)
- The shop panel sits below the HUD and right of the item bar; hearts, coins, keys, balloon type and item slots stay bright while it is open.
- Decorations are never diagonally next to a door (M1.9 had 83 in ~32,000 over 300 seeds). A tiny start room ringed by doors may now stay bare.
- On about 1 floor in 70 a few room-filler mobs, coins or a heart move to other cells (shared random stream). Walls, doors, keys, shops, slots, pits and secret rooms are unchanged.
- Tooling: `tools/release.mjs` freezes a release + QA pair, refreshes checksums and the test package version; `dev --test` tests `src/` without freezing. The test suite compares versions part by part (so `m1.10` is newer than `m1.9`).
- QA build `m1.9.1-qa` (debug hook on).

## M1.9: shop, slot rework, pits, Rattlebone (388 checks)
- Slot machine: 3 coins a spin, no per-floor limit. Odds: 62% nothing, 14% +5 coins, 8% heart, 6% power-up, 2% jackpot (25 coins spray into the room), 8% three skulls (spawns 1 + 1 monster per 3 floors, capped at 8). Expected return about 0.40× the cost.
- Balloon throw cooldown 0.42 s → 0.80 s.
- Power-ups last the whole floor, shown as a HUD icon row. Rebalanced: Sneakers ×1.35, Freeze 60% speed, Shield absorbs 3 hits.
- Merchant Old Murkle on every even floor from 2. Permanent items: Red balloons 35 (faster, longer range), Green 45 (poison ticks), Yellow 50 (a splash puddle that only hurts mobs), Backpack 30 (a second item slot). Two power-ups at 10 coins each, once per floor.
- Balloon type switches with R / 1–4 / LB / BALL; backpack slots with F / RB / a tap.
- Secret room on every generated floor behind a cracked wall that opens after 3 balloon hits.
- No empty rooms. 8 decoration kinds with no hitbox.
- Pits from L3 (max 6). Fatal; ground mobs avoid them, fliers cross them.
- Rattlebone skeleton from L6: becomes a bone pile, gives a tell at 3 s and reforms at 4.5 s unless the pile is smashed.
- Hazewisp passes through doors.
- Known issues: the shop panel covers the top-left HUD while open; in crowded rooms a decoration can sit diagonally next to a door.
- QA build `m1.9-qa` (debug hook on).

## M1.8: endless floors, score, high scores, slot machine (325 checks)
- Endless floors: every exit leads to the next floor, up to floor 10,000. Floors 1–8 keep their M1.7 layouts.
- Scaling caps past floor 8: up to 22 mobs (L13), 30 coins, mob HP +6% per floor up to ×1.6 (L18), elite chance capped at 60%, two modifiers from L8.
- Deep wall styles every 4 floors past 8: basalt (L9), rusted iron (L13), crystal (L17), glyph stone (L21), void runes (L25).
- Score (1,000 per floor below the first, 50 per pop, +100 per elite, 5 per coin), shown on the pause, level-clear and death screens.
- Death ends the run, then name entry (keyboard, gamepad d-pad, touch) and the high score page (also on the title).
- Same-origin high score API with client-side validation, friendly 429 handling and a LOCAL top-10 fallback.
- Slot machine (coins only, printed odds, 3 spins per floor, EV 0.35× cost).
- Fixes: `#` glyph added to the pixel font; the test harness doesn't match its own guard patterns; a timing-sensitive glow check now samples a full pulse.
- QA build `m1.8-qa` (debug hook on).

## M1.7: readability, gated debug hook, L3 floor rule (256 checks)
- Elite modifier icons sit above the mob (or stack beside it), never over the sprite.
- `window.__game` is only exposed in the release build with `?debug`; a separate **QA build** (`m1.7-qa`) has it always on.
- RANGED colour changed to a lighter red-pink (#ff6a7a) for contrast against brick.
- L3 per-seed difficulty floor: level 3 is never easier than level 2 for the same seed (total and elite-adjusted HP).
- Phone: in the top strip only the HUD panel, item bar, minimap and buttons ignore touches.
- Screamer ears about 30% thicker with a wider wingbeat.

## M1.6: QA fixes and balance (238 checks)
- QA fixes: no stray throws after closing the map or resuming, minimap hide is saved, elite loot never lands in a fence, Giant Balloon splash blocked by walls/doors/fences, `?seed=` links keep CONTINUE.
- Screamer gets bat-wing ears.
- Level 3 always has a Kettlegrump and 8 mobs; two-modifier elites phase in (50% L6, 75% L7, 100% L8+).
- Phone pause and MAP buttons moved; touches starting in the HUD strip never move or look.
- Elite readability: bordered modifier icons that scale with distance, framed glow, clearer colours.

## M1.5: QA fixes, redraw, balance (217 checks)
- QA fixes: phone pause button size, steep throws no longer splash on the ceiling, a Hazewisp in a fence cell can be hit, LOOK SPEED arrows in the pause menu.
- Screamer redrawn; Springle moved to L3.
- Balance pass, minimap colours, seed links on the level-clear screen, full-screen map with a MAP button.

## M1.4: elites and power-ups (195 checks)
- Elite mobs with modifiers (RANGED, SLIME TRAIL, BEEFY, FAST, REGEN) and loot.
- Six timed power-ups (SPEED SNEAKERS, SHIELD BUBBLE, TRIPLE BALLOON, FREEZE POP, COIN MAGNET, GIANT BALLOON) and an item bar.

## M1.3: bigger picture, new mobs, procedural levels (158 checks)
- Internal resolution 480×300 and 64×64 textures.
- Five new mobs: Springle, Kettlegrump, Hazewisp, Clunkbot, Zapfly.
- Procedurally generated levels 2–8 ("Rooms and Mazes"), reproducible with `?seed=`.
- Assorted fixes.

## M1.2: look up and down (106 checks)
- Pitch (look up/down) for mouse, gamepad right stick and touch drag, with INVERT Y in the pause menu.
- Four hand frames (idle, wind-up, throw, empty) and an idle bob.
- The Screamer replaces the first placeholder enemy (four ear-flap frames, scream on sight).

## M1.1: input and QA fixes (83 checks)
- A1–A9: fullscreen requested once on touch start; hybrid touch/mouse switching; inputs cleared and game paused on blur, hidden tab or pointer-lock loss; one click resumes; instant taps and clicks throw; death beats level-exit on the same step; gamepad prompts; low taps on the win screen don't skip into a new game.
- B1–B8: contact knockback and re-bite delay tuned, balloon arc tuned, N mutes (saved), touch pause button and pause menu, touch run threshold, LOOK SPEED setting (saved).

## M1: first playable (54 checks)
- Canvas 2D raycaster (320×200), textured walls, see-through fences, sliding doors, gold key and locked door.
- Balloon throwing, an enemy with hurt flash and pop, coins, hearts, exit, two levels, win screen.
- Auto-save per level with CONTINUE; keyboard and mouse, gamepad and touch controls; landscape lock.
