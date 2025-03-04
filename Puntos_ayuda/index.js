const express = require('express');
const app = express();

const usuariosRoute = require('./routes/usuarios');
const puntosRoute = require('./routes/puntos_ayuda');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', usuariosRoute);
app.use('/api', puntosRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});