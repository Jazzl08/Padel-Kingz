import * as authService from '../services/auth.service.js';

// Functie voor het maken van een nieuw account (registreren)
export const register = async (req, res, next) => {
  try {
    // Probeer een nieuwe gebruiker te maken met de gegevens uit het formulier (req.body)
    const { user, token } = await authService.registerUser(req.body);

    // Zet een veilige "cookie" in de browser, dat is een soort digitaal stempeltje zodat je ingelogd blijft
    res.cookie('token', token, {
      httpOnly: true, // Zorgt ervoor dat hackers de cookie niet via code kunnen stelen
      secure: process.env.NODE_ENV === 'production', // Alleen via veilige (https) verbindingen in productie (live)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Nodig als de backend en frontend op verschillende servers staan
      path: '/', // De cookie is overal op de website geldig
      maxAge: 7 * 24 * 60 * 60 * 1000, // De cookie blijft 7 dagen geldig
    });

    // Stuur een bevestiging terug dat de registratie is gelukt
    res.status(201).json({ message: 'Registratie geslaagd!', user, token });
  } catch (err) {
    // Als er iets fout gaat, stuur de fout door naar de algemene foutafhandeling
    next(err);
  }
};

// Functie voor het inloggen op een bestaand account
export const login = async (req, res, next) => {
  try {
    // Probeer in te loggen met de ingevulde gegevens (email en wachtwoord)
    const { user, token } = await authService.loginUser(req.body);

    // Net als bij registratie, zet hier de "cookie" in de browser zodat je ingelogd bent
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
      path: '/', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dagen geldig
    });

    // Stuur een bericht terug dat de login is gelukt
    res.json({ message: 'Ingelogd!', user, token });
  } catch (err) {
    // Stuur eventuele fouten (zoals een verkeerd wachtwoord) door
    next(err);
  }
};

// Functie voor het uitloggen
export const logout = (req, res) => {
  // Verwijder de "cookie" van de gebruiker. Hierdoor ben je niet meer ingelogd
  res.clearCookie('token', {
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  // Stuur een berichtje dat het uitloggen is gelukt
  res.json({ message: 'Uitgelogd.' });
};

// Functie om de gegevens van de huidig ingelogde speler op te vragen ("wie ben ik?")
export const getMe = (req, res) => {
  // Stuur de informatie van de speler terug. Als er niemand is ingelogd, stuur "null" (niks) terug
  res.json({ user: req.user || null });
};