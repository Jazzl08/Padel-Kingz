import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { protectroute, adminOnly } from '../middleware/auth.js';

// Maak hier een set aan 'web routes' aan voor dingen die over de spelers/gebruikers gaan
const router = Router();

// Haalt een lijst op van alle spelers. Alleen een beheerder mag dit volledige overzicht inzien ('adminOnly')
router.get('/', protectroute, adminOnly, usersController.getAllUsers);

// Haalt toernooi statistieken (hoeveel spelers) op. Eveneens alleen toegestaan voor de beheerder  
router.get('/stats', protectroute, adminOnly, usersController.getTournamentStats);

// Haalt alleen de openbare informatie van een speler op met dit bepaalde unieke identificatienummer ('id') 
router.get('/:id', protectroute, usersController.getUserById);

// Met deze speciale link verandert de status van de speler in de database ('toggle'). Let op dit is alleen voor beheer! 
router.patch('/:id/toggle', protectroute, adminOnly, usersController.toggleUserActive);

// Een bijzondere functie die één geblesseerde speler inruilt voor een reserve. 
router.post('/swap', protectroute, adminOnly, usersController.swapPlayer);

export default router;