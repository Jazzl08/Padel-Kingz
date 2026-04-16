'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import gsap from 'gsap'
import './dashboard.css'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [matches, setMatches] = useState([])
  const [stats, setStats] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  const pageRef = useRef(null)

  useEffect(() => {
    if (!user) return

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/matches/player/${user.id}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/leaderboard`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([matchData, lbData]) => {
      setMatches(Array.isArray(matchData) ? matchData : [])
      const myStats = Array.isArray(lbData) ? lbData.find(r => r.user_id === user.id) : null
      setStats(myStats)
    }).finally(() => {
      setDataLoading(false)
      // Animaties na laden
      setTimeout(() => {
        if (pageRef.current) {
          gsap.fromTo(pageRef.current, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
          )
          gsap.fromTo('.db-stat-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
          )
          gsap.fromTo('.db-match-card', 
            { opacity: 0, x: -20 }, 
            { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.4 }
          )
        }
      }, 50)
    })
  }, [user])

  const getResultLabel = (match, userId) => {
    if (match.match_status !== 'Completed') return { label: 'Gepland', cls: 'badge-pending' }
    const inA = match.player_1_team_a === userId || match.player_2_team_a === userId
    const won = (inA && match.winner_team === 'A') || (!inA && match.winner_team === 'B')
    return won ? { label: 'Gewonnen', cls: 'badge-win' } : { label: 'Verloren', cls: 'badge-loss' }
  }

  if (loading || dataLoading) return (
    <div className="db-loading">
      <div className="db-loading-inner">
        <div className="db-loading-spinner"></div>
        <span>Laden...</span>
      </div>
    </div>
  )

  return (
    <div className="db-page" ref={pageRef} style={{ opacity: 0 }}>
      {/* HERO */}
      <section className="db-hero">
        <div className="db-hero-left">
          <span className="db-hero-sub">Jouw dashboard</span>
          <h1 className="db-hero-title">
            WELKOM<br />{user?.name?.split(' ')[0].toUpperCase()}
          </h1>
          <p className="db-hero-desc">Bekijk je wedstrijden, resultaten en positie op de ranglijst.</p>
        </div>
        <div className="db-hero-badge">
          <span className="db-level-label">Niveau</span>
          <span className="db-level-value">{user?.skill_level || 'Niet ingesteld'}</span>
        </div>
      </section>

      {/* STATS */}
      <section className="db-stats">
        {[
          { num: stats?.matches_played ?? 0, label: 'Gespeeld' },
          { num: stats?.wins ?? 0, label: 'Gewonnen' },
          { num: stats?.losses ?? 0, label: 'Verloren' },
          { num: stats?.points ?? 0, label: 'Punten', accent: true },
          { num: stats ? `#${stats.rank}` : '—', label: 'Positie' },
        ].map(({ num, label, accent }) => (
          <div key={label} className={`db-stat-card ${accent ? 'db-stat-card--accent' : ''}`}>
            <span className="db-stat-num">{num}</span>
            <span className="db-stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* WEDSTRIJDEN */}
      <section className="db-matches">
        <h2 className="db-section-title">Mijn wedstrijden</h2>

        {matches.length === 0 ? (
          <div className="db-empty">
            <span className="db-empty-icon">🎾</span>
            <p>Nog geen wedstrijden ingepland.</p>
            <p className="db-empty-sub">Zodra de admin een ronde start, verschijnen jouw wedstrijden hier.</p>
          </div>
        ) : (
          <div className="db-matches-list">
            {matches.map((match) => {
              const result = getResultLabel(match, user?.id)
              const inA = match.player_1_team_a === user?.id || match.player_2_team_a === user?.id
              const myTeam = inA
                ? `${match.player1a_name} & ${match.player2a_name}`
                : `${match.player1b_name} & ${match.player2b_name}`
              const oppTeam = inA
                ? `${match.player1b_name} & ${match.player2b_name}`
                : `${match.player1a_name} & ${match.player2a_name}`

              return (
                <div key={match.match_id} className="db-match-card">
                  <div className="db-match-meta">
                    <span className="db-match-round">Ronde {match.round_number}</span>
                    <span className="db-match-court">Baan {match.court_number}</span>
                  </div>
                  <div className="db-match-teams">
                    <div className="db-team db-team--mine">
                      <span className="db-team-label">Jouw team</span>
                      <span className="db-team-names">{myTeam}</span>
                    </div>
                    <span className="db-vs">VS</span>
                    <div className="db-team">
                      <span className="db-team-label">Tegenstander</span>
                      <span className="db-team-names">{oppTeam}</span>
                    </div>
                  </div>
                  {match.match_status === 'Completed' && (
                    <div className="db-match-score">{match.team_a_score} — {match.team_b_score}</div>
                  )}
                  <span className={`db-badge ${result.cls}`}>{result.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
