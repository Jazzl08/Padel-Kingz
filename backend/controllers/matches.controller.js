import * as matchesService from '../services/matches.service.js';

// Haalt alle wedstrijden op die in één bepaalde speelronde (roundId) horen
export const getMatchesByRound = async (req, res, next) => {
  try {
    // Vraag uit de matches "service" de wedstrijden op speciaal voor dit ene rondenummer
    const matches = await matchesService.getMatchesByRound(req.params.roundId);
    res.json(matches); // Stuur de lijst met gevonden wedstrijden terug
  } catch (err) { 
    next(err); 
  }
};

// Vraagt speciaal alle wedstrijden op waarin één bepaalde speler (userId) zit
export const getMatchesByPlayer = async (req, res, next) => {
  try {
    // Kijk in het systeem welke wedstrijden deze speler allemaal heeft
    const matches = await matchesService.getMatchesByPlayer(req.params.userId);
    res.json(matches); // Geef zijn of haar lijst met wedstrijden terug
  } catch (err) { 
    next(err); 
  }
};

// Hiermee kunnen we een uitslag (score) invullen of bijwerken van een wedstrijd
export const updateScore = async (req, res, next) => {
  try {
    // Haal de scores van team A en team B uit de doorgestuurde informatie
    const { team_a_score, team_b_score } = req.body;
    // Roep de "service" aan om daadwerkelijk de score op te slaan onder dit wedstrijd-id
    const match = await matchesService.updateScore(req.params.id, team_a_score, team_b_score);
    res.json(match); // Stuur de aangepaste wedstrijd ter bevestiging weer terug
  } catch (err) { 
    next(err); 
  }
};