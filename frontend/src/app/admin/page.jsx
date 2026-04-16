'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import gsap from 'gsap'
import './admin.css'

const TABS = ['Spelers', 'Rondes', 'Scores invoeren', 'Wissel Speler']

export default function Admin() {
  // Check voor admin
  const { user, loading: authLoading } = useAuth({ requireAdmin: true })
  const [tab, setTab]         = useState('Spelers')
  const [players, setPlayers] = useState([])
  const [rounds, setRounds]   = useState([])
  const [matches, setMatches] = useState([])
  const [stats, setStats]     = useState(null)
  const [activeRound, setActiveRound] = useState(null)
  const [scoreForm, setScoreForm]     = useState({})
  const [swapForm, setSwapForm]       = useState({ injured: '', reserve: '' })
  const [msg, setMsg]         = useState({ text: '', type: '' })

  const pageRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !user) return

    // Animaties
    const ctx = gsap.context(() => {
      gsap.fromTo('.ad-main > div', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
      )
    }, pageRef)
    
    return () => ctx.revert()
  }, [tab])

  useEffect(() => {
    if (!user) return

    // Haal alles tegelijk op
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/users`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rounds`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/users/stats`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([p, r, s]) => {
      setPlayers(Array.isArray(p) ? p : [])
      setRounds(Array.isArray(r) ? r : [])
      setStats(s)
      setTimeout(() => {
        if (pageRef.current) {
          gsap.fromTo(pageRef.current, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
          )
        }
      }, 50)
    })
  }, [user])

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const playerList = players.filter(p => p.role === 'player')
  const totalPlayers = playerList.length
  const activePlayers = playerList.filter(p => p.is_active).length
  const inactivePlayers = totalPlayers - activePlayers
  const freeSpots = Math.max(0, 50 - totalPlayers)

  const loadMatchesForRound = async (roundId) => {
    setActiveRound(roundId)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/round/${roundId}`, { credentials: 'include' })
    setMatches(await res.json())
  }

  const startRound = async (roundId) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rounds/${roundId}/start`, {
      method: 'POST', credentials: 'include',
    })
    const data = await res.json()
    showMsg(data.message || data.error, res.ok ? 'success' : 'error')
    const rRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rounds`, { credentials: 'include' })
    setRounds(await rRes.json())
  }

  const completeRound = async (roundId) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rounds/${roundId}/complete`, {
      method: 'POST', credentials: 'include',
    })
    const data = await res.json()
    showMsg(data.message || data.error, res.ok ? 'success' : 'error')
    const rRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rounds`, { credentials: 'include' })
    setRounds(await rRes.json())
  }

  const togglePlayer = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/toggle`, {
      method: 'PATCH', credentials: 'include',
    })
    const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { credentials: 'include' })
    setPlayers(await pRes.json())
  }

  const handleSwapPlayer = async () => {
    if (!swapForm.injured || !swapForm.reserve) {
      showMsg('Selecteer zowel een actieve speler (geblesseerd) als een reserve speler.', 'error')
      return
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/swap`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ injuredPlayerId: swapForm.injured, reservePlayerId: swapForm.reserve }),
    })
    const data = await res.json()
    showMsg(res.ok ? 'Speler succesvol gewisseld!' : (data.error || 'Fout bij opslaan.'), res.ok ? 'success' : 'error')
    
    // Spelers lijst vernieuwen
    const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { credentials: 'include' })
    setPlayers(await pRes.json())
    setSwapForm({ injured: '', reserve: '' })
  }

  const submitScore = async (matchId) => {
    const match = matches.find(m => m.match_id === matchId)
    const formVals = scoreForm[matchId] || {}
    // Selecteer logische score
    const a = formVals.a !== undefined ? formVals.a : match.team_a_score
    const b = formVals.b !== undefined ? formVals.b : match.team_b_score

    if (a === undefined || b === undefined || a === '' || b === '') {
      showMsg('Vul beide scores in.', 'error'); return
    }
    if (parseInt(a) === parseInt(b)) {
      showMsg('Scores mogen niet gelijk zijn.', 'error'); return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}/score`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_a_score: parseInt(a), team_b_score: parseInt(b) }),
    })
    const data = await res.json()
    showMsg(res.ok ? 'Score opgeslagen!' : (data.error || 'Fout bij opslaan.'), res.ok ? 'success' : 'error')
    if (activeRound) loadMatchesForRound(activeRound)
  }

  if (authLoading) return <div className="ad-loading"><div className="ad-spinner">Laden...</div></div>

  return (
    <div className="ad-page" ref={pageRef} style={{ opacity: 0 }}>
      <section className="ad-hero gsap-anim-hero">
        <div>
          <span className="ad-hero-sub"></span>
          <br />
          <br />
          <h1 className="ad-hero-title">ADMIN<br />PANEL</h1>
        </div>
        {stats && (
          <div className="ad-hero-stats">
            <div className="ad-hero-stat">
              <span className="ad-hero-stat-num">{totalPlayers}</span>
              <span className="ad-hero-stat-label">Totaal</span>
            </div>
            <div className="ad-hero-stat">
              <span className="ad-hero-stat-num">{activePlayers}</span>
              <span className="ad-hero-stat-label">Actief</span>
            </div>
            <div className="ad-hero-stat">
              <span className="ad-hero-stat-num">{inactivePlayers}</span>
              <span className="ad-hero-stat-label">Deactief</span>
            </div>
            <div className="ad-hero-stat ad-hero-stat--alert">
              <span className="ad-hero-stat-num">{freeSpots}</span>
              <span className="ad-hero-stat-label">Vrij</span>
            </div>
          </div>
        )}
      </section>

      <div className="ad-tabs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`ad-tab ${tab === t ? 'ad-tab--active' : ''}`}>
            {t}
          </button>
        ))}
      </div>

      {msg.text && (
        <div className={`ad-msg ${msg.type === 'error' ? 'ad-msg--error' : ''}`}>
          {msg.text}
        </div>
      )}

      <main className="ad-main">
        {tab === 'Spelers' && (
          <div className="ad-players">
            <h2 className="ad-section-title">Alle ingeschreven spelers</h2>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>#</th><th>Naam</th><th>Email</th>
                    <th>Niveau</th><th>Leeftijd</th><th>Status</th><th>Actie</th>
                  </tr>
                </thead>
                <tbody>
                  {players.filter(p => p.role === 'player').map((p, i) => (
                    <tr key={p.id} className={!p.is_active ? 'ad-row--inactive' : ''}>
                      <td>{i + 1}</td>
                      <td className="ad-player-name">{p.name}</td>
                      <td className="ad-email">{p.email}</td>
                      <td><span className="ad-level-tag">{p.skill_level || '-'}</span></td>
                      <td>{p.age || '-'}</td>
                      <td>
                        <span className={`ad-status-badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>
                          {p.is_active ? 'Actief' : 'Inactief'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => togglePlayer(p.id)} className="ad-toggle-btn">
                          {p.is_active ? 'Deactiveer' : 'Activeer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Rondes' && (
          <div className="ad-rounds">
            <h2 className="ad-section-title">Rondes beheren</h2>
            <div className="ad-rounds-grid">
              {rounds.map((round) => (
                <div key={round.round_id} className="ad-round-card">
                  <div className="ad-round-top">
                    <span className="ad-round-num">Ronde {round.round_number}</span>
                    <span className={`ad-round-status ${
                      round.status.toLowerCase() === 'in progress' ? 'status-active' :
                      round.status.toLowerCase() === 'completed' ? 'status-done' : 'status-pending'
                    }`}>
                      {round.status.toLowerCase() === 'in progress' ? 'Actief' :
                       round.status.toLowerCase() === 'completed' ? 'Klaar' : 'Gepland'}
                    </span>
                  </div>
                  <div className="ad-round-actions">
                    {round.status.toLowerCase() === 'pending' && (
                      <button onClick={() => startRound(round.round_id)} className="ad-btn ad-btn--start">Start ronde</button>
                    )}
                    {round.status.toLowerCase() === 'in progress' && (
                      <button onClick={() => completeRound(round.round_id)} className="ad-btn ad-btn--complete">Ronde afsluiten</button>
                    )}
                    {round.status.toLowerCase() === 'completed' && <span className="ad-done-label">Voltooid</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Scores invoeren' && (
          <div className="ad-scores">
            <h2 className="ad-section-title">Scores invoeren</h2>
            <div className="ad-round-select">
              {rounds.map((r) => (
                <button
                  key={r.round_id}
                  onClick={() => loadMatchesForRound(r.round_id)}
                  className={`ad-round-pill ${activeRound === r.round_id ? 'ad-round-pill--active' : ''}`}
                >
                  Ronde {r.round_number}
                </button>
              ))}
            </div>

            {matches.length === 0 ? (
              <div className="ad-empty">Selecteer een ronde om scores in te voeren.</div>
            ) : (
              <div className="ad-score-list">
                {matches.map((match) => (
                  <div key={match.match_id} className={`ad-score-card ${(match.match_status || '').toLowerCase() === 'completed' ? 'ad-score-card--done' : ''}`}>
                    <div className="ad-score-court">Baan {match.court_number}</div>
                    <div className="ad-score-teams">
                      <div className="ad-score-team">
                        <span className="ad-score-team-tag">Team A</span>
                        <span>{match.player1a_name} & {match.player2a_name}</span>
                      </div>
                      
                      <div className="ad-score-inputs">
                        <input
                          type="number" min="0" max="99" placeholder="A"
                          className="ad-score-input"
                          value={scoreForm[match.match_id]?.a !== undefined ? scoreForm[match.match_id].a : (match.team_a_score !== null ? match.team_a_score : '')}
                          onChange={(e) => setScoreForm(f => ({
                            ...f, [match.match_id]: { ...f[match.match_id], a: e.target.value }
                          }))}
                        />
                        <span className="ad-score-dash">—</span>
                        <input
                          type="number" min="0" max="99" placeholder="B"
                          className="ad-score-input"
                          value={scoreForm[match.match_id]?.b !== undefined ? scoreForm[match.match_id].b : (match.team_b_score !== null ? match.team_b_score : '')}
                          onChange={(e) => setScoreForm(f => ({
                            ...f, [match.match_id]: { ...f[match.match_id], b: e.target.value }
                          }))}
                        />
                        <button onClick={() => submitScore(match.match_id)} className={`ad-save-btn ${(match.match_status || '').toLowerCase() === 'completed' ? 'ad-save-btn--update' : ''}`}>
                          {(match.match_status || '').toLowerCase() === 'completed' ? 'Aanpassen' : 'Opslaan'}
                        </button>
                      </div>

                      <div className="ad-score-team ad-score-team--right">
                        <span className="ad-score-team-tag">Team B</span>
                        <span>{match.player1b_name} & {match.player2b_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'Wissel Speler' && (
          <div className="ad-players">
            <h2 className="ad-section-title">Speler Wisselen</h2>
            <div className="ad-round-card">
               <p className="ad-hero-sub" style={{ textTransform: 'none', marginBottom: '2rem' }}>
                 Vervang een geblesseerde speler met een reserve. Dit vervangt de speler direct in het toernooi.
               </p>
               <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
                  <select 
                    className="ad-score-input"
                    style={{ width: 'auto', padding: '0 1.5rem', flex: '1', fontSize: '1rem', fontWeight: 600 }}
                    value={swapForm.injured} 
                    onChange={e => setSwapForm({...swapForm, injured: e.target.value})}
                  >
                    <option value="">-- Geblesseerde Speler (Uit) --</option>
                    {players.filter(p => p.role === 'player' && p.is_active).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <span className="ad-score-dash">NAAR</span>

                  <select 
                    className="ad-score-input"
                    style={{ width: 'auto', padding: '0 1.5rem', flex: '1', fontSize: '1rem', fontWeight: 600 }}
                    value={swapForm.reserve} 
                    onChange={e => setSwapForm({...swapForm, reserve: e.target.value})}
                  >
                    <option value="">-- Reserve Speler (In) --</option>
                    {players.filter(p => p.role === 'player' && !p.is_active).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
               </div>
               <button onClick={handleSwapPlayer} className="ad-btn ad-btn--start" style={{ width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block' }}>
                 Wissel Speler
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
