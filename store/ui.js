"use client";
import { create } from "zustand";
let toastId = 0;
export const useUi = create()((set) => ({
  quickView: null,
  openQuickView: (p) => set({ quickView: p }),
  closeQuickView: () => set({ quickView: null }),
  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),
  toasts: [],
  toast: (message, tone = "success") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
