"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  SavedBuild,
  getSavedBuilds,
  saveBuild,
  deleteBuild,
  generateBuildId,
  getCloudBuilds,
  saveCloudBuild,
  deleteCloudBuild,
} from "./build-storage";

/**
 * Hook that abstracts build storage.
 * When the user is logged in, uses the cloud API.
 * When not logged in, falls back to localStorage.
 */
export function useBuilds(type: SavedBuild["type"]) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (isLoggedIn) {
      const cloud = await getCloudBuilds(type);
      setBuilds(cloud);
    } else {
      setBuilds(getSavedBuilds(type));
    }
    setLoading(false);
  }, [isLoggedIn, type]);

  // Refresh on mount and when login state changes
  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const save = useCallback(
    async (build: SavedBuild): Promise<SavedBuild> => {
      if (isLoggedIn) {
        const saved = await saveCloudBuild(build);
        if (saved) {
          await refresh();
          return saved;
        }
      }
      // Fallback to localStorage
      const localBuild = { ...build, id: build.id || generateBuildId() };
      saveBuild(localBuild);
      await refresh();
      return localBuild;
    },
    [isLoggedIn, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isLoggedIn) {
        await deleteCloudBuild(id);
      } else {
        deleteBuild(id);
      }
      await refresh();
    },
    [isLoggedIn, refresh]
  );

  return { builds, loading, refresh, save, remove, isLoggedIn };
}
