# Module Structure

The backend should be organized by feature so that a reviewer can follow one
flow without jumping across many unrelated folders. `server/index.js` remains at
the root because the exam runner starts the backend with `nodemon index.js`.

## Recommended `server/` Tree

```txt
server/
  index.js
  package.json
  db.sqlite
  src/
    app.js
    config/
      corsConfig.js
      sessionConfig.js
      constants.js
    db/
      connection.js
      transaction.js
    middleware/
      requireAuth.js
      errorHandler.js
      notFoundHandler.js
      validateRequest.js
    shared/
      errors.js
      time.js
      random.js
      http.js
    features/
      auth/
        auth.routes.js
        auth.service.js
        users.dao.js
        password.js
        user.mapper.js
      network/
        network.routes.js
        network.service.js
        network.dao.js
        network.mapper.js
      games/
        games.routes.js
        games.service.js
        games.dao.js
        routeValidation.service.js
        graph.service.js
        scoring.service.js
        game.mapper.js
      ranking/
        ranking.routes.js
        ranking.service.js
        ranking.dao.js
        ranking.mapper.js
    scripts/
      init-db.js
      seed-db.js
```

This structure keeps each domain flow local:

- authentication code lives in `features/auth`;
- network loading code lives in `features/network`;
- game creation, planning, validation, execution, and result code lives in
  `features/games`;
- ranking code lives in `features/ranking`;
- shared middleware, database helpers, and utility functions live outside
  feature folders.

## Root Files

### `server/index.js`

Startup entry required by the exam.

Responsibilities:

- import `src/app.js`;
- read the port from config;
- start `app.listen`.

It should not register every route directly. Keeping startup small makes it easy
to explain what runs when `nodemon index.js` is executed.

### `server/src/app.js`

Express application factory.

Responsibilities:

- create the Express app;
- enable JSON body parsing;
- apply CORS;
- apply session middleware;
- initialize Passport;
- mount feature routes under `/api`;
- mount `notFoundHandler`;
- mount `errorHandler`.

Recommended middleware order:

```txt
express.json()
cors(corsConfig)
session(sessionConfig)
passport.initialize()
passport.session()
/api/sessions routes
/api/network routes
/api/games routes
/api/ranking routes
notFoundHandler
errorHandler
```

Middleware order matters because protected routes need parsed JSON, CORS
headers, session cookies, and Passport user deserialization before handlers run.

## Shared Infrastructure

### `config/`

Configuration modules keep constants out of feature code:

- `corsConfig.js`: allowed React origin and credentials flag;
- `sessionConfig.js`: session secret, cookie options, resave settings;
- `constants.js`: port, database path, planning duration, initial coins, and
  debug flags.

### `db/`

Database helpers:

- `connection.js`: opens SQLite, enables foreign keys, exposes promise helpers;
- `transaction.js`: wraps multi-write workflows in a transaction.

Feature DAOs import these helpers. Routes and React components never access
SQLite directly.

### `middleware/`

Cross-feature Express middleware:

- `requireAuth.js`: returns `401` when there is no authenticated user;
- `validateRequest.js`: reusable route parameter/body validation helper;
- `notFoundHandler.js`: JSON `404` for unknown API routes;
- `errorHandler.js`: converts known errors to JSON responses.

### `shared/`

Small utilities used by several features:

- `errors.js`: `BadRequestError`, `ForbiddenError`, `NotFoundError`,
  `ConflictError`, `ValidationError`;
- `time.js`: `nowIso`, `addSeconds`, deadline comparison;
- `random.js`: random item selection;
- `http.js`: safe JSON response helpers if needed.

Keep this folder small. If a helper is only used by games, keep it in
`features/games`.

## Feature Folder Pattern

Each feature follows the same shape:

```txt
feature/
  feature.routes.js
  feature.service.js
  feature.dao.js
  feature.mapper.js
```

Rules:

- `*.routes.js` handles HTTP details.
- `*.service.js` handles business decisions.
- `*.dao.js` handles SQLite queries.
- `*.mapper.js` converts database rows into API-safe objects.

Some features need extra service modules. The games feature has more files
because route validation and scoring are the central complexity of the app.

## Feature Responsibilities

### `features/auth`

Files:

- `auth.routes.js`;
- `auth.service.js`;
- `users.dao.js`;
- `password.js`;
- `user.mapper.js`.

Responsibilities:

- login;
- logout;
- current session;
- password verification;
- Passport serialize/deserialize;
- safe user response mapping.

No registration module is planned.

### `features/network`

Files:

- `network.routes.js`;
- `network.service.js`;
- `network.dao.js`;
- `network.mapper.js`.

Responsibilities:

- full setup network for logged users;
- station and line loading;
- segment loading;
- API-safe network response mapping.

Planning-specific network data can be served by `games.service.js` because it is
bound to an owned game and deadline.

### `features/games`

Files:

- `games.routes.js`;
- `games.service.js`;
- `games.dao.js`;
- `routeValidation.service.js`;
- `graph.service.js`;
- `scoring.service.js`;
- `game.mapper.js`.

Responsibilities:

- create planning games;
- choose reachable start/destination pairs;
- return planning data with `planningDeadline` and `serverNow`;
- reconstruct submitted routes from segment IDs;
- validate station continuity and line-change rules;
- enforce planning deadlines;
- choose random events;
- write game result and game steps transactionally.

The games feature should own the route-submission transaction because it is the
only workflow that coordinates game row updates, step inserts, events, scoring,
and invalid/expired status.

### `features/ranking`

Files:

- `ranking.routes.js`;
- `ranking.service.js`;
- `ranking.dao.js`;
- `ranking.mapper.js`.

Responsibilities:

- compute best score per user;
- sort ranking;
- return public-safe player names and scores to logged users.

## Import Direction

Allowed:

```txt
index.js -> src/app.js
app.js -> feature routes
feature routes -> feature services
feature services -> feature DAOs
feature services -> same-feature helper services
feature DAOs -> db helpers
any backend module -> shared errors/time/random when needed
```

Avoid:

- DAO importing route modules;
- route modules importing SQLite connection directly;
- features importing React/client code;
- `shared/` growing into a vague dump of game-specific logic;
- services returning Express `res` objects.

## Example Request Flow by File

Route submission:

```txt
src/app.js
-> features/games/games.routes.js
-> middleware/requireAuth.js
-> middleware/validateRequest.js
-> features/games/games.service.js
-> features/games/games.dao.js
-> features/games/routeValidation.service.js
-> features/games/scoring.service.js
-> db/transaction.js
-> middleware/errorHandler.js if an error occurs
```

Login:

```txt
src/app.js
-> features/auth/auth.routes.js
-> features/auth/auth.service.js
-> features/auth/users.dao.js
-> features/auth/password.js
-> Passport session serialization
```

Setup network:

```txt
src/app.js
-> features/network/network.routes.js
-> middleware/requireAuth.js
-> features/network/network.service.js
-> features/network/network.dao.js
-> features/network/network.mapper.js
```
