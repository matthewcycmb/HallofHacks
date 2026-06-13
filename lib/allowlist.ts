/**
 * Single source of truth for which external hosts may serve media.
 * Used by the sanitize script (drops non-conforming URLs at ingest)
 * and by next.config.ts (CSP img-src / frame-src).
 */
export const ALLOWED_IMAGE_HOSTS = [
  "d112y698adiu2z.cloudfront.net", // Devpost project media CDN
  "devpost.com",
  "*.devpost.com",
  "i.ytimg.com", // YouTube video thumbnails (photographic feed images)
  "lh3.googleusercontent.com", // Google account avatars
  "avatars.githubusercontent.com", // GitHub account avatars
];

export const ALLOWED_VIDEO_EMBED_HOSTS = [
  "www.youtube-nocookie.com",
  "www.youtube.com",
  "player.vimeo.com",
];

export function isAllowedHost(url: string, allowlist: string[]): boolean {
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    host = parsed.hostname;
  } catch {
    return false;
  }
  return allowlist.some((pattern) =>
    pattern.startsWith("*.")
      ? host === pattern.slice(2) || host.endsWith(pattern.slice(1))
      : host === pattern,
  );
}

export function isAllowedImageUrl(url: string): boolean {
  return isAllowedHost(url, ALLOWED_IMAGE_HOSTS);
}

export function isAllowedVideoEmbedUrl(url: string): boolean {
  return isAllowedHost(url, ALLOWED_VIDEO_EMBED_HOSTS);
}

/** Embed URL → the human watch page, for "Watch on YouTube/Vimeo" links. */
export function watchUrlFromEmbed(embedUrl: string): { href: string; label: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(embedUrl);
  } catch {
    return null;
  }
  if (["www.youtube.com", "www.youtube-nocookie.com"].includes(parsed.hostname)) {
    const id = parsed.pathname.match(/^\/embed\/([\w-]+)/)?.[1];
    return id ? { href: `https://www.youtube.com/watch?v=${id}`, label: "YouTube" } : null;
  }
  if (parsed.hostname === "player.vimeo.com") {
    const id = parsed.pathname.match(/^\/video\/(\d+)/)?.[1];
    return id ? { href: `https://vimeo.com/${id}`, label: "Vimeo" } : null;
  }
  return null;
}
