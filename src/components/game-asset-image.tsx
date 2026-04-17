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
};

/** Local /public item art — next/image for stable layout and efficient caching */
export function GameAssetImage({ src, alt, width, height, className, hideOnError }: GameAssetImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={hideOnError ? hideOnImageError : undefined}
      sizes={`${width}px`}
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
