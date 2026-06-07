# Errors, Validation, and Runtime Configuration

This document defines backend behavior for bad input, expected conflicts, and
runtime setup.

## Validation Layers

### Request Validation

Validate at route boundaries:

- route parameters are integers;
- required body fields exist;
- `segmentIds` is an array;
- every segment id is an integer;
- login body contains non-empty username and password.

### Business Validation

Validate in services:

- game belongs to the authenticated user;
- game is still in `planning`;
- route starts from assigned station;
- route ends at assigned destination;
- line changes happen only at interchanges;
- submission respects deadline.

### Database Validation

Validate with SQLite constraints:

- unique username;
- unique station and line names;
- valid event effect range;
- valid game status values;
- foreign keys.

## Error Types

Use small custom error classes or plain errors with status metadata:

```txt
BadRequestError -> 400
UnauthorizedError -> 401
ForbiddenError -> 403
NotFoundError -> 404
ConflictError -> 409
ValidationError -> 422
```

Route handlers can either catch these errors directly or pass them to a final
Express error middleware.

## Error Response Shape

```json
{
  "error": "Route does not reach the destination."
}
```

Do not expose stack traces, SQL statements, password hashes, salts, or internal
module names in API responses.

## Logging

Server logs should include enough information to debug:

- endpoint;
- error type;
- game id or user id when useful;
- short message.

Do not log passwords or session cookies.

Do not add a backend debug action for exam runtime. Validation decisions should
be inspectable from the route/service/DAO code and from controlled API results,
without exposing debug-only HTTP documentation or detailed trace logs.

## Runtime Configuration

Recommended environment values:

```txt
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=development-secret-replace-later
DATABASE_PATH=./db.sqlite
```

Defaults may be provided for development, but secrets should be configurable.
Planning timeout behavior is configured through the fixed 90-second planning
duration and the stored planning deadline; delayed timeout submissions use the
last server-saved draft instead of a separate tolerance setting.

## CORS

Use explicit CORS:

```js
cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
})
```

Do not use wildcard CORS with credentials.

## Server Startup

The exam runner starts the backend with:

```sh
cd server
nodemon index.js
```

Therefore:

- `index.js` must start the server directly;
- all dependencies must be declared in `server/package.json`;
- no global modules except `nodemon` should be assumed;
- database initialization must be available from committed files or documented
  scripts.
