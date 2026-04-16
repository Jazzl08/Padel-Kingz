import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

// Functie voor het ophalen van alle wedstrijden die bij één unieke speelronde horen
export const getMatchesByRound = async (roundId) => {
  // Dit is een grote database zoekopdracht ('query'). We zoeken de wedstrijd op, en voegen daar in 1x ook
  // het baannummer en de namen van de 4 spelers vanuit de "users" tabel (u1, u2, u3, u4) aan toe
  const result = await pool.query(
    `SELECT m.*,
       c.court_number,
       u1.name AS player1a_name, u2.name AS player2a_name,
       u3.name AS player1b_name, u4.name AS player2b_name
     FROM matches m
     JOIN courts c ON m.court_id = c.court_id
     JOIN users u1 ON m.player_1_team_a = u1.id
     JOIN users u2 ON m.player_2_team_a = u2.id
     JOIN users u3 ON m.player_1_team_b = u3.id
     JOIN users u4 ON m.player_2_team_b = u4.id
     WHERE m.round_id = $1
     ORDER BY c.court_number ASC`, // ASC betekent oplopend sorteren, dus baan 1, baan 2, baan 3...
    [roundId]
  );
  return result.rows; // Stuur de gevonden gegevens van de wedstrijden uit die ronde terug
};

// Functie die een persoonlijk poule schema ophaalt per speler (al jouw geplande of gespeelde potjes)
export const getMatchesByPlayer = async (userId) => {
  // We zoeken weer naar wedstrijden en spelers, maar we eisen hier per se (WHERE in de code laag daaronder)
  // dat deze "userId" één van de 4 deelnemende spelers moet zijn
  const result = await pool.query(
    `SELECT m.*, c.court_number, r.round_number,
       u1.name AS player1a_name, u2.name AS player2a_name,
       u3.name AS player1b_name, u4.name AS player2b_name
     FROM matches m
     JOIN courts c ON m.court_id = c.court_id
     JOIN rounds r ON m.round_id = r.round_id
     JOIN users u1 ON m.player_1_team_a = u1.id
     JOIN users u2 ON m.player_2_team_a = u2.id
     JOIN users u3 ON m.player_1_team_b = u3.id
     JOIN users u4 ON m.player_2_team_b = u4.id
     WHERE $1 IN (m.player_1_team_a, m.player_2_team_a, m.player_1_team_b, m.player_2_team_b)
     ORDER BY r.round_number ASC`,
    [userId]
  );
  return result.rows; // Retourneer de complete speellijst voor deze speler
};

// Functie om de uitslag / score in de database op te slaan
export const updateScore = async (matchId, team_a_score, team_b_score) => {
  // Bij padel kan je (normaal gesproken) niet eindigen in een gelijkspel - dat blokkeren we hier als extra beveiligingscheck
  if (team_a_score === team_b_score) {
    throw createError(400, 'Scores mogen niet gelijk zijn.');
  }

  // Bepaal snel wie gewonnen heeft (het team met de hoogste score) in A of B
  const winner = team_a_score > team_b_score ? 'A' : 'B';

  // Zet deze scores en winnaar in de speelstatus als 'Completed' (Afgerond)
  const result = await pool.query(
    `UPDATE matches SET
       team_a_score = $1,
       team_b_score = $2,
       winner_team = $3,
       match_status = 'Completed'
     WHERE match_id = $4 AND match_status != 'Completed'
     RETURNING *`, // Dat wil zeggen dat hij na de actie hem direct ter controle terugstuurt
    [team_a_score, team_b_score, winner, matchId]
  );

  // Als we niks terugkregen uit de vorige blok, dan staat hij vast al op voltooid of er ging iets mis
  if (!result.rows[0]) {
    throw createError(404, 'Wedstrijd niet gevonden of al voltooid.');
  }

  // Roep direct de functie hieronder aan om de punten in het klassement aan te passen! Handig
  await updateLeaderboard(result.rows[0]);
  
  // Stuur de succesvolle wijziging terug naar boven
  return result.rows[0];
};

// Interne functie: Die puur kijkt wie zijn dit, en dan aan beide teams punten en statistieken optelt
const updateLeaderboard = async (match) => {
  const teamA = [match.player_1_team_a, match.player_2_team_a];
  const teamB = [match.player_1_team_b, match.player_2_team_b];

  // Voor elke speler in Team A: check of speler won: sla op in leaderboard
  for (const playerId of teamA) {
    await upsertLeaderboard(playerId, match.winner_team === 'A');
  }
  // Hetzelfde voor de speler in Team B
  for (const playerId of teamB) {
    await upsertLeaderboard(playerId, match.winner_team === 'B');
  }
};

// Interne functie: Werkt het klassement daadwerkelijk uit per speler op detailniveau
const upsertLeaderboard = async (userId, won) => {
  // We updaten hier de standen (win_percentage is hoeveel procent de persoon heeft gewonnen, losses is verliezen)
  // "ON CONFLICT" betekent hier heel simpel: als de scorelijst van deze persoon nog niet bestond, 
  // maak de speler dan hier voor het EERST aan qua score, anders doe er eentje erbovenop (UPDATE) 
  await pool.query(
    `INSERT INTO leaderboard (user_id, matches_played, wins, losses, points, win_percentage)
     VALUES ($1, 1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
       matches_played  = leaderboard.matches_played + 1,
       wins            = leaderboard.wins + $2,
       losses          = leaderboard.losses + $3,
       points          = leaderboard.points + $4,
       win_percentage  = ROUND(
         (leaderboard.wins + $2)::DECIMAL /
         NULLIF(leaderboard.matches_played + 1, 0) * 100, 2
       )`,
    [ // Gegevens die ingevuld moeten worden in bovenstaand stuk tekst
      userId,
      won ? 1 : 0,           // Gewonnen bij insert
      won ? 0 : 1,           // Verloren bij insert
      won ? 10 : 0,          // 10 Punten als hij of zij gewonnen heeft, verlies = 0 punten
      won ? 100.00 : 0.00,   // Initieel percentage
    ]
  );
};