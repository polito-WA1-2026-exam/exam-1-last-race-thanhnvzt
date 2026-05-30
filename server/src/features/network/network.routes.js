import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as networkService from './network.service.js';

const router = Router();

router.get('/setup', requireAuth, async (req, res, next) => {
  try {
    const network = await networkService.getSetupNetwork();
    res.json(network);
  } catch (err) {
    next(err);
  }
});

export default router;
