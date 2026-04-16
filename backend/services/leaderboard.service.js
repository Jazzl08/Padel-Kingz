import pool from '../config/db.js';

// Functie om de volledige standenlijst van het toernooi op te halen
export const getLeaderboard = async () => {
  // Haal uit onze dataopslag elke speler uit het "leaderboard" samen met hun naam en vaardigheid
  // Zet ze in volgorde van hun score: 1. meeste punten overall, 2. hoogste winstpercentage bij een gelijkspel (DESC = hoog naar laag)
  const result = await pool.query(
    `SELECT l.*, u.name, u.skill_level
     FROM leaderboard l
     JOIN users u ON l.user_id = u.id
     ORDER BY l.points DESC, l.win_percentage DESC`
  );

  // Loop door alle rijen en bereken handmatig op welke positie/rang ze staan in de tabellen (1e, 2e, 3e, etc)
  return result.rows.map((row, index) => ({
    ...row, // neem alles wat we al hadden (naam, score)
    rank: index + 1, // Voeg daar de rang (positie op de lijst, beginnend bij nummer 1) aan toe
  }));
};