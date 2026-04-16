'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TransitionLink from '@/components/TransitionLink'
import gsap from 'gsap'
import './register.css'

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional']

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', skill_level: '', botField: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const pageRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(pageRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' })

      const elements = Array.from(contentRef.current.children)
      gsap.fromTo(elements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out', delay: 0.2 }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Blokkeer spambots
    if (form.botField) {
      setError('Anti-spam check gefaald. Ververs de pagina en probeer het opnieuw.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          ...(form.age && { age: parseInt(form.age) }),
          ...(form.skill_level && { skill_level: form.skill_level }),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registratie mislukt, probeer het opnieuw')
        gsap.fromTo('.aw-glass-card', { x: -8 }, { x: 8, yoyo: true, repeat: 3, duration: 0.1, clearProps: 'x' })
        return
      }

      if (data.token) {
        gsap.to(pageRef.current, {
          opacity: 0, y: -20, duration: 0.4,
          onComplete: () => router.push('/')
        })
      } else {
        setError('Registratie mislukt, probeer het opnieuw')
      }
    } catch (err) {
      setError('Kan geen verbinding maken met de server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="aw-page register-container" ref={pageRef}>
      <div className="aw-glass-card register-card" ref={contentRef}>
        
        <div className="register-header">
          <span className="register-subtitle">NIEUWE SPELER</span>
          <h1 className="register-title">REGISTREREN</h1>
          <p className="register-desc">
            Schrijf je in voor het King of the Court toernooi en claim je plek!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="form-error">{error}</div>}

          <div className="input-group">
            <label>VOLLEDIGE NAAM</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              minLength="2" maxLength="50"
              pattern="^[a-zA-ZÀ-ÿ\s\-']+$"
              title="Alleen letters, spaties, koppeltekens en apostrofs"
              placeholder="John Doe"
              className="input-field"
            />
          </div>
          {/* Verborgen honingpot-veld voor bot spam-bots */}
          <div style={{ display: 'none' }}>
            <label>Laat dit veld leeg als je een mens bent</label>
            <input type="text" name="botField" tabIndex="-1" autoComplete="off" value={form.botField} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>EMAILADRES</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              maxLength="100"
              placeholder="jouw@email.nl"
              className="input-field"
            />
          </div>

          <div className="input-group">
             <label>WACHTWOORD</label>
             <input type="password" name="password" value={form.password} onChange={handleChange} required
              minLength="8" maxLength="100"
              placeholder="********"
              title="Minimaal 8 tekens, 1 hoofdletter, 1 kleine letter, 1 cijfer en 1 speciaal teken"
              className="input-field"
              style={{ letterSpacing: '0.1em' }}
             />
          </div>

          <div className="row-group">
            <div className="input-group col-1">
              <label>LEEFTIJD</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} min="10" max="100"
                placeholder="25"
                className="input-field"
              />
            </div>

            <div className="input-group col-2">
              <label>NIVEAU</label>
              <select name="skill_level" value={form.skill_level} onChange={handleChange}
                className="input-field select-field"
              >
                <option value="">Kies niveau</option>
                {(typeof SKILL_LEVELS !== 'undefined' ? SKILL_LEVELS : []).map((level) => (<option key={level} value={level}>{level}</option>))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="aw-btn" style={{ marginTop: '1.5rem' }}>
            {loading ? 'LADEN...' : 'REGISTREREN'}
          </button>
        </form>

        <div className="auth-redirect">
          Al een account? <TransitionLink href="/login" label="Log In" className="auth-redirect-link" />
        </div>

      </div>
    </main>
  )
}
