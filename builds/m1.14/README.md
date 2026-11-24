# Labyrinth Remake — M1.14 prototype (placeholder title)

Release build (no debug hook unless `?debug`); QA build in `../m1.14-qa/`.

## What changed since M1.13.1

- **The King in Yellow** (after Robert W. Chambers' 1895 book) takes floor 20; King Gloop's next round moves to floor 35.
  - His floor has darkened gold-brick walls and a dark gold floor and ceiling.
  - His hall holds an empty lectern, and he is not there yet. Find the torn play script hidden somewhere on the floor and place it on the lectern (E / USE). That starts the cut scene: the doors lock and he appears. Without the script the portal stays sealed.
  - He drifts after you and attacks every 2.4 s (1.6 s once furious at half health), using one of four attacks:
    - **The Yellow Sign:** a sigil brands the floor under you. If you are still on it after about a second, it costs a heart and reverses your controls (moving and turning) for 3 s.
    - **Tattered robes:** a fan of rags (5, then 7) that hurt and slow you.
    - **Carcosa:** for 6 s the room turns yellow, the minimap scrambles, the message band garbles, and twin pale suns home in on you.
    - **The Lake of Hali:** dark pools spread across the hall (one right under you) and hurt while you stand in them.
  - HP 70 × 1.4 (second round) + 5 per floor = 193 on floor 20.

Frozen build; sha256 in `../SHA256SUMS`.
