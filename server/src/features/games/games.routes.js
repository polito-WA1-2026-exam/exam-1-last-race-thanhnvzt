import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { parseIntegerParam } from '../../middleware/validateRequest.js';
import { NotImplementedError } from '../../shared/errors.js';
import * as gamesService from './games.service.js';

const router = Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const game = await gamesService.createGame(req.user.id);
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
});

router.get('/:gameId/planning', requireAuth, async (req, res, next) => {
  try {
    const gameId = parseIntegerParam(req.params.gameId, 'gameId');
    const planningData = await gamesService.getPlanningData(gameId, req.user.id);
    res.json(planningData);
  } catch (err) {
    next(err);
  }
});

router.post('/:gameId/route', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Route submission'));
});

router.get('/:gameId/result', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Game result'));
});

export default router;
