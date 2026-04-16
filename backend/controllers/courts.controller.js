import pool from '../config/db.js';

// Haalt alle padelbanen uit de database en zet ze op volgorde van het baannummer
export const getAllCourts = async () => {
  const result = await pool.query( // Vraag alles op uit de tabel "courts" en sorteer ze netjes ("ASC" betekent oplopend, dus baan 1, 2, 3...)
    'SELECT * FROM courts ORDER BY court_number ASC'
  );
  return result.rows; // Stuur de lijst met banen terug
};

// Past de status van een specifieke padelbaan aan (bijvoorbeeld van 'beschikbaar' naar 'bezet')
export const updateCourtStatus = async (id, status) => {
  const result = await pool.query( // Werk de status bij in de database voor de baan met een bepaald ID
    `UPDATE courts SET status = $1 WHERE court_id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0]; // Stuur de aangepaste informatie van die specifieke baan terug zodat we die kunnen zien
};