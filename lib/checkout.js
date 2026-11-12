"use client";
import { api } from "./api";
import { payWithRazorpay } from "./razorpay";
const PENDING_KEY = "humuzzdesserts-pending-order";
const LAST_KEY = "humuzzdesserts-last-order";
function save(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function load(key) {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export const getPendingOrder = () => load(PENDING_KEY);
export const getLastOrder = () => load(LAST_KEY);
/**
 * Opens Razorpay for an order and verifies the payment on the server.
 * Returns the paid order, or throws Error("DISMISSED") if the customer closed the window.
 */
export async function completePayment(params, phone) {
  save(PENDING_KEY, { orderNumber: params.orderNumber, phone });
  const signed = await payWithRazorpay(params);
  const order = await api("/payments/verify", { method: "POST", body: JSON.stringify(signed) });
  save(LAST_KEY, order);
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {}
  return order;
}
