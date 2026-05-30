# DAO and Service Boundaries

The backend uses two layers above SQLite:

- DAO modules for direct database access;
- service modules for business rules that coordinate several DAO operations.

This keeps SQL, HTTP, and game rules separate.

## Route Handler Responsibilities

Route handlers should:

- read `req.params`, `req.body`, and `req.user`;
- validate HTTP-level input;
- call one service or DAO function;
- choose the HTTP status code;
- return JSON.

They should not:

- contain raw SQL;
- implement the full route-validation algorithm;
- calculate final score directly;
- access another user's game without an ownership helper.

## DAO Responsibilities

DAO modules should:

- use parameterized SQL;
- map rows to clean JavaScript objects;
- preserve database constraints;
- expose small operation-oriented functions.

Example DAO groups inside feature folders:

### `features/auth/users.dao.js`

- `getUserByEmail(email)`
- `getUserById(id)`

### `features/network/network.dao.js`

- `listStations()`
- `listLinesWithSegments()`
- `listNetworkForSetup()`
- `listPlanningSegments()`
- `listSegmentsWithServingLines()`

### `features/games/games.dao.js`

- `createPlanningGame(data)`
- `getGameById(gameId)`
- `getGameForUser(gameId, userId)`
- `markGameExecuted(data)`
- `markGameInvalid(data)`
- `insertGameSteps(gameId, steps)`
- `getGameResultForUser(gameId, userId)`

### `features/ranking/ranking.dao.js`

- `listRanking()`

## Service Responsibilities

Service modules should:

- coordinate multiple DAO calls;
- enforce game status transitions;
- run transactional workflows;
- keep route handlers small.

### `features/games/games.service.js`

Responsibilities:

- create a planning game;
- choose a start and destination at least 3 stops apart;
- return planning data with `planningDeadline` and `serverNow`;
- submit a route and return either execution data or invalid result data.

### `features/games/routeValidation.service.js`

Responsibilities:

- reconstruct directed route steps from selected segment IDs;
- verify route starts at assigned start;
- verify consecutive continuity;
- verify final destination;
- verify line changes only at interchange stations;
- return a validation result object, not an HTTP response.

### `features/games/scoring.service.js`

Responsibilities:

- select random events for each valid step;
- apply event effects from 20 starting coins;
- clamp score to minimum 0;
- build step result objects.

## Data Shape Between Layers

Services should receive plain JavaScript objects:

```js
{
  gameId,
  userId,
  selectedSegmentIds
}
```

Services should return plain results:

```js
{
  status: 'executed',
  validRoute: true,
  initialCoins: 20,
  finalCoins: 18,
  score: 18,
  steps: []
}
```

Routes translate those results into HTTP responses.
