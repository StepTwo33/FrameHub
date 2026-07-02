"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { SavedBuild } from "@/lib/build-storage";

const cloudBuildLoadedIdRef = { current: null as string | null };

export async function fetchCloudBuild(buildId: string): Promise<SavedBuild | null> {
  try {
    const res = await fetch(`/api/builds/${buildId}`);
    if (!res.ok) return null;
    const remote = await res.json();
    return {
      id: remote.id,
      name: remote.name,
      description: remote.description,
      isPublic: remote.isPublic,
      type: remote.type,
      createdAt: remote.createdAt,
      updatedAt: remote.updatedAt,
      data: remote.data,
    };
  } catch {
    return null;
  }
}

export function setCloudBuildInUrl(buildId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("buildId", buildId);
  window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
}

export function clearCloudBuildInUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("buildId");
  const qs = url.searchParams.toString();
  window.history.replaceState({}, "", qs ? `${url.pathname}?${qs}` : url.pathname);
  cloudBuildLoadedIdRef.current = null;
}

/** Call after loading a cloud build in-page so the URL hook does not re-fetch. */
export function markCloudBuildLoaded(buildId: string) {
  cloudBuildLoadedIdRef.current = buildId;
}

/** Load a cloud build when the builder is opened via `?buildId=` (shareable, survives refresh). */
export function useCloudBuildFromUrl(
  expectedType: SavedBuild["type"],
  onLoad: (build: SavedBuild) => void
) {
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const loadedIdRef = cloudBuildLoadedIdRef;

  const syncFromUrl = useCallback(async () => {
    const buildId = new URLSearchParams(window.location.search).get("buildId");
    if (!buildId) {
      loadedIdRef.current = null;
      return;
    }
    if (loadedIdRef.current === buildId) return;

    const build = await fetchCloudBuild(buildId);
    if (!build) {
      toast.error("Could not load build");
      return;
    }
    if (build.type !== expectedType) {
      toast.error("This build belongs in a different builder");
      return;
    }

    loadedIdRef.current = buildId;
    onLoadRef.current(build);
  }, [expectedType]);

  useEffect(() => {
    queueMicrotask(() => { void syncFromUrl(); });
  }, [syncFromUrl]);

  useEffect(() => {
    const onPopState = () => {
      loadedIdRef.current = null;
      void syncFromUrl();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncFromUrl]);
}
