import { Router } from 'express';
import * as roundsController from '../controllers/rounds.controller.js';
import { protectroute, adminOnly } from '../middleware/auth.js';

// Maak hier een set aan 'web routes' aan voor dingen die over de speelrondes gaan
const router = Router();

// Vraag het lijstje met alle verschillende speelrondes op (zoals 'Ronde 1, Ronde 2') voor een ingelogde bezoeker
router.get('/', protectroute, roundsController.getAllRounds);

// Vraag aan wie er in de finale staan, alleen de beheerder ('adminOnly') mag deze knoop doorhakken of opvragen
router.get('/finalists', protectroute, adminOnly, roundsController.getFinalists);

// Details ophalen die bij één bepaalde ronde (door middel van een uniek idnummer) horen 
router.get('/:id', protectroute, roundsController.getRoundById);

// Starten van een complete speelronde. Een grote taak en daarom alleen weggelegd voor de beheerder ('adminOnly')
router.post('/:id/start', protectroute, adminOnly, roundsController.startRound);

// Rondt een speelronde af zodra alles gespeeld is, en rekent de punten door (ook alleen voor de admin)
router.post('/:id/complete', protectroute, adminOnly, roundsController.completeRound);

export default router;