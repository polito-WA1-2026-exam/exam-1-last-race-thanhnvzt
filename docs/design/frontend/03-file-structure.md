# File Structure

Use a feature-oriented hierarchy. The goal is that a reviewer can find auth,
API, route pages, reusable UI, and game helper logic without reading the whole
project.

## Recommended `client/src` Tree

```txt
client/src/
  main.jsx
  App.jsx
  router/
    AppRouter.jsx
    ProtectedRoute.jsx
  api/
    client.js
    authApi.js
    gameApi.js
    rankingApi.js
  context/
    AuthContext.jsx
  routes/
    public/
      InstructionsPage.jsx
      NotFoundPage.jsx
    auth/
      LoginPage.jsx
    game/
      SetupPage.jsx
      PlanningPage.jsx
      ExecutionPage.jsx
      ResultPage.jsx
    ranking/
      RankingPage.jsx
  components/
    layout/
      AppLayout.jsx
      TopNav.jsx
      PhaseStepper.jsx
    feedback/
      ErrorBanner.jsx
      LoadingPanel.jsx
      EmptyState.jsx
    controls/
      SubmitButton.jsx
      IconButton.jsx
    game/
      NetworkMap.jsx
      StationOnlyMap.jsx
      SegmentList.jsx
      RouteBuilder.jsx
      CountdownTimer.jsx
      ExecutionTimeline.jsx
      ScorePanel.jsx
    ranking/
      RankingTable.jsx
  features/
    game/
      routePreview.js
      mapLayout.js
      formatGame.js
    auth/
      authStorage.js
  styles/
    base.css
    tokens.css
    layout.css
    game.css
```

## Naming Rules

- Route components end with `Page`: `PlanningPage.jsx`.
- API modules end with `Api`: `gameApi.js`.
- Context files end with `Context`: `AuthContext.jsx`.
- Reusable components use nouns: `SegmentList.jsx`, `ScorePanel.jsx`.
- Pure helper files use lower camel case: `routePreview.js`.
- Avoid vague names such as `utils.js`, `helpers.js`, `Game.jsx`, or
  `Components.jsx`.

## Module Responsibilities

### `api/client.js`

Low-level fetch wrapper:

- base server URL;
- JSON parsing;
- error shape normalization;
- `credentials: 'include'`.

### `api/authApi.js`

Session endpoints:

- `login`;
- `logout`;
- `getCurrentSession`.

### `api/gameApi.js`

Game endpoints:

- `getSetupNetwork`;
- `createGame`;
- `getPlanningData`;
- `submitRoute`;
- `getGameResult`.

### `api/rankingApi.js`

Ranking endpoint:

- `getRanking`.

### `features/game/routePreview.js`

Client-only helpers for display:

- derive selected segment labels;
- detect obvious disconnected next segment for warning text;
- compute route length from selected segments.

This helper must not decide final validity or score.

### `features/game/mapLayout.js`

Map display helpers:

- station coordinate scaling;
- label positioning;
- line path conversion for SVG.

Do not put HTTP calls or server game rules here.

## Import Direction

Allowed:

```txt
routes -> api
routes -> components
routes -> context
components -> features/game formatting helpers
components -> child components
api -> no React components
features -> no React components and no API calls
```

Avoid:

- `components` importing route pages;
- `api` importing React;
- helpers calling `fetch`;
- route components containing raw SQL concepts or server-only validation.

