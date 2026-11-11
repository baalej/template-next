'use client'

import { useEffect } from 'react'

import { site } from '@/lib/site'

// Last resort, for errors in a root layout itself. It replaces the whole
// document, so it gets no styles or metadata from the layouts and must render
// its own <html> and <body>. Keep it free of imports that could fail too.
export default function GlobalError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const { error, retry } = props

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang={site.lang}>
      <body style={{ fontFamily: 'system-ui', padding: 24 }}>
        <title>500</title>
        <h1>500</h1>
        <button onClick={() => retry()} type="button">
          ↻
        </button>
      </body>
    </html>
  )
}
