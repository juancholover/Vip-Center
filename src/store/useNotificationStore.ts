import { create } from "zustand";

interface NotificationState {
  message: string | null;
  type: "success" | "error" | "info" | null;
  show: (msg: string, type?: "success" | "error" | "info") => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: null,

  show: (msg, type = "info") => set({ message: msg, type }),
  clear: () => set({ message: null, type: null }),
}));
