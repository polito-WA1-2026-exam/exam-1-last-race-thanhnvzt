# Testing Plan

This project will mainly be evaluated by navigation, but implementation should
still be verified systematically. This plan gives manual tests and API checks
that map to the [Requirements](./01-requirements.md).

## Startup Checks

Run from a clean clone:

```sh
cd server
npm install
nodemon index.js
```

```sh
cd client
npm install
npm run dev
```

Expected:

- server starts without crash;
- client starts in development mode;
- browser console has no application errors;
- no `node_modules` directories are committed.

## Authentication Tests

| Scenario | Steps | Expected |
| --- | --- | --- |
| Anonymous instructions | Open `/` while logged out | Instructions visible, no network map. |
| Protected setup | Try to open `/setup` while logged out | Redirect to login or controlled access message. |
| Login success | Enter seeded valid credentials | User session starts, navigate to setup. |
| Login failure | Enter wrong password | Controlled error, no crash, no session. |
| Refresh after login | Refresh browser on `/` or use current session check | User is still recognized through cookie. |
| Logout | Click logout | Session removed, protected routes unavailable. |

## Network and Setup Tests

| Scenario | Expected |
| --- | --- |
| Full network loads for logged user | At least 4 lines, 12 stations, 3 interchanges visible or inferable. |
| Anonymous cannot fetch setup network | `GET /api/network/setup` returns `401`. |
| Setup map shows connections | Lines and station connections are visible. |
| Start game | New game created with start/destination at least 3 segments apart. |

## Planning Tests

| Scenario | Expected |
| --- | --- |
| Planning page loads | Station-only map, start/destination, segment list, route builder, timer. |
| Planning map hides connections | No line paths shown during planning. |
| Timer counts down from server deadline | Around 90 seconds at phase start. |
| Manual submit | Calls route submission endpoint once. |
| Timeout submit | Automatically submits current route. |
| Manual submission arrives after deadline | Backend marks the game expired with score 0. |
| Timeout submission arrives after deadline | Backend validates the latest server-saved draft. |
| Duplicate submit click | Second click is disabled or ignored. |

## Route Validation Tests

Create or choose known routes in the seeded network.

| Route type | Expected |
| --- | --- |
| Valid direct multi-step route | `validRoute: true`, events generated, score from coin total. |
| Empty route | `validRoute: false`, score 0. |
| `Noi Bai Airport -> Phu Minh -> West Lake -> Long Bien` | invalid line change at West Lake, score 0. |
| Starts from wrong station | invalid, score 0. |
| Ends before destination | invalid, score 0. |
| Disconnected segment in middle | invalid, score 0. |
| Repeated segment ID | invalid, score 0. |
| Line change at interchange | valid if rest of route is valid. |
| Line change at non-interchange | invalid, score 0. |
| Unknown segment ID | `422` JSON error. |
| Submit another user's game | `403`. |
| Submit already submitted game | `409`. |

## Execution and Result Tests

| Scenario | Expected |
| --- | --- |
| Valid route execution | Steps displayed one at a time, event description/effect shown. |
| Coin updates | Each displayed total equals previous total plus event effect. |
| Negative raw total | Displayed/stored score is 0. |
| Invalid route | Execution skipped, result score 0, reason visible. |
| New game button | Allows another game without page reload. |

## Ranking Tests

| Scenario | Expected |
| --- | --- |
| Ranking as logged user | Ranking table loads. |
| Ranking as anonymous | `401` or redirect to login. |
| Seeded history | At least 2 users appear with previous results. |
| Best score | Multiple games by one user show only that user's best score. |
| Sorting | Higher score appears before lower score. |

## API Manual Checks

Use browser dev tools or a REST client:

- all success responses are JSON;
- all error responses are JSON;
- protected endpoints return `401` without session;
- malformed payloads return `400` or `422`;
- server does not expose stack traces;
- cookies are sent only when `credentials: 'include'` is used.
