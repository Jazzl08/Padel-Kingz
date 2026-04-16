'use client'
import '../legal.css'

export default function CookiePolicy() {
  return (
    <main className="aw-page legal-page">
      <div className="aw-glass-card legal-card">
        <h1 className="legal-title">Cookiebeleid</h1>
        
        <p className="legal-text">
          <strong>Laatst bijgewerkt op:</strong> 16 April 2026<br />
          Tijdens het gebruik van onze website kunnen we of onze externe partners "cookies" opslaan. Hieronder leggen we uit welke dat zijn.
        </p>

        <h2 className="legal-subtitle">1. Wat zijn Cookies?</h2>
        <p className="legal-text">
          Cookies zijn kleine stukjes data, die door je browser worden onthouden wanneer je een website bezoekt. We gebruiken deze om bijvoorbeeld je login-informatie ("token") te onthouden.
        </p>

        <h2 className="legal-subtitle">2. Jouw toestemming beheren</h2>
        <p className="legal-text">
          Tijdens je eerste bezoek vroegen wij in de balk onderaan of je akkoord was met cookies. 
          Heb je geaccepteerd? Geweldig! Zo niet, dan zul je niet altijd 100% van de beleving op deze site kunnen delen (bijvoorbeeld: advertentievoorkeuren). 
          Jouw keuze is opgeslagen in je browser (via <code>localStorage</code> onder "pk_cookie_consent"). Verwijder de site-data in je brower om dit menu opnieuw in te stellen.
        </p>

        <h2 className="legal-subtitle">3. Strikt Noodzakelijke / Functionele Cookies</h2>
        <ul className="legal-list">
          <li><strong>token:</strong> Een beveiligde "HttpOnly" en "Secure" JWT sessie-sleutel. Zorgt er simpelweg voor dat je ingelogd kunt blijven tussen pagina's, en beveiligt tegen spambots. Voor deze is toestemming wettelijk *niet* vereist, omdat je anders de site simpelweg niet kunt verwerken als ingelogde gebruiker.</li>
        </ul>

        <h2 className="legal-subtitle">4. Analytische / Afhankelijkheid Cookies</h2>
        <p className="legal-text">
          Voor niet-noodzakelijke cookies zoals "Google Analytics", wachten we altijd op je goedkeuring vóór we ze afvuren in de Cookiebanner. Weiger je? Dan laadt het script domweg niet.
        </p>

      </div>
    </main>
  )
}