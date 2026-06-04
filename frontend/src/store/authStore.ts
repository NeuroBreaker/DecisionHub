import { create } from 'zustand';

interface AuthState {
  user: { role: 'PARTICIPANT' | 'JURY' | 'ORGANIZER' } | null;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: { role: 'PARTICIPANT' }, // Для теста ставим роль участника
  isAuthenticated: true,         // Ставим true, чтобы пропустить Login
}));
