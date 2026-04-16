import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

// Dit is de "waarde" per niveau, zodat de computer weet dat een Professional (4) beter is dan een Beginner (1)
const SKILL_ORDER = { Beginner: 1, Intermediate: 2, Advanced: 3, Professional: 4 };

// Een hulpmiddeltje om een lijst met spelers van 'Slechtst' naar 'Best' te sorteren
const sortBySkill = (players) =>
  [...players].sort((a, b) => SKILL_ORDER[a.skill_level] - SKILL_ORDER[b.skill_level]);

// Functie die 48 man in 2 gelijke, maar EERLIJK verdeelde groepen van 24 verdeelt (Groep A en Groep B)
export const divideIntoGroups = (players) => {
  const sorted = sortBySkill(players); // Eerst sorteren op niveau
  const groupA = [];
  const groupB = [];

  // Zig-zag verdelen zodat beide groepen ongeveer evenveel beginners en pro's hebben
  sorted.forEach((player, index) => {
    const block = Math.floor(index / 2);
    const posInBlock = index % 2;
    if (block % 2 === 0) {
      posInBlock === 0 ? groupA.push(player) : groupB.push(player);
    } else {
      posInBlock === 0 ? groupB.push(player) : groupA.push(player);
    }
  });

  return { groupA, groupB }; // Return de twee mooi gebalanceerde koppen
};

// Bereken de allereerste startwedstrijden (Ronde 1) voor beide groepen
export const generateRoundMatches = async (roundId, groupPlayers) => {
  const { groupA, groupB } = divideIntoGroups(groupPlayers);
  const matches = [];

  // Haal alle padelbanen op uit de database (Baan 1 oplopend t/m de laatste baan)
  const courtsRes = await pool.query('SELECT * FROM courts ORDER BY court_number ASC');
  const courts = courtsRes.rows;

  // Interne functie die voor 1 van de groepen (bijv Groep A) de 6 baantjes vult met elk 4 man
  const createMatchesForGroup = async (players) => {
    const sorted = sortBySkill(players).reverse(); // reverse() betekent: De beste spelers beginnen op baan 1
    for (let i = 0; i < 6; i++) {
      // Pak een blokje van 4 spelers voor deze ene baan
      const courtPlayers = sorted.slice(i * 4, i * 4 + 4);
      if (courtPlayers.length < 4) continue; // Als er geen 4 mensen over zijn, sla baan over

      // De nummers 1 en 4 spelen tegen 2 en 3 (dit is een standaard padel mix)
      const team_a = [courtPlayers[0], courtPlayers[3]];
      const team_b = [courtPlayers[1], courtPlayers[2]];
      const courtId = courts[i] ? courts[i].court_id : null;

      // Sla dit startpotje op in de database!
      const result = await pool.query(
        `INSERT INTO matches (round_id, court_id, player_1_team_a, player_2_team_a, player_1_team_b, player_2_team_b, team_a_score, team_b_score, winner_team, match_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Scheduled') RETURNING *`,
        [roundId, courtId, team_a[0].id, team_a[1].id, team_b[0].id, team_b[1].id, null, null, null]
      );
      matches.push(result.rows[0]);
    }
  };

  // Voer de koppeling per baan uit voor zowel Groep A als Groep B
  if (groupA.length >= 4) await createMatchesForGroup(groupA);
  if (groupB.length >= 4) await createMatchesForGroup(groupB);

  return matches; // Geef alle net-gemaakte wedstrijden terug
};

// Het beroemde "King of the Court" systeem (als je wint ga je een baan omhoog, verlies is baan naar beneden)
export const advanceKingOfTheCourt = async (currentRoundId, nextRoundId) => {
  // Haal alle potjes op van de ronde die zojuist in zijn geheel 'Afgerond' is
  const result = await pool.query(
    `SELECT m.*, c.court_number FROM matches m
     LEFT JOIN courts c ON m.court_id = c.court_id
     WHERE m.round_id = $1 AND m.match_status = 'Completed'
     ORDER BY m.match_id ASC`,
    [currentRoundId]
  );
  const matches = result.rows;
  if (matches.length === 0) return; // Geen potjes gevonden = we hoeven niks door te schuiven

  const courtsRes = await pool.query('SELECT * FROM courts ORDER BY court_number ASC');
  const courts = courtsRes.rows;

  // Splits uit tussen Groep A en B
  const half = Math.ceil(matches.length / 2);
  const groupAMatches = matches.slice(0, half);
  const groupBMatches = matches.slice(half);

  // Verwerk deze King of the Court regel per groep
  const processGroup = async (groupMatches) => {
    groupMatches.sort((a, b) => a.court_number - b.court_number);
    const newCourts = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    // Loop door elke baan heen (1 t/m 6)
    for (let i = 0; i < groupMatches.length; i++) {
      const match = groupMatches[i];
      const courtNum = i + 1; // 1 to 6

      // Wie was het winnende team (2 man)? En wie was hier de verliezer (2 man)?
      const winnerTeam = match.winner_team === 'A' ? 
        [{id: match.player_1_team_a}, {id: match.player_2_team_a}] : 
        [{id: match.player_1_team_b}, {id: match.player_2_team_b}];
      const loserTeam = match.winner_team === 'A' ? 
        [{id: match.player_1_team_b}, {id: match.player_2_team_b}] : 
        [{id: match.player_1_team_a}, {id: match.player_2_team_a}];

      // SCHUIF REGELS:
      if (courtNum === 1) {
         // Baan 1: Winnaar blijft staan (kan niet hoger), Verliezer zakt af naar Baan 2
        newCourts[1].push(...winnerTeam);
        newCourts[2].push(...loserTeam);
      } else if (courtNum === 6) {
         // Baan 6 (laagste): Winnaar stijgt naar Baan 5, Verliezer blijft staan op Baan 6 (kan niet lager)
        newCourts[5].push(...winnerTeam);
        newCourts[6].push(...loserTeam);
      } else {
         // Gewone banen tussendoor: Winnaar = getalletje omlaag (bijv 3 naar 2), Verliezer = getalletje omhoog (bijv 3 naar 4)
        newCourts[courtNum - 1].push(...winnerTeam);
        newCourts[courtNum + 1].push(...loserTeam);
      }
    }

    // Nu de mensen op hun nieuwe baan zijn ingedeeld, splitsen we de winnaars en verliezers op met een nieuwe willekeurige partner voor het volgende uiltje
    for (let i = 1; i <= 6; i++) {
      const players = newCourts[i];
      if (players.length === 4) {
        // Splitten zodat je een nieuwe partner krijgt (winnaar 1 + verliezer 1 vs winnaar 2 + verliezer 2)
        const team_a = [players[0].id, players[2].id];
        const team_b = [players[1].id, players[3].id];
        
        const courtId = courts.find(c => c.court_number === i)?.court_id || null;

        // Maak in de database de vastgestelde nieuwe wedstrijden aan voor de Volgende Ronde ('nextRoundId')
        await pool.query(
          `INSERT INTO matches (round_id, court_id, player_1_team_a, player_2_team_a, player_1_team_b, player_2_team_b, team_a_score, team_b_score, winner_team, match_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Scheduled')`,
          [nextRoundId, courtId, team_a[0], team_a[1], team_b[0], team_b[1], null, null, null]
        );
      }
    }
  };

  // Run the logic
  if (groupAMatches.length > 0) await processGroup(groupAMatches);
  if (groupBMatches.length > 0) await processGroup(groupBMatches);
};

// Speciale functie die nagaat wie de absolute Koningen (Finalisten) van het toernooi zijn
export const determineFinalists = async () => {
  // Zoek uit hoeveel rondes er in totaal zijn in het systeem (meestal 6)
  const maxRoundRes = await pool.query('SELECT MAX(round_number) as max_round FROM rounds');
  const maxRoundNum = maxRoundRes.rows[0].max_round;

  if (!maxRoundNum) throw createError(400, 'Geen rondes gevonden in het toernooi.');

  // Haal de data van de ALLESLAATSTE ronde op (de finale ronde)
  const finaleRound = await pool.query(
    `SELECT round_id, status FROM rounds WHERE round_number = $1`,
    [maxRoundNum]
  );

  // Als de finale ronde nog niet is begonnen ('Pending' of 'Scheduled'), dan zijn de finalisten nog niet bekend
  const status = finaleRound.rows[0].status.toLowerCase();
  if (status === 'pending' || status === 'scheduled') {
    throw createError(400, `De finalisten zijn pas bekend wanneer de finale ronde (Ronde ${maxRoundNum}) start.`);
  }

  // Als de finale ronde wél bezig is (of voorbij), kijken we gewoon wie er op dat moment op Baan 1 ('Court 1') stonden - dat is de finale!
  const finalMatch = await pool.query(
    `SELECT m.*, c.court_number FROM matches m
     JOIN courts c ON m.court_id = c.court_id
     WHERE m.round_id = $1 AND c.court_number = 1`, // Baan 1
    [finaleRound.rows[0].round_id]
  );

  if (!finalMatch.rows[0]) throw createError(404, 'Geen wedstrijd op baan 1 gevonden voor de finale.');

  const match = finalMatch.rows[0];
  // Retourneer de identiteit van deze 4 topspelers 
  return {
    finalists: [
      match.player_1_team_a,
      match.player_2_team_a,
      match.player_1_team_b,
      match.player_2_team_b,
    ],
    message: `Finalisten van baan 1 (Ronde ${maxRoundNum}).`,
  };
};
