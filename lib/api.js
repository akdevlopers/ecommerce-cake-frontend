import { BUSINESS } from "./site";
export const API_URL =(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
export class ApiError extends Error {
  status;
  code;
  details;
  constructor(status, body) {
    super(body.message || "Something went wrong");
    this.status = status;
    this.code = body.code || "UNKNOWN";
    this.details = body.details;
  }
}
export async function api(path, opts = {}) {
  const { token, revalidate, headers, ...rest } = opts;
  const init = {
    ...rest,
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  if (revalidate !== undefined) init.next = { revalidate };
  else if (!rest.method || rest.method === "GET") init.cache = "no-store";
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, { code: "NETWORK", message: "Cannot reach the server. Please check your connection." });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || {});
  return data;
}
// ---- server-side helpers for storefront pages (cached for 60s, never throw) ----
const REVALIDATE = 60;
/**
 * Makes sure a product always has options/variants. Older API responses (still in the
 * page cache after an update) only had "weights"; those become a single Size option.
 */
export function normalizeProduct(p) {
  if (!p) return p;
  if (Array.isArray(p.variants)) return { ...p, options: p.options || [] };
  const weights = p.weights || [];
  const hasSizes = weights.some((w) => w.label);
  return {
    ...p,
    options: hasSizes ? [{ name: "Size", values: weights.map((w) => w.label), colors: {} }] : [],
    variants: weights.map((w) => ({
      id: w.id,
      label: w.label,
      options: hasSizes ? { Size: w.label } : {},
      price: w.price,
      comparePrice: w.comparePrice ?? null,
      image: null,
      inStock: true,
    })),
  };
}
export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    const list = await api(`/products${qs ? `?${qs}` : ""}`, { revalidate: REVALIDATE });
    return list.map(normalizeProduct);
  } catch (e) {
    console.error("getProducts failed", e);
    return [];
  }
}
export async function getProduct(slug) {
  try {
    const data = await api(`/products/${encodeURIComponent(slug)}`, { revalidate: REVALIDATE });
    return { product: normalizeProduct(data.product), related: (data.related || []).map(normalizeProduct) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
/** Highlights the admin chose to show as home page tabs. */
export async function getHomeTabs() {
  try {
    return await api("/highlights", { revalidate: REVALIDATE });
  } catch {
    return [];
  }
}
export const DEFAULT_SETTINGS = {
  storeName: "Humuzz Desserts",
  tagline: "Bakery & Cake Studio",
  logoUrl: null,
  phone: BUSINESS.phone,
  email: BUSINESS.email,
  address: BUSINESS.address,
  whatsapp: "",
  deliveryCharge: 9900,
  freeDeliveryAbove: 99900,
  deliverySlots: ["10 AM – 1 PM", "1 PM – 4 PM", "4 PM – 7 PM", "7 PM – 10 PM"],
  announcement: "",
};
export async function getSettings() {
  try {
    const s = await api("/settings", { revalidate: REVALIDATE });
    // Never show blank contact details — fall back to the registered business details.
    return {
      ...s,
      phone: s.phone || BUSINESS.phone,
      email: s.email || BUSINESS.email,
      address: s.address || BUSINESS.address,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
