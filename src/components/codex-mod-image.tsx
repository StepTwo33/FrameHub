"use client";

import { useState } from "react";
import { GameAssetImage } from "@/components/game-asset-image";
import { PolarityIcon } from "@/components/polarity-icon";
import { getModImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type CodexModImageProps = {
  name: string;
  polarity: string;
  size?: number;
  className?: string;
};

/** Mod thumbnail with polarity fallback when art is missing or a blank CDN placeholder. */
export function CodexModImage({ name, polarity, size = 36, className }: CodexModImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded bg-muted/20",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {!failed ? (
        <GameAssetImage
          src={getModImage(name)}
          alt=""
          width={size}
          height={size}
          className="h-full w-full rounded object-contain"
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
