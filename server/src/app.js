import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { corsConfig } from './config/corsConfig.js';
import { sessionConfig } from './config/sessionConfig.js';
import './features/auth/passport.js';
import authRoutes from './features/auth/auth.routes.js';
import networkRoutes from './features/network/network.routes.js';
import gamesRoutes from './features/games/games.routes.js';
import rankingRoutes from './features/ranking/ranking.routes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(cors(corsConfig));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/sessions', authRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/ranking', rankingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
