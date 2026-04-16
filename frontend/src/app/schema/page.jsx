'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import gsap from 'gsap'
import './schema.css'

export default function Schema() {
  const { loading: authLoading } = useAuth()
  const [rounds, setRounds]   = useState([])
  const [active, setActive]   = useState(null)
  
  // Sla wedstrijden lokaal op
  const [matchesCache, setMatchesCache] = useState({})
  
  const [matches, setMatches] = useState([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const pageRef = useRef(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rounds`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const rounds = Array.isArray(d) ? d : []
        setRounds(rounds)
        const activeRound = rounds.find((r) => r.status === 'active') || rounds[0]
        if (activeRound) loadMatches(activeRound.round_id)
        else setActive(null)
      })
      .finally(() => {
        setLoading(false)
        setTimeout(() => {
          if (pageRef.current) {
            gsap.fromTo(pageRef.current, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            )
          }
        }, 50)
      })
  }, [])

  const loadMatches = async (roundId) => {
    setActive(roundId)
    
    // Check opgeslagen wedstrijden
    if (matchesCache[roundId]) {
      setMatches(matchesCache[roundId])
      triggerCardAnimation()
      return
    }

    setMatchLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches/round/${roundId}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      const fetchedMatches = Array.isArray(data) ? data : []
      
      setMatchesCache(prev => ({ ...prev, [roundId]: fetchedMatches }))
      setMatches(fetchedMatches)
    } catch (e) {
      console.error(e)
    } finally {
      setMatchLoading(false)
    }
    
    triggerCardAnimation()
  }

  const triggerCardAnimation = () => {
    setTimeout(() => {
      gsap.fromTo('.sc-court-card', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
      )
    }, 50)
  }

  const statusLabel = (s) => {
    if (!s) return { text: 'Gepland', cls: 'status-pending' }
    const status = s.toLowerCase()
    if (status === 'in progress') return { text: 'Actief',  cls: 'status-active' }
    if (status === 'completed')   return { text: 'Klaar',   cls: 'status-done' }
    return                        { text: 'Gepland', cls: 'status-pending' }
  }

  if (authLoading || loading) return (
    <div className="sc-loading"><div className="sc-spinner"></div></div>
  )

  return (
    <div className="sc-page" ref={pageRef} style={{ opacity: 0 }}>
      <section className="sc-hero">
        <span className="sc-hero-sub">Toernooischema</span>
        <h1 className="sc-hero-title">WEDSTRIJD<br />SCHEMA</h1>
        <p className="sc-hero-desc">Selecteer een ronde om alle banen te bekijken.</p>
      </section>

      <main className="sc-main">
        <div className="sc-rounds">
          {rounds.map((round) => {
            const s = statusLabel(round.status)
            return (
              <button
                key={round.round_id}
                onClick={() => {
                  loadMatches(round.round_id)
                  setActive(round.round_id)
                }}
                className={`sc-round-btn ${active === round.round_id ? 'sc-round-btn--active' : ''}`}
              >
                <span>Ronde {round.round_number}</span>
                <span className={`sc-status ${s.cls}`}>{s.text}</span>
              </button>
            )
          })}
        </div>

        {matchLoading ? (
          <div className="sc-match-loading"><div className="sc-spinner"></div></div>
        ) : matches.length === 0 ? (
          <div className="sc-empty">Geen wedstrijden voor deze ronde.</div>
        ) : (
          <div className="sc-courts-grid">
            {matches.map((match) => (
              <div key={match.match_id} className="sc-court-card">
                <div className="sc-court-header">
                  <span className="sc-court-num">Baan {match.court_number}</span>
                  <span className={`sc-match-status ${
                    (match.match_status || '').toLowerCase() === 'completed' ? 'status-done' :
                    (match.match_status || '').toLowerCase() === 'in progress' ? 'status-active' : 'status-pending'
                  }`}>
                    {(match.match_status || '').toLowerCase() === 'completed' ? 'Klaar' :
                     (match.match_status || '').toLowerCase() === 'in progress' ? 'Bezig' : 'Gepland'}
                  </span>
                </div>
                <div className="sc-teams">
                  <div className="sc-team">
                    <span className="sc-team-tag">Team A</span>
                    <span className="sc-player">{match.player1a_name}</span>
                    <span className="sc-player">{match.player2a_name}</span>
                  </div>
                  <div className="sc-score-block">
                    {(match.match_status || '').toLowerCase() === 'completed' ? (
                      <>
                        <span className="sc-score">{match.team_a_score}</span>
                        <span className="sc-score-sep">—</span>
                        <span className="sc-score">{match.team_b_score}</span>
                      </>
                    ) : (
                      <span className="sc-vs">VS</span>
                    )}
                  </div>
                  <div className="sc-team sc-team--right">
                    <span className="sc-team-tag">Team B</span>
                    <span className="sc-player">{match.player1b_name}</span>
                    <span className="sc-player">{match.player2b_name}</span>
                  </div>
                </div>
                {(match.match_status || '').toLowerCase() === 'completed' && (
                  <div className="sc-winner">Team {match.winner_team} wint</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
