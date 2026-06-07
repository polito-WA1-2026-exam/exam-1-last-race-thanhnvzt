# Game Validation and Transactions

Route submission is the most important backend workflow. It changes game state,
validates the route, may select random events, and writes the final score.

## Create Game Workflow

```txt
createGame(userId)
-> load network graph
-> compute pairs with shortest distance >= 3 segments
-> randomly choose one pair
-> startedAt = server now
-> planningDeadline = startedAt + 90 seconds
-> insert games row with status planning
-> return gameId, start, destination, deadline, serverNow
```

The shortest-distance computation should use the fixed network segments as an
undirected graph.

## Submit Route Workflow

```txt
submitRoute(gameId, userId, selectedSegmentIds)
-> begin transaction
-> load game and verify ownership
-> verify status is planning
-> compare server now with planningDeadline
-> load selected segments and serving lines
-> reject repeated segment IDs
-> reconstruct directed route
-> validate route rules and resolve line id for each directed step
-> if invalid or expired: update game with score 0
-> if valid: choose events for resolved steps, insert game steps, update score
-> commit transaction
-> return result object
```

The transaction prevents partial state such as game score updated without
matching game steps.

## Directed Route Reconstruction

The client sends segment IDs, not directed station pairs. The server reconstructs
direction from the assigned start:

1. Reject the submitted route if any physical segment ID appears more than once.
2. Set `currentStationId` to `game.startStationId`.
3. For each selected segment:
   - if `station_a_id` equals current station, direction is A -> B;
   - if `station_b_id` equals current station, direction is B -> A;
   - otherwise the route is disconnected and invalid.
4. Update `currentStationId` to the step destination.
5. After all segments, require `currentStationId === destinationStationId`.

## Line-Change Validation

Each segment can be served by one or more metro lines. Validation should track
possible current lines instead of forcing one arbitrary line too early.

Algorithm:

```txt
possibleLines = lines serving first step

for each next step:
  nextLines = lines serving next step
  sharedStation = previous step destination

  allowedNextLines = []

  for previousLine in possibleLines:
    for nextLine in nextLines:
      if nextLine === previousLine:
        allowed
      else if sharedStation is served by both lines:
        allowed only because it is an interchange

  possibleLines = allowedNextLines
  if possibleLines is empty: invalid route
```

The route is valid only if the final step leaves at least one possible line
assignment.

For a valid route, the validation service must choose one valid line assignment
and return it as `resolvedSteps`. Each resolved step contains:

```js
{
  index,
  segmentId,
  fromStationId,
  toStationId,
  lineId
}
```

If multiple line assignments are valid, choose deterministically from the
remaining possible assignments, for example the lowest `lineId` at the final
step and the compatible preceding lines. The important rule is that scoring and
`game_steps` insertion receive already-resolved `lineId` values; they should not
re-run line-change validation or guess a line later.

## Debug Validation Logging

Normal server runs should not print detailed validation traces. For local
debugging, enable validation logging with either:

```sh
DEBUG_GAME_VALIDATION=1 npm start
```

or the broader debug shortcut:

```sh
npm run debug
```

When enabled, the server logs the validation decision path with a
`[game-validation]` prefix:

- submitted `segmentIds`;
- owner/status/deadline checks;
- deadline decision using stored planning drafts for late timeout submissions;
- selected segment rows and serving line options;
- directed route reconstruction from the assigned start station;
- rejected step reasons such as unknown, disconnected, or over-continued route;
- duplicate segment rejection;
- line-assignment candidates and whether each transition is accepted by same
  line or interchange;
- final resolved `lineId` per step for valid routes;
- scoring input and output after route validation.

These logs are server-only diagnostics. They must not be returned by the API and
must not include passwords, session cookies, or raw SQL statements.

## Deadline Rule

The server stores `planningDeadline` and enforces it during submission. The
client receives `serverNow` for display synchronization, but the backend compares
against server time.

Implemented deadline behavior:

- manual submission before or at deadline: validate and execute normally;
- manual submission after deadline: mark the game `expired` with score 0;
- timeout submission after deadline: validate the latest server-saved planning
  draft, not a fresh late route body.

The server still owns the deadline. The client disables editing at zero and
sends an automatic timeout submission, but the persisted draft is what lets the
server reconstruct "the route built so far" if that timeout request arrives
late.

## Invalid Route Result

Invalid or expired games:

- skip event selection;
- insert no `game_steps`;
- set `valid_route = 0`;
- set `final_coins = 0`;
- set `score = 0`;
- store a short `invalid_reason`.

## Valid Route Result

Valid games:

- start from 20 coins;
- select one random event per resolved step;
- apply event effects in order;
- insert one `game_steps` row per resolved step, including its resolved
  `line_id`;
- set raw `final_coins`;
- set `score = Math.max(finalCoins, 0)`;
- set `valid_route = 1`;
- set `status = 'executed'`.
