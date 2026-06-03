# Requirements

Source: [../exam.md](../exam.md).

The application is a single-player web game named "Last Race". A registered
player receives a random starting station and destination station in a fixed
underground network. The player reconstructs a valid route within 90 seconds,
then the server executes the route step by step with random events that modify
the score.

## Actors

| Actor | Capabilities |
| --- | --- |
| Anonymous visitor | Can view the game instructions only. Cannot see the network map, cannot start games, cannot view the ranking. |
| Registered user | Can log in, view the network in setup, play unlimited games, view the result, start another game, and view the global ranking. |

There is no registration workflow. Users are preloaded in the database.

## Functional Requirements

### Public Area

- Show concise game instructions to anonymous visitors.
- Show login controls.
- Do not expose the network map or game APIs to anonymous visitors.

### Authentication

- Support login and logout through Passport.js sessions.
- Use encrypted and salted stored credentials.
- Preserve login state through `/api/sessions/current`.
- Require credentials in fetch calls that depend on the session.

### Network and Events

- Store the underground network on the server.
- Store all events on the server.
- Seed at least 4 metro lines.
- Seed at least 12 stations.
- Seed at least 3 interchange stations served by more than one line.
- Seed at least 8 different events.
- The network does not change during games.

### Game Setup Phase

- The logged-in player sees the full network map.
- The map includes station names, connections, and lines.
- The player explicitly starts the planning phase when ready.

### Game Planning Phase

- The server assigns a random starting station and destination station.
- The destination must be reachable from the starting station.
- The minimum distance between start and destination must be at least 3
  segments.
- The player sees:
  - a map with station names only, without visible line connections;
  - the assigned start and destination;
  - the list of all connected station pairs, called segments.
- The planning timer starts at 90 seconds.
- The player builds a route by selecting segments in sequence.
- The player may submit before the timer expires.
- If the timer expires, the client automatically submits the current route.

### Route Validity

A submitted route is valid only if:

- it starts at the assigned starting station;
- it ends at the assigned destination station;
- every selected step is a real connected pair in the network;
- consecutive steps are contiguous;
- line changes happen only at interchange stations.
- no physical segment is used more than once, even though a station may appear
  more than once in the route.

The server performs the final validation. The client may prevent obvious errors
for usability but must not be trusted.

### Game Execution Phase

- If the route is invalid or incomplete, execution is skipped.
- Invalid or incomplete games end with score 0.
- If the route is valid, the server randomly selects one event for each step.
- Each event has a description and an integer effect between -4 and +4.
- The server applies each effect to the coin total.
- The player sees the journey steps one at a time in sequence, including:
  - from station;
  - to station;
  - selected line;
  - event description;
  - effect;
  - updated coin total.

### Result Phase

- Every game starts with 20 coins.
- The final score is the remaining coin total.
- If the coin total is negative, the stored and displayed score is 0.
- The player can start a new game.
- Registered users can play unlimited games.

### Ranking

- Dedicated ranking page.
- Shows the best successful result for each user who has completed games.
- At least 2 registered users must already have successful game results in the
  seeded database.
- Ranking data is available only to registered users.

## Non-Functional and Quality Requirements

- React 19 SPA using JavaScript and Strict Mode.
- Node 24.x LTS and Express HTTP API.
- SQLite database file.
- Two-server development pattern:
  - Express API server;
  - React development server.
- CORS configured for credentials.
- No normal user operation should reload the page.
- Desktop browser target. Mobile responsiveness is not evaluated.
- No unhandled client console errors or application crashes.
- Server APIs must validate input and protect private data.
- API responses should not expose unnecessary information.
- README must document APIs, tables, routes, components, screenshots, users, and
  AI usage.

## Initial Data Requirements

| Data | Required minimum |
| --- | ---: |
| Lines | 4 |
| Stations | 12 |
| Interchange stations | 3 |
| Events | 8 |
| Registered users | 3 |
| Users with previous successful games | 2 |

## Open Questions from Preliminary Text

The exam text is preliminary. These questions should be left as comments in the
student's tracking notes if the final version does not clarify them:

- Should the ranking be visible to all logged-in users only, or also to
  anonymous visitors? Current design protects it because anonymous visitors can
  only view instructions.
- Should invalid games be stored as attempts with score 0? Current design stores
  every completed game, including invalid attempts, but ranking considers best
  stored score.
- Should the full event list ever be visible before execution? Current design
  keeps it server-side and sends only chosen events during execution to avoid
  unnecessary data exposure.
