import { create } from "zustand";

interface progressStore {
  progress: number;
  setProgress: (progress: number) => void;
  resetProgress: () => void;
}

export const useUploadProgressStore = create<progressStore>((set) => ({
  progress: 0,
  setProgress: (progress: number) => set({ progress }),
  resetProgress: () => set({ progress: 0 }),
}));
