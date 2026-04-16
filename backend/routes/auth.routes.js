import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { protectroute, checkUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

// Maak een nieuw 'router' object aan waarmee we de weblinks (urls) kunnen vastleggen
const router = Router();

// Extra beveiliging: zorg dat mensen niet oneindig vaak snel achter elkaar kunnen inloggen of registreren (tegen hackers)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Hoe lang is de 'straf'? 15 minuten in dit geval
  max: 8, // Maximaal 8 pogingen per IP-adres in die 15 minuten
  message: { error: 'Te veel inlog/registratie pogingen, probeer het over 15 minuten opnieuw.' }, // Bericht dat je krijgt bij te vaak proberen
  standardHeaders: true,
  legacyHeaders: false,
});

// Link voor het registreren (account aanmaken) - Inclusief beveiliging (limiet & controle op ingevulde gegevens)
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// Link voor inloggen - Inclusief beveiliging (limiet & controle op email/wachtwoord velden)
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Link om uit te loggen - Hiervoor is geen ingave controle of limiet nodig
router.post('/logout', authController.logout);

// Link om de eigen speler-gegevens op te halen - checkUser kijkt of degene wel is ingelogd
router.get('/me', checkUser, authController.getMe);

// Exporteer al deze web links zodat de rest van de backend deze kan gebruiken
export default router;