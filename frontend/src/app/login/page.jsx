'use client'

import React, { useState } from 'react'
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.token) {
        router.push("/");
      } else {
        setError("Ongeldig e-mailadres of wachtwoord");
      }
    } catch (err) {
      setError("Ongeldig e-mailadres of wachtwoord");
    }
  }

  return (
    <div className="login-container">
      {/* Linkerkant */}
      <div className="login-left">
        <div className="left-content">
          <span className="login-subtitle">Log in</span>
          <h1 className="login-hero-title">
            WELCOME<br />
            BACK
          </h1>
          <p className="login-hero-desc">
            Sign back in to your account to access your courses and<br />
            embody the art of being human.
          </p>
        </div>
      </div>

      {/* Rechterkant */}
      <div className="login-right">
        <div className="login-card">
          <div className="card-content">
            <h2 className="card-title">LOG IN</h2>

            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-submit">LOG IN</button>
            </form>
          </div>

          <div className="login-footer">
            <div className="footer-line"></div>
            <div className="footer-content">
              <span>DON'T HAVE AN ACCOUNT?</span>
              <Link href="/register" className="signup-link">SIGN UP </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}