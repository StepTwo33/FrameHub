"use client";

import { useEffect, useRef } from "react";
import type { SavedBuild } from "@/lib/builds/build-storage";
import { getSavedBuilds } from "@/lib/builds/build-storage";

/**
 * Load a locally saved build when the builder is opened via `?localBuild=<id>`
 * (used after Import/Export QR / short-code import).
 */
export function useLocalBuildFromUrl(
  expectedType: SavedBuild["type"],
  apply: (build: SavedBuild) => void,
) {
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("localBuild");
    if (!id || appliedRef.current === id) return;
    appliedRef.current = id;

    const build = getSavedBuilds(expectedType).find((b) => b.id === id);
    if (!build) return;

    apply(build);

    const url = new URL(window.location.href);
    url.searchParams.delete("localBuild");
    const qs = url.searchParams.toString();
    window.history.replaceState({}, "", qs ? `${url.pathname}?${qs}` : url.pathname);
  }, [expectedType, apply]);
}
