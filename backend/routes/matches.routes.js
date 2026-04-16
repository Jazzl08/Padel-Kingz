import { Router } from 'express';
import * as matchesController from '../controllers/matches.controller.js';
import { protectroute, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateScoreSchema } from '../schemas/match.schema.js';

// Maak een verzameling links om met wedstrijden te kunnen werken
const router = Router();

// Haal wedstrijden op voor één specifieke speelronde (mits je ingelogd bent)
router.get('/round/:roundId', protectroute, matchesController.getMatchesByRound);

// Haal alle wedstrijden op voor één specifieke speler (mits je ingelogd bent)
router.get('/player/:userId', protectroute, matchesController.getMatchesByPlayer);

// Verander of update de uitslag van een wedstrijd (score inlossen). Maar pas op: 
// 1. Je moet ingelogd zijn (protectroute) 2. Je moet admin/beheerder zijn (adminOnly) 
// en 3. De score moet correct zijn ingevuld, zoals controleert door "validate(updateScoreSchema)"
router.patch('/:id/score', protectroute, adminOnly, validate(updateScoreSchema), matchesController.updateScore);

export default router;