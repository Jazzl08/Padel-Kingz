import pool from '../config/db.js';
import { generateRoundMatches, advanceKingOfTheCourt } from './tournament.service.js';
import { createError } from '../middleware/errorHandler.js';

// Functie om de basisinformatie van alle rondes (Ronde 1, Ronde 2, etc) op te vragen
export const getAllRounds = async () => {
  // Haal ze uit de database en sorteer ze netjes van laag naar hoog 
  const result = await pool.query('SELECT * FROM rounds ORDER BY round_number ASC');
  return result.rows;
};

// Functie om informatie op te vragen over één specifieke ronde (via ronde ID)
export const getRoundById = async (id) => {
  const result = await pool.query('SELECT * FROM rounds WHERE round_id = $1', [id]);
  if (!result.rows[0]) throw createError(404, 'Ronde niet gevonden.');
  return result.rows[0];
};

// Functie voor de Toernooileider (admin) om een speelronde echt te laten beginnen
export const startRound = async (roundId) => {
  const round = await getRoundById(roundId);
  
  // Als het groter dan ronde 1 is (bijv ronde 2, 3, 4 etc.), hoeven we geen willekeurige begin-mix meer te maken.
  if (round.round_number !== 1) {
    // Zet in de database dat de ronde nu officieel is begonnen
    await pool.query(
      `UPDATE rounds SET status = 'In Progress', start_time = NOW() WHERE round_id = $1`,
      [roundId]
    );
    return { message: 'Ronde ' + round.round_number + ' is gestart (King of the Court)!' };
  }

  // Omdat het hier Ronde 1 is, zoeken we maximaal 48 actieve spelers in willekeurige volgorde bij elkaar.
  const playersResult = await pool.query(
    `SELECT id, name, skill_level, age, gender FROM users
     WHERE role = 'player' AND is_active = TRUE ORDER BY RANDOM() LIMIT 48`
  );
  const players = playersResult.rows;
  
  // Extra check: 4 spelers is echt het absolute minimum om 1 padel potje te kunnen starten
  if (players.length < 4) throw createError(400, 'Niet genoeg spelers om te starten.');

  // Laat het "tournament service" script de allereerste willekeurige partijtjes berekenen en inplannen 
  const matches = await generateRoundMatches(roundId, players);

  // Zet in de database dat ronde 1 gestart is, en de tijd hiervan
  await pool.query(
    `UPDATE rounds SET status = 'In Progress', start_time = NOW() WHERE round_id = $1`,
    [roundId]
  );

  return { message: 'Ronde 1 gestart! Groepen zijn ingedeeld.', matches };
};

// Functie om een ronde volledig af te sluiten zodra iedereen klaar is met spelen
export const completeRound = async (roundId) => {
  try {
    // Check of echt *alle* wedstrijdinvoeren/scores uit deze ronde de status 'Afgerond' hebben
    const check = await pool.query("SELECT 1 FROM matches WHERE round_id = $1 AND match_status != 'Completed'", [roundId]);
    if (check.rows.length > 0) throw createError(400, 'Niet alle wedstrijden in deze ronde zijn opgeslagen.');

    // Zet de hele ronde op verzilverd ('Completed') en noteer de eindtijd
    await pool.query("UPDATE rounds SET status = 'Completed', end_time = NOW() WHERE round_id = $1", [roundId]);
    
    // Kijk of er überhaupt nog een volgende ronde in de database zit (zijn we klaar met uitschuiven of toernooi?)
    const round = await getRoundById(roundId);
    const nextRound = await pool.query("SELECT round_id FROM rounds WHERE round_number = $1", [round.round_number + 1]);

    // Als er nog een volgende ronde is:
    if (nextRound.rows.length > 0) {
       // Voer het King of the Court schuifsysteem uit (winnaars een baantje omhoog, verliezers eentje omlaag)
       await advanceKingOfTheCourt(roundId, nextRound.rows[0].round_id);
    }

    return { message: 'Ronde voltooid! De Koning van de Baan doorschuiving is berekend voor de volgende ronde.' };
  } catch (err) {
    throw createError(400, err.message || 'Fout bij het voltooien van ronde, zorg dat alle matches completed zijn.');
  }
};
