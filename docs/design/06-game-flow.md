# Game Flow

This document describes the runtime behavior from the player's point of view and
from the full-stack request flow. It links the [API Contract](./04-api-contract.md),
[Frontend Design](./05-frontend-design.md), and
[Validation and Security](./07-validation-security.md).

## Phase 0: Anonymous Instructions

1. User visits `/`.
2. React renders game instructions.
3. If no session exists, only instructions and login are available.
4. The client does not request network data for anonymous users.

Design point: anonymous visitors are explicitly limited by the exam text, so the
app avoids exposing the network before login.

## Phase 1: Login

1. User opens `/login`.
2. `LoginPage` uses controlled inputs for username and password.
3. On submit, it calls `API.login`.
4. `POST /api/sessions` runs Passport local authentication.
5. Passport verifies the salted password hash.
6. Server creates a session cookie.
7. Client stores the returned safe user object in `AuthContext`.
8. User navigates to `/setup`.

Full flow:

```txt
Login form submit
-> API.login(credentials)
-> POST /api/sessions with credentials: include
-> Express JSON middleware
-> Passport local strategy
-> DAO getUserByUsername
-> password verification
-> session cookie
-> React AuthContext update
```

## Phase 2: Setup

1. Logged user opens `/setup`.
2. `SetupPage` calls `API.getSetupNetwork`.
3. `GET /api/network/setup` checks the session.
4. DAO loads stations, lines, and line segments.
5. React renders the full network map and legend.
6. User clicks "Start game".
7. Client calls `API.createGame`.
8. Server creates a `planning` game:
   - chooses start and destination;
   - ensures minimum distance of 3 stops;
   - sets `planningDeadline` to current server time plus 90 seconds.
9. Client navigates to `/game/:gameId/planning`.

## Phase 3: Planning

1. `PlanningPage` loads `GET /api/games/:gameId/planning`.
2. Server verifies the game belongs to the user and is still in planning.
3. Client renders:
   - station-only map;
   - start and destination;
   - all segment pairs;
   - selected route area;
   - countdown based on `planningDeadline`.
4. User selects segments in sequence.
5. User submits manually, or the countdown submits automatically at zero.
6. Client calls `POST /api/games/:gameId/route`.

Important distinction:

- Client selection helps the user build a route.
- Server validation decides whether the route is valid.

## Phase 4A: Valid Route Execution

1. Server reconstructs the route direction from the assigned start.
2. Server validates station continuity and line-change rules, then resolves one
   valid `lineId` for each directed step.
3. Server starts from 20 coins.
4. For each resolved step:
   - choose one random event from `events`;
   - apply the event effect;
   - insert a `game_steps` row.
5. Server updates the game:
   - `status = 'executed'`;
   - `validRoute = 1`;
   - `finalCoins = raw total`;
   - `score = max(raw total, 0)`.
6. Server returns all execution steps.
7. Client shows the execution one step at a time.
8. Client navigates to result when the last step is shown.

Execution animation is a UI decision. The randomness and score are already fixed
by the server response.

## Phase 4B: Invalid or Incomplete Route

1. Server detects an invalid route, incomplete route, expired planning phase, or
   malformed route state.
2. Server skips random event execution.
3. Server updates the game:
   - `status = 'invalid'` or `status = 'expired'`;
   - `validRoute = 0`;
   - `finalCoins = 0`;
   - `score = 0`;
   - `invalidReason = short explanation`.
4. Server returns result data with no steps.
5. Client shows an explanation and score 0.

This implements the exam rule that invalid or incomplete routes lose all 20
coins and obtain score zero.

## Phase 5: Result

1. `ResultPage` displays:
   - valid/invalid status;
   - final score;
   - route summary if available;
   - button to start a new game;
   - link to ranking.
2. "New game" repeats setup or directly calls `POST /api/games`, depending on
   the chosen UX.

Recommended UX: return to `/setup` before starting another game so the player
can review the full network again.

## Phase 6: Ranking

1. Logged user opens `/ranking`.
2. Client calls `GET /api/ranking`.
3. Server computes best score per user from completed games.
4. Client displays a table sorted by best score descending.

Recommended columns:

- position;
- player name;
- best score;
- completed games.

## Server Time and Timer Behavior

The server stores `planningDeadline` and returns both `planningDeadline` and
`serverNow` when creating or loading a planning game. The client displays a
countdown from those values, but the server remains authoritative.

Client countdown calculation:

```txt
serverOffsetMs = Date.parse(serverNow) - Date.now()
remainingMs = Date.parse(planningDeadline) - (Date.now() + serverOffsetMs)
```

When route submission arrives:

- if `submittedAt` is before or equal to `planningDeadline`, process normally;
- if it arrives after the deadline but within the configured tolerance window,
  process normally to protect honest submissions delayed by HTTP or browser
  scheduling;
- if it arrives after `planningDeadline + PLANING_TOLERANCE_SECONDS`, mark the
  game `expired` with score 0.

The exam says timeout automatically ends planning with the route built so far.
That means the client must submit at zero. The server deadline remains the
authority in case of manipulated clients. `PLANING_TOLERANCE_SECONDS` defaults to
`2`; it is not extra visible planning time. Once the countdown reaches zero, the
client disables route editing and sends the current route.
