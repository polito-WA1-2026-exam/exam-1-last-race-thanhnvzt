# Component Contracts

These contracts describe expected props and responsibilities. They are not final
code, but they define clear module boundaries for implementation.

## Layout Components

### `AppLayout`

Responsibility:

- render `TopNav`;
- render route content;
- provide consistent page spacing.

Inputs:

- `children`.

Does not:

- fetch data;
- manage game state.

### `TopNav`

Responsibility:

- show navigation based on auth state;
- call logout handler.

Inputs:

- `user`;
- `onLogout`;
- `logoutLoading`.

## Feedback Components

### `LoadingPanel`

Responsibility:

- show consistent loading feedback for page-level loading.

Inputs:

- `message`.

### `ErrorBanner`

Responsibility:

- show controlled error messages.

Inputs:

- `message`;
- optional `onDismiss`.

## Game Components

### `NetworkMap`

Used on setup page.

Inputs:

- `stations`;
- `lines`;
- optional `height`.

Displays:

- station labels;
- colored line paths;
- interchange markers;
- line legend can be separate or included.

Does not:

- start games;
- fetch network data;
- validate routes.

### `StationOnlyMap`

Used on planning page.

Inputs:

- `stations`;
- `startStationId`;
- `destinationStationId`;

Displays:

- station labels;
- start and destination markers;
- no segment lines.

### `SegmentList`

Inputs:

- `segments`;
- `selectedSegmentIds`;
- `onSelectSegment`;
- `disabled`.

Displays:

- all segment pairs;
- selected state if already chosen;
- accessible buttons for selecting segments.

### `RouteBuilder`

Inputs:

- `selectedSegments`;
- `onRemoveLast`;
- `onClear`;
- `previewWarning`.

Displays:

- ordered selected route;
- remove controls;
- clear route action;
- client-side preview warnings.

Does not:

- decide final route validity.

### `CountdownTimer`

Inputs:

- `deadline`;
- `onExpire`;
- `disabled`.

Behavior:

- updates once per second;
- calls `onExpire` once;
- cleans interval on unmount;
- respects duplicate-submission guard owned by parent.

### `ExecutionTimeline`

Inputs:

- `steps`;
- `currentStepIndex`;
- `onNext`;

Displays:

- current event;
- coin effect;
- coins after step;
- compact step list.

Does not:

- choose events;
- recalculate score.

### `ScorePanel`

Inputs:

- `initialCoins`;
- `finalCoins`;
- `score`;
- optional `validRoute`;

Displays:

- clear score summary;
- invalid state if needed.

## Ranking Components

### `RankingTable`

Inputs:

- `ranking`;
- optional `currentUserId`.

Displays:

- position;
- player name;
- best score;
- completed games.

Does not:

- fetch ranking data.

## API Module Contracts

### `api/client.js`

Exports:

- `apiGet(path)`;
- `apiPost(path, body)`;
- `apiDelete(path)`.

Responsibilities:

- set base URL;
- include credentials;
- parse JSON;
- normalize errors.

### `api/gameApi.js`

Exports:

- `getSetupNetwork()`;
- `createGame()`;
- `getPlanningData(gameId)`;
- `submitRoute(gameId, segmentIds)`;
- `getGameResult(gameId)`.

