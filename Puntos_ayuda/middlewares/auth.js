const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ")[1]; // Extraer el token
        req.token = bearerToken;

        jwt.verify(req.token, "secretkey", (error, authData) => {
            if (error) {
                return res.sendStatus(403); // Acceso prohibido si el token es inválido
            } else {
                req.authData = authData; // Almacenar los datos del usuario en la request
                next(); // Continuar con la ejecución de la ruta
            }
        });
    } else {
        res.sendStatus(403); // Acceso prohibido si no hay token
    }
}

module.exports = verifyToken;
