import { Router } from 'express';
import passport from 'passport';
import { requireAuth } from '../../middleware/requireAuth.js';
import { HttpError } from '../../shared/errors.js';
import { mapSessionUser } from './auth.service.js';

const router = Router();

router.post('/', (req, res, next) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || username.trim() === '') {
    return next(new HttpError(400, 'Username is required'));
  }
  if (typeof password !== 'string' || password === '') {
    return next(new HttpError(400, 'Password is required'));
  }

  return passport.authenticate('local', (err, user) => {
    if (err) return next(err);
    if (!user) return next(new HttpError(401, 'Invalid username or password'));

    return req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.status(201).json(mapSessionUser(user));
    });
  })(req, res, next);
});

router.get('/current', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json(mapSessionUser(req.user));
});

router.delete('/current', requireAuth, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('last-race-session');
      return res.status(204).end();
    });
  });
});

export default router;
