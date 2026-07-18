"use client";

import Image from "next/image";
import { resolveAvatarSrc } from "@/lib/display/avatar-url";

const hideOnImageError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  (e.target as HTMLImageElement).style.display = "none";
};

type GameAssetImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Hide broken thumbnails (missing /public file) */
  hideOnError?: boolean;
  /** Hide solid white CDN placeholders that load successfully but render blank */
  rejectBlank?: boolean;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onBlank?: React.ReactEventHandler<HTMLImageElement>;
};

function isMostlyBlankWhite(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, 8, 8);
    const data = ctx.getImageData(0, 0, 8, 8).data;
    let whitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) whitePixels++;
    }
    return whitePixels >= 60;
  } catch {
    return false;
  }
}

/**
 * Local /public item art (mods, weapons, frames, …).
 * Uses a native img element so missing PNGs skip next/image optimization (which logs "received null" on 404/empty bodies).
 */
export function GameAssetImage({
  src,
  alt,
  width,
  height,
  className,
  hideOnError,
  rejectBlank,
  onError,
  onBlank,
}: GameAssetImageProps) {
  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (hideOnError) hideOnImageError(e);
    onError?.(e);
  };

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (!rejectBlank) return;
    const img = e.target as HTMLImageElement;
    if (!isMostlyBlankWhite(img)) return;
    if (hideOnError) hideOnImageError(e);
    onBlank?.(e);
    onError?.(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={hideOnError || onError ? handleError : undefined}
      onLoad={rejectBlank ? handleLoad : undefined}
      loading="lazy"
      decoding="async"
    />
  );
}

type AvatarImageProps = {
  src: string;
  alt: string;
  size: number;
  className?: string;
};

/** Avatars: OAuth URLs use next/image; same-origin uploads skip the optimizer (API routes + cache-bust query strings break it). */
export function AvatarImage({ src, alt, size, className }: AvatarImageProps) {
  const isRemote = src.startsWith("http://") || src.startsWith("https://");
  const resolvedSrc = isRemote ? src : resolveAvatarSrc(src);

  if (isRemote) {
    return (
      <Image src={resolvedSrc} alt={alt} width={size} height={size} className={className} sizes={`${size}px`} />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

type QrImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

/** Data-URL QR codes — must stay unoptimized */
export function QrCodeImage({ src, alt, width, height, className }: QrImageProps) {
  return <Image src={src} alt={alt} width={width} height={height} className={className} unoptimized />;
}
