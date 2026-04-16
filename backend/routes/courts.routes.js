import { Router } from 'express';
import * as courtsController from '../controllers/courts.controller.js';
import { protectroute, adminOnly } from '../middleware/auth.js';

// Maak weer een nieuw object om onze weblinks voor banen in te stellen
const router = Router();

// Zorg dat alleen ingelogde mensen ('protectroute') kunnen zien welke banen er allemaal zijn
router.get('/', protectroute, courtsController.getAllCourts);

// Verander de status van een baan, maar let op: alleen de beheerder ('adminOnly') mag dit aanpassen
router.patch('/:id/status', protectroute, adminOnly, courtsController.updateCourtStatus);

// Exporteer de links voor het web
export default router;