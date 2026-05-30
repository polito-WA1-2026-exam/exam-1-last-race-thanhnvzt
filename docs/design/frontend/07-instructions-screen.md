# Instructions Screen Design

The instructions screen is the only meaningful page anonymous visitors can see.
It must explain the game clearly without exposing protected game data.

## Purpose

- Teach the high-level Last Race loop before login.
- Make clear that gameplay starts only after authentication.
- Avoid showing the fixed network, station names, line names, segment pairs,
  event catalog, active game state, or ranking data.
- Give seeded registered users a clear login action.

## Access Rule

Route: `/`

Access:

- anonymous users: allowed;
- logged users: allowed, but navigation should also offer setup/ranking links;
- protected data: never rendered on this page.

The page can describe concepts such as "network", "segments", "events", and
"ranking", but it must not include concrete network data.

## Layout

Use a compact desktop information screen, not a marketing landing page.

```txt
InstructionsPage
  Brief header row
    title
    short objective
    login action
  Rule summary band
    90-second timer
    valid route
    score/ranking
  Main content grid
    How a game works
```

## Visual Direction

- Use the same transit-control visual language as the rest of the app.
- Prefer crisp panels, small labels, rule chips, and ordered steps.
- Use a non-data "signal board" or rule summary instead of a network map.
- Keep text dense but readable; avoid oversized hero typography.
- Do not use station names, actual line names, real segment pairs, or the
  network map as decoration.

## Required Copy Content

The screen must explain:

1. The player studies the full network only after login.
2. The server assigns a random start and destination.
3. The player has 90 seconds to build a route from segment pairs.
4. Timeout submits the route built so far.
5. Valid routes execute with one random event per step.
6. Invalid or incomplete routes score zero.
7. Registered users can replay and compare best scores in ranking.
8. Anonymous visitors can only read instructions and log in.

## Prohibited Content

Do not show:

- station names;
- line names or colors tied to the real seeded network;
- segment pairs;
- full network map or station-only map;
- event catalog entries;
- current or historical ranking rows;
- active game IDs, assigned starts, or assigned destinations.

## Components

Recommended component split:

- `InstructionsPage`: route-level page and copy ownership.
- `InstructionStepList`: ordered game flow.
- `InstructionRulePanel`: timer, route validity, score summary.

These can start inline inside `InstructionsPage` and be extracted later if the
page grows.

## States

No server data is required.

States:

- anonymous: show login action as primary action;
- logged user: show setup action as primary action and keep instructions visible;
- unavailable auth check: keep page readable while navigation settles.

## Human Verification

- Open `/` while logged out.
- Confirm the page explains the game without needing oral explanation.
- Confirm the page contains no protected game data.
- Confirm the primary action is login for anonymous users.
- Log in and revisit `/`; confirm the user can navigate to setup without losing
  access to the instructions.
