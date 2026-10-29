import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
  subscription: {
    planName: string;
  };
}

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-store",
    },
  ),
);
