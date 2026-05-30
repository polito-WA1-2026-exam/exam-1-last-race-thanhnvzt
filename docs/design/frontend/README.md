# Frontend Design Package

This package defines the React frontend architecture for Last Race. It expands
the high-level [Frontend Design](../05-frontend-design.md) into smaller files so
the UI, routes, modules, and state transitions can be reviewed independently.

The chosen UI direction is a **desktop transit-control game cockpit**: compact,
map-first, phase-oriented, and optimized for route planning under time pressure.

## Documents

1. [UX Direction](./01-ux-direction.md)
2. [Routes and Information Architecture](./02-routes-information-architecture.md)
3. [File Structure](./03-file-structure.md)
4. [State and Data Flow](./04-state-data-flow.md)
5. [Screen Specifications](./05-screen-specs.md)
6. [Component Contracts](./06-component-contracts.md)
7. [Instructions Screen Design](./07-instructions-screen.md)

## Design Principles

- Map-first: the network map is the primary visual object in setup and planning.
- Phase clarity: setup, planning, execution, result, and ranking have distinct
  screens and visible status.
- Dense but readable: the app targets desktop, so use structured panels and
  tables without oversized landing-page sections.
- Server authority: the client displays and collects input, but the server owns
  game assignment, route validation, random events, and scoring.
- Explainable React: route components orchestrate data loading, reusable
  components render UI, API modules perform HTTP calls, and helpers only handle
  client-side formatting or preview logic.
