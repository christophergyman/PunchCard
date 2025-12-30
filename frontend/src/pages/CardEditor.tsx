import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCard, useCreateCard, useUpdateCard } from '../hooks/useCards';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../stores/authStore';
import { Layout } from '../components/layout/Layout';
import { CardForm } from '../components/cards/CardForm';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { CreatePunchCardRequest } from '../types';

export function CardEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const { data: card, isLoading } = useCard(id || '');
  const { data: usersData } = useUsers();
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();

  // Redirect non-admin users trying to create or edit cards
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (data: CreatePunchCardRequest) => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: id!,
        data: {
          title: data.title,
          description: data.description,
          reward: data.reward,
          cardStyle: data.cardStyle,
        },
      });
      navigate(`/cards/${id}`);
    } else {
      const newCard = await createMutation.mutateAsync(data);
      navigate(`/cards/${newCard.id}`);
    }
  };

  if (isEditing && isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to={isEditing ? `/cards/${id}` : '/dashboard'}
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← {isEditing ? 'Back to Card' : 'Back to Dashboard'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Card' : 'Create New Card'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? 'Update your punch card details'
              : 'Design your custom punch card'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <CardForm
            initialData={
              card
                ? {
                    title: card.title,
                    description: card.description,
                    totalSlots: card.totalSlots,
                    reward: card.reward,
                    cardStyle: card.cardStyle,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
            submitLabel={isEditing ? 'Save Changes' : 'Create Card'}
            users={usersData?.content}
          />
        </div>
      </div>
    </Layout>
  );
}
