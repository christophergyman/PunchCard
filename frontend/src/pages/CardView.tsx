import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCard, usePunchCard, useDeleteCard } from '../hooks/useCards';
import { Layout } from '../components/layout/Layout';
import { Scene } from '../three/Scene';
import { PunchCard3D } from '../three/PunchCard3D';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

export function CardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading, error } = useCard(id!);
  const punchMutation = usePunchCard();
  const deleteMutation = useDeleteCard();

  const handlePunch = (position: number) => {
    if (card && !card.punches.some((p) => p.position === position)) {
      punchMutation.mutate({ cardId: card.id, position });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await deleteMutation.mutateAsync(id!);
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !card) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Card Not Found</h1>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isComplete = card.currentPunches >= card.totalSlots;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{card.title}</h1>
            {card.description && (
              <p className="text-gray-600 mt-1">{card.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/cards/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Card View */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video">
              <Scene>
                <PunchCard3D
                  card={card}
                  onPunch={handlePunch}
                  disabled={punchMutation.isPending}
                />
              </Scene>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Click and drag to rotate • Click a slot to punch
            </p>
          </div>

          {/* Card Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Punches</span>
                    <span className="font-medium">
                      {card.currentPunches} / {card.totalSlots}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isComplete ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${(card.currentPunches / card.totalSlots) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {isComplete ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <span className="text-2xl">🎉</span>
                    <p className="font-semibold text-green-800 mt-2">
                      Congratulations!
                    </p>
                    <p className="text-green-700 text-sm">
                      You've earned: {card.reward}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800 text-sm">
                      {card.totalSlots - card.currentPunches} more punch
                      {card.totalSlots - card.currentPunches !== 1 ? 'es' : ''}{' '}
                      until you earn:
                    </p>
                    <p className="font-semibold text-blue-900 mt-1">
                      {card.reward}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Punch History
              </h2>
              {card.punches.length === 0 ? (
                <p className="text-gray-500 text-sm">No punches yet</p>
              ) : (
                <ul className="space-y-2">
                  {card.punches
                    .sort((a, b) => b.position - a.position)
                    .slice(0, 5)
                    .map((punch) => (
                      <li
                        key={punch.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          Punch #{punch.position}
                        </span>
                        <span className="text-gray-400">
                          {new Date(punch.punchedAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
