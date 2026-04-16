// Dit is nodig om de login-sleutel (token) te controleren
import jwt from "jsonwebtoken";
// Verbind met de database
import pool from "../config/db.js";

// Dit blokkeert mensen als ze niet zijn ingelogd
export const protectroute = async (req, res, next) => {
  try {
    // Haal de token uit de cookies
    const token = req.cookies.token;
    // Geen token? Dan mag je niet verder.
    if (!token) {
      return res.status(401).json({ message: "Niet geautoriseerd, je bent niet ingelogd" });
    }

    // Controleer of de token klopt met ons geheime wachtwoord
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Zoek de gebruiker op in de database en kijk of hij actief is
    const user = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = TRUE",
      [decoded.id]
    );

    // Bestaat de gebruiker niet of is het account op inactief gezet? Blokkeer.
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Niet geautoriseerd, account niet gevonden of inactief" });
    }

    // Bewaar de gebruikerinformatie voor de volgende stap
    req.user = user.rows[0];
    
    // Ga verder naar de pagina die ze wilden bezoeken
    next();
  } catch (error) {
    // Fout bij de token? Stuur ze weg.
    return res.status(401).json({ message: "Niet geautoriseerd, sleutel (token) werkt niet meer" });
  }
};

// Controleert stilletjes of iemand ingelogd is zonder ze direct te blokkeren
export const checkUser = async (req, res, next) => {
  try {
    // Haal de token op
    const token = req.cookies.token;
    
    // Geen token? Registreer dat er geen gebruiker is en ga verder
    if (!token) { req.user = null; return next(); }

    // Pak de token uit
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Zoek de persoon in de database
    const user = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    // Sla de persoon op als we hem gevonden hebben, anders niet
    req.user = user.rows.length > 0 ? user.rows[0] : null;
    next();
  } catch (error) {
    // Fout in de token, negeer het en ga door als anonieme gebruiker
    req.user = null;
    next();
  }
};

// Zorgt ervoor dat alleen admins (bazen) hier mogen komen
export const adminOnly = (req, res, next) => {
  // Ben je niet ingelogd of ben je geen 'admin'? Dan word je tegengehouden.
  if (!req.user || req.user.role !== 'admin') {
    // Laat de server weten dat iemand stiekem op een admin pagina probeerde te komen
    console.warn(`Admin toegang geweigerd voor gebruiker ${req.user?.id || 'onbekend'} op ${req.path}`);
    return res.status(403).json({ message: "Alleen managers (admins) mogen hier komen." });
  }
  // Als je wel admin bent, mag je door.
  next();
};