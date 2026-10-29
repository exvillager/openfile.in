import { create } from "zustand";

interface FileStatusState {
  fileStatusMessages: string;
  updateFileStatus: (message: string) => void;
}

export const useFileStatusStore = create<FileStatusState>((set) => ({
  fileStatusMessages: "Decrypt & Download",
  updateFileStatus: (message) =>
    set((state) => ({
      fileStatusMessages: message,
    })),
}));
