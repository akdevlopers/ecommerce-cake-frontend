export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
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
export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    return await api(`/products${qs ? `?${qs}` : ""}`, { revalidate: REVALIDATE });
  } catch (e) {
    console.error("getProducts failed", e);
    return [];
  }
}
export async function getProduct(slug) {
  try {
    return await api(`/products/${encodeURIComponent(slug)}`, { revalidate: REVALIDATE });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
export async function getCategories() {
  try {
    return await api("/categories", { revalidate: REVALIDATE });
  } catch {
    return [];
  }
}
export const DEFAULT_SETTINGS = {
  storeName: "Sweet Crumbs Bakery",
  phone: "",
  email: "",
  address: "",
  whatsapp: "",
  deliveryCharge: 9900,
  freeDeliveryAbove: 99900,
  deliverySlots: ["10 AM – 1 PM", "1 PM – 4 PM", "4 PM – 7 PM", "7 PM – 10 PM"],
  announcement: "",
};
export async function getSettings() {
  try {
    return await api("/settings", { revalidate: REVALIDATE });
  } catch {
    return DEFAULT_SETTINGS;
  }
}
