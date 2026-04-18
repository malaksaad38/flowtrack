import { create } from "zustand";

type AppState = {
  quickInput: string;
  setQuickInput: (value: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  quickInput: "",
  setQuickInput: (value) => set({ quickInput: value }),
}));
