import type { Metadata } from 'next'
import Link from 'next/link'

import { site } from '@/lib/site'
import './(frontend)/styles.css'

// 404 for URLs that match no route at all. The app has two root layouts, the
// frontend's and Payload's admin, so there's no single layout a regular
// not-found.tsx could render inside; this file brings its own document instead.
// Needs `experimental.globalNotFound` in next.config.ts.
export const metadata: Metadata = {
  title: `404 | ${site.name}`,
  robots: { index: false },
}

export default function GlobalNotFound() {
  return (
    <html lang={site.lang}>
      <body>
        <main>
          <div className="placeholder">
            <h1>404</h1>
            <p>
              <Link href="/">←</Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
