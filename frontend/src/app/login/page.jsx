'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TransitionLink from '@/components/TransitionLink'
import gsap from 'gsap'
import './login.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
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
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || 'Ongeldig e-mailadres of wachtwoord')
        gsap.fromTo('.aw-glass-card', 
          { x: -8 }, { x: 8, yoyo: true, repeat: 3, duration: 0.1, clearProps: 'x' })
        return
      }

      if (data.token) {
        gsap.to(pageRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          onComplete: () => router.push('/')
        })
      } else {
        setError('Inloggen mislukt, probeer het opnieuw')
      }
    } catch (err) {
      setError('Kan geen verbinding maken met de server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="aw-page login-container" ref={pageRef}>
      <div className="aw-glass-card login-card" ref={contentRef}>
        
        <div className="login-header">
          <span className="login-subtitle">WELKOM TERUG</span>
          <h1 className="login-title">LOG IN</h1>
          <p className="login-desc">
            Krijg toegang tot je speler-dashboard en bekijk je scores live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="form-error">{error}</div>}

          <div className="input-group">
            <label>EMAILADRES</label>
            <input
              type="email" name="email"
              className="input-field"
              value={form.email} onChange={handleChange}
              maxLength="100"
              placeholder="jouw@email.nl" required
            />
          </div>

          <div className="input-group">
             <label>WACHTWOORD</label>
             <input
              type="password" name="password"
              className="input-field password"
              value={form.password} onChange={handleChange}
              maxLength="100"
              placeholder="********" required
             />
          </div>

          <button type="submit" disabled={loading} className="aw-btn submit-btn">
            {loading ? 'LADEN...' : 'INLOGGEN'}
          </button>
        </form>

        <div className="auth-redirect">
          Nog geen account? <TransitionLink href="/register" label="Registreer Hier" className="auth-redirect-link" />
        </div>

      </div>
    </main>
  )
}
