import * as roundsService from '../services/rounds.service.js';
import { determineFinalists } from '../services/tournament.service.js';

// Haalt een lijstje op met alle verschillende speelrondes (Ronde 1, Ronde 2, enzovoort)
export const getAllRounds = async (req, res, next) => {
  try {
    const rounds = await roundsService.getAllRounds(); 
    res.json(rounds); // Stuur al deze rondes terug als een lijst
  } catch (err) { next(err); }
};

// Haalt alle informatie op van één specifieke speelronde
export const getRoundById = async (req, res, next) => {
  try {
    // Via req.params.id (het ID) vragen we hierom in de "service"
    const round = await roundsService.getRoundById(req.params.id);
    res.json(round); // Bevestig en geef de details van deze ene ronde terug
  } catch (err) { next(err); }
};

// Start een ronde als iedereen er klaar voor is, meestal maakt dit de wedstrijden
export const startRound = async (req, res, next) => {
  try {
    const result = await roundsService.startRound(req.params.id);
    res.json(result); // Laat weten dat de ronde met succes begonnen is
  } catch (err) { next(err); }
};

// Sluit een uitgespeelde speelronde volledig af en rekent alles door
export const completeRound = async (req, res, next) => {
  try {
    const result = await roundsService.completeRound(req.params.id);
    res.json(result); // Bericht terugsturen als het afsluiten succesvol was
  } catch (err) { next(err); }
};

// Een speciale functie die bepaalt wie de allerbeste spelers zijn: de finalisten
export const getFinalists = async (req, res, next) => {
  try {
    // Dit heet een apart script aanroepen in de tournament service, die haalt de finalisten op
    const result = await determineFinalists();
    res.json(result); // Stuur de gelukkige winnaars terug 
  } catch (err) { next(err); }
};