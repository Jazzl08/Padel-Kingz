// Haal de tool op om met de database te praten
import {Pool} from 'pg';
// Zorg dat we verborgen instellingen kunnen lezen (zoals het wachtwoord)
import dotenv from 'dotenv';

dotenv.config();

// Maak een verbinding met de database aan via de link uit het .env bestand
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Als we de neon.tech of online productie database gebruiken, moet ssl aan staan
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') 
        ? { rejectUnauthorized: false } 
        : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
});

// Zeg even in de console als het is gelukt om te verbinden
pool.on('connect', () => {
    console.log('Connected to the database');
});

// Geef een foutmelding als de database niet werkt
pool.on('error', (err) => {
    console.error('Database Error', err);
});

// Zorg dat andere bestanden deze database verbinding kunnen gebruiken
export default pool;