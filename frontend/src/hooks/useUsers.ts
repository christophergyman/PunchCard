import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUser, promoteUser } from '../api/users';

export function useUsers(page = 0, size = 100) {
  return useQuery({
    queryKey: ['users', page, size],
    queryFn: () => getUsers(page, size),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function usePromoteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => promoteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
