# Frontend Design

The detailed frontend design is split into smaller documents under
[frontend/](./frontend/README.md). This keeps the React application structure,
UI decisions, route logic, and component contracts easier to review.

## Frontend Design Package

1. [UX Direction](./frontend/01-ux-direction.md)
2. [Routes and Information Architecture](./frontend/02-routes-information-architecture.md)
3. [File Structure](./frontend/03-file-structure.md)
4. [State and Data Flow](./frontend/04-state-data-flow.md)
5. [Screen Specifications](./frontend/05-screen-specs.md)
6. [Component Contracts](./frontend/06-component-contracts.md)

## Summary

The frontend should feel like a desktop transit-control game cockpit:

- compact and readable rather than decorative;
- map-first during setup and planning;
- clear phase navigation;
- strong feedback for timer, route selection, execution events, and score;
- no registration screen, because the exam only requires seeded users and
  login/logout.

The recommended React organization is feature-oriented. Route-level screens live
in `client/src/routes/`, reusable UI lives in `client/src/components/`, API calls
live in `client/src/api/`, and game-specific helpers live in
`client/src/features/game/`.

