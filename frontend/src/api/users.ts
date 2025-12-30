import { apiClient } from './client';
import type { User, Page } from '../types';

export const getUsers = async (page = 0, size = 100): Promise<Page<User>> => {
  const response = await apiClient.get<Page<User>>('/users', {
    params: { page, size },
  });
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const promoteUser = async (userId: string): Promise<User> => {
  const response = await apiClient.post<User>(`/users/${userId}/promote`);
  return response.data;
};
