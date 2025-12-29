import { apiClient } from './client';
import type { Punch, CreatePunchRequest } from '../types';

export const addPunch = async (cardId: string, data: CreatePunchRequest): Promise<Punch> => {
  const response = await apiClient.post<Punch>(`/cards/${cardId}/punches`, data);
  return response.data;
};

export const getPunches = async (cardId: string): Promise<Punch[]> => {
  const response = await apiClient.get<Punch[]>(`/cards/${cardId}/punches`);
  return response.data;
};
