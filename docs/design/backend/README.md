# Backend Design

This package describes the Node + Express backend beyond the HTTP API contract.
The API contract defines endpoints and payloads; this backend design defines how
the server should be organized internally.

For endpoint paths, request bodies, response bodies, and HTTP status codes, see
[API Contract](../04-api-contract.md).

## Documents

1. [Module Structure](./01-module-structure.md)
2. [Authentication and Sessions](./02-authentication-sessions.md)
3. [DAO and Service Boundaries](./03-dao-service-boundaries.md)
4. [Game Validation and Transactions](./04-game-validation-transactions.md)
5. [Errors, Validation, and Runtime Configuration](./05-errors-validation-runtime.md)

## Backend Responsibility

The backend is the authority for:

- authenticated sessions;
- protected API access;
- network and event data;
- random start/destination assignment;
- planning deadline storage and enforcement;
- route validation;
- random event selection;
- scoring;
- ranking.

The client may display previews and countdowns, but the backend decides the
final game state.

## Request Flow

```txt
HTTP request
-> Express app in server/src/app.js
-> shared middleware
-> feature route
-> feature service
-> feature DAO
-> SQLite
-> mapper
-> JSON response
```

Keep route handlers short. They should parse HTTP input, check authentication,
call service/DAO functions, and return JSON. They should not contain long SQL
queries or the full route-validation algorithm.
