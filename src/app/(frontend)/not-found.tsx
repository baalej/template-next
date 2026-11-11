import type { Metadata } from 'next'
import Link from 'next/link'

// Rendered when a frontend page calls `notFound()`, e.g. for a slug with no
// matching document. URLs that match no route at all get global-not-found.tsx.
export const metadata: Metadata = {
  title: '404',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="placeholder">
      <h1>404</h1>
      <p>
        <Link href="/">←</Link>
      </p>
    </div>
  )
}
