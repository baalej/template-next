'use client'

import { useEffect } from 'react'

// Catches errors thrown while rendering a frontend page; the layout (header,
// footer, consent banner) stays up around it. In production the message is
// replaced by a generic one, and `digest` matches the entry in the server logs.
export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  const { error, retry } = props

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="placeholder">
      <h1>500</h1>
      <p>
        <button onClick={() => retry()} type="button">
          ↻
        </button>
      </p>
    </div>
  )
}
