const express = require('express');
const router = express.Router();
const { connection } = require('../config/config.db'); // Importar la conexión a la base de datos

// Función para registrar un nuevo punto de ayuda
const postPuntoAyuda = (req, res) => {
    const { nombre, direccion, latitud, longitud, capacidad, recursos, contacto, creado_por } = req.body;

    // Verificar si el usuario que hace la solicitud es un administrador
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [creado_por], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        if (results.length === 0 || results[0].tipo !== 'administrador') {
            return res.status(403).json({ mensaje: 'No tienes permisos para registrar puntos de ayuda' });
        }

        // Insertar nuevo punto de ayuda en la base de datos
        connection.query(
            'INSERT INTO puntos_ayuda (nombre, direccion, latitud, longitud, capacidad, recursos, contacto, creado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, direccion, latitud, longitud, capacidad, recursos, contacto, creado_por],
            (err, result) => {
                if (err) {
                    console.error('Error al insertar punto de ayuda:', err);
                    return res.status(500).json({ mensaje: 'Error interno del servidor' });
                }

                res.status(201).json({ mensaje: 'Punto de ayuda registrado exitosamente', id: result.insertId });
            }
        );
    });
};





// Servicio GET para obtener todas las carreras
const getCarreras = (req, res) => {
    connection.query(
        "SELECT * FROM tbl_carrera",
        (error, results) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.status(200).json(results);
        }
    );
};

// Servicio POST para agregar una nueva carrera
const postCarrera = (req, res) => {
    const { carrera, descripcion } = req.body;

    // Validar que los campos no estén vacíos
    if (!carrera || !descripcion) {
        return res.status(400).json({ error: 'Los campos carrera y descripcion son obligatorios.' });
    }

    connection.query(
        "INSERT INTO tbl_carrera (UNCR_CARRERA, UNCR_DESCRIPICION) VALUES (?, ?)",
        [carrera, descripcion],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.status(201).json({ "Carrera añadida correctamente": results.affectedRows });
        }
    );
};

// Ruta para registrar un punto de ayuda
router.post('/puntos/post', postPuntoAyuda);

module.exports = router;