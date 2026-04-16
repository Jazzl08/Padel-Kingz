import app from './src/app.js';
import dotenv from 'dotenv';

// Controleer of er beveiligde (niet-zichtbare) wachtwoorden en instellingen uit het '.env' bestand kunnen worden meegetrokken
dotenv.config();

// Gebruik poort 5000 in de browser (uit de geheime map) OF pak poort 5000 standaard er zelf bij
const PORT = process.env.PORT || 5000;

// Hier zeggen we "Klaar voor de start... Af!" en dan begint deze map zich open te stellen voor verkeer uit de browser
app.listen(PORT, () => {
  // Als we succesvol de lucht in zijn geschoten en online zijn, klop dit hard in de logs! (Zodat we meteen weten of we werken)
  console.log(`[Padel King server]: Startklaar! we leven en wachten op het stopcontact via poort: ${PORT}`);
});