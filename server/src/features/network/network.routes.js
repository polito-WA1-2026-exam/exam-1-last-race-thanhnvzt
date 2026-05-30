import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { NotImplementedError } from '../../shared/errors.js';

const router = Router();

router.get('/setup', requireAuth, (req, res, next) => {
  next(new NotImplementedError('Setup network'));
});

export default router;
