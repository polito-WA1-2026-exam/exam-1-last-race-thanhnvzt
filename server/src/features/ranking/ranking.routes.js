import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { getRanking } from './ranking.service.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (err) {
    next(err);
  }
});

export default router;
