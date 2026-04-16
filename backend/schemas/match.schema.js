import { z } from 'zod';

// Dit reglement kijkt heel streng of de ingevulde score in een padelwedstrijd wel 'logisch' klopt
export const updateScoreSchema = z.object({
  // De score van Team A moet een heel ('int') positief getal zijn, en maximaal 99
  team_a_score: z.coerce.number().int().min(0).max(99),
  
  // De score van Team B moet minimaal 0 en maximaal 99 zijn
  team_b_score: z.coerce.number().int().min(0).max(99),
}).refine(
  // Voeg een 'slimme regel' ('refine') toe: Gelijkspel bestaat niet in dit toernooi.
  // Data van Team A en Team B mogen hierdoor simpelweg NOOIT in balans (=) zijn met elkaar
  (data) => data.team_a_score !== data.team_b_score,
  { message: 'Scores mogen niet gelijk zijn — er moet een winnaar zijn.' }
);