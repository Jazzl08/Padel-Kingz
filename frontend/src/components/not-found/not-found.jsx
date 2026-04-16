'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import './not-found.css'

export default function NotFound() {
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
  }, [])

  return (
    <main className="aw-page not-found-page">
      <div className="aw-glass-card not-found-card" ref={containerRef}>
        <span className="not-found-sub">FOUTCODE 404</span>
        <h1 className="not-found-title">OUT OF BOUNDS!</h1>
        <p className="not-found-text">
          Oeps! Je hebt de bal buiten de baan geslagen. De pagina die je zoekt bestaat niet, of is verplaatst.
        </p>
        <Link href="/" className="aw-btn not-found-btn">
          TERUG NAAR HOMEPAGE
        </Link>
      </div>
    </main>
  )
}
