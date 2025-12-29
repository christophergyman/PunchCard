import { apiClient } from './client';
import type { PunchCard, CreatePunchCardRequest, UpdatePunchCardRequest, Page } from '../types';

export const getCards = async (page = 0, size = 20): Promise<Page<PunchCard>> => {
  const response = await apiClient.get<Page<PunchCard>>('/cards', {
    params: { page, size },
  });
  return response.data;
};

export const getCard = async (id: string): Promise<PunchCard> => {
  const response = await apiClient.get<PunchCard>(`/cards/${id}`);
  return response.data;
};

export const createCard = async (data: CreatePunchCardRequest): Promise<PunchCard> => {
  const response = await apiClient.post<PunchCard>('/cards', data);
  return response.data;
};

export const updateCard = async (id: string, data: UpdatePunchCardRequest): Promise<PunchCard> => {
  const response = await apiClient.put<PunchCard>(`/cards/${id}`, data);
  return response.data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await apiClient.delete(`/cards/${id}`);
};
