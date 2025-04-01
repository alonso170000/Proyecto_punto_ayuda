const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    
    if (!bearerHeader) {
        console.log("Acceso denegado: No se proporcionó token");
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    console.log("[DEBUG] Header Authorization recibido:", bearerHeader);

    const token = bearerHeader.split(" ")[1]; // Extrae el token sin "Bearer"

    if (!token) {
        console.log("Acceso denegado: Formato de token incorrecto");
        return res.status(401).json({ mensaje: "Formato de token incorrecto" });
    }

    jwt.verify(token, "secretkey", (error, decoded) => {
        if (error) {
            console.log("Token inválido:", error.message);
            
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ mensaje: "Token expirado" });
            }
            
            return res.status(403).json({ mensaje: "Token inválido", error });
        }
        
        console.log(" Token verificado para usuario:", decoded.user);
        req.user = decoded.user;
        next();
    });
}

module.exports = verifyToken;
