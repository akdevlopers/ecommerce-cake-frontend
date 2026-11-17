"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api, normalizeProduct } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
/**
 * Keeps the saved cart (localStorage) in line with the products in the database. Products the
 * admin deleted or hid are removed from the cart, and prices/photos are refreshed. Runs on page
 * load, on every page change and when the tab gets focus again.
 */
export default function CartSync() {
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!useCart.getState().items.length) return;
      let products;
      try {
        products = (await api("/products")).map(normalizeProduct);
      } catch {
        return; // network / server issue — keep the cart as it is
      }
      if (cancelled || !Array.isArray(products)) return;
      const removed = useCart.getState().sync(products);
      if (removed) {
        useUi
          .getState()
          .toast(
            removed === 1
              ? "An item in your cart is no longer available and was removed"
              : `${removed} items in your cart are no longer available and were removed`,
            "info",
          );
      }
    };
    run();
    const onFocus = () => document.visibilityState === "visible" && run();
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [pathname]);
  return null;
}
