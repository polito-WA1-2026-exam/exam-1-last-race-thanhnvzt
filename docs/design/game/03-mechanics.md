# Mechanics Specifications

Every important mechanic is documented with purpose, player experience, inputs,
outputs, success conditions, failure states, edge cases, tuning levers, and
dependencies.

## Mechanic: Setup Study

**Purpose**: Let the player learn the fixed metro network before the timed
challenge.

**Player Experience Goal**: The player should feel they are preparing for a
memory-and-planning test.

**Input**: Player views the setup screen and clicks "Start game" when ready.

**Output**: The setup phase ends and the server creates a planning game.

**Success Condition**: The player can identify stations, line colors, segment
connections, and interchange stations before starting.

**Failure State**: If the map is unclear, later route failures feel unfair.

**Edge Cases**:

- If the player stays on setup indefinitely, no timer should start.
- If network loading fails, starting a game should be unavailable.
- If start-game request is pending, the button should be disabled.

**Tuning Levers**:

- map size;
- line color contrast;
- station label density;
- interchange marker visibility.

**Dependencies**:

- fixed network data;
- setup network API;
- map rendering component.

## Mechanic: Random Assignment

**Purpose**: Give every game a different planning challenge.

**Player Experience Goal**: The player should feel each attempt asks for a fresh
route, even though the network is fixed.

**Input**: Logged user starts a game.

**Output**: Server assigns start station, destination station, planning
deadline, and initial coins.

**Success Condition**: Destination is reachable and at least 3 stops away.

**Failure State**: If assignments are too short, the challenge is trivial. If
too long or obscure, the challenge may feel unfair.

**Edge Cases**:

- If no eligible station pairs exist, server should fail with a controlled error.
- Start and destination must never be the same station.
- Repeated games may reuse a pair; uniqueness is not required.

**Tuning Levers**:

- minimum stop distance: `[PLACEHOLDER] 3`, required by exam;
- optional maximum stop distance: `[PLACEHOLDER] not set`;
- station-pair selection weighting: `[PLACEHOLDER] uniform random`.

**Dependencies**:

- graph distance computation;
- fixed network;
- game creation service.

## Mechanic: Timed Planning

**Purpose**: Force route commitment under time pressure.

**Player Experience Goal**: The player should feel a controlled rush, not panic
from unclear controls.

**Input**: Player selects ordered segments from the segment list.

**Output**: Client builds a selected route list and submits it manually or at
timeout.

**Success Condition**: The player can select, review, remove, clear, and submit
segments within the 90-second timer.

**Failure State**: If the timer expires, the current route is submitted. If the
route is incomplete or invalid, the game scores 0.

**Edge Cases**:

- Submit and timeout may happen nearly simultaneously; only one submission
  should be sent.
- If route submission fails due to network error, show controlled error.
- If the browser clock differs from the server, countdown display uses
  `serverNow` offset but server deadline remains authoritative.
- If an honest submission arrives just after the server deadline because of
  transport delay, the backend accepts it within the configured tolerance window.

**Tuning Levers**:

- planning duration: `[PLACEHOLDER] 90 seconds`, required by exam;
- low-time warning threshold: `[PLACEHOLDER] 15 seconds`;
- segment list row height and sorting;
- route builder edit controls.

**Dependencies**:

- planning API response;
- countdown component;
- route builder component.

## Mechanic: Route Validity

**Purpose**: Judge whether the planned journey is physically and line-logically
valid.

**Player Experience Goal**: The player should feel rewarded for understanding
connections and interchanges.

**Input**: Ordered `segmentIds` submitted by the client.

**Output**: Server returns either valid execution data or invalid result data.

**Success Condition**: Route starts at assigned start, reaches assigned
destination, uses connected segments, and changes lines only at interchanges.

**Failure State**: Invalid or incomplete route skips execution and scores 0.

**Edge Cases**:

- Empty route.
- First segment does not touch start.
- Segment sequence disconnects in the middle.
- Route reaches destination then continues.
- Line switch at a non-interchange station.
- Segment served by multiple lines.
- Unknown segment id.

**Tuning Levers**:

- strictness of post-destination continuation: `[PLACEHOLDER] invalid`;
- deadline tolerance window: configurable as `PLANING_TOLERANCE_SECONDS`,
  default `2`;
- invalid reason detail level.

**Dependencies**:

- segment data;
- line-segment data;
- interchange detection;
- game ownership and status.

## Mechanic: Journey Events

**Purpose**: Add uncertainty to valid route execution and make shorter routes
valuable.

**Player Experience Goal**: The player should feel suspense as each segment
resolves.

**Input**: Valid route steps.

**Output**: One random event per step and updated coin total after each step.

**Success Condition**: Events are understandable, effects are small, and the
score changes are visible.

**Failure State**: If event variance is too large, planning skill stops mattering.

**Edge Cases**:

- Final coin total can become negative before clamping score to 0.
- Same event may occur multiple times unless explicitly prevented.
- If event catalog is empty, execution cannot proceed.

**Tuning Levers**:

- event effect range: exam requires -4 to +4;
- event probability: `[PLACEHOLDER] uniform random`;
- event count: at least 8;
- whether duplicate events are allowed in one journey: `[PLACEHOLDER] allowed`.

**Dependencies**:

- event catalog;
- scoring service;
- game-step persistence.

## Mechanic: Score and Ranking

**Purpose**: Give each game a clear outcome and a replay target.

**Player Experience Goal**: The player should want to improve their best result.

**Input**: Final game result.

**Output**: Final score and ranking entry.

**Success Condition**: Valid games produce a score based on remaining coins;
invalid games score 0; ranking shows each user's best score.

**Failure State**: If ranking includes confusing duplicate user rows or hidden
score rules, replay motivation weakens.

**Edge Cases**:

- Raw final coins below 0 are displayed/stored as score 0.
- Users with no completed games may be omitted.
- Tied scores sort by a deterministic secondary rule.

**Tuning Levers**:

- starting coins: exam requires 20;
- score clamp: minimum 0;
- tie-break rule: `[PLACEHOLDER] player name ascending`;
- ranking scope: logged users only.

**Dependencies**:

- completed games;
- ranking query;
- result screen.
