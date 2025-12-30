import { Link } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { useAuthStore } from '../stores/authStore';
import { Layout } from '../components/layout/Layout';
import { CardPreview } from '../components/cards/CardPreview';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { data, isLoading, error } = useCards();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? 'Create and manage punch cards for users'
                : 'View your punch cards and track your progress'}
            </p>
          </div>
          {isAdmin && (
            <Link to="/cards/new">
              <Button>+ New Card</Button>
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Failed to load cards. Please try again.
          </div>
        )}

        {data && data.content.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No cards yet
            </h2>
            <p className="text-gray-600 mb-6">
              {isAdmin
                ? 'Create a punch card for a user to get started!'
                : 'No punch cards have been assigned to you yet.'}
            </p>
            {isAdmin && (
              <Link to="/cards/new">
                <Button>Create Your First Card</Button>
              </Link>
            )}
          </div>
        )}

        {data && data.content.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.content.map((card) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
