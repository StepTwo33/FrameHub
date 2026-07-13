"use client";

import { useState } from "react";
import { GameAssetImage } from "@/components/game-asset-image";
import { PolarityIcon } from "@/components/polarity-icon";
import { getModImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type CodexModImageProps = {
  name: string;
  polarity: string;
  /** Width in px. Height follows mod-card aspect unless `square`. */
  size?: number;
  /** Square thumb (builders) vs portrait mod card (codex). */
  variant?: "square" | "card";
  className?: string;
};

const MOD_CARD_ASPECT = 250 / 364;

/** Mod thumbnail with polarity fallback when art is missing or a blank CDN placeholder. */
export function CodexModImage({
  name,
  polarity,
  size = 36,
  variant = "square",
  className,
}: CodexModImageProps) {
  const [failed, setFailed] = useState(false);
  const isCard = variant === "card";
  const width = size;
  const height = isCard ? Math.round(size / MOD_CARD_ASPECT) : size;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded bg-muted/20",
        isCard && "ring-1 ring-border/40",
        className,
      )}
      style={{ width, height: className ? undefined : height }}
    >
      {!failed ? (
        <GameAssetImage
          src={getModImage(name)}
          alt=""
          width={width}
          height={height}
          className={cn(
            "rounded object-contain",
            isCard ? "h-full w-full" : "h-full w-full",
          )}
          hideOnError
          rejectBlank
          onError={() => setFailed(true)}
          onBlank={() => setFailed(true)}
        />
      ) : (
        <PolarityIcon polarity={polarity} size={Math.round(size * 0.65)} />
      )}
    </div>
  );
}
