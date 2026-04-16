// Laad alle benodigde pakketten in
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";

// Laad de routes voor inloggen en registreren
import authRoutes from './routes/auth.js';

// Lees de geheime instellingen uit het .env bestand
dotenv.config();

// Maak de app en de server aan
const app = express();
const server = http.createServer(app);

// Voeg extra beveiliging toe
app.use(helmet()); 

// Zorg dat mensen niet te vaak achter elkaar iets kunnen sturen (tegen spammers)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false,
    message: "Te veel verzoeken van dit IP, probeer het later opnieuw."
});
// Pas de limiet toe op alle /api routes
app.use("/api", limiter);

// Zorg dat de frontend met deze backend mag praten
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
}));

// Zorg dat we JSON-gegevens en cookies kunnen lezen
app.use(express.json());
app.use(cookieParser());

// Een simpele test-route om te zien of de server het doet
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Bepaal op welke poort de server moet draaien
const PORT = process.env.PORT || 5000;

// Koppel de routes voor alles wat met inloggen te maken heeft
app.use('/api/auth', authRoutes);

// Start de server op
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



