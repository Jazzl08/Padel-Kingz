// Pakketten ophalen voor server routes (zoals /login /register)
import express from "express";
// Een tool om wachtwoorden veilig te versleutelen (hash)
import bcrypt from "bcryptjs";
// Een systeem dat inlogtickets (tokens) kan uitdelen zodat we weten wie je bent
import jwt from "jsonwebtoken";
// De tool die verbinding maakt met onze database
import pool from "../config/db.js";
// Validatietool (zorgt ervoor dat input de juiste vorm heeft, zoals een geldig e-mailadres)
import { z } from "zod";
// Controleurs (middlewares) die checken of de gebruiker is ingelogd
import { protectroute } from "../middleware/auth.js";
// Controleurs (middlewares) die checken of de gebruiker een speciale rol heeft (zoals beheerder)
import { requireRole } from "../middleware/role.js";

// Maak een nieuwe route lijst (router) voor Express aan
const router = express.Router();

// Standaard instellingen voor inlogcookies
const cookieOptions = {
    // Alleen de server mag de cookie inzien, dat beschermt tegen gekraakte code (XSS)
    httpOnly: true,
    // Als de server een echte site in 'productie' mode draait, werkt het inloggen alleen over een veilige https connectie
    secure: process.env.NODE_ENV === 'production',
    // Alleen onze eigen website (het domein) mag deze cookies lezen
    sameSite: 'Strict',
    // Je blijft maximaal 30 dagen ingelogd (in milliseconden berekend)
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

// Dit definieert wat een nieuwe gebruiker als data moet insturen om zich aan te melden (wordt streng gecontroleerd)
const registerSchema = z.object({
  name: z.string().min(3, "Naam moet minimaal 3 tekens bevatten"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
  // Kan een gewone speler of een beheerder zijn, als ze geen keuze insturen mag dat ook (optional)
  role: z.enum(['player', 'admin']).optional(),
});

// Welke gegevens verwachten we als iemand wil inloggen? Een mail en iets in het wachtwoord-vak!
const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

// Maak een digitaal kaartje of 'inlogticket' (token) waarmee de gebruiker kan zeggen 'ik ben het'
const generateToken = (user) => {
    // We verstoppen hun ID in de token met ons speciale JWT geheime wachtwoord 
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Goed voor de komende 30 dagen
    });
}

// Route waar een nieuw persoon een account via een POST request kan aanmaken (registreren)
router.post("/register", async (req, res) => {
    // Controleer de ingevoerde naam, email en wachtwoord
    const validation = registerSchema.safeParse(req.body);

    // Is er een fout? Retourneer de fout van Zod als reactie
    if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
    }

    // Haal de gecheckte informatie uit de controle
    const { name, email, password, role } = validation.data;

    // Kijk snel of deze e-mail al geregistreerd staat in de database "users"
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // Als die er is, mag er niet nog een account met die e-mail komen (400 Bad Request)
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Gebruiker bestaat al" });
    }

    // Hash (sleutel) het wachtwoord 10 keer voor extra beveiliging, we slaan nooit wachtwoorden als tekst op!
    const hashedPassword = await bcrypt.hash(password, 10);
    // Bevat het verzoek geen rol? Dan wijzen we standaard de "speler" (player) rol toe.
    const userRole = role || 'player';

    // Voeg het nieuwe account eindelijk toe in de lijst ("users") van de database
    // "RETURNING ..." deelt meteen de velden met ons van die gloednieuwe rij, zodat we 'm kunnen pakken en door kunnen gaan
    const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
        [name, email, hashedPassword, userRole]
    );

    // Maak hun inlogkaartje (token) klaar!
    const token = generateToken(newUser.rows[0]);

    // Omdat ze nu succesvol geregistreerd zijn, zetten we ook de toegangscookie (login) op hun computer neer
    res.cookie("token", token, cookieOptions);

    // Retourneer reactie "Gelukt" (201 Created) inclusief hun gehaalde gegevens!
    return res.status(201).json({ user: newUser.rows[0] });
})

// Route voor inloggen
router.post("/login", async (req, res) => {
    // Loop de controle door
    const validation = loginSchema.safeParse(req.body);

    // Vliegt de control mis? Retourneer de waarschuwing!
    if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
    }

    // Haal strakke gegevens binnen
    const { email, password } = validation.data;

    // Komt de gebruiker uberhaupt voor in de "users" in de Database?
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // Nee? Verkeerde credentials! (Niet letterlijk melden dat de email mis was voor security)
    if (user.rows.length === 0) {
        return res.status(400).json({ message: "Onjuiste gegevens" });
    }

    // Pak dat ene resultaat voor de gebruiker
    const userData = user.rows[0];

    // Typte de persoon hetzelfde wachtwoord in? bcrypt gaat the vergelijken met de veilige "lelijke" hash die bewaard was
    const isMatch = await bcrypt.compare(password, userData.password);

    // Was t wachtwoord onjuist?
    if (!isMatch) {
      // 400 - fout verstoornis
        return res.status(400).json({ message: "Onjuiste gegevens" });
    }

    // Alles top! Maak een sessie pas (Token) voor de inlogger
    const token = generateToken(userData);

    // Plak de "ticket" als veilige sessie cookie direct op de computer.
    res.cookie("token", token, cookieOptions);

    // Geef hun gebruikersinformatie en rol terug aan de client!
    res.json({ id: userData.id, name: userData.name, email: userData.email, role: userData.role });
})

// Een beschermde route die puur checkt "wie ben ik op basis vd token" (protectroute) en zo zend de backend de 'huidige user' (req.user) snel door. 
router.get("/me", protectroute, async (req, res) => {
    res.json(req.user);
});

// Weg en doei :) we sturen de cookie veranderbaar in het jaar zero! Dat sloopt hem (loguit dus)
router.post("/logout", (req, res) => {
    // Vervang de actieve token cookie door een lege die na 1 milliseconde verloopt
    res.cookie("token", "", {
        ...cookieOptions,
        maxAge: 1,
    });
    // Zeg dat het uitloggen geslaagd is
    res.json({ message: "Succesvol uitgelogd" });
});

// Een speciale route voor de admin om een lijst te zien van álle gebruikers
// Er wordt dubbel gecheckt: ben je ingelogd (protectroute) EN ben je de admin (requireRole)?
router.get("/users", protectroute, requireRole("admin"), async (req, res) => {
    try {
        // Vraag aan de database om alle handige info op te halen (id, naam, email, rol, aanmaakdatum) en sorteer van nieuw naar oud
        const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
        // Geef al die informatie netjes terug aan het dashboard van de admin
        res.json(result.rows);
    } catch (error) {
        // Zag je een fout? Zet hem in de console en stuur een simpele melding
        console.error("Fout bij ophalen gebruikers:", error);
        res.status(500).json({ message: "Kon gebruikers niet ophalen" });
    }
});

// Nog een speciale route voor de admin om iemand permanent te verwijderen
router.delete("/users/:id", protectroute, requireRole("admin"), async (req, res) => {
    try {
        // Welk ID werd er in de URL meegestuurd? (bijv. /users/4)
        const { id } = req.params;
        // Vertel de database om de persoon met dit ID weg te mieteren
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        // Geef door dat het gelukt is
        res.json({ message: "Gebruiker is verwijderd" });
    } catch (error) {
        // Gaat het mis met verwijderen? Log het en geef de fout netjes door.
        console.error("Fout bij verwijderen gebruiker:", error);
        res.status(500).json({ message: "Kon gebruiker niet verwijderen" });
    }
});

// Zorg dat we deze lijst met routes elders kunnen oppakken en gebruiken.
export default router;