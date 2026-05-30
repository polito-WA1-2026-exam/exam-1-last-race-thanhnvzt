import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { verifyCredentials } from './auth.service.js';
import { getUserById } from './users.dao.js';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const user = await verifyCredentials(username, password);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});
