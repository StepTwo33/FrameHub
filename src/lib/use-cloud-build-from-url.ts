"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { SavedBuild } from "@/lib/build-storage";

async function fetchCloudBuild(buildId: string): Promise<SavedBuild | null> {
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

/** Load a cloud build when the builder is opened via `?buildId=` (from `/build/[id]`). */
export function useCloudBuildFromUrl(
  expectedType: SavedBuild["type"],
  onLoad: (build: SavedBuild) => void
) {
  useEffect(() => {
    queueMicrotask(async () => {
      const params = new URLSearchParams(window.location.search);
      const buildId = params.get("buildId");
      if (!buildId) return;

      const build = await fetchCloudBuild(buildId);
      if (!build) {
        toast.error("Could not load build");
        return;
      }
      if (build.type !== expectedType) {
        toast.error("This build belongs in a different builder");
        return;
      }

      onLoad(build);
      window.history.replaceState({}, "", window.location.pathname);
    });
  }, [expectedType, onLoad]);
}
