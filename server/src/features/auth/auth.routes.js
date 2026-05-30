import { Router } from 'express';
import { NotImplementedError } from '../../shared/errors.js';

const router = Router();

router.post('/', (req, res, next) => {
  next(new NotImplementedError('Login'));
});

router.get('/current', (req, res) => {
  res.status(401).json({ error: 'Not authenticated' });
});

router.delete('/current', (req, res) => {
  req.logout?.(() => {});
  res.status(204).end();
});

export default router;
