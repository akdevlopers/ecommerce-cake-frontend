const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
/** Formats paise as ₹ (whole rupees unless there are paise). */
export function money(paise) {
  if (paise % 100 === 0) return inr.format(paise / 100);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}
export function discountPercent(price, compare) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}
export function formatDate(value, opts = { day: "numeric", month: "short", year: "numeric" }) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T00:00:00") : new Date(value);
  return d.toLocaleDateString("en-IN", opts);
}
export function formatDateTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
/** Today in India as YYYY-MM-DD (for date input min). */
export function todayIST(offsetDays = 0) {
  return new Date(Date.now() + 5.5 * 3600 * 1000 + offsetDays * 86400 * 1000).toISOString().slice(0, 10);
}
export const STATUS_LABEL = {
  PENDING: "Awaiting payment",
  PAID: "Order confirmed",
  PREPARING: "Being baked",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Payment failed",
};
export const cn = (...c) => c.filter(Boolean).join(" ");
