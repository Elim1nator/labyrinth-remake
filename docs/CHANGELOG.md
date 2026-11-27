# Changelog

All builds are single HTML files in `builds/<milestone>/`; checksums in `builds/SHA256SUMS`.
Test counts are the number of passing checks in `tests/m1.test.mjs` for that build.

## M1.75: the Clockwork Mourner and the Tin Heart (Rust Works)
- New mob, **the Clockwork Mourner** (7 HP, speed 1.05, map letter `i`): a wind-up figure in a rusted mask, found only on **Rust Works** floors (a deep wall style from floor 13). It is the common mob there: it is added to the Rust Works pool twice and featured twice, and every Rust Works floor keeps at least 3 (`ensureThemeMob`). On seeds 1-30, floors 13-30, Rust Works floors average about 6 Mourners out of about 23 mobs. Every bite that lands also **Rusts** you for 8 s (`MOURNER.rustT`; a shield block skips it like the damage). It walks on 3 frames (right foot, standing, left foot, standing, 6 frames/s) and stands on the standing frame. It ticks and tocks as it walks (within 7 cells), winds itself up as its voice, and when it dies it **shatters into a burst of gears** (16 cog particles, rusty and iron) with a ratchet-and-spring crash. It is a featured theme mob, so the L3 kettle and Rattlebones swaps skip it.
- New run item, **the Tin Heart** (max 1, price 40, `theme:'RUST WORKS'`): only found on Rust Works floors, from the usual item sources there (item pool, shop), plus a 5% drop per Mourner kill (`TINHEART.drop`). While you hold it you are **immune to Rust** (Mourner and Rafter Doll bites and the Infernal Rust power; Rust you already have is scrubbed off when you get it), and your **throws are 15% faster** (cooldown x0.85, inside the usual minimum). CONTINUE keeps it.
- Art: `assets/mobs/mourner.png` (3 frames of 100 x 137, bottom-aligned, centred on the head) and a new tile in `assets/items.png` (Tin Heart, slot 45 at 96,96). The gear particles are drawn in code (`sprGear`).
- New test group `m175` (7 checks).
- QA build `m1.75-qa` (debug hook on).

## M1.74.1: CONTINUE coin fixes, score board retry, ice spikes
Playtest fixes for M1.73.1 (built on M1.74, which includes M1.73.1).
- **Double coins on CONTINUE (blocker).** M1.73.1 wrote your current coin total into the floor save when you paid a coin door. CONTINUE replays the floor with every coin back on the ground, so the coins you had already picked up came back on top of that total (Playtest: 67 instead of 36). The save now keeps the floor-start coins and, separately, the coin changes that CONTINUE keeps (`coinAdj`): a paid coin door, a Ferryman's Coin payout, a permanent shop buy, a run item from the shop, a Mystery Box, claimed coin-room loot and a revive. CONTINUE gives you floor-start coins plus that change. The Ferryman, Music Box and Master Key saves from M1.74 wrote the current total too, and use the same change now.
- **Debt Collector coins (follows from the blocker).** Coins taken on the floor, such as a Debt Collector theft, are no longer baked into the save by a later door payment, so CONTINUE gives them back as it did before M1.73.1.
- **No small refund when the price is more than your saved coins.** If a door, shop item or Mystery Box cost more than you had at the start of the floor, the save used to clamp at 0 and CONTINUE gave the difference back. Now CONTINUE starts you at 0 and owes the difference (`coinDebt`, shown as "THE NEXT N COINS YOU FIND ARE OWED"). The first N floor coins or coin bags you pick up repay it. Leaving the floor drops the debt (those coins were already spent).
- **Score board retries.** A failed board load (unreachable, error, 404 or 429) used to stay on local scores until the page reloaded. A later open now tries the online board again, at most once a minute (`HS_RETRY_MS` = 60 s), so a 429 still cannot cause a request loop. A successful load is still cached for the page load.
- **"This version" has more rows.** The board now asks for `limit=100`, the API's maximum (was 50). It still filters on the client, so a version outside the top 100 shows fewer than 10 rows; a full fix needs a version filter on the score API.
- **Ice spikes no longer wedge onto you.** With a wall behind you, a spike's target (1.2 cells behind you) was inside the wall, so it slid onto your own spot, where a balloon (it starts 0.25 cells ahead) could not hit it. It now aims for the open spot nearest to straight behind you and never comes closer than 0.5 cells (`ICEWIZ.spikeMin`; its bite still reaches 0.6).
- Old saves without `coinAdj` / `coinDebt` still load as before.

## M1.73.1: paid coin doors keep their cost; the score board is cached
- Paying a coin door now writes the new coin count into the floor save along with `coinPaid`. CONTINUE still restores the door as open and does not charge again, and it no longer refunds the first payment (once per floor). Old saves without the field still load, with the door priced as before.
- The high-score board fetches the online list at most once per page load (and may re-read it after a successful score POST). Re-opening the board, including the All/This version toggle, uses the cached rows and filters them on the client. A 429 from a GET or a POST falls back to the local top-10 board, the same way a 404 or other error already did, and does not retry in a loop. A 429 on POST still keeps the local save.
- All test groups pass.
- QA build `m1.73.1-qa` (debug hook on).

## M1.74: the Snowball, the Ferryman's Coin, the Master Key and the Turned Face
- New run item, the **Snowball** (max 1, never sold or found in the usual pool). A **Snowman** drops it rarely (**7%** per kill, at most one per run). While you hold it, thrown balloons use Jacob's snowball sprite and the snowball hand; they still carry every balloon colour you own, and the Frozen Wand's +1 damage and bounce still apply. A hit **slows** the target for **1 second** (the existing `slowT` chill, 55% speed on regular monsters, 50% on the Mortared Man / Ice Wizard / ice spikes) and makes a **white snow puff** (and puff sound) instead of the water splash. Frozen Wand bounce still skips the puff, the same way it skipped the splash.
- New run item, the **Ferryman's Coin** (max 1, never in the usual loot pool). A **Debt Collector** drops it **30%** of the time on an Old Vaults floor (skipped if you already hold it, one is already on the floor, or the shop already stocks it). Every Old Vaults shop always stocks it for **40 coins** (a normal mid-shop price, same as the Jailer's Eye). Once you own it the shop still lists it but marks it sold ("SOLD OUT, WANDERER."), which is how the shop already treats a maxed run item. While you hold it, opening a locked door (with a key) or a coin door (by paying) gives **+3 coins**. The Music Box also pays +3 for each locked or coin door it opens; fences (including the Jailer's Eye) and a Treasure Knight smash do not. A coin door restored by CONTINUE (`sv.coinPaid`) does not pay out again.
- New run item, the **Master Key** (max 1, never sold or found in the usual pool). On each **Deep Labyrinth** floor (the early-floor `THEMES` entry; not later `DEEP_THEMES` such as Basalt Depths) there is a **15%** chance it appears as a floor item, skipped if you already hold it or one is already on the floor. It is permanent and never used up. While you hold it, every locked door opens like a normal door (USE, no key spent). Keys still pick up as usual. Coin doors and fences are unchanged. With the Ferryman's Coin, a Master Key opening of a locked door also pays +3. Opened locked doors are remembered on CONTINUE (`sv.locks` / `applyOpenedLocks`) so a restored door never pays again (this applies to any unlock, key or Master Key, so Ferryman + key also cannot be farmed).
- New special mob, **the Turned Face**, guaranteed exactly one per Deep Labyrinth floor, spawned in the room farthest from the player's start. It is not in `MOB_POOLS`, is excluded from `rollMods`, kettle and Rattlebones swaps, `ensureThemeMob` counts, kill counts and floor-clear requirements, and cannot be hit or killed (balloons and snowballs pass through). It floats slowly in a straight line toward the player at **0.9** cells/s (walk is 2.7), ignores walls, doors and collision, and draws through walls at about **0.55** alpha with a gentle bob. Frozen **2.5 s** at floor start; also frozen during boss intros, pause and menus because `updatePlay` does not tick then. On touch it does normal contact damage (1 heart), then a **1.5 s** cooldown and fades back about **3** tiles. The shield blocks it if it blocks contact damage. Descending removes it (it is spawned per floor).
- Art: `assets/hand_snow.png` (4 frames: idle/windup from Jacob's held-snowball hand, throw/empty from the existing glove), `assets/snowball.png` (12x14 projectile, matching a balloon frame), three new tiles in `assets/items.png` (the snowball, the Ferryman's Coin and the Master Key, keyed from Jacob's art), and `assets/mobs/turnedface.png` (one frame; bob and alpha are in code). The first-person hand and the HUD balloon box show the snowball while that item is active.
- The Snowball, Ferryman's Coin and Master Key are saved with the other run items, so CONTINUE keeps them. Old saves without the new fields still load.
- All test groups pass (local dev build; official freeze deferred).
- QA build `m1.74-qa` (debug hook on).

## M1.73: the Broodmother comes for you
- **Pit rule change**: once **100 coins** have gone into the pits, the **next boss floor you reach** is the Broodmother's, however deep you are (before, only floor 15 could be hers). It happens once per run: the floor is remembered with the run (so CONTINUE meets her again), and later boss floors are back to normal. The King in Yellow keeps floor 20 (she takes the next one after). Floor 15 is still the Grand Masque if the pits have had fewer than 100 coins by then.
- Icy Prison floors keep their pit spiders and the Treasure Knight (unchanged, confirmed).
- All test groups pass.
- QA build `m1.73-qa` (debug hook on).

## M1.72: only ice monsters in the Icy Prison
- On an Icy Prison floor every regular monster is now a **Snowman** (60%) or a **Frozen Screamer** (40%), alongside the Ice Wizard and his ice spikes. Monsters that appear during the floor (pit spiders' swarm, shrine curses and the like) are ice monsters there too, and floor 3 no longer adds its extra Kettlegrump when it is icy. The **Treasure Knight** still visits: he is the floor's loot chase rather than a regular monster, and an armoured knight fits a prison. Tuning: `ICY_MOBS`.
- Tests that expect particular monsters on floors 3 and 6 (Springle, Kettlegrump, Rattlebone) and the "floor 3 is never easier than floor 2" check now skip icy floors.
- All test groups pass.
- QA build `m1.72-qa` (debug hook on).

## M1.71: the Frozen Screamer
- New monster, **the Frozen Screamer** (Icy Prison floors only: featured and guaranteed one per floor, also in the pool; 4 base HP, speed 1.45): a Screamer encased in ice (4 flap frames from the supplied sheet, `assets/mobs/fscreamer.png`). It flies and screams like a Screamer and fires the same sonic rings, but its bite and its rings do **+1 damage** (2 hearts). When it dies the ice **shatters** (small blue burst) and a **regular Screamer** breaks free and keeps fighting; the coin drop waits for that one.
- Size: the recent sprite sheets (Ice Wizard, ice spike, Snowman, Weeping Gargoyle, Debt Collector, Mortared Man and the new Frozen Screamer) are saved as palette PNGs - same look, about 140 KB less.
- All test groups pass.
- QA build `m1.71-qa` (debug hook on).

## M1.70: the Snowman
- New monster, **the Snowman** (Icy Prison floors only: featured, at least 1, 2 from floor 5; 4 base HP, speed 1.05): an angry snowman from the supplied 3-frame sheet (`assets/mobs/snowman.png`). Frame 1 is idle/walk and he bobs up and down as he moves; frame 2 winds up a snowball (0.45 s) and frame 3 throws it (`assets/boss/shot_snowball.png`, 1 heart). Like the Screamer he always throws (every ~2.7 s when you are 1.4-8 cells away and in sight), and he bites if you get close. Tuning: `RANGED.snowman`.
- All test groups pass.
- QA build `m1.70-qa` (debug hook on).

## M1.69: the Ice Wizard and the Frozen Wand
- New boss, **the Ice Wizard** (from the supplied 5-frame sheet: frame 1 casts, frames 2-5 walk; `assets/mobs/icewiz.png`). He is on **every Icy Prison floor**, waiting in the room farthest from the start, with a boss bar once he has seen you. HP 30 + 4 per floor. He keeps 3-6 cells away and every 1.6-2.4 s casts either a fan of 3 small fast **ice orbs** or one slow **big ice orb** that bursts into a **blue explosion** (1 heart and a brief chill within 1.3 cells) when it hits a wall, reaches you or runs out. Every 14-22 s he calls a **blizzard**: the fog closes to 3 tiles for 5-10 s.
- At **75%, 50% and 25%** health he raises a **shield bubble** and summons **2-5 ice spikes** (flying minions from the supplied art, 2 HP, `assets/mobs/icespike.png`) that circle round to bite you from behind. Until every spike is gone his bubble holds and balloons clank off; he keeps attacking. Killing him ends the blizzard and shatters any spikes left.
- He drops the **Frozen Wand** (run item, never sold or found elsewhere; icon in a new fifth row of `assets/items.png`): your balloons are frozen, do **+1 damage**, and instead of splashing they **bounce off** monsters and walls, drop to the floor and roll about for a few seconds before vanishing (harmless once bounced).
- Art: `assets/boss/shot_iceorb.png`, `shot_icebig.png`; the blue explosion is the existing explosion art with red and blue swapped (no new image). Tuning: `ICEWIZ` in the game.
- Tests: the single-file size cap is gone (the size is still reported); new art is kept as small as possible.
- All test groups pass.
- QA build `m1.69-qa` (debug hook on).

## M1.68: the Icy Prison
- New floor type, **the Icy Prison**: it can replace the theme of any generated floor from floor 3 (never the tutorial or a boss floor such as the King in Yellow's). The chance grows with depth (6% on floor 3, +2% a floor, at most 45%), and after one appears the next 4 floors can't be icy. It uses only three new wall textures (cracked ice tiles, frozen stone with icicles and snow, icy brick; `assets/walls.png` is now 10 x 3 tiles), white fog, a whitish floor and a grey ceiling, a faint frost tint, and slate doors.
- **The cold**: on an Icy Prison floor you move at 85% speed and wait 25% longer between throws. Tuning: `ICY` in the game.
- All test groups pass.
- QA build `m1.68-qa` (debug hook on).

## M1.67: paid coin doors stay open on CONTINUE
- Paying a coin door is saved (`coinPaid`, keyed like `coinTaken`). CONTINUE restores that door as open and does not charge for it again. Music Box coin-door loot is unchanged. Old saves without the field still load.
- All test groups pass.
- QA build `m1.67-qa` (debug hook on).

## M1.66: (merged from Grok-Code-8/9) Jailer's Eye, clear boss cut-scenes, coin-loot CONTINUE, shared high scores
- The Jailer's Eye is a rare Stone Keep run item (weight 0.4, at most one per floor, about 8% of Stone Keep floors). While you hold it, iron fences open like doors and stay open, including after CONTINUE. It does not appear off that theme, and the slot machine does not award it.
- Boss cut-scenes pick a camera with a clear line of sight to the boss (or skip walls between if no vantage exists), lift the fog so the boss is visible, then restore the exact previous fog, including Glasses and the Slick Man's clamp.
- After the Music Box opens a coin door and you take the room's reward, CONTINUE no longer respawns that loot.
- Every score POST to the relative `/api/labyrinth/scores` path includes `{name,score,floor,seed,version}`. The board can toggle All versions vs This version (old rows with no version are unknown). A 404, error, or unreachable API still shows the local top 10.
- The Rafter Doll is still drawn at half a normal mob's size, but its balloon hit height is now at least 0.58, so a throw at level aim (pitch 0) hits it at mid range. Its bite still connects. A shield block stops the Rust as well as the heart.
- Using the Music Box is saved: CONTINUE restores the open doors (including locked and coin doors), the cracked wall, and the tune. Jumping to the same floor with the cheat console resets the music so the game no longer freezes (`TypeError` in `musicTick`). A coin door opened by the box now grants the reward that was in its room.
- Grok-Code-8/9 numbered these M1.65 and M1.66; M1.65 is the Debt Collector on main, so both land here on top of it.
- All test groups pass.
- QA build `m1.66-qa` (debug hook on).

## M1.65: the Debt Collector
- New monster, **the Debt Collector** (Old Vaults floors only, exactly one per floor; 6 base HP): a dark hooded figure in a smiling gold mask (3-frame walk from the supplied art, `assets/mobs/collector.png`). It chases you, and its hit **steals 3 coins** instead of hurting you (the coins fly to it). If you have no coins, its hit costs **2 hearts**. Once it has taken **12 coins** it is paid off: it stops, can no longer be hurt, and works like a shopkeeper (face it and press E / X / USE to open the floor's shop). Kill it before then and the coins it took spill back out. It never gets Infernal modifiers. Tuning: `COLLECTOR` in the game.
- All test groups pass.
- QA build `m1.65-qa` (debug hook on).

## M1.64: no per-monster map colours
- Removed the per-type map colour (`dot`) from every regular monster. In play every monster has been the same red X on the minimap and full map since M1.29, so the colours only fed the debug map preview (now the same red) and two old colour-distance tests (retired from this build on).
- All test groups pass.
- QA build `m1.64-qa` (debug hook on).

## M1.63: the Weeping Gargoyle
- New decoration: a **gargoyle statue** (from the supplied art) on a pedestal, rare: about 1 in 10 big rooms (40+ cells) gets one, on any floor.
- On **Stone Keep** floors half of those statues are alive, and about 1 in 10 of the floor's other monsters spawns as one. A live **Weeping Gargoyle** (6 base HP) never moves. Asleep it is stone: eyes shut, balloons clank off. Come within **3 cells** (in sight) and it wakes with red eyes and screams like the Screamer, then fires **bursts of 3 sonic rings** (0.3 s apart), closes its mouth and recharges for 2.4-3.4 s. Get more than **8 cells** away and it shuts its eyes and goes back to sleep. It never bites and never gets Infernal modifiers. Art: `assets/mobs/gargoyle.png` (asleep, awake, screaming). Tuning: `GARG` in the game.
- Merged with Grok-Code-7 (M1.62, Timber Attic, below).
- All test groups pass.
- QA build `m1.63-qa` (debug hook on).

## M1.62: Timber Attic (the Music Box, the Rafter Doll)
- New use-item, **Music Box** (only drops or is sold on Timber Attic floors; uncommon, at most one per floor). Using it plays an eerie, slightly detuned music-box tune for the rest of the level and permanently opens every door on that floor, including locked and coin doors and the hidden cracked wall. It is used up afterward. A Music Box you already hold still works on any floor. Icon in `assets/items.png`.
- New monster, **the Rafter Doll** (5 base HP, scales like the other regular mobs): a cracked porcelain doll, drawn at half a normal mob's size with a matching hitbox. It is fast, dashes in to bite, then flees before coming back. The bite applies **Rust** for 15 s: your throws are slower and don't go as far (the existing RUSTED status pill is shown, clear of the touch buttons). It only lives on **Timber Attic** floors (the wood-wall early theme), with the usual featured minimum (1, or 2 from floor 5), and is skipped by the L3 kettle-swap and the Rattlebones swap. It has no ranged elite attack. Art: `assets/mobs/rafterdoll.png` (2 walk frames, feet-centred and bottom-aligned, cut from the supplied sheet with the white background keyed out).
- All test groups pass.
- QA build `m1.62-qa` (debug hook on).

## M1.61: item screen on LB
- Gamepad **LB** opens and closes the item screen (D-pad up still opens it). Balloon colours are permanent run items and no longer cycle, so LB was free.
- All test groups pass.
- QA build `m1.61-qa` (debug hook on).

## M1.60: ranged elite crash and theme-mob swaps
- The elite `ranged` modifier is only rolled for monsters that have a `RANGED` entry (it was being given to Rattlebones, Hexeyes, Lichen Faces, Bathers and the Slick Man, which then crashed with `TypeError: Cannot read properties of undefined (reading 'tele')` when they first tried to fire — about 239 of 2,200 floors in the M1.57 playtest, including seed 5 L5, seed 25 L7 and seed 19 L8). The fire code and `fireAt` now also no-op if the entry is missing, so a leftover or morphed ranged flag can never throw.
- The L3 kettle-swap and the L6+ Rattlebones swap now skip every featured theme mob (the Mortared Man was missing from the L3 skip list; Bathers and the others could still be turned into skeletons on L6+). The M1.58 `ensureThemeMob` minimum still restores at least 1 (2 from floor 5) after later generation steps.
- All test groups pass.
- QA build `m1.60-qa` (debug hook on).

## M1.59: the Spirit Slate and the item screen
- New run item, **Spirit Slate** (only drops or is sold on Slate Halls floors; max 1, 40 coins; lasts the whole run): every monster shows as a red X on the minimap and the full map, even in rooms you haven't explored. Icon in `assets/items.png` (next to the Plunger).
- New **item screen**: press **I** (gamepad **D-pad up**, or tap the hearts/coins panel on touch) to see every run item you have (with counts) and the use-items you carry. Pick one with the arrows / WASD, the d-pad, or a click / tap to read its name and what it does. The game waits while it is open; I, Esc or B closes it.
- Merged with Grok-Code-5/6 (M1.57/M1.58 below).
- QA build `m1.59-qa` (debug hook on).

## M1.58: guaranteed Baths / Cellar / Slate mobs; Bather walk fixed
- Theme featured mobs now keep their minimum after later generation steps (Rattlebone swaps, shop and boss arenas moving monsters): **at least 1** on that theme, **2 from floor 5**. This is the Bather on Tiled Baths, the Lichen Face on Mossy Cellar, the Slick Man on Slate Halls, and the Mortared Man on Brick Halls. The earlier M1.57 letter-count test could pass while a later swap removed a featured mob (visible on some Slate floors, where only one Slick Man was left).
- The Bather's 4-frame statue walk is re-cut: every frame is bottom-aligned and centred on the feet so the sprite no longer wobbles. The walk cycle is twice as fast (8 frames/s, in line with other walkers).
- Treasure Knights are unchanged: one is guaranteed on every floor from 2, and a coin door can add a second (~4% of floors). Two knights is intended, not a double-spawn bug.
- All test groups pass.
- QA build `m1.58-qa` (debug hook on).

## M1.57: Tiled Baths (the Bather, the Plunger) and Slate Halls (the Slick Man)
- **The Bather** (Tiled Baths floors only): a pale marble statue (4-frame walk loop from the supplied sheet) with 4 base HP. It slowly chases you and leaves slick, damaging puddles in *pool water blue* (`#3FC8E6`, with a lighter highlight). Rubber Boots ignore them; flyers are unaffected. The old hunched 5-frame art was kept for the Slick Man.
- **Plunger** (use-item): opens a black hole at your feet and drops you exactly one floor, then is used up. A held key cannot chain another drop. Blocked (and not consumed) on a sealed boss floor or the last floor. Only appears on floors whose theme label says Baths; a held Plunger still works anywhere. Uncommon (about a third the weight of other use-items) and at most one per Baths floor.
- **The Slick Man** (Slate Halls floors only): a dark slimy stone figure using the old Bather walk sheet (`assets/mobs/slickman.png`, 5 frames). 10 base HP (2.5× a typical 4-HP mob; tougher than Clunkbot), speed 0.8. It reflects player projectiles 30% of the time (the balloon bounces back and can hurt you, with a spark and a clack). While one is alive and within 10 cells, view distance is forced to 5 blocks, overriding glasses, flares and other sight items, then lerps back when it dies or you leave its range. Heavy wet-stone voice and footsteps.
- All test groups pass.
- QA build `m1.57-qa` (debug hook on).

## M1.56: no more riders
- Infernal mobs no longer get the **Mounted** modifier (a second mob riding on top). It is never rolled; every other modifier is unchanged. Switch: `MOD_OFF` in the game.
- All test groups pass.
- QA build `m1.56-qa` (debug hook on).

## M1.55: Mortared Man colours
- The face is recoloured to match the brick walls (its shading mapped onto the brick tile's browns and reds; the glowing red eyes are kept).
- QA build `m1.55-qa` (debug hook on).

## M1.54: Mortared Man art
- `assets/mobs/mortar.png` is now cut from the supplied face sheet (three 96 x 96 frames: shut, opening, open; the baked-in checkerboard keyed out).
- QA build `m1.54-qa` (debug hook on).

## M1.53: Brick Halls - the Masonry Trowel and the Mortared Man
- New run item, **Masonry Trowel** (only drops or is sold on Brick Halls floors): secret cracked walls show a wide, deep, very visible crack. Icon from the supplied art, in `assets/items.png`.
- New monster, **the Mortared Man** (4 base HP, Brick Halls floors only): a brick-red face painted into the wall itself (no standing sprite) that slides along the walls after you, round inner and outer corners. While you look at it, it keeps its mouth shut and can't be hurt (balloons clank off). When you look away (it is off screen), it opens its mouth (0.45 s), spits a mortar glob at you and stays open for 1.6 s: that's when you can hit it. It never bites. Art: `assets/mobs/mortar.png` (shut, opening, open) and `assets/boss/shot_mortar.png`. Tuning: `MORTAR` in the game.
- All test groups pass.
- QA build `m1.53-qa` (debug hook on).

## M1.52: Mourner's Veil and the Lichen Face (merged from Grok-Code-3)
- New use-item, **Mourner's Veil**: a damp lace veil. Using it blinds every mob within your current view range (and in line of sight) for 5 s. Blinded mobs lose track of you and wander, with a dark-veil mark and motes over them. The Warding Bell's stun still freezes a mob if both are applied. The Veil is in the normal use-item loot and shop pools. Pickup text and the HUD tooltip use the name and "BLINDS EVERY MOB IN VIEW FOR 5 S"; Q, gamepad Y and the ITEM button all use it.
- New monster, **the Lichen Face** (3 base HP, scales like the other regular mobs): a pale cracked stone face ringed with dark tendrils that hovers and drifts toward you like the other flyers (pits, puddles and spores do not affect it). It lives on **Mossy Cellar** floors (the existing early theme on floors 2-8, not the tutorial Gatehouse and not the deep themes). When it pops it leaves a slowing spore patch about the size of a slime puddle, lasting 5 s, on the floor below where it died. Mid-hop airborne ground mobs also ignore the patch; Rubber Boots shrug it off, same as webs, frost and goo. It has a quiet, warbling procedural moan when it spots you, and a distinct pop. Tuning: `VEIL` and `SPORE` in the game.
- Art for the Veil icon and the Lichen Face's five-frame tendril-wave loop is packed from `assets/items.png` and `assets/mobs/lichen.png` (the face sheet is keyed to a transparent background).
- Using the Veil plays a short (~0.85 s) translucent grey-green damp mist around the edges of the 3D view; it fades out, never fully hides the scene, and is not drawn over the HUD, minimap, message band or touch buttons. Blinded mobs still show a small dark veil mark and motes.
- The source banner now says world art is packed from PNG sheets in `assets/`, not generated in code.
- QA build `m1.52-qa` (debug hook on).

## M1.51: higher-resolution walls
- Wall tiles are 128x128 instead of 64x64 (`assets/walls.png` is now 1280x256, re-cut from the supplied art; 256-colour PNG to keep the file small). The pillar, rune, crack, dent, gold-brick and coin-door effects are scaled to match; doors still use the 64px `doors.png`.
- Game file: 1,317 KB (limit 2 MB).
- All test groups pass.
- QA build `m1.51-qa` (debug hook on).

## M1.50: transparent fence art
- The fence tile in `assets/walls.png` now uses the supplied transparent fence image.
- All test groups pass.
- QA build `m1.50-qa` (debug hook on).

## M1.49: new wall textures
- All 20 wall tiles in `assets/walls.png` redrawn from the supplied sheet (same order and size). The fence's dark backdrop is cut out so it stays see-through.
- All test groups pass (2,578 checks across the parallel group runs).
- QA build `m1.49-qa` (debug hook on).

## M1.48: Hexeye art fix
- The Hexeye's red-stare frame is no longer cut off on the left (the frames are now cut from the supplied image by shape, not by equal strips).
- QA build `m1.48-qa` (debug hook on).

## M1.47: the Hexeye; bigger pits and pit rooms
- New monster, the **Hexeye** (from floor 12): a floating purple stone hexagon with one big eye (art from the supplied sprite, `assets/mobs/hexeye.png`: open, half-blink, closed, red). It floats toward you, blinks, and hangs back about 2.6 cells away. When it sees you within 4.2 cells it stares: a high whine, its eye turns red and the fog goes red; after 2 s you lose a heart if you are still in range. Step out of range to dodge it. The attack is psychic, so the leather jacket, bubble wrap, garlic and hand mirror do not stop it. Tuning: `HEXEYE` in the game.
- Pits: more of them deeper down (6 spots by floor 10, +1 every 4 floors past 12, up to 10), 2x1 / 2x2 pits from floor 8 and up to 3x3 from floor 14, each keeping every part of the floor reachable. Tuning: `PITGEN`.
- Pit rooms (from floor 14, 40% of floors): a room becomes all pit except 1-cell paths joining its doors. What stood there moves elsewhere and nothing stands on the paths; the start, exit, shop, treasure, arena, slot machine, key and secret-room entrance never end up in one.
- Fix: monsters displaced by a pit room never land in the boss arena or the shop.
- The single-file size limit is now 2 MB (the full-colour Hexeye art put the build at about 1 MB).
- QA build `m1.47-qa` (debug hook on).

## M1.46: freeze fix, stuck skeletons
- Fixed the game freezing (the view stopped updating; the pause menu still animated, but CONTINUE froze it again): an Infernal mob of a type without a pre-built glow (a skitter, an egg sac, the knight...) crashed the renderer every frame. The glow is now built for any mob type the first time it is needed.
- Safety net: an error in one frame no longer freezes the game. The loop carries on, and the last error is shown in small red text on the pause screen (report it if you see it).
- Fixed two skeletons stuck on top of each other: the Mounted power could put a Rattlebones on a Rattlebones carrier, and when the carrier collapsed into its bone pile the rider stayed pinned to it. Riders never get a carrier of their own kind, Rattlebones are no longer carriers, and a carrier that collapses throws its rider off.
- QA build `m1.46-qa` (debug hook on).

## M1.45: new arm and balloon art, explosions, flyers skip puddles
- New art for the blue water balloon and the arm, from the supplied reference images: holding, wind-up (pulled back), throw and the empty hand (the supplied open-hand art). The arm frames are now 100 x 80 and the sleeve runs on past the bottom-right corner, so it never shows a cut end while the arm moves. The other six balloon colours (red, green, yellow, black, purple, pink) are made from the new blue art, thrown and in hand.
- Thrown balloons are drawn about 30% bigger (giant pump balloons too), and the balloon's edge pixels are darker than its centre. The blue balloon colour (HUD chip, splashes) is the new art's sky blue (#40c9fc).
- New explosion art, `assets/boom.png`, after the supplied concept: a small burst, the fireball, the peak and drifting smoke (~0.75 s). Black balloons and Explode deaths show a full blast, the firecracker four smaller ones around you, and the Firework power a small one with its sparks. The old white puff rings are gone.
- Flying or airborne monsters (screamers, masks, Hazewisp, flying bosses, Infernal Flying mobs, a Springle mid-hop) pass over yellow puddles without taking damage.
- Tests: the touch-layout check measures the hand itself (the sleeve runs under the touch buttons by design); the death-screen test picks a biting mob and never teleports into a wall.
- Tests: the M1.28 Morph check stops at the first morph (with a morph forced every 0.2 s it could morph back into a Clunkbot and fail).
- QA build `m1.45-qa` (debug hook on).

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
