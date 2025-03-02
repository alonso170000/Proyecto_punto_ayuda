const express = require('express');
const app = express();

//const alumnosRoute = require('./routes/alumnos');
//const carrerasRoute = require('./routes/carreras');

const usuariosRoute = require('./routes/usuarios');
const puntosRoute = require('./routes/puntos_ayuda');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas

app.use('/api', usuariosRoute);
app.use('/api', puntosRoute);
//app.use('/api', alumnosRoute);
//app.use('/api', carrerasRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});