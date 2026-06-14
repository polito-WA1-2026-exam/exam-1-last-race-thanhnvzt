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

Each segment can be served by one or more metro lines. The current implementation
keeps the same line when possible and randomly chooses among serving lines when
a line choice is needed.

Algorithm:

```txt
currentLine = random line serving first step

for each next step:
  nextLines = lines serving next step
  sharedStation = previous step destination

  if nextLines contains currentLine:
    keep currentLine
  else:
    currentLine = random line serving next step
```

Because interchange status is derived from distinct line membership, a connected
path that changes from one served line to another at the shared station is
already changing at an interchange by definition.

For a valid route, the validation service must choose one valid line assignment
and return it internally as `resolvedSteps`. Each resolved step contains:

```js
{
  index,
  segmentId,
  fromStationId,
  toStationId,
  lineId
}
```

If multiple lines serve a segment and the current line cannot be kept, choose
one of the serving lines randomly. The important rule is that scoring and
`game_steps` insertion receive already-resolved `lineId` values; they should not
re-run line-change validation or guess a line later. The API response then maps
those internal resolved steps into public `steps` with station, line, event, and
coin details instead of exposing a duplicate ID-only `resolvedSteps` array.

- Normal server runs do not print detailed validation traces.
- Route validation remains explainable through the service and validation
  function boundaries rather than a backend debug action.

Key validation decisions to explain during oral defense:

- deadline decision using stored planning drafts for late timeout submissions;
- selected segment rows and serving line options;
- directed route reconstruction from the assigned start station;
- rejected step reasons such as unknown, disconnected, or over-continued route;
- duplicate segment rejection;
- line assignment: keep the same line when possible, otherwise switch to a
  random line serving the next segment;
- final resolved `lineId` per step for valid routes;
- scoring input and output after route validation.

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
