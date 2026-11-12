"use client";
import { useEffect, useState } from "react";
/** True after the first client render — avoids hydration mismatches with localStorage state. */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
