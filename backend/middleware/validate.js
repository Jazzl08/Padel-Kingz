// Tussenstation (Filter): 'validate' controleert streng álle ingevulde formuliergegevens (bijv email/wachtwoord) voordat het zware databasewerk in de controllers start!
// Hij controleert aan de hand van een reglement oftewel een "schema" (die per route is meegestuurd vanuit de map 'schemas')
export const validate = (schema) => (req, res, next) => {
  // Test alle vakjes en tekst die door de browser zijn meegestuurd aan het reglement (Bijvoorbeeld: Is het wachtwoord minimaal 8 letters? Zitten er geen gekke tekens in een email?)
  const result = schema.safeParse(req.body);
  
  // Is het testje bij één van de regels in dat schema onverwachts rood opgelicht / gesjeesd? ('success === false')
  if (!result.success) {
    // Stel dan alle losse 'Let op! Dit veld is leeg / te kort' fouten van alle invoervelden netjes in 1 zinnetje achter elkaar
    const messages = result.error.issues.map((e) => e.message).join(', ');
    
    // Geef dit hele rijtje meteen in het rood (via een 400 Bad Request fout) vol op de neus terug naar de bezoeker ("Foute Boel, fix je formulier!")
    return res.status(400).json({ error: messages });
  }
  
  // Als ál het huiswerk was afgelinkt & goed werd gekeurd, dan hebben we alles 100% veilig en netjes binnen
  // Omdat sommige schema's bijvoorbeeld getalletjes die aanhangers ('string') lijken vanzelf slim kunnen veranderen naar een puur rekencijfer ('integer'),
  // is de data dus vers gevormd in 'result.data'. Knal dit direct achter het 'verstuur'-spulletje aan, zodat de rest van de site dit vlekkeloos wegpompt (De 'Controller')
  req.body = result.data;
  
  // Niks aan het handje, sla de filter netjes over, stuur de weblink lekker in z'n vrij door!
  next();
};