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

Interchange status is not stored directly on the station. The backend derives
it from the fixed network: a station is an interchange when it is served by
more than one distinct metro line.

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

1. Noi Bai Airport
2. Phu Minh
3. Co Nhue
4. West Lake
5. Cau Giay
6. Cat Linh
7. Ha Noi Station
8. Long Bien
9. Yen Vien
10. Ngoc Hoi
11. Giap Bat
12. Ha Dong
13. An Khanh
14. Nhon
15. Troi
16. Yen So
17. Co Loa
18. Trau Quy

### Lines

| Line | Stations in order |
| --- | --- |
| Line 1 (Ngoc Hoi - Yen Vien) | Ngoc Hoi, Giap Bat, Ha Noi Station, Long Bien, Yen Vien |
| Line 2 (Ha Dong - Noi Bai) | Ha Dong, Cau Giay, West Lake, Phu Minh, Noi Bai Airport |
| Line 2A (Cat Linh - Ha Dong) | Cat Linh, Cau Giay, Ha Dong |
| Line 3 (Troi - Nhon - Yen So) | Troi, Nhon, Cau Giay, Cat Linh, Ha Noi Station, Yen So |
| Line 5 (Co Loa - An Khanh) | Co Loa, Long Bien, Ha Noi Station, Cau Giay, An Khanh |
| Line 8 (Co Nhue - Trau Quy) | Co Nhue, West Lake, Long Bien, Trau Quy |

### Interchange Stations

| Station | Lines |
| --- | --- |
| Cau Giay | Line 2, Line 2A, Line 3, Line 5 |
| Cat Linh | Line 2A, Line 3 |
| Ha Noi Station | Line 1, Line 3, Line 5 |
| Long Bien | Line 1, Line 5, Line 8 |
| Ha Dong | Line 2, Line 2A |
| West Lake | Line 2, Line 8 |

The exam requires at least 3 interchange stations. This design has 6 derived
interchange stations, which makes route planning more interesting while
remaining easy to explain. Deriving interchanges from line membership keeps the
database aligned with the exam definition of an interchange station.

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
2. Which metro line should be recorded for each valid step?

Recommended server algorithm:

1. Reject the route if any segment ID is repeated.
2. Convert selected segment IDs into directed route steps.
3. Check the first directed step starts from the assigned start.
4. Check each next step starts where the previous step ended.
5. Check the final step ends at the assigned destination.
6. For each step, load the list of lines serving that segment.
7. Resolve one line sequence:
   - first step uses a random line serving that segment;
   - next step keeps the same line if that line also serves the next segment;
   - otherwise the next step switches to a random line serving that segment.

Because interchange stations are derived from distinct line membership, a
connected path that changes lines at a shared station is already changing at an
interchange by definition.

The validation result must include the resolved line assignment, not only a
boolean. For a valid route, return ordered directed steps with `segmentId`,
`fromStationId`, `toStationId`, and the chosen `lineId` for each step. Scoring
and persistence then consume those resolved steps when inserting `game_steps`
and building the execution response. This is easier to defend than hardcoding
line choices in the client.

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
