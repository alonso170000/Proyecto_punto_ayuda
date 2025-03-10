const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");

const verifyToken = require("./middlewares/auth");
const usuariosRoute = require('./routes/usuarios');
const puntosRoute = require('./routes/puntos_ayuda');
const solicitudRoute = require('./routes/solicitudes_ayuda');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/login", (req, res) => {
    const user = {
        id: 1,
        nombre: "Alonso",
        email: "alonso@email.com",
    };
  
    jwt.sign({ user }, "secretkey", { expiresIn: "2h" }, (err, token) => {
        res.json({ token });
    });
  });  

// Rutas
app.use('/api', verifyToken, usuariosRoute);
app.use('/api', verifyToken, puntosRoute);
app.use('/api', verifyToken, solicitudRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});