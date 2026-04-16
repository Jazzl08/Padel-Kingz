// Een 'vangnet' filter dat ervoor zorgt dat áls er iets zwaar verkeerd gaat (crasht) in het ophalen, dit veilig wordt afgewezen 
export const errorHandler = (err, req, res, next) => {
  // Log de echte ruwe fout eerst netjes voor de techneut in de achtergrond terminal ('server console')
  console.error(' Error:', err.message);

  // Pak de meegeleverde foutcode of geef het anders direct een 500 status (compleet gecrashte server)
  const statusCode = err.statusCode || 500;
  
  // Standaard foutmelding voor 500 (wij leggen niet alle moeilijke database code of bugs bloot aan de gewone app bezoeker)
  const isServerFout = statusCode === 500;
  
  // Als we in 'productie' (dus echt online/live voor mensen) zitten én er crasht iets ernstigs (500), laat dan alleen een rustige tekst zien. 
  // Als we nog aan het programmeren (DEVELOPMENT) zijn óf de fout niet zo diep is gegaan, laat dan de echte foutmelding wél zien op het scherm (zoals 'verkeerd wachtwoord')
  const message = isServerFout && process.env.NODE_ENV === 'production'
    ? 'Oeps, onze server heeft even een time-out. Probeer het over een paar minuten opnieuw.' 
    : (err.message || 'Interne serverfout');

  // Stuur de melding ('error: message') als JSON blokje terug naar het beeldscherm met de bijbehorende rode statuscode eronder (bijv 404 of 500)
  res.status(statusCode).json({
    error: message,
    // (Optioneel) Als we in PROGRAMMEER (development) mode testen, stuur dan óók direct de hele 'stack trace' (pad van de code bug) mee naar voren zodat we hem goed traceren
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Een handig op-maat stukje gereedschap ('functie') die we bijv in de 'services' map kunnen gebruiken om onze eigen foutmelding te versturen! 
// Bijvoorbeeld: throw createError(400, "Het wachtwoord was fout!");
export const createError = (statusCode, message) => {
  // Vertel de Javascript engine in de pagina dat er hier een unieke opgeslagen rode FOUT (= new Error) in de code was
  const err = new Error(message);
  
  // Plak de bijpassende fout-status (bijv. 400 voor foutje v/d gebruiker, 404 voor niet gevonden) aan de melding vast
  err.statusCode = statusCode;
  
  // En stuur het hele 'verkeerd-ingevulde'-spulletje linea recta naar het vangnet hier bovenaan
  return err;
};