import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from '../routes/auth.routes.js';
import usersRoutes from '../routes/users.routes.js';
import courtsRoutes from '../routes/courts.routes.js';
import roundsRoutes from '../routes/rounds.routes.js';
import matchesRoutes from '../routes/matches.routes.js';
import leaderboardRoutes from '../routes/leaderboard.routes.js';
import { errorHandler } from '../middleware/errorHandler.js';

dotenv.config();

// Hier wekken we het kloppende hart van onze achterkant ("backend") écht tot leven
const app = express();

// Vertrouw de zogenaamde proxy servers ('tussenstations' op het web). Zonder dit zou hij alle bezoekers
// als één persoon aanzien en zou Rate Limiting dus willekeurig iedereen de toegang gaan blokkeren.
app.set('trust proxy', 1);

// Gebruik een veiligheids-"helm" om hackaanvallen of lekken tegen te gaan (deze stuurt kleine beveiligende stickertjes (headers) mee)
app.use(helmet());

// Sta toe dat de Frontend de Backend direct mag aanspreken (en neem het vliegverkeer met inlogcookies over met "credentials")
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Geef toestemming om de "huidige inlog-cookies" uit de link op te pakken zodat we weten wie wie is
app.use(cookieParser());
// Begrijp dat álle pakketjes (JSON data) die uit de website-browser komen netjes leesbaar zijn
app.use(express.json());

// Beveiliging: Hoe lang en hoe vaak mag iemand bestanden van de server openen? (Zodat we niet worden overspoeld!)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Strafblad: 15 minuten wachten
  max: 300, // Je mag per 15 min wel tot 300 klikjes uitvoeren over de pagina (browsen kost immers veel links tegelijk)
  message: { error: 'Te veel verzoeken (knoppen geklikt), probeer het later opnieuw.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Zet de limiet speciaal op alle inkomende data (/api/...) 
app.use('/api', limiter);

// Weblinks inladen: Koppel elke /api/xxx aan de juiste map vol met Nederlandse uitleg die we eerder hebben toegevoegd
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courts', courtsRoutes);
app.use('/api/rounds', roundsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Klein testlinkje ('Ping!') om even snel te kijken of de hartslag van de database nog meewerkt
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Padel King API werkt en draait!' });
});

// Zwerver code: Als iemand een link in de browser intypt die wij hierboven NIET hebben gemaakt, trap hem dan af (404 Error)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Deze pagina of functionaliteit bestaat niet of de link in de backend/API is stuk (404).' });
});

// En áls er ergens dan een flinke rode fout onstaat (wat een crash veroorzaakt), dan komt híj helemaal onderaan terecht
// en vangt deze dit net de fout veilig op :)
app.use(errorHandler);

export default app;