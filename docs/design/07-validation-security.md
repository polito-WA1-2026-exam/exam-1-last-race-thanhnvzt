# Validation and Security

The server is authoritative for security, permissions, route validity, random
events, and score calculation. The client may validate for usability, but every
important rule must be repeated on the server.

## Authentication and Sessions

Required stack:

- `passport`
- `passport-local`
- `express-session`
- salted password hashing, for example `crypto.scrypt`
- `cors` with `credentials: true`

Recommended session API:

- `POST /api/sessions`
- `GET /api/sessions/current`
- `DELETE /api/sessions/current`

Do not return password hashes, salts, or internal session data to the client.

## CORS

Development has two origins:

- React: commonly `http://localhost:5173`
- Express: currently `http://localhost:3001`

Server CORS configuration should allow only the React origin and credentials:

```js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

Fetch calls that need the session should include:

```js
credentials: 'include'
```

## Authorization

| Resource | Rule |
| --- | --- |
| Setup network | logged-in users only |
| Planning game | only the owner user |
| Submit route | only the owner user and only once while game is in planning |
| Game result | only the owner user |
| Ranking | logged-in users only |

Use one `isLoggedIn` middleware for authentication and DAO-level ownership
checks for game-specific resources.

## Input Validation

### Route Parameters

- `gameId` must be an integer.
- Unknown `gameId` returns `404`.
- Existing game owned by another user returns `403`.

### Login Body

- `username` must be a non-empty string.
- `password` must be a non-empty string.
- Invalid credentials return `401` with a generic message.

### Route Submission Body

Validate:

- body has `segmentIds`;
- `segmentIds` is an array;
- every value is an integer;
- no array item is unknown;
- array length is reasonable, for example no more than the number of segments;
- game is still in `planning`;
- route has not already been submitted.

Return `422` for malformed route payloads that cannot be processed. Return
`200` with `validRoute: false` for processable but invalid routes.

## Route Validation Cases

| Case | Expected result |
| --- | --- |
| Empty segment list | invalid, score 0 |
| First segment does not touch start station | invalid, score 0 |
| Consecutive segments are disconnected | invalid, score 0 |
| Route stops before destination | invalid, score 0 |
| Route reaches destination then continues | invalid, score 0 unless explicitly rejected earlier |
| Segment ID does not exist | `422` |
| Line switch at non-interchange station | invalid, score 0 |
| Line switch at valid interchange station | allowed |
| Same physical path with reverse direction | allowed if sequence starts at assigned start |
| Submission at or before server deadline | validate route normally |
| Submission within configured tolerance after server deadline | validate route normally; tolerance only covers transport delay |
| Submission after `planningDeadline + PLANING_TOLERANCE_SECONDS` | expired, score 0 |

## Score Rules

- Initial coins: 20.
- Event effects: integer from -4 to +4.
- Raw final coins can become negative.
- Displayed/stored score: `Math.max(finalCoins, 0)`.
- Invalid or incomplete route: final score 0 and no events.

Only the server calculates score.

## Data Exposure Rules

| Data | Anonymous | Planning client | Execution/result client |
| --- | ---: | ---: | ---: |
| Instructions | Yes | Yes | Yes |
| Full network lines/connections | No | No | Not needed |
| Station names and positions | No | Yes | As part of route result |
| Segment list | No | Yes | Not needed |
| Full event catalog | No | No | No |
| Chosen event per step | No | No | Yes |
| Other users' ranking scores | No | Yes | Yes |
| Password hash/salt | No | No | No |

The ranking is protected because the exam says anonymous users can only view
instructions.

## Error Handling

Backend:

- catch expected DAO errors;
- return JSON errors;
- log server-side diagnostics with route context;
- never expose stack traces in JSON responses.

Frontend:

- show an error banner for API failures;
- show login page after `401`;
- disable submit while a submission is in progress;
- avoid duplicate route submissions;
- render empty ranking gracefully.
