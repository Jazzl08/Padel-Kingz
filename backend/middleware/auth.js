import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Een filter (middleware) die ervoor zorgt dat bepaalde pagina's/gegevens alleen te zien zijn als je ingelogd bent
export const protectroute = async (req, res, next) => {
  try {
    // Zoek het 'inlogbewijsje' (de token in de cookie) die door de browser is teruggestuurd
    const token = req.cookies.token;
    if (!token) {
      // Als er geen bewijs is, blokkeer de toegang dan direct met een '401 Niet geautoriseerd' fout
      return res.status(401).json({ message: "Niet ingelogd, geen token gevonden." });
    }

    // Controleer of de token echt van ons is en niet namaak/verlopen, door het geheime wachtwoord (JWT_SECRET) te gebruiken
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check in de database of deze gebruiker nog bestaat en op actief staat (bijv. niet weggestuurd is)
    const user = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = TRUE",
      [decoded.id]
    );

    // Als de speler niet gevonden is (of intussen is gedeactiveerd), weiger de toegang
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Niet geautoriseerd: Gebruiker niet gevonden of niet actief." });
    }

    // Geef de gegevens in de backend mee ('req.user') zodat de rest van de website dit verderop kan gebruiken
    req.user = user.rows[0];
    
    // Alles is goed gekeurd, ga verder naar de volgende stap ('next()')
    next();
  } catch (error) {
    // Als de token fout of vervalst is, kom je in de catch terecht. Toegang geweigerd.
    return res.status(401).json({ message: "Niet geautoriseerd, token controle faalde." });
  }
};

// Een wat makkelijker filter: Het maakt hierbij niet uit of je weigert als je niet bent ingelogd, 
// maar áls je een token hebt stopt hij de gegevens in req.user, is deze leeg? Prima, dan blijf je bezoeker ('null'). 
export const checkUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) { req.user = null; return next(); } // Niks aan de hand, ga verder als onbekende (null)

    // Probeer de token (cookie) te ontcijferen
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Zoek hem op in de database
    const user = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    // Vul req.user als de db iets vond, vul in met niks (null) als hij leeg is
    req.user = user.rows.length > 0 ? user.rows[0] : null;
    next();
  } catch (error) {
    // Foute inlog cookie? Dan ben je gewoon niet ingelogd ('null') en loop je de code weer verder uit ('next()')
    req.user = null;
    next();
  }
};

// Extra strenge beveiliging: Alleen de "admin" (de baas / toernooileiding) mag hier langs!
export const adminOnly = (req, res, next) => {
  // Controleer of er niemand is ingelogd, of dat de ingelogde NIET de rol 'admin' heeft
  if (!req.user || req.user.role !== 'admin') {
    // Noteer in het interne logboek ('server terminal') dat er een stiekeme poging werd gedaan door iemand
    console.warn(`Admin toegang geweigerd voor user ${req.user?.id || 'onbekend'} op ${req.path}`);
    
    // Geef een harde afwijzing op het beeldscherm ('403 Verboden') 
    return res.status(403).json({ message: "Alleen admins (toernooileiding) hebben toegang." });
  }
  
  // Is het wél de baas? Laat hem dan door!
  next();
};