import { Navigate, useParams } from 'react-router-dom';

export function ExecutionPage() {
  const { gameId } = useParams();
  return <Navigate to={`/game/${gameId}/result`} replace />;
}
