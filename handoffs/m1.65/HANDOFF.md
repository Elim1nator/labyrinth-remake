# M1.65 handoff

## What was wrong
The M1.62 playtest found a blocker and four follow-ups (see the review notes):

1. Balloons thrown at level aim flew over the Rafter Doll. Hit height was `h * sz` = 0.31, so the z window topped out at 0.43, under the balloon's 0.47–0.70 mid-range arc.
2. The Music Box effect was not saved, so CONTINUE brought the doors back closed.
3. `startLevel` cleared `G.musicBox` but left `MUSIC.song={box:true}` when the floor number was unchanged (cheat-jump to the same floor), and `musicTick` then read `S.bpm` on that object and threw.
4. A shield block should skip the doll's Rust, like other blocked hits.
5. A coin door opened by the Music Box did not grant the room's reward.

## The fix
- `DOLL.hitH` is 0.58 (about 0.55): the doll's balloon hit height is `max(scaled, hitH)`. The sprite stays `sz: 0.5`. Bite reach is unchanged at 0.52.
- `hurtPlayer` already applied Rust only when `hurtPlayerBy` returned true (a shield block returns false). A test now locks that in.
- `writeSave` / `openMusicBox` store `musicBox`; `startLevel` restores it on CONTINUE (`applyMusicBox({quiet:true,noGrant:true})`).
- `startLevel` always calls `musicStop()`, which now clears `MUSIC.song` even when there is no audio graph.
- Opening a coin door with the box collects the `coinLoot` item that was placed in that room (run item, power-up, piggy or bag).

## Freeze
- Tests: **601/601** passed (30 retired pre-M1.23/M1.31 checks).
- Release `builds/m1.65/index.html` 1658.0 KB (1,697,765 bytes), sha256 `64b8a369f58d9cbc7ea69bf59df3fa1df9c60768c879e18b7983d796aa925d2b`.
- QA `builds/m1.65-qa/index.html` 1658.0 KB (1,697,763 bytes), sha256 `d1b28f823bcee62e7bfc554daff5b8252b8b067ddc6ddfe4e50add193d47bf49`.
- Main's frozen `builds/m1.64/` is unchanged.
- No PNG art changed.

