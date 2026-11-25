# M1.49 brief

The owner approved the first feature for M1.49:

**Mossy Cellar**

- Item: **Mourner's Veil**, a damp lace veil. Using it blinds every mob within the player's view range for 5 s.
- Mob: **The Lichen Face** (3 base HP), a pale face growing out of the moss that hops after the player. When it pops, it leaves a slowing patch of spores.

Art for this round was to be made with the built-in image generator, not Game Art Director, then cut, resized and keyed to fit the existing sprite atlas and packed with `node tools/assets.mjs pack`.

Build notes from the task:

- If a Mossy Cellar floor or theme already exists, use it as the Lichen Face's spawn floor(s). Otherwise pick a sensible early, mossy-appropriate pool.
- Add Mourner's Veil as a use-item in the normal loot and shop pools.
- Reuse any existing blind/stun status if there is one. Blinded mobs lose track of the player and wander for 5 s, with a visible indicator. View range is the player's current sight radius.
- The Lichen Face has 3 base HP, scales the same way other mobs do, and moves by hopping toward the player. On death it leaves a spore patch that slows the player, about the size of a slime puddle and lasting a few seconds. Flyers ignore it, and it follows the existing slow and status rules (Knit Scarf does not exist yet).
- Add the item and mob to any codex or bestiary, item names, HUD tooltips and pickup text. Touch, keyboard and gamepad must all work, and messages must not sit behind touch buttons.

Playtest is paused, so REVIEW is pending.
