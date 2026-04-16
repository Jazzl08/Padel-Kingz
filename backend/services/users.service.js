import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, skill_level, age, is_active, created_at
     FROM users ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, skill_level, age, is_active, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  if (!result.rows[0]) throw createError(404, 'Speler niet gevonden.');
  return result.rows[0];
};

export const toggleUserActive = async (id) => {
  const result = await pool.query(
    `UPDATE users SET is_active = NOT is_active WHERE id = $1
     RETURNING id, name, is_active`,
    [id]
  );
  if (!result.rows[0]) throw createError(404, 'Speler niet gevonden.');
  return result.rows[0];
};

export const getTournamentStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE role = 'player') AS total_players,
      COUNT(*) FILTER (WHERE role = 'player' AND is_active = TRUE) AS active_players,
      COUNT(*) FILTER (WHERE role = 'player') >= 50 AS is_full
    FROM users
  `);
  return result.rows[0];
};

// Verwisselt een geblesseerde speler met een reservespeler in alle geplande wedstrijden
export const swapPlayer = async (injuredPlayerId, reservePlayerId) => {
  // Controleer of beide spelers echt bestaan in de database
  const check = await pool.query('SELECT id FROM users WHERE id IN ($1, $2)', [injuredPlayerId, reservePlayerId]);
  if (check.rows.length !== 2) throw createError(400, 'Één of beide spelers niet gevonden.');

  // Maak de geblesseerde speler inactief en de reservespeler actief
  await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [injuredPlayerId]);
  await pool.query('UPDATE users SET is_active = TRUE WHERE id = $1', [reservePlayerId]);

  // Vervang de geblesseerde speler met de reservespeler in alle komende wedstrijden:
  // Update Team A - Speler 1
  await pool.query(`UPDATE matches SET player_1_team_a = $1 WHERE player_1_team_a = $2 AND match_status != 'Completed'`, [reservePlayerId, injuredPlayerId]);
  // Update Team A - Speler 2
  await pool.query(`UPDATE matches SET player_2_team_a = $1 WHERE player_2_team_a = $2 AND match_status != 'Completed'`, [reservePlayerId, injuredPlayerId]);
  // Update Team B - Speler 1
  await pool.query(`UPDATE matches SET player_1_team_b = $1 WHERE player_1_team_b = $2 AND match_status != 'Completed'`, [reservePlayerId, injuredPlayerId]);
  // Update Team B - Speler 2
  await pool.query(`UPDATE matches SET player_2_team_b = $1 WHERE player_2_team_b = $2 AND match_status != 'Completed'`, [reservePlayerId, injuredPlayerId]);

  return { message: 'Speler succesvol gewisseld in de komende wedstrijden!' };
};