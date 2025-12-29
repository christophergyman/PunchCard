import { create } from 'zustand';

interface CardState {
  selectedCardId: string | null;
  isEditing: boolean;
  setSelectedCard: (id: string | null) => void;
  setIsEditing: (editing: boolean) => void;
}

export const useCardStore = create<CardState>((set) => ({
  selectedCardId: null,
  isEditing: false,
  setSelectedCard: (id) => set({ selectedCardId: id }),
  setIsEditing: (editing) => set({ isEditing: editing }),
}));
