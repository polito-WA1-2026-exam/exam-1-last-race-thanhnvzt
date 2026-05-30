import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { LoginPage } from '../routes/auth/LoginPage.jsx';
import { SetupPage } from '../routes/game/SetupPage.jsx';
import { PlanningPage } from '../routes/game/PlanningPage.jsx';
import { ExecutionPage } from '../routes/game/ExecutionPage.jsx';
import { ResultPage } from '../routes/game/ResultPage.jsx';
import { InstructionsPage } from '../routes/public/InstructionsPage.jsx';
import { NotFoundPage } from '../routes/public/NotFoundPage.jsx';
import { RankingPage } from '../routes/ranking/RankingPage.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<InstructionsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="setup" element={<SetupPage />} />
          <Route path="game/:gameId/planning" element={<PlanningPage />} />
          <Route path="game/:gameId/execution" element={<ExecutionPage />} />
          <Route path="game/:gameId/result" element={<ResultPage />} />
          <Route path="ranking" element={<RankingPage />} />
        </Route>
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
