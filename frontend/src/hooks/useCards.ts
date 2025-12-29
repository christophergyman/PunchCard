import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCards, getCard, createCard, updateCard, deleteCard } from '../api/cards';
import { addPunch } from '../api/punches';
import type { CreatePunchCardRequest, UpdatePunchCardRequest, PunchCard } from '../types';

export function useCards(page = 0, size = 20) {
  return useQuery({
    queryKey: ['cards', page, size],
    queryFn: () => getCards(page, size),
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ['cards', id],
    queryFn: () => getCard(id),
    enabled: !!id,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePunchCardRequest) => createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePunchCardRequest }) =>
      updateCard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cards', id] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function usePunchCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, position }: { cardId: string; position: number }) =>
      addPunch(cardId, { position }),
    // Optimistic update for snappy feel
    onMutate: async ({ cardId }) => {
      await queryClient.cancelQueries({ queryKey: ['cards', cardId] });
      const previous = queryClient.getQueryData<PunchCard>(['cards', cardId]);

      if (previous) {
        queryClient.setQueryData<PunchCard>(['cards', cardId], {
          ...previous,
          currentPunches: previous.currentPunches + 1,
        });
      }

      return { previous };
    },
    onError: (_, { cardId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['cards', cardId], context.previous);
      }
    },
    onSettled: (_, __, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
    },
  });
}
