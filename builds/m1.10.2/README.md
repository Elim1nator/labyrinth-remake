# Labyrinth Remake — M1.10.2 prototype (placeholder title)

Release build (no debug hook unless `?debug`); QA build in `../m1.10.2-qa/`.

## What changed since M1.10.1

- **Boss cut scene.** Opening a door into a boss room starts a 5-second cut scene (the game is paused, nothing can hurt you). You are pulled into the room, every door slams and locks behind you with a slam sound and a screen shake, the view turns to the boss, and "VS <BOSS NAME>" slides in between letterbox bars. Then the fight begins. If you get into an arena some other way (through an open gap), the scene plays the moment you step inside. It plays once per fight; CONTINUE replays it.

Frozen build; sha256 in `../SHA256SUMS`.
