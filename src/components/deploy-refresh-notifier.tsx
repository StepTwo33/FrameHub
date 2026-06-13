"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const BUILD_STORAGE_KEY = "framehub_build_id";

function isStaleClientError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("failed to find server action") ||
    m.includes("chunkloaderror") ||
    m.includes("loading chunk") ||
    m.includes("older or newer deployment")
  );
}

function promptRefresh(reason: string) {
  toast.info(reason, {
    duration: 12000,
    action: {
      label: "Refresh",
      onClick: () => window.location.reload(),
    },
  });
}

export function DeployRefreshNotifier() {
  const warned = useRef(false);

  useEffect(() => {
    const warnOnce = (reason: string) => {
      if (warned.current) return;
      warned.current = true;
      promptRefresh(reason);
    };

    const checkBuild = async () => {
      try {
        const res = await fetch("/api/build-meta", { cache: "no-store" });
        if (!res.ok) return;
        const { buildId } = (await res.json()) as { buildId?: string };
        if (!buildId) return;

        const prev = sessionStorage.getItem(BUILD_STORAGE_KEY);
        if (prev && prev !== buildId) {
          warnOnce("Frame Hub was updated. Refresh for the latest version.");
        }
        sessionStorage.setItem(BUILD_STORAGE_KEY, buildId);
      } catch {
        // ignore network errors during deploy
      }
    };

    checkBuild();
    const interval = setInterval(checkBuild, 3 * 60 * 1000);

    const onError = (event: ErrorEvent) => {
      if (isStaleClientError(event.message || "")) {
        warnOnce("This page is from an older version. Please refresh.");
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const msg =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason ?? "");
      if (isStaleClientError(msg)) {
        warnOnce("This page is from an older version. Please refresh.");
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      clearInterval(interval);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
