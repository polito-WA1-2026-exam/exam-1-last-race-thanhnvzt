import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { parseIntegerParam } from '../../middleware/validateRequest.js';
import { HttpError } from '../../shared/errors.js';
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

function parseSegmentIds(body) {
  if (!Array.isArray(body?.segmentIds)) {
    throw new HttpError(422, 'segmentIds must be an array');
  }

  if (!body.segmentIds.every((segmentId) => Number.isInteger(segmentId))) {
    throw new HttpError(422, 'segmentIds must contain only integers');
  }

  return body.segmentIds;
}

router.post('/:gameId/route', requireAuth, async (req, res, next) => {
  try {
    const gameId = parseIntegerParam(req.params.gameId, 'gameId');
    const segmentIds = parseSegmentIds(req.body);
    const result = await gamesService.submitRoute(gameId, req.user.id, segmentIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:gameId/result', requireAuth, async (req, res, next) => {
  try {
    const gameId = parseIntegerParam(req.params.gameId, 'gameId');
    const result = await gamesService.getGameResult(gameId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
