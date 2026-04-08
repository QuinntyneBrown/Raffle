export const THEMES = ['cosmic', 'festive', 'corporate'] as const;
export type Theme = (typeof THEMES)[number];

export const ANIMATION_STYLES = ['slot_machine', 'wheel_spin', 'card_flip'] as const;
export type AnimationStyle = (typeof ANIMATION_STYLES)[number];

export interface Raffle {
  id: string;
  name: string;
  heading: string;
  subheading: string | null;
  theme: Theme;
  animationStyle: AnimationStyle;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RaffleWithCounts extends Raffle {
  totalParticipants: number;
  drawnCount: number;
  remainingCount: number;
}

export interface Participant {
  id: string;
  raffleId: string;
  name: string;
  isDrawn: boolean;
  drawnAt: string | null;
  drawOrder: number | null;
  createdAt: string;
}

export interface DrawResult {
  name: string;
  drawOrder: number;
}

export interface ActiveRafflePublic {
  id: string;
  heading: string;
  subheading: string | null;
  theme: Theme;
  animationStyle: AnimationStyle;
  participantNames: string[];
  allDrawn: boolean;
  lastDrawnName: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface CreateRaffleInput {
  name: string;
  heading: string;
  subheading?: string | null;
  theme: Theme;
  animationStyle: AnimationStyle;
  participants: string[];
}

export interface UpdateRaffleInput {
  name?: string;
  heading?: string;
  subheading?: string | null;
  theme?: Theme;
  animationStyle?: AnimationStyle;
  participants?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}
