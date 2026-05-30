# API Contract

All API responses are JSON. Endpoints that require a session use Passport and
the `isLoggedIn` middleware. Client fetch calls to authenticated endpoints must
send `credentials: 'include'`.

This document defines the client-server HTTP boundary. For the internal Express
module structure, services, DAOs, authentication setup, transactions, and error
handling, see [Backend Design](./backend/README.md).

Base URL in development:

```txt
http://localhost:3001/api
```

The server currently listens on port `3001`; keep the README and CORS origin
consistent if this changes.

## Common Error Shape

```json
{
  "error": "Human-readable error message"
}
```

Expected common status codes:

- `400 Bad Request`: malformed payload or invalid parameters.
- `401 Unauthorized`: missing or expired login session.
- `403 Forbidden`: authenticated user cannot access this resource.
- `404 Not Found`: requested resource does not exist.
- `409 Conflict`: action conflicts with current game state.
- `422 Unprocessable Entity`: well-formed input violates game validation.
- `500 Internal Server Error`: unexpected server/database failure.

## Session APIs

| Method | Endpoint | Auth | Body | Success | Error cases | DAO/helper |
| --- | --- | ---: | --- | --- | --- | --- |
| POST | `/api/sessions` | No | `{ "email": "...", "password": "..." }` | `201` + logged user | `400`, `401`, `500` | Passport local strategy, `getUserByEmail` |
| GET | `/api/sessions/current` | Optional | none | `200` + logged user, or `401` | `401`, `500` | Passport session |
| DELETE | `/api/sessions/current` | Yes | none | `204` | `401`, `500` | `req.logout` |

Logged user response:

```json
{
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice"
}
```

Do not return password hashes or salts.

## Public APIs

| Method | Endpoint | Auth | Body | Success | Error cases | DAO/helper |
| --- | --- | ---: | --- | --- | --- | --- |
| GET | `/api/instructions` | No | none | `200` + text/structured instructions | `500` | static object |

The instructions may also be hardcoded in the client. If so, this endpoint is
optional. The important rule is that anonymous visitors do not receive network
data.

## Network APIs

| Method | Endpoint | Auth | Body | Success | Error cases | DAO/helper |
| --- | --- | ---: | --- | --- | --- | --- |
| GET | `/api/network/setup` | Yes | none | `200` + full network with lines and connections | `401`, `500` | `listNetworkForSetup` |

Setup response:

```json
{
  "stations": [
    { "id": 1, "name": "Aurora Gate", "x": 80, "y": 120 }
  ],
  "lines": [
    {
      "id": 1,
      "name": "Red Line",
      "color": "#d64545",
      "stations": [
        { "id": 1, "name": "Aurora Gate" },
        { "id": 2, "name": "Museum Square" }
      ],
      "segments": [
        { "id": 1, "fromStationId": 1, "toStationId": 2 }
      ]
    }
  ]
}
```

## Game APIs

| Method | Endpoint | Auth | Body | Success | Error cases | DAO/helper |
| --- | --- | ---: | --- | --- | --- | --- |
| POST | `/api/games` | Yes | none | `201` + planning game data | `401`, `500` | `createGame` |
| GET | `/api/games/:gameId/planning` | Yes | none | `200` + planning data | `400`, `401`, `403`, `404`, `409`, `500` | `listPlanningData` |
| POST | `/api/games/:gameId/route` | Yes | `{ "segmentIds": [1, 2, 3] }` | `200` + execution/result data | `400`, `401`, `403`, `404`, `409`, `422`, `500` | `submitRoute` |
| GET | `/api/games/:gameId/result` | Yes | none | `200` + result data | `400`, `401`, `403`, `404`, `500` | `listGameResult` |

### Create Game Response

```json
{
  "gameId": 42,
  "status": "planning",
  "startStation": { "id": 3, "name": "Central Spire" },
  "destinationStation": { "id": 12, "name": "East Depot" },
  "planningDeadline": "2026-05-30T12:01:30.000Z",
  "serverNow": "2026-05-30T12:00:00.000Z",
  "initialCoins": 20
}
```

### Planning Data Response

```json
{
  "gameId": 42,
  "startStation": { "id": 3, "name": "Central Spire" },
  "destinationStation": { "id": 12, "name": "East Depot" },
  "planningDeadline": "2026-05-30T12:01:30.000Z",
  "serverNow": "2026-05-30T12:00:00.000Z",
  "stations": [
    { "id": 1, "name": "Aurora Gate", "x": 80, "y": 120 }
  ],
  "segments": [
    {
      "id": 1,
      "stationA": { "id": 1, "name": "Aurora Gate" },
      "stationB": { "id": 2, "name": "Museum Square" }
    }
  ]
}
```

Planning data intentionally omits line names, colors, and line-connected map
paths. This follows the exam requirement that the planning map shows station
names but no connecting lines.

`serverNow` is returned with planning responses so the client can compensate for
small clock differences while rendering the countdown. The server still uses the
stored `planningDeadline` as the authority when the route is submitted.

### Submit Route Request

```json
{
  "segmentIds": [5, 8, 9, 14]
}
```

The server reconstructs the directed route from the assigned start. If the next
selected segment does not touch the current station, the route is invalid.

### Valid Route Response

```json
{
  "gameId": 42,
  "status": "executed",
  "validRoute": true,
  "initialCoins": 20,
  "finalCoins": 18,
  "score": 18,
  "steps": [
    {
      "index": 0,
      "fromStation": { "id": 3, "name": "Central Spire" },
      "toStation": { "id": 7, "name": "Glassworks" },
      "line": { "id": 2, "name": "Blue Line", "color": "#2f6fde" },
      "event": { "description": "Wrong platform delay", "effect": -2 },
      "coinsAfterStep": 18
    }
  ]
}
```

### Invalid Route Response

```json
{
  "gameId": 42,
  "status": "invalid",
  "validRoute": false,
  "invalidReason": "Route does not reach East Depot.",
  "initialCoins": 20,
  "finalCoins": 0,
  "score": 0,
  "steps": []
}
```

Invalid route submission is a successful game-state transition, so `200` is
acceptable. Use `422` only when the payload itself cannot be interpreted as a
route, for example non-array `segmentIds`.

## Ranking API

| Method | Endpoint | Auth | Body | Success | Error cases | DAO/helper |
| --- | --- | ---: | --- | --- | --- | --- |
| GET | `/api/ranking` | Yes | none | `200` + ranking list | `401`, `500` | `listRanking` |

Response:

```json
{
  "ranking": [
    {
      "position": 1,
      "userId": 2,
      "name": "Bianca",
      "bestScore": 28,
      "completedGames": 4
    }
  ]
}
```

## Route Ownership Rules

- Every `/api/games/:gameId/*` endpoint checks that the game belongs to
  `req.user.id`.
- If the game exists but belongs to a different user, return `403`.
- If the game does not exist, return `404`.
- Prefer a helper named `getGameForUser(gameId, userId)` that makes this check
  explicit.
