"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const MAX_QTY = 10;
export const useCart = create()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      add: (p, { variantId, message = "", qty = 1 }) =>
        set((s) => {
          const v = p.variants.find((x) => x.id === variantId) || p.variants[0];
          const msg = message.trim();
          const key = `${p.id}-${v.id}-${msg}`;
          const existing = s.items.find((i) => i.key === key);
          const unitPrice = v.price;
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty), unitPrice } : i))
            : [
                ...s.items,
                {
                  key,
                  productId: p.id,
                  slug: p.slug,
                  name: p.name,
                  image: v.image || p.images[0] || "",
                  variantId: v.id,
                  variantLabel: v.label,
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
    {
      name: "humuzzdesserts-cart",
      version: 1,
      partialize: (s) => ({ items: s.items }),
      // v0 carts stored weightId/weightLabel/eggless. Sizes became variants with the same ids.
      migrate: (state, version) => {
        if (version < 1 && state?.items) {
          state.items = state.items.map(({ weightId, weightLabel, eggless, ...i }) => ({
            ...i,
            variantId: i.variantId ?? weightId,
            variantLabel: i.variantLabel ?? weightLabel ?? "",
          }));
        }
        return state;
      },
    },
  ),
);
export const cartCount = (items) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items) => items.reduce((n, i) => n + i.qty * i.unitPrice, 0);
