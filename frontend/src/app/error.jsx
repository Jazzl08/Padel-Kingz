'use client'

import ErrorBoundary from '../components/error/error'

export default function GlobalError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />
}