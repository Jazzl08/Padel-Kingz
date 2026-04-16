// Dit is een controleur (middleware) die kijkt of de inkomende gegevens wel kloppen volgens het schema (bijvoorbeeld de Zod tool)
export const validate = (schema) => (req, res, next) => {
  // Controleer of wat is binnengekomen (bijv. e-mail en wachtwoord) veilig en correct is volgens het `schema`
  const result = schema.safeParse(req.body);
  
  // Is het niet helemaal goed gegaan? Waarschuw dan dat het formulier niet klopt
  if (!result.success) {
    // Verzamel alle foutmeldingen uit de controle in een lijstje met komma's
    const messages = result.error.issues.map((e) => e.message).join(', ');
    // Stuur een melding terug (code 400 Bad Request) met de fouten in de gegevens
    return res.status(400).json({ error: messages });
  }
  
  // Als alle gegevens kloppen, sla ze netjes en gecheckt terug in het verzoek (body)
  req.body = result.data;
  
  // Geef groen licht en laat het verzoek verder lopen
  next();
};