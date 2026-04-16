// Zorgt ervoor dat we bepalen welke rollen (zoals speler, scheids, admin) op bepaalde pagina's mogen
export const requireRole = (roles) => {
    // Dit geeft een controleur (middleware) terug voor express
    return (req, res, next) => {
        // Zorg dat we altijd met een lijstje werken, zelfs als er maar 1 rol is meegegeven
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Heeft deze bezoeker geen rol of zit hun rol niet in de toegestane lijst? Stop ze dan direct!
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            // Ze worden geblokkeerd en we geven aan dat ze geen rechten (forbidden/403) hebben
            return res.status(403).json({ message: "Verboden: Je hebt hier geen rechten voor" });
        }
        // Als ze de juiste rol wel hebben, mogen ze door naar wat ze wilden
        next();
    };
};