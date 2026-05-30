# Game Validation and Transactions

Route submission is the most important backend workflow. It changes game state,
validates the route, may select random events, and writes the final score.

## Create Game Workflow

```txt
createGame(userId)
-> load network graph
-> compute pairs with shortest distance >= 3 stops
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
-> reconstruct directed route
-> validate route rules
-> if invalid or expired: update game with score 0
-> if valid: choose events, insert game steps, update score
-> commit transaction
-> return result object
```

The transaction prevents partial state such as game score updated without
matching game steps.

## Directed Route Reconstruction

The client sends segment IDs, not directed station pairs. The server reconstructs
direction from the assigned start:

1. Set `currentStationId` to `game.startStationId`.
2. For each selected segment:
   - if `station_a_id` equals current station, direction is A -> B;
   - if `station_b_id` equals current station, direction is B -> A;
   - otherwise the route is disconnected and invalid.
3. Update `currentStationId` to the step destination.
4. After all segments, require `currentStationId === destinationStationId`.

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

## Deadline Rule

The server stores `planningDeadline` and enforces it during submission. The
client receives `serverNow` for display synchronization, but the backend compares
against server time.

Recommended strict behavior:

- before or at deadline: validate and execute normally;
- after deadline: mark the game `expired` with score 0.

If a small grace window is added, it must be documented and implemented only on
the server.

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
- select one random event per step;
- apply event effects in order;
- insert one `game_steps` row per step;
- set raw `final_coins`;
- set `score = Math.max(finalCoins, 0)`;
- set `valid_route = 1`;
- set `status = 'executed'`.
