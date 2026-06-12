import { SESSION_SECRET } from './constants.js';

export const sessionConfig = {
  name:"last-race-session",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
};
