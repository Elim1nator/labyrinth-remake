# QA BUILD (debug hook on, NOT FOR PUBLISHING) — Kersplat Labyrinth: The Descent M1.32 QA build

Same game as `../m1.32/index.html`, except `QA_BUILD=true`: the `window.__game` test hook is always on, and the title says "QA build". The two files differ in exactly 2 lines (title and flag).
For automated tests and QA only; don't publish this build. High score tests run against the local stub `tests/hs_stub.mjs`, never the live board. Frozen; sha256 in `../SHA256SUMS`.
