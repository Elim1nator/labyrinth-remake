# Kersplat Labyrinth: The Descent — M1.18

Release build (no debug hook unless `?debug`); QA build in `../m1.18-qa/`.

## What changed since M1.17.1

- **Music: a song for every floor.** Original 8-bit music is composed in code from the floor seed, so every floor has its own tune and the same seed and floor always give the same song.
  - Slow minor or modal keys at about 58–82 BPM.
  - A soft bass line, a quiet pulse arpeggio, a sparse triangle melody (A-B-A'-B phrases) and light noise ticks.
  - Boss floors use darker modes (phrygian, locrian, harmonic minor) and lower keys.
  - It plays quietly under the ambience: about −39 dB average, measured.
  - Nothing is downloaded, the file grows by only a few KB, and it stays fully original. N mutes everything.
- **Revive.** When you die, the death screen offers **REVIVE** for 10 coins × the number of times you have died this run (10, 20, 30…).
  - Press R, gamepad X/Y, or tap the button.
  - You stand back up where you fell with full hearts and 2 s of safety. Nearby monsters are pushed back, and after a pit fall you land on solid ground.
  - The floor is saved again.
  - Without enough coins it says how many you need. Continuing goes to name entry as before.

Frozen build; sha256 in `../SHA256SUMS`.
