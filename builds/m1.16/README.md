# Kersplat Labyrinth: The Descent — M1.16

Release build (no debug hook unless `?debug`); QA build in `../m1.16-qa/`.

## What changed since M1.15

- **Cheat console.** Type `cheat` on the keyboard while playing (or paused). A command box opens at the bottom and the game pauses. Press Enter to run a command, Esc to close.

  | Command | Effect |
  |---|---|
  | `jump N` | Go to floor N (1–10,000), keeping hearts, coins and items |
  | `heal` | Full hearts |
  | `god` | Toggle god mode (no damage, pits can't take you) |
  | `coins N` | Set your coins |
  | `give ITEM` | Put a power-up in your item slot (e.g. `give rocks`) |
  | `gold ITEM` | Grant a golden power-up |
  | `perm hp` / `perm arm` / `perm quick` | Add a permanent item |
  | `kill` | Pop every monster on the floor (not the boss) |
  | `boss` | Defeat this floor's boss |
  | `pit N` | Set the coins-in-the-pits count |
  | `help`, `close` | Show the list, close the box |

  Using any cheat marks the run. A cheated run's score is not sent to the high scores; you see "CHEATS USED - SCORE NOT SAVED". The mark is kept in the save, so CONTINUE doesn't clear it.
- **Fix:** a brand-new game could crash when buying the Golden Wonder in the shop (the golden-item list wasn't created yet).

Frozen build; sha256 in `../SHA256SUMS`.
