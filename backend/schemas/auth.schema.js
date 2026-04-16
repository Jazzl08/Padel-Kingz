import { z } from 'zod';

// Dit is het reglement ('schema') waaraan voldaan MOET worden als iemand een account wil aanmaken
export const registerSchema = z.object({
  // De speler 'naam': Mag niet leeg zijn, en we controleren of er geen gekke hackers-tekens (script tags) in zitten
  name: z.string()
    .trim() // Haal onzichtbare spaties vooraan of achteraan weg
    .min(2, 'Naam moet minimaal 2 tekens zijn')
    .max(50, 'Naam mag maximaal 50 tekens lang zijn')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Naam mag alleen letters, spaties, koppeltekens en apostrofs bevatten (geen speciale tekens of script tags)'),
  
  // Het e-mailadres: Moet een echt @teken.nl hebben, niet onmogelijk lang zijn, en we zetten alles automatisch in kleine letters
  email: z.string()
    .trim()
    .email('Ongeldig e-mailadres')
    .max(100, 'E-mailadres is te lang')
    .toLowerCase(),
  
  // Het wachtwoord: Streng. Minimaal 8 tekens, een hoofdletter, een miniletter, een cijfer en een raar symbool (!@#)
  password: z.string()
    .min(8, 'Wachtwoord moet minimaal 8 tekens zijn')
    .max(100, 'Wachtwoord is te lang')
    .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
    .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet minimaal één cijfer bevatten')
    .regex(/[^A-Za-z0-9]/, 'Wachtwoord moet minimaal één speciaal teken bevatten'),
  
  // Leeftijd is niet verplicht ('optional'), maar ALS je hem invult: Tussen 10 en 100 jaar. 
  // 'coerce' betekent dat zelfs als mensen het getal in de code per ongeluk als tekst "25" sturen, hij hem hier naar échte data 25 vertaalt.
  age: z.coerce.number().int().min(10).max(100).optional(),
  
  // Handig drop-down keuzemenu, je MAG het invullen, maar het mag geen verzonnen niveau zijn buiten deze vier
  skill_level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Professional']).optional(),
});

// Het reglement voor als je alleen maar komt Inloggen in plaats van registreren
export const loginSchema = z.object({
  // Controleer het e-mailadres, pas het netjes aan (zoals onzichtbare spaties weg en alles kleine letters)
  email: z.string()
    .trim()
    .email('Ongeldig e-mailadres')
    .max(100, 'E-mailadres is te lang')
    .toLowerCase(),
  // Het wachtwoord hoeft hier niet streng gecontroleerd te worden op symbolen (dat doen we in de db wel), 
  // We willen alleen zeker weten: vul álsjeblieft op z'n minst 1 letter erin, laat het niet leeg!
  password: z.string().min(1, 'Wachtwoord is verplicht').max(100, 'Wachtwoord is te lang'),
});