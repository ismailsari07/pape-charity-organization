import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email?: string | undefined;
  role?: "admin" | "user" | undefined | string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      reset: () => set({ user: null, isAuthenticated: false, isLoading: true }),
    }),
    {
      name: "AuthStore",
    },
  ),
);
