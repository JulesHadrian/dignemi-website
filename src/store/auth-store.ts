import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        // Guardamos token en localStorage para que axios lo tome (ver módulo 1)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'dignemi-auth-storage', // nombre en localStorage
    }
  )
);