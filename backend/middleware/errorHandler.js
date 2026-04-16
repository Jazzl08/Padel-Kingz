// Dit scriptje vangt fouten op zodat de hele server niet crasht
export const errorHandler = (err, req, res, next) => {
  // Schrijf de fout in de console (zodat wij als bouwers het kunnen zien)
  console.error(' Fout:', err.message);

  // Kijk welke code de fout heeft (bijvoorbeeld: 404 is niet gevonden, 500 is een storing)
  const statusCode = err.statusCode || 500;
  
  // Kijk of het een grote crash (500) op de server is
  const isServerFout = statusCode === 500;
  
  // Als we online (in productie) zijn, laat bezoekers geen moeilijke foutmelding zien
  const message = isServerFout && process.env.NODE_ENV === 'production'
    ? 'Oeps, onze server heeft even een time-out. Probeer het over een paar minuten opnieuw.' 
    // Anders (bijvoorbeeld tijdens het bouwen) laat de echte foutmelding zien
    : (err.message || 'Interne serverfout');

  // Stuur de fout via JSON (data formaat) terug met de juiste code
  res.status(statusCode).json({
    error: message,
    // Laat de exacte coderegel zien waar de fout op trad als we lokaal aan het testen zijn
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Hulpmiddeltje om snel een specifieke fout te kunnen maken in de code
export const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};