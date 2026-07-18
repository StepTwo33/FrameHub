import { toast } from "sonner";
import { buildShareUrl, type ShareableBuild } from "@/lib/builds/build-url";
import { copyTextToClipboard } from "@/lib/clipboard";

export type ShareBuildOutcome =
  | { kind: "copied"; url: string }
  | { kind: "need_public_save" }
  | { kind: "copy_failed"; url: string };

/**
 * Shared builder share flow:
 * - public cloud build → `/build/{id}`
 * - not public → nudge save with community listing
 * - else → compact `?build=` URL
 */
export async function shareBuilderBuild(opts: {
  isPublic: boolean;
  buildId: string | null;
  fallback: ShareableBuild;
}): Promise<ShareBuildOutcome> {
  if (opts.isPublic && opts.buildId) {
    const url = `${window.location.origin}/build/${opts.buildId}`;
    const ok = await copyTextToClipboard(url);
    if (ok) {
      toast.success("Share link copied!", { description: "Link copied to clipboard" });
      return { kind: "copied", url };
    }
    toast.error("Could not copy link", { description: url });
    return { kind: "copy_failed", url };
  }

  if (!opts.isPublic) {
    toast.info("Enable community listing to share", {
      description: 'Check "List in Community Builds" when saving, then copy the link.',
    });
    return { kind: "need_public_save" };
  }

  const url = window.location.origin + buildShareUrl(opts.fallback);
  const ok = await copyTextToClipboard(url);
  if (ok) {
    toast.success("Share link copied!", { description: "Link copied to clipboard" });
    return { kind: "copied", url };
  }
  toast.error("Could not copy link", { description: url });
  return { kind: "copy_failed", url };
}
