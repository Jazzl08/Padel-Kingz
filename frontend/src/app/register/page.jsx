'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './register.css'

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    })

    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
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
                setError("Registratie mislukt, probeer het opnieuw");
            }
        } catch (err) {
            setError("Registratie mislukt, probeer het opnieuw");
        }
    }

    return (
        <div className="register-container">
            {/* Linkerkant */}
            <div className="register-left">
                <div className="left-content">
                    <span className="register-subtitle">Sign up</span>
                    <h1 className="register-hero-title">
                        CREATE<br />
                        ACCOUNT
                    </h1>
                    <p className="register-hero-desc">
                        Maak een account aan om te beginnen met je cursussen en<br />
                        embody the art of being human.
                    </p>
                </div>
            </div>

            {/* Rechterkant */}
            <div className="register-right">
                <div className="register-card">
                    <div className="card-content">
                        <h2 className="card-title">REGISTREREN</h2>

                        <form onSubmit={handleSubmit} className="register-form">
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label className="form-label">Naam</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

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
                                <label className="form-label">Wachtwoord</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-submit1">REGISTREER</button>
                        </form>
                    </div>

                    <div className="register-footer">
                        <div className="footer-line"></div>
                        <div className="footer-content">
                            <span>AL EEN ACCOUNT?</span>
                            <Link href="/login" className="signup-link">LOG IN</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}