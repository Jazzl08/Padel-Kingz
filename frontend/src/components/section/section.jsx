'use client'

import React, { useEffect, useRef } from 'react'
import TransitionLink from '../TransitionLink'
import gsap from 'gsap'
import './section.css'
import Lenis from "lenis";

export default function Section() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      gsap.fromTo('.hero-title', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      )
      gsap.fromTo('.hero-desc', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' }
      )
      gsap.fromTo('.hero-actions', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className='hero-section' ref={containerRef}>
      <div className='hero-content'>
        <span className='hero-badge'>HET ULTIEME TOERNOOI</span>
        <h1 className='hero-title'>DE STRIJD OM DE <span className="text-highlight">KROON</span> BEGINT HIER.</h1>
        <p className='hero-desc'>
          Schrijf je in voor het King of the Court Padeltoernooi. Grijp je racket, domineer de baan, speel tactisch en claim de overwinning. Alleen de besten blijven staan.
        </p>
        <div className='hero-actions'>
          <TransitionLink href="/register" label="SCHRIJF JE NU IN" className="aw-btn" />
          <TransitionLink href="/schema" label="BEKIJK SCHEMA" className="hero-btn-outline" />
        </div>
      </div>
      
      {/* Optionele visuele elementen op de achtergrond */}
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>
    </div>
  )
}