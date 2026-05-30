# State and Data Flow

This document defines where state lives and how data moves between React and the
server.

## Global State

Only authentication is global.

| State | Owner | Why |
| --- | --- | --- |
| `user` | `AuthContext` | Needed by navigation, protected routes, and logout. |
| `authLoading` | `AuthContext` | Needed while checking `/api/sessions/current`. |

Do not put game data, ranking, network data, or route builder state in global
Context unless a future feature truly needs it.

## Page State

| Page | State | Source |
| --- | --- | --- |
| `SetupPage` | `network`, `loading`, `error`, `startingGame` | `gameApi.getSetupNetwork`, `gameApi.createGame` |
| `PlanningPage` | `planningData`, `selectedSegmentIds`, `submitting`, `submitError` | `gameApi.getPlanningData`, local route builder |
| `CountdownTimer` | `remainingSeconds` | derived from server `planningDeadline` |
| `ExecutionPage` | `steps`, `currentStepIndex`, `playbackDone` | route state or `gameApi.getGameResult` |
| `ResultPage` | `result`, `loading`, `error` | `gameApi.getGameResult` |
| `RankingPage` | `ranking`, `loading`, `error` | `rankingApi.getRanking` |
| `LoginPage` | `email`, `password`, `submitting`, `error` | controlled form |

## Derived Values

Compute these during render or with small pure helpers:

- selected route labels;
- number of selected segments;
- whether submit button should be disabled;
- current coin delta text;
- ranking position numbers if the server does not send them.

Do not store derivable values in `useState`.

## Data Loading Pattern

Page-level data loading should follow this shape:

```txt
route mounts
-> set loading true
-> call API module
-> set data on success
-> set controlled error on failure
-> set loading false
```

For effects, include real dependencies:

- `PlanningPage`: `[gameId]`
- `ResultPage`: `[gameId]`
- `AuthProvider`: `[]` for initial session check

## Route Submission Flow

```txt
PlanningPage selectedSegmentIds
-> submitRoute handler
-> gameApi.submitRoute(gameId, selectedSegmentIds)
-> POST /api/games/:gameId/route
-> server validates and executes
-> response contains validRoute, score, steps
-> navigate to execution or result
```

Recommended navigation:

- valid route with steps: go to `/game/:gameId/execution`;
- invalid route: go directly to `/game/:gameId/result`;
- pass response through route state for speed;
- still allow result page to reload from API if state is missing.

## Timer Flow

The server returns `planningDeadline` and `serverNow`.

Client behavior:

1. `CountdownTimer` receives the deadline.
2. `PlanningPage` computes `serverOffsetMs` from `serverNow`.
3. The timer calculates remaining time as:

   ```txt
   Date.parse(planningDeadline) - (Date.now() + serverOffsetMs)
   ```

4. It updates once per second.
5. At zero, it calls `onExpire`.
6. `PlanningPage` uses the same submit handler used by the manual submit button.
7. A `hasSubmitted` ref or state flag prevents duplicate submissions.

The timer is UI state. The server deadline is the authority.

## Error Handling Flow

API wrapper should normalize errors:

```txt
HTTP non-OK
-> parse JSON error if available
-> throw Error with message and status
-> route catches error
-> if status 401, clear auth and navigate login
-> otherwise show ErrorBanner
```
