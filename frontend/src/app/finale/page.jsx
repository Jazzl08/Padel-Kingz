'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '../lib/useAuth'
import gsap from 'gsap'
import './finale.css'

export default function Finale() {
  const { loading: authLoading } = useAuth()
  const [finalists, setFinalists] = useState([])
  const [players, setPlayers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const pageRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rounds/finalists`, {
          credentials: 'include',
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || data.message || 'Finale nog niet beschikbaar.')
          return
        }

        setFinalists(data.finalists)

        // Haal data tegelijk op
        const playerData = await Promise.all(
          data.finalists.map((id) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/users/${id}`, { credentials: 'include' })
              .then((r) => r.json())
          )
        )
        setPlayers(playerData)
      } catch {
        setError('Kon finale niet laden. Probeer het later opnieuw.')
      } finally {
        setLoading(false)
        setTimeout(() => {
          if (pageRef.current) {
            gsap.fromTo(pageRef.current, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            )
            gsap.fromTo('.fin-player-card', 
              { opacity: 0, scale: 0.95 }, 
              { opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.3 }
            )
            gsap.fromTo('.fin-court-card', 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.5 }
            )
          }
        }, 50)
      }
    }
    load()
  }, [])

  if (authLoading || loading) return (
    <div className="fin-loading"><div className="fin-spinner"></div></div>
  )

  return (
    <div className="fin-page" ref={pageRef} style={{ opacity: 0 }}>
      <section className="fin-hero">
        <div className="fin-hero-content">
          <span className="fin-hero-sub">Het moment is aangebroken</span>
          <h1 className="fin-hero-title">DE<br />FINALE</h1>
          <p className="fin-hero-desc">
            De beste spelers van baan 1 strijden om de titel King of the Court.
          </p>
        </div>
        <div className="fin-trophy"></div>
      </section>

      <main className="fin-main">
        {error ? (
          <div className="fin-error">
            <span className="fin-error-icon"></span>
            <h2 className="fin-error-title">Finale nog niet beschikbaar</h2>
            <p className="fin-error-desc">Alle rondes moeten voltooid zijn voor de finale bepaald kan worden.</p>
            <div className="fin-nav-links" style={{ justifyContent: 'center' }}>
              <Link href="/schema" className="fin-link-btn">Bekijk schema</Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="fin-section-title">FINALISTEN</h2>
            <p className="fin-section-sub">De 4 spelers die op baan 1 eindigden</p>

            <div className="fin-bracket">
              <div className="fin-team-block">
                <div className="fin-team-label">TEAM A</div>
                {players.slice(0, 2).map((p) => (
                  <div key={p.id} className="fin-player-card">
                    <div className="fin-player-avatar">{p.name?.charAt(0).toUpperCase()}</div>
                    <div className="fin-player-info">
                      <span className="fin-player-name">{p.name}</span>
                      <span className="fin-player-level">{p.skill_level}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="fin-vs-block">
                <div className="fin-vs-inner">
                  <span className="fin-vs-text">VS</span>
                  <span className="fin-vs-sub">Finale</span>
                </div>
              </div>

              <div className="fin-team-block">
                <div className="fin-team-label">TEAM B</div>
                {players.slice(2, 4).map((p) => (
                  <div key={p.id} className="fin-player-card fin-player-card--right">
                    <div className="fin-player-info fin-player-info--right">
                      <span className="fin-player-name">{p.name}</span>
                      <span className="fin-player-level">{p.skill_level}</span>
                    </div>
                    <div className="fin-player-avatar fin-player-avatar--orange">
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fin-court-info">
              <div className="fin-court-card">
                <span className="fin-court-label">Locatie</span>
                <span className="fin-court-value">Baan 1</span>
                <span className="fin-court-sub">Padel Center - Court 1</span>
              </div>
              <div className="fin-court-card fin-court-card--accent">
                <span className="fin-court-label">Formaat</span>
                <span className="fin-court-value">Best of 3</span>
                <span className="fin-court-sub">20 minuten per set</span>
              </div>
              <div className="fin-court-card">
                <span className="fin-court-label">Winnaar</span>
                <span className="fin-court-value">Winnaar</span>
                <span className="fin-court-sub">King of the Court</span>
              </div>
            </div>

            <div className="fin-nav-links">
              <Link href="/schema" className="fin-link-btn">Bekijk schema</Link>
              <Link href="/leaderboard" className="fin-link-btn fin-link-btn--outline">Ranglijst</Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
