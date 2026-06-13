/**
 * The canonical site origin. Prefers an explicit override, else Vercel's
 * production domain (auto-updates when you attach a custom domain), else
 * localhost. Used by metadata, sitemap, and robots so they never disagree.
 */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}
