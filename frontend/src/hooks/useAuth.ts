import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, register, getCurrentUser } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../types';

export function useLogin() {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      authStore.login(response.token, response.user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  });
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogout() {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    authStore.logout();
    queryClient.clear();
  };
}
