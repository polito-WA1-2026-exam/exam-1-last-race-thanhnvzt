# Last Race Design Documentation

This folder contains the implementation design for the WA1 exam project
"Last Race". It is based on the preliminary exam text in
[../exam.md](../exam.md) and on the current repository shape:

- `client/`: React 19 single-page application.
- `server/`: Node 24 + Express HTTP API server.
- SQLite database stored in the server folder.
- Passport session authentication with cookies.

## Reading Order

1. [Requirements](./01-requirements.md) explains what the application must do.
2. [Domain Model](./02-domain-model.md) defines the game entities and rules.
3. [Game Design](./game/README.md) defines the player experience, loops,
   mechanics, economy, onboarding, and playtest criteria.
4. [Database Design](./03-database.md) maps the model to SQLite tables.
5. [Backend Design](./backend/README.md) defines the internal Express, service,
   DAO, authentication, validation, and transaction structure.
6. [API Contract](./04-api-contract.md) defines the Express endpoints.
7. [Frontend Design](./05-frontend-design.md) defines the React frontend
   direction and links to the detailed [frontend design package](./frontend/README.md).
8. [Game Flow](./06-game-flow.md) details the setup, planning, execution, and
   result phases.
9. [Validation and Security](./07-validation-security.md) lists server-side and
   client-side checks.
10. [Testing Plan](./08-testing-plan.md) provides manual and integration test
   scenarios.

## Core Design Decision

The server is authoritative for the network, random game assignment, route
validation, event selection, scoring, authentication, and ranking. The client is
responsible for rendering screens, collecting user input, showing the countdown,
and displaying server responses.

The design uses these boundaries:

- React owns the single-page user interface.
- Express exposes JSON HTTP APIs.
- DAO functions isolate SQLite queries from route handlers.
- Passport sessions protect registered-user functionality.
- Server-side game rules avoid trusting the browser for scoring or validation.
