import * as usersService from '../services/users.service.js';

// Haalt alle gebruikers op en stuurt ze terug
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (err) { next(err); }
};

// Zoekt één specifieke gebruiker op basis van het ID in de link
export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
};

// Zet de status van een speler aan of uit (actief/inactief)
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await usersService.toggleUserActive(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
};

// Haalt wat statistieken op over het toernooi, zoals het aantal spelers
export const getTournamentStats = async (req, res, next) => {
  try {
    const stats = await usersService.getTournamentStats();
    res.json(stats);
  } catch (err) { next(err); }
};

// Verwisselt een geblesseerde speler met een reservespeler
export const swapPlayer = async (req, res, next) => {
  try {
    const { injuredPlayerId, reservePlayerId } = req.body;
    const result = await usersService.swapPlayer(injuredPlayerId, reservePlayerId);
    res.json(result);
  } catch (err) { next(err); }
};