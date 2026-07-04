export const AVATAR_CROP_VIEWPORT = 280;
export const AVATAR_OUTPUT_SIZE = 256;

export type AvatarCropTransform = {
  /** Multiplier on top of min cover scale (1 = fit, higher = zoom in). */
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export function minCoverScale(
  imageWidth: number,
  imageHeight: number,
  viewport = AVATAR_CROP_VIEWPORT,
): number {
  return Math.max(viewport / imageWidth, viewport / imageHeight);
}

export function clampCropOffset(
  offsetX: number,
  offsetY: number,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  viewport = AVATAR_CROP_VIEWPORT,
): { offsetX: number; offsetY: number } {
  const displayW = imageWidth * scale;
  const displayH = imageHeight * scale;
  const maxX = Math.max(0, (displayW - viewport) / 2);
  const maxY = Math.max(0, (displayH - viewport) / 2);
  return {
    offsetX: Math.min(maxX, Math.max(-maxX, offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, offsetY)),
  };
}

export function cropTransformToSourceRect(
  transform: AvatarCropTransform,
  imageWidth: number,
  imageHeight: number,
  viewport = AVATAR_CROP_VIEWPORT,
): { x: number; y: number; size: number } {
  const scale = minCoverScale(imageWidth, imageHeight, viewport) * transform.zoom;
  const size = viewport / scale;
  const centerX = imageWidth / 2 - transform.offsetX / scale;
  const centerY = imageHeight / 2 - transform.offsetY / scale;
  return {
    x: centerX - size / 2,
    y: centerY - size / 2,
    size,
  };
}

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/** Render a square cropped avatar as JPEG. */
export async function renderCroppedAvatarBlob(
  image: HTMLImageElement,
  transform: AvatarCropTransform,
  outputSize = AVATAR_OUTPUT_SIZE,
): Promise<Blob> {
  const { x, y, size } = cropTransformToSourceRect(
    transform,
    image.naturalWidth,
    image.naturalHeight,
  );

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(image, x, y, size, size, 0, 0, outputSize, outputSize);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      0.92,
    );
  });
}
