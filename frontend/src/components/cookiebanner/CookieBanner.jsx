'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import './cookiebanner.css'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check of cookie is opgeslagen
    const consent = localStorage.getItem('pk_cookie_consent')
    if (!consent) {
      setShowBanner(true)
      // Wacht even met animatie
      setTimeout(() => {
        gsap.fromTo('.aw-cookie-banner', 
          { y: 100, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        )
      }, 1000)
    } else if (consent === 'accepted') {
      // Optionele tracking laden
      loadTrackingScripts()
    }
  }, [])

  const loadTrackingScripts = () => {
    // Laad analytics script
  }

  const handleAccept = () => {
    localStorage.setItem('pk_cookie_consent', 'accepted')
    closeBanner()
    loadTrackingScripts()
  }

  const handleReject = () => {
    // Alleen basis cookies
    localStorage.setItem('pk_cookie_consent', 'rejected')
    closeBanner()
  }

  const closeBanner = () => {
    gsap.to('.aw-cookie-banner', {
      y: 100, opacity: 0, duration: 0.4, ease: 'power3.in',
      onComplete: () => setShowBanner(false)
    })
  }

  if (!showBanner) return null

  return (
    <div className="aw-cookie-banner">
      <div className="aw-cookie-content">
        <h3 className="aw-cookie-title">Zullen we cookies gebruiken?</h3>
        <p className="aw-cookie-text">
          Wij gebruiken cookies om jouw ervaring te verbeteren, de website te beveiligen en 
          anonieme statistieken te verzamelen. Functionele cookies (voor o.a. inloggen) plaatsen we altijd.
          Lees meer in ons <Link href="/cookies" className="aw-cookie-link">Cookiebeleid</Link>.
        </p>
      </div>
      <div className="aw-cookie-actions">
        <button onClick={handleReject} className="aw-btn aw-btn-outline">
          WEIGEREN
        </button>
        <button onClick={handleAccept} className="aw-btn aw-cookie-accept">
          AKKOORD
        </button>
      </div>
    </div>
  )
}
