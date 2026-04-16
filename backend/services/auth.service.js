import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

// Functie om een nieuwe speler te registreren in de database
export const registerUser = async ({ name, email, password, age, skill_level }) => {
  // Controleer of het toernooi al vol zit (maximaal 48 spelers en 2 reserves, dus 50 totaal)
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users WHERE role = 'player'`
  );
  if (parseInt(countResult.rows[0].count) >= 50) {
    throw createError(400, 'Het toernooi zit vol. Maximaal 48 deelnemers en 2 reserves.');
  }

  // Controleer of dit e-mailadres al bestaat in het systeem
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw createError(400, 'E-mailadres is al geregistreerd.');

  // Codeer het wachtwoord ('hashen') zodat niemand (ook de database niet) het echte wachtwoord kan lezen
  const hashed = await bcrypt.hash(password, 12);

  // Sla de nieuwe speler op in de database met al zijn of haar gegevens
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, age, skill_level)
     VALUES ($1, $2, $3, 'player', $4, $5)
     RETURNING id, name, email, role, age, skill_level`,
    [name, email, hashed, age || null, skill_level || 'Intermediate']
  );

  const user = result.rows[0];

  // Maak een speciaal "inlogbewijs" (een token genaamd) zodat je daarna direct ingelogd blijft voor 7 dagen
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Stuur de nieuwe gebruiker én het bewijs van inloggen terug
  return { user, token };
};

// Functie om een bestaande gebruiker te laten inloggen
export const loginUser = async ({ email, password }) => {
  // Haal alle informatie van de gebruiker op die hoort bij dit e-mailadres
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  // Als er geen speler met dat e-mailadres is gevonden, stuur een fout (wachtwoord of email verkeerd)
  if (!user) throw createError(401, 'Onjuist e-mailadres of wachtwoord.');
  
  // Als de speler op inactief ('geblokkeerd' of 'geblesseerd') staat, mag die niet meer zomaar inloggen
  if (user.is_active === false) throw createError(403, 'Dit account is gedeactiveerd of geblokkeerd.');

  // Vergelijk het ingevulde wachtwoord met het beveiligde wachtwoord uit de database
  const valid = await bcrypt.compare(password, user.password);
  
  // Als de wachtwoorden niet overeenkomen, geef een foutmelding
  if (!valid) throw createError(401, 'Onjuist e-mailadres of wachtwoord.');

  // Maak (net als bij registratie) een bewijs van inloggen aan dat 7 dagen geldig is
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Zorg dat we het wachtwoord NIET terugsturen naar het scherm/browser (voor de veiligheid)
  const { password: _, ...userWithoutPassword } = user;
  
  // Stuur de gegevens en het inlogbewijsje terug naar het inlogscherm
  return { user: userWithoutPassword, token };
};