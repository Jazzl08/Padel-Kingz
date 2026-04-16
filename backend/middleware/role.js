// Extra controlepoortje: Hiermee kunnen we straks per web-link hard instellen dat alleen een bépaald type gebruiker op die link de actie mag uitvoeren
// Bijvoorbeeld: requireRole(['admin', 'player']) <- Alleen als je beheerder óf speler (geen anoniemeling) bet, mag je er in!
export const requireRole = (roles) => {
    // Geef deze blokkeer-functie ('middleware') terug in de weblinks (routers)
    return (req, res, next) => {
        // Maak even een net lijstje aan (een zogenaamde 'array') van welke rollen wel/niet zijn toegestaan in de vraag van de weblink
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Is de bezoeker onbekend? OF Staat de titel (de rol, bijv 'admin') van deze gebruiker niet in de lijst met toegestane mensen? 
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            // STOP! Toegang hard verboden (403). De bezoeker heeft niet de benodigde status als de koning of de speler. 
            return res.status(403).json({ message: "Verboden: Je hebt hier niet de juiste toegangsrechten voor." });
        }
        
        // Hoor je er wel bij? Dan verlaat je ongedeerd het beveiligingshokje en mag je door ("next()") naar de backend controller!
        next();
    };
};