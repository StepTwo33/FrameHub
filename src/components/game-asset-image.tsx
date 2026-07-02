"use client";

import Image from "next/image";

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
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

/**
 * Local /public item art (mods, weapons, frames, …).
 * Uses a native img element so missing PNGs skip next/image optimization (which logs "received null" on 404/empty bodies).
 */
export function GameAssetImage({ src, alt, width, height, className, hideOnError, onError }: GameAssetImageProps) {
  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (hideOnError) hideOnImageError(e);
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

/** Avatars: same-origin uploads or hosts listed in next.config.ts `images.remotePatterns` */
export function AvatarImage({ src, alt, size, className }: AvatarImageProps) {
  return (
    <Image src={src} alt={alt} width={size} height={size} className={className} sizes={`${size}px`} />
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
