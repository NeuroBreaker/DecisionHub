import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (email, password) => {
    // Вызов вашего Python бэкенда
    const response = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      set({ isAuthenticated: true, user: data.user });
    } else {
      throw new Error("Неверный логин или пароль");
    }
  },

  logout: () => set({ isAuthenticated: false, user: null }),
}));
