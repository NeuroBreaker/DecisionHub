// src/store/authStore.ts

import { create } from 'zustand';
import { authApi, setToken } from '@/services/api';
import type { User, RegisterData } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    set({ isAuthenticated: true, user: data.user });
  },

  register: async (registerData) => {
    const data = await authApi.register(registerData);
    setToken(data.access_token);
    set({ isAuthenticated: true, user: data.user });
  },

  logout: () => {
    setToken(null);
    set({ isAuthenticated: false, user: null });
  },
}));
