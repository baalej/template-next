import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

// Static routes only. When pages come from Payload, query them here, and add
// `await connection()` (from 'next/server') before the query: this file is
// prerendered at build time otherwise, and the Docker build has no database.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/`, changeFrequency: 'weekly', priority: 1 }]
}
