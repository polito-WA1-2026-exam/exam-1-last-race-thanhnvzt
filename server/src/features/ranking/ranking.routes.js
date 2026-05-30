import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { NotImplementedError } from '../../shared/errors.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Ranking'));
});

export default router;
