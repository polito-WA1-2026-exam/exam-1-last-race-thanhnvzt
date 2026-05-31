import { useEffect, useState } from 'react';
import { getRanking } from '../../api/rankingApi.js';
import { EmptyState } from '../../components/feedback/EmptyState.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';
import { LoadingPanel } from '../../components/feedback/LoadingPanel.jsx';
import { RankingTable } from '../../components/ranking/RankingTable.jsx';
import { useAuth } from '../../context/useAuth.js';

export function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadRanking() {
      try {
        setLoading(true);
        const data = await getRanking();
        if (!ignore) {
          setRanking(data.ranking);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load ranking.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadRanking();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <LoadingPanel message="Loading ranking..." />;
  }

  return (
    <section className="page-panel ranking-page">
      <p className="eyebrow">Global ranking</p>
      <h1>Best scores</h1>
      <ErrorBanner message={error} />
      {!error && ranking.length === 0 && (
        <EmptyState message="No completed games are available yet." />
      )}
      {!error && ranking.length > 0 && (
        <RankingTable ranking={ranking} currentUserId={user?.id} />
      )}
    </section>
  );
}
