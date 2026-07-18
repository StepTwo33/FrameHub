/** Runtime avatar files live on disk under public/uploads; serve via API (works across deploys and cache-bust query strings). */
export function resolveAvatarSrc(src: string): string {
  if (!src.startsWith("/uploads/avatars/")) return src;
  const q = src.indexOf("?");
  const path = q === -1 ? src : src.slice(0, q);
  const query = q === -1 ? "" : src.slice(q);
  return `/api${path}${query}`;
}
