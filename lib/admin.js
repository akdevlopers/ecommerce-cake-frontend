"use client";

import { api, ApiError } from "./api";

const TOKEN_KEY = "sweetcrumbs-admin-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** Calls an admin endpoint with the saved token. Sends the user to the login page when the session expires. */
export async function adminApi(path, opts = {}) {
  try {
    return await api(`/admin${path}`, { ...opts, token: getToken() });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && typeof window !== "undefined") {
      setToken(null);
      window.location.href = "/admin/login";
    }
    throw err;
  }
}

/** Rupees (string/number from an input) -> paise */
export const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
/** Paise -> rupees for an input value */
export const toRupees = (paise) => (paise == null ? "" : String(paise / 100));

/** Shrinks an image file in the browser (max 1600px, JPEG) and returns base64 without the data: prefix. */
export async function fileToUploadPayload(file, maxSize = 1600) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("This file is not a valid image"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const jpeg = canvas.toDataURL("image/jpeg", 0.85);
  return { contentType: "image/jpeg", data: jpeg.split(",")[1] };
}

export const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-blue-50 text-blue-700",
  PREPARING: "bg-purple-50 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  FAILED: "bg-red-50 text-red-700",
};
