import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { NotImplementedError } from '../../shared/errors.js';

const router = Router();

router.post('/', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Game creation'));
});

router.get('/:gameId/planning', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Planning data'));
});

router.post('/:gameId/route', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Route submission'));
});

router.get('/:gameId/result', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Game result'));
});

export default router;
