'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
 import './login.css'

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, form, {
        withCredentials: true
      });
      router.push("/");
    } catch (err) {
      setError("Ongeldig e-mailadres of wachtwoord");
    }
  }

  return (
    <div className="login-form">
    <div className="login-form-side">
      <div className="login-card">
        <h2 className="login-title">Inloggen</h2>
        <p className="login-desc">Welkom terug! Log in om door te gaan.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="naam@voorbeeld.nl"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Wachtwoord</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          

          <button type="submit" className="btn-submit">Login</button>
        </form>

        <div className="login-footer">
          Nog geen account? <Link href="/register">Registreer hier</Link>
        </div>
      </div>
    </div>
          </div>

  )
}