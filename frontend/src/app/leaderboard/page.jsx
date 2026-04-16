'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import gsap from 'gsap'
import './leaderboard.css'

export default function Leaderboard() {
  const { loading: authLoading } = useAuth()
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const pageRef = useRef(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leaderboard`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .finally(() => {
        setLoading(false)
        setTimeout(() => {
          if (pageRef.current) {
            gsap.fromTo(pageRef.current, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            )
            gsap.fromTo('.lb-podium-card', 
              { opacity: 0, y: 40 }, 
              { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
            )
            gsap.fromTo('tbody tr', 
              { opacity: 0, x: -20 }, 
              { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.4 }
            )
          }
        }, 50)
      })
  }, [])

  const medalColor = (rank) => {
    if (rank === 1) return '#FFD700'
    if (rank === 2) return '#C0C0C0'
    if (rank === 3) return '#CD7F32'
    return '#D1C9BE'
  }

  if (authLoading || loading) return (
    <div className="lb-loading">
      <div className="lb-spinner"></div>
    </div>
  )

  const top3 = data.slice(0, 3)

  return (
    <div className="lb-page" ref={pageRef} style={{ opacity: 0 }}>
      <section className="lb-hero">
        <span className="lb-hero-sub">Overzicht</span>
        <h1 className="lb-hero-title">RANG&shy;LIJST</h1>
        <p className="lb-hero-desc">{data.length} spelers strijden om de top positie.</p>
      </section>

      {top3.length > 0 && (
        <section className="lb-podium-section">
          <div className="lb-podium">
            {top3[1] && (
              <div className="lb-podium-card lb-podium-card--2">
                <span className="lb-podium-medal" style={{ color: medalColor(2) }}>●</span>
                <span className="lb-podium-rank">#2</span>
                <span className="lb-podium-name">{top3[1].name}</span>
                <span className="lb-podium-pts">{top3[1].points} pts</span>
                <span className="lb-podium-level">{top3[1].skill_level}</span>
              </div>
            )}
            {top3[0] && (
              <div className="lb-podium-card lb-podium-card--1">
                <span className="lb-podium-crown"></span>
                <span className="lb-podium-medal" style={{ color: medalColor(1) }}>●</span>
                <span className="lb-podium-rank">#1</span>
                <span className="lb-podium-name">{top3[0].name}</span>
                <span className="lb-podium-pts">{top3[0].points} pts</span>
                <span className="lb-podium-level">{top3[0].skill_level}</span>
              </div>
            )}
            {top3[2] && (
              <div className="lb-podium-card lb-podium-card--3">
                <span className="lb-podium-medal" style={{ color: medalColor(3) }}>●</span>
                <span className="lb-podium-rank">#3</span>
                <span className="lb-podium-name">{top3[2].name}</span>
                <span className="lb-podium-pts">{top3[2].points} pts</span>
                <span className="lb-podium-level">{top3[2].skill_level}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="lb-table-section">
        <h2 className="lb-section-title">Alle spelers</h2>
        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th><th>Speler</th><th>Niveau</th>
                <th>Gespeeld</th><th>Gewonnen</th><th>Verloren</th>
                <th>Win %</th><th>Punten</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.user_id} className={row.rank <= 3 ? 'lb-row--top' : ''}>
                  <td><span className="lb-rank" style={{ color: medalColor(row.rank) }}>{row.rank}</span></td>
                  <td className="lb-player-name">{row.name}</td>
                  <td><span className="lb-level-tag">{row.skill_level}</span></td>
                  <td>{row.matches_played}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                  <td>{row.win_percentage}%</td>
                  <td><strong>{row.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
