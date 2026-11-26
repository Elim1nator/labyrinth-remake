# High score API contract

The game expects a small JSON API on the **same origin** that serves `index.html`, under
`/api/labyrinth`. The client uses **relative paths only** and sends no credentials of any
kind (no Authorization header, no keys, no tokens); requests use `credentials: "same-origin"`.
There is no CORS: the API is not meant to be called from other origins.

## Endpoints

### `GET /api/labyrinth/health`

`200 {"ok": true}`. The game calls this to decide whether the online board is available.

### `GET /api/labyrinth/scores?limit=N`

`limit` defaults to 10, maximum 100.

```json
{"scores": [
  {"rank": 1, "name": "ACE", "score": 12345, "floor": 9, "seed": "abc123",
   "version": "M1.66", "created_at": "2026-11-21T14:00:00Z"}
]}
```

Sorted by score (highest first), ties broken by earliest `created_at`. `created_at` is an
ISO 8601 UTC timestamp. `version` is optional on old rows (treat a missing value as
unknown). From M1.66 the game requests `limit=50` so a “This version” filter still has
enough rows, then shows the top 10 after filtering.

### `POST /api/labyrinth/scores`

Body (`Content-Type: application/json`, at most 2 KB):

```json
{"name": "ACE", "score": 12345, "floor": 9, "seed": "abc123", "version": "M1.66"}
```

From M1.66 the game always sends `version` (the build's release string). Older clients may
omit it; the server should accept either form.

Success: `201 {"ok": true, "id": 42, "rank": 7}`.

## Validation

The server enforces these rules; the game checks them too before sending.

| Field | Rule |
|---|---|
| `name` | string, 1–16 characters after trimming; letters, digits, space, `_` `.` `-` only |
| `score` | integer, 0 to 10,000,000, and at most `floor × 100,000` |
| `floor` | integer, 1 to 10,000 |
| `seed` | string, 1–32 characters; letters, digits, `_` `-` only |
| `version` | optional string, at most 16 characters from `[A-Za-z0-9._-]`; the build id (e.g. `M1.66`). Omit or reject other characters. A missing value is unknown, not the current build |
| body | JSON object, at most 2 KB |

## Errors

All errors return `{"ok": false, "error": "<message>"}`:

| Status | When |
|---|---|
| 400 | invalid JSON, body too large, or a field fails validation |
| 404 | unknown path |
| 405 | wrong method for the path |
| 429 | rate limit reached |

## Rate limits

At most **5 posts per minute** and **30 per hour** per client IP. On `429` the game shows a
friendly "wait a minute, then try again" message and lets the player retry.

## Client behaviour

- When the API can't be reached (opened from `file://`, offline, server down, health check
  fails), the game keeps a **local top 10** in `localStorage` under
  `labyrinthRemake.localScores.v1` and labels the board LOCAL.
- The score formula never exceeds `floor × 100,000` (see [../BALANCE.md](../BALANCE.md)).
- The board can toggle All versions vs This version, filtering the fetched list
  client-side by `version`.
- Automated tests never post to a live board; they use `tests/hs_stub.mjs`, a local
  implementation of this contract (including the rate limits) that binds to loopback only.
