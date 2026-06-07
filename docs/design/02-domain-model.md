# Domain Model

This document describes the game entities and business rules that will be
implemented in SQLite, Express, and React. See also
[Database Design](./03-database.md) and [API Contract](./04-api-contract.md).

## Entities

### User

A registered player who can log in and play games.

- `id`: stable primary key.
- `username`: unique login identifier.
- `name`: display name used in the ranking.
- `passwordHash`: salted encrypted password hash.
- `salt`: salt used for password verification.

### Station

A node in the fixed underground network.

- `id`: stable primary key.
- `name`: unique station name.
- `x`, `y`: optional map coordinates for deterministic drawing in the client.
- `isInterchange`: whether line changes are allowed at this station.

Stations are public only to logged-in users. Anonymous users must not receive
the station list.

### Line

A metro line in the fixed network.

- `id`: stable primary key.
- `name`: unique line name.
- `color`: display color used by the setup map.

### Segment

A direct connection between two adjacent stations.

- `id`: stable primary key.
- `stationAId`: first endpoint.
- `stationBId`: second endpoint.

Segments are undirected for gameplay. `A -> B` and `B -> A` are the same
connection, but a route step has a direction depending on how the player travels.

### Line Segment

Association between a line and an ordered segment position.

- `lineId`: line that serves this segment.
- `segmentId`: direct station pair served by the line.
- `position`: order of the segment within the line.

This supports:

- showing the complete setup map by line;
- validating whether a route step can be served by one or more lines;
- allowing future networks where the same station pair is shared by more than
  one line.

### Event

A random event that may happen during one route step.

- `id`: stable primary key.
- `description`: text shown during execution.
- `effect`: integer from -4 to +4.

The server chooses events during route execution. The client receives only the
events selected for the current game result.

### Game

One game attempt by one registered user.

- `id`: stable primary key.
- `userId`: owner.
- `status`: `planning`, `executed`, `invalid`, or `expired`.
- `startStationId`: assigned start.
- `destinationStationId`: assigned destination.
- `startedAt`: game creation timestamp.
- `planningDeadline`: server timestamp 90 seconds after planning starts.
- `planningDraftSegmentIds`: JSON array of the latest route draft saved before
  the deadline.
- `planningDraftUpdatedAt`: server timestamp for the latest saved draft.
- `submittedAt`: route submission timestamp.
- `initialCoins`: always 20.
- `finalCoins`: raw final coin total before clamping.
- `score`: displayed and ranked score, clamped to minimum 0.
- `validRoute`: boolean.
- `invalidReason`: short explanation for invalid or incomplete games.

Only one game at a time needs to be active per user in the UI. The database may
store older completed games for history and ranking.

### Game Step

A submitted and executed route step.

- `id`: stable primary key.
- `gameId`: parent game.
- `stepIndex`: zero-based order.
- `fromStationId`: route step start.
- `toStationId`: route step end.
- `lineId`: selected or resolved line used for this step.
- `eventId`: selected event after execution.
- `coinsAfterStep`: coin total after applying the event.

For invalid games, game steps may either be omitted or stored only as submitted
steps without events. The recommended design omits execution steps for invalid
games and stores `invalidReason` on `games`.

## Proposed Seed Network

This network satisfies the minimum requirements and is specific enough for an
original implementation.

### Stations

1. Aurora Gate
2. Museum Square
3. Central Spire
4. Harbor Market
5. West Garden
6. North Library
7. Glassworks
8. River Forum
9. South Arena
10. Old Foundry
11. Hill Observatory
12. East Depot
13. Clocktower
14. Canal Court

### Lines

| Line | Stations in order |
| --- | --- |
| Red Line | Aurora Gate, Museum Square, Central Spire, Harbor Market, West Garden |
| Blue Line | North Library, Central Spire, Glassworks, River Forum, South Arena |
| Green Line | Museum Square, Old Foundry, River Forum, Hill Observatory, East Depot |
| Gold Line | West Garden, Clocktower, Glassworks, East Depot, South Arena |
| Violet Line | Canal Court, Old Foundry, Central Spire, Clocktower |

### Interchange Stations

| Station | Lines |
| --- | --- |
| Central Spire | Red, Blue, Violet |
| West Garden | Red, Gold |
| Glassworks | Blue, Gold |
| River Forum | Blue, Green |
| South Arena | Blue, Gold |
| Old Foundry | Green, Violet |
| East Depot | Green, Gold |
| Clocktower | Gold, Violet |

The exam requires at least 3 interchange stations. This design has 8 explicit
interchange stations, which makes route planning more interesting while
remaining easy to explain. Museum Square is a non-interchange Red/Green crossing
used to demonstrate an invalid line change.

## Proposed Events

| Description | Effect |
| --- | ---: |
| Quiet journey | 0 |
| Found a dropped token | +1 |
| Helpful passenger shares a shortcut | +2 |
| Express train arrives early | +3 |
| Station musician inspires the trip | +4 |
| Wrong platform delay | -2 |
| Ticket inspection surcharge | -3 |
| Crowded carriage slows the trip | -1 |
| Missed connection | -4 |

The requirement says at least 8 events with effects from -4 to +4. This design
uses 9 events to avoid a minimum-only seed.

## Route Validation Rule

The route is a sequence of station-to-station steps derived from selected
segments. Validation must answer two questions:

1. Is every step physically connected in the network?
2. Is there at least one assignment of metro lines to those steps such that line
   changes occur only at interchange stations?

Recommended server algorithm:

1. Reject the route if any segment ID is repeated.
2. Convert selected segment IDs into directed route steps.
3. Check the first directed step starts from the assigned start.
4. Check each next step starts where the previous step ended.
5. Check the final step ends at the assigned destination.
6. For each step, load the list of lines serving that segment.
7. Use dynamic validation over possible current lines:
   - first step can use any line serving that segment;
   - next step can keep the same line if it serves the next segment;
   - next step can switch to another serving line only if the shared station is
     an interchange station served by both the previous line and the new line.
8. Accept the route if at least one line assignment reaches the final step.

The validation result must include the resolved line assignment, not only a
boolean. For a valid route, return ordered directed steps with `segmentId`,
`fromStationId`, `toStationId`, and the chosen `lineId` for each step. Scoring
and persistence then consume those resolved steps when inserting `game_steps`
and building the execution response. This is easier to defend than hardcoding
line choices in the client, and it handles segments that may be served by
multiple lines.

## User Stories

- As an anonymous visitor, I can read instructions so I understand the game.
- As an anonymous visitor, I cannot see the private network map or ranking.
- As a registered user, I can log in and keep a session.
- As a registered user, I can inspect the full network before playing.
- As a registered user, I can start a game and receive a random reachable
  start-destination pair.
- As a registered user, I can build a route from a segment list within 90
  seconds.
- As a registered user, I can submit the route or have it submitted
  automatically when time expires.
- As a registered user, I can watch the executed route step by step.
- As a registered user, I can see my final score and start another game.
- As a registered user, I can view the ranking of best results.

## Permissions

| Action | Anonymous | Logged user | Owner |
| --- | ---: | ---: | ---: |
| View instructions | Yes | Yes | Yes |
| View full network | No | Yes | Yes |
| Start game | No | Yes | Yes |
| View own active game | No | No | Yes |
| Submit own route | No | No | Yes |
| View own result | No | No | Yes |
| View ranking | No | Yes | Yes |
| Access another user's game | No | No | No |
