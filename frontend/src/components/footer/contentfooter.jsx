'use client'

import Link from 'next/link'
import TransitionLink from '../TransitionLink'
import './contentfooter.css'
import React from 'react'

export default function ContentFooter() {
  return (
    <div className='content'>
      <Section1 />
      <Section2 />
    </div>
  )
}

const Section1 = () => {
  return (
    <div className="footer-top">
      <div className="footer-brand">
        <h2>Klaar om te domineren?</h2>
        <p>Padel Kingz is dé plek voor fanatieke spelers. <br/>Klim in the rankings, win the finale en word de koning van the kooi.</p>
      </div>
      <Nav />
    </div>
  )
}

const Section2 = () => {
  return (
    <div className='content__bottom'>
      <h1 className='content__title'>Padel Kingz</h1>
      <div className='footer-legal'>
        <TransitionLink href="/voorwaarden" label="Algemene Voorwaarden" className="footer-link" />
        <TransitionLink href="/privacy" label="Privacybeleid" className="footer-link" />
        <TransitionLink href="/cookies" label="Cookiebeleid" className="footer-link" />
      </div>
      <p>© {new Date().getFullYear()} Padel Kingz. Alle rechten voorbehouden.</p>
    </div>
  )
}

const Nav = () => {
  return (
    <div className='nav'>
      <div className='nav__group'>
        <h3 className='nav__heading'>Ontdek</h3>
        <TransitionLink href="/" label="Home" className="footer-link" />
        <TransitionLink href="/leaderboard" label="Ranglijst" className="footer-link" />
        <TransitionLink href="/schema" label="Wedstrijdschema" className="footer-link" />
        <TransitionLink href="/finale" label="Finale" className="footer-link" />
      </div>
      <div className='nav__group'>
        <h3 className='nav__heading'>Contact</h3>
        <a href="mailto:info@padelkingz.nl" className="footer-link">info@padelkingz.nl</a>
        <a href="tel:+31612345678" className="footer-link">+31 6 12345678</a>
        <p className="footer-text">Padelweg 1, Amsterdam</p>
      </div>
      <div className='nav__group'>
        <h3 className='nav__heading'>Socials</h3>
        <a href="#" className="footer-link" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="#" className="footer-link" target="_blank" rel="noopener noreferrer">TikTok</a>
        <a href="#" className="footer-link" target="_blank" rel="noopener noreferrer">Facebook</a>
      </div>
    </div>
  )
}