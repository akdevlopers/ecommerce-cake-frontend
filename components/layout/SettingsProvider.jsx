"use client";
import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS } from "@/lib/api";
const Ctx = createContext(DEFAULT_SETTINGS);
export function SettingsProvider({ value, children }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useSettings = () => useContext(Ctx);
