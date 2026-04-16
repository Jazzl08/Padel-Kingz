import pool from '../config/db.js';

// Functie om een lijst van alle padelbanen uit de database op te halen
export const getAllCourts = async () => {
  // Vraag alle banen op en zet ze netjes op volgorde (baan 1, baan 2, enzovoort)
  const result = await pool.query(
    'SELECT * FROM courts ORDER BY court_number ASC'
  );
  return result.rows; // Retourneer de gevonden banen
};

// Functie om de status van een specifieke baan (bijv. 'Beschikbaar' of 'Bezet') te wijzigen
export const updateCourtStatus = async (id, status) => {
  // Pas de status aan in de database voor de baan met dit unieke ID
  const result = await pool.query(
    `UPDATE courts SET status = $1 WHERE court_id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0]; // Stuur de aangepaste baan direct ter bevestiging terug
};