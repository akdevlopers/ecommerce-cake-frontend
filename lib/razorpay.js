"use client";
import { SITE } from "./site";
let loader = null;
export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("Could not load the payment window. Check your internet connection."));
    };
    document.body.appendChild(s);
  });
  return loader;
}
/** Opens Razorpay Checkout. Resolves with the signed response, or rejects when the user closes the window. */
export async function payWithRazorpay(params) {
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: params.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: params.amount,
      currency: params.currency,
      order_id: params.razorpayOrderId,
      name: SITE.name,
      description: `Order ${params.orderNumber}`,
      prefill: { name: params.customer.name, email: params.customer.email, contact: params.customer.phone },
      notes: { order_number: params.orderNumber },
      theme: { color: "#E31C79" },
      handler: (res) => resolve(res),
      modal: { ondismiss: () => reject(new Error("DISMISSED")), confirm_close: true },
    });
    rzp.open();
  });
}
