'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import '../not-found/not-found.css'

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Fout loggen
    console.error('Frontend Applicatie Fout:', error)
  }, [error])

  return (
    <main className="aw-page not-found-page">
      <div className="aw-glass-card not-found-card" style={{ maxWidth: '600px' }}>
        <span className="not-found-sub">SYSTEEMFOUT</span>
        <h1 className="not-found-title" style={{ fontSize: '2.5rem' }}>RACKET GEBROKEN!</h1>
        <p className="not-found-text">
          Er is helaas iets technisch misgegaan tijdens het laden van het toernooi.
          Onze excuses voor het ongemak.
        </p>
        <button
          onClick={() => reset()}
          className="aw-btn not-found-btn"
          style={{ marginRight: '1rem' }}
        >
          OPNIEUW PROBEREN
        </button>
        <Link href="/" className="aw-btn not-found-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
          NAAR HOMEPAGE
        </Link>
      </div>
    </main>
  )
}
