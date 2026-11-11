import type { CollectionConfig, ImageSize } from 'payload'

import { anyone, authenticated } from '@/access'
import { env } from '@/env'
import { revalidateOnChange } from '@/lib/revalidate'

// Width-only sizes: the height follows the original's aspect ratio, so nothing
// is ever cropped. Framing (crop, focal point) is an art-direction choice left
// to each project. These exist to keep pages fast: point `next/image` (or a
// `srcset`) at the closest size's URL instead of at the original, which can be
// a multi-megabyte camera file the optimizer would re-read on every cache miss.
//
// Sizes wider than the original are skipped (Payload returns `null` for them),
// so small images are never upscaled.
const widths = { thumbnail: 400, small: 768, medium: 1280, large: 1920 } as const

const imageSizes: ImageSize[] = Object.entries(widths).map(([name, width]) => ({
  name,
  width,
  formatOptions: { format: 'webp', options: { quality: 80 } },
}))

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: revalidateOnChange('media'),
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    staticDir: env.MEDIA_DIR,
    imageSizes,
    // An explicit list rather than `image/*`, which would let SVG in. An SVG can
    // carry script, and uploads are served from this site's own origin, so
    // opening one directly would run it with access to the admin session. Add
    // SVG back only with sanitising in place.
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'application/pdf',
    ],
  },
}
