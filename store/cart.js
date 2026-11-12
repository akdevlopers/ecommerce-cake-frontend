"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const MAX_QTY = 10;
export const useCart = create()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      add: (p, { weightId, eggless, message, qty }) =>
        set((s) => {
          const w = p.weights.find((x) => x.id === weightId) || p.weights[0];
          const msg = message.trim();
          const key = `${p.id}-${w.id}-${eggless ? 1 : 0}-${msg}`;
          const existing = s.items.find((i) => i.key === key);
          const unitPrice = w.price + (eggless ? p.egglessExtra : 0);
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty), unitPrice } : i))
            : [
                ...s.items,
                {
                  key,
                  productId: p.id,
                  slug: p.slug,
                  name: p.name,
                  image: p.images[0] || "",
                  weightId: w.id,
                  weightLabel: w.label,
                  eggless,
                  message: msg,
                  qty: Math.min(MAX_QTY, qty),
                  unitPrice,
                },
              ];
          return { items, drawerOpen: true };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    { name: "humuzzdesserts-cart", partialize: (s) => ({ items: s.items }) },
  ),
);
export const cartCount = (items) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items) => items.reduce((n, i) => n + i.qty * i.unitPrice, 0);
