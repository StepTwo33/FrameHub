"use client";

import { useEffect } from "react";
import { loadSharedOverrides } from "@/lib/data-overrides-client";

/** Loads shared data overrides once per session so fixes apply site-wide. */
export function OverridesProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void loadSharedOverrides();
  }, []);
  return children;
}
