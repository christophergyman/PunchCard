export type PunchShape = 'CIRCLE' | 'STAR' | 'HEART' | 'CUSTOM';

export interface CardStyle {
  backgroundColor: string;
  textColor: string;
  texture?: string;
  punchShape: PunchShape;
}

export interface Punch {
  id: string;
  cardId: string;
  punchedBy: string;
  position: number;
  punchedAt: string;
}

export interface PunchCard {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  totalSlots: number;
  currentPunches: number;
  reward: string;
  cardStyle: CardStyle;
  punches: Punch[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePunchCardRequest {
  title: string;
  description?: string;
  totalSlots: number;
  reward: string;
  cardStyle?: Partial<CardStyle>;
}

export interface UpdatePunchCardRequest {
  title?: string;
  description?: string;
  reward?: string;
  cardStyle?: Partial<CardStyle>;
}

export interface CreatePunchRequest {
  position: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
