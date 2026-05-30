# Routes and Information Architecture

The frontend is a React SPA. React Router is recommended; if used, declare it in
`client/package.json`.

## Route Table

| Route | Access | Module | Purpose |
| --- | --- | --- | --- |
| `/` | Public | `routes/public/InstructionsPage.jsx` | Game instructions and login entry point. |
| `/login` | Public | `routes/auth/LoginPage.jsx` | Login form for seeded users. |
| `/setup` | Logged user | `routes/game/SetupPage.jsx` | Full metro network before starting a game. |
| `/game/:gameId/planning` | Game owner | `routes/game/PlanningPage.jsx` | Timed route-building phase. |
| `/game/:gameId/execution` | Game owner | `routes/game/ExecutionPage.jsx` | Step-by-step event playback. |
| `/game/:gameId/result` | Game owner | `routes/game/ResultPage.jsx` | Final score and new-game action. |
| `/ranking` | Logged user | `routes/ranking/RankingPage.jsx` | General ranking of best results. |
| `*` | Public | `routes/public/NotFoundPage.jsx` | Lightweight fallback. |

No `/register` route is planned because the exam states that registration is not
requested or evaluated.

## Navigation Model

Top navigation:

- app title: navigates to `/`;
- setup: visible only when logged in;
- ranking: visible only when logged in;
- login/logout: changes by auth state;
- current user display: visible only when logged in.

During an active game, show a compact phase indicator:

```txt
Setup -> Planning -> Execution -> Result
```

Only the current and completed phases should look active. Do not allow users to
skip forward through phase navigation. Use buttons driven by valid actions
instead.

## Page Hierarchy

```txt
App
  AuthProvider
  AppRouter
    PublicLayout
      InstructionsPage
      LoginPage
      NotFoundPage
    ProtectedLayout
      SetupPage
      PlanningPage
      ExecutionPage
      ResultPage
      RankingPage
```

`ProtectedLayout` checks the auth context for navigation purposes. The server
still enforces authentication and ownership.

## Page Responsibilities

### Instructions

- Explain the game briefly.
- Mention that only seeded registered users can play.
- Do not show network map or segment data.

### Setup

- Fetch and display the full network.
- Let the player start a game.
- Avoid showing planning-only segment controls.

### Planning

- Fetch planning data.
- Display station-only map.
- Display all segment pairs.
- Manage selected route state.
- Submit manually or on timeout.

### Execution

- Display server-returned steps.
- Progress one step at a time.
- Never recalculate event effects.

### Result

- Display score and invalid reason if any.
- Offer new-game and ranking actions.

### Ranking

- Fetch ranking.
- Display sorted table with empty/loading/error states.

