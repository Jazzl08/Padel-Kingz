'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './Register.css'

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
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, form, {
                withCredentials: true
            });
            router.push("/");
        } catch (err) {
            setError("Registratie mislukt, probeer het opnieuw");
        }
    }

    return (
        <div className="register-form-side">
            <div className="register-card">
                <h2 className="register-title">Registreren</h2>
                <p className="register-desc">Maak een account aan om te beginnen.</p>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div className='form-row'>
                        <div className="form-group">
                            <label className="form-label">Naam</label>
                            <input
                                type="text"
                                placeholder="Je naam"
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

                    <button type="submit" className="btn-submit">Registreer</button>
                </form>

                <div className="register-footer">
                    Al een account? <Link href="/login">Log hier in</Link>
                </div>
            </div>
        </div>
    )
}