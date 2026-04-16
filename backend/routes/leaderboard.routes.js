import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';
import { protectroute } from '../middleware/auth.js';

// Maak een apart routes-script voor alles dat met het klassement (leaderboard) te maken heeft
const router = Router();

// Haal het klassement op wanneer iemand ernaar vraagt, tenminste als ze zijn ingelogd ('protectroute')
router.get('/', protectroute, leaderboardController.getLeaderboard);

// Stuur dit scriptje met de klassement-links naar de buitenwereld
export default router;