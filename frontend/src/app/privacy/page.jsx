'use client'
import '../../components/not-found/not-found.css'
import '../legal.css'

export default function PrivacyPolicy() {
  return (
    <main className="aw-page legal-page">
      <div className="aw-glass-card legal-card">
        <h1 className="legal-title">Privacy Policy</h1>
        
        <p className="legal-text">
          <strong>Laatst bijgewerkt op:</strong> 16 April 2026<br />
          Bij Padel King ("wij", "ons") hechten we veel waarde aan je privacy. In dit document leggen we uit welke gegevens we verzamelen, waarom we dit doen en hoe we hiermee omgaan.
        </p>

        <h2 className="legal-subtitle">1. Welke gegevens we verzamelen</h2>
        <ul className="legal-list">
          <li><strong>Persoonsgegevens:</strong> Je naam, e-mailadres en leeftijd (bij het aanmaken van een account).</li>
          <li><strong>Sportgegevens:</strong> Je padel-niveau en wedstrijdstatistieken (voor het toernooi).</li>
          <li><strong>Technische data:</strong> Je IP-adres en browserinformatie (noodzakelijk voor beveiliging).</li>
        </ul>

        <h2 className="legal-subtitle">2. Waarom we deze gegevens verzamelen</h2>
        <p className="legal-text">
          Jouw gegevens worden uitsluitend gebruikt om je aan te melden voor het padeltoernooi, je wedstrijdstanden en scores bij te houden in ons leaderboard en je de mogelijkheid te geven veilig in te loggen op je persoonlijke account. We gebruiken je e-mailadres niet voor ongevraagde marketing/spam.
        </p>

        <h2 className="legal-subtitle">3. Hoe lang we ze bewaren</h2>
        <p className="legal-text">
          Gegevens worden bewaard zolang als het account actief is. Zodra we een verzoek tot verwijdering ontvangen of na afloop van het seizoensgebonden toernooi (en bij inactieve accounts ouder dan 2 jaar), anonimiseren we deze informatie permanent uit onze PostgreSQL database.
        </p>

        <h2 className="legal-subtitle">4. Jouw rechten</h2>
        <p className="legal-text">
          Je hebt altijd het recht om je gegevens in te zien, aan te passen of te laten verwijderen (Recht op Vergetelheid - GDPR/AVG). Neem hiervoor contact met ons op via info@padelking.nl.
        </p>

      </div>
    </main>
  )
}