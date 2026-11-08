import type { MetadataRoute } from 'next';

// Set to any non-empty value to prevent search engines from indexing the site.
const indexingDisabled = process.env.INDEXING_DISABLED?.trim();

// The value is runtime, so the route must never be prerendered at build time.
export const dynamic = 'force-dynamic';

const robots = (): MetadataRoute.Robots =>
  indexingDisabled
    ? { rules: { userAgent: '*', disallow: '/' } }
    : { rules: { userAgent: '*', allow: '/' } };

export default robots;
