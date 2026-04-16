import * as leaderboardService from '../services/leaderboard.service.js';

// Haalt het klassement met alle punten van de spelers op en stuurt dit door 
export const getLeaderboard = async (req, res, next) => {
  try {
    // Vraag het leaderboard (het speelschema / de standen) op aan de "service"
    const leaderboard = await leaderboardService.getLeaderboard();
    // Stuur de gevonden standen en punten terug naar wie het ophaalde
    res.json(leaderboard);
  } catch (err) { 
    // Als er iets fout gaat bij het ophalen, geef dit door voor foutafhandeling
    next(err); 
  }
};