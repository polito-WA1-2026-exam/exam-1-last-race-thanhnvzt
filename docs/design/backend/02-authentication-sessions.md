# Authentication and Sessions

Authentication uses Passport.js with session cookies. There is no registration
feature; users are preloaded in SQLite.

## Stored Credentials

`users` stores:

- `username`;
- `name`;
- `password_hash`;
- `salt`.

Use a salted password hash such as `crypto.scrypt`. Never store plain-text
passwords.

## Login Flow

```txt
POST /api/sessions
-> validate username/password body
-> Passport local strategy
-> usersDao.getUserByUsername(username)
-> verify password hash
-> req.login(user)
-> serialize user id into session
-> return safe user JSON
```

Safe user JSON:

```json
{
  "id": 1,
  "username": "user1",
  "name": "Alice"
}
```

The response never includes `password_hash` or `salt`.

## Current Session Flow

```txt
GET /api/sessions/current
-> Passport session middleware reads cookie
-> deserialize user id
-> usersDao.getUserById(id)
-> return safe user JSON
```

If there is no authenticated user, return `401`.

## Logout Flow

```txt
DELETE /api/sessions/current
-> isLoggedIn
-> req.logout
-> destroy session
-> 204 No Content
```

## Protected Middleware

```js
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}
```

Use this middleware on:

- setup network;
- game creation;
- planning data;
- route submission;
- game result;
- ranking.

Game-specific endpoints also need ownership checks after authentication.

## Session Configuration

Development configuration:

```txt
secret: from SESSION_SECRET or a development fallback
resave: false
saveUninitialized: false
cookie.httpOnly: true
cookie.sameSite: "lax"
```

The frontend must send authenticated fetch calls with `credentials: 'include'`.

## No Registration Route

Do not add:

- `/api/users/register`;
- `/register`;
- signup forms.

The exam requires seeded registered users and explicitly says registration is
not requested or evaluated.
