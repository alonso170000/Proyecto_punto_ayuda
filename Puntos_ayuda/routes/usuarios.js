const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { connection } = require('../config/config.db'); // Importar la conexión a la base de datos

// Servicio POST para registrar admin
const postAdmin = (req, res) => {
    const { superadmin_id, nombre, email, contraseña, telefono } = req.body;

    // Verificar si el usuario que hace la solicitud es un súper administrador
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [superadmin_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        // Verificar si el usuario existe y es superadmin
        if (results.length === 0 || results[0].tipo !== 'superadmin') {
            return res.status(403).json({ mensaje: 'No tienes permisos para registrar administradores' });
        }

        // Hashear la contraseña antes de guardarla
        bcrypt.hash(contraseña, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al encriptar la contraseña:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            // Insertar nuevo administrador en la base de datos
            connection.query(
                'INSERT INTO usuarios (nombre, email, contraseña, telefono, tipo) VALUES (?, ?, ?, ?, "administrador")',
                [nombre, email, hashedPassword, telefono],
                (err, result) => {
                    if (err) {
                        console.error('Error al insertar administrador:', err);
                        return res.status(500).json({ mensaje: 'Error interno del servidor' });
                    }

                    res.status(201).json({ mensaje: 'Administrador registrado exitosamente' });
                }
            );
        });
    });
};






// Servicio GET para obtener todos los alumnos
const getAlumnos = (req, res) => {
    connection.query(
        "SELECT * FROM tbl_alumno",
        (error, results) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.status(200).json(results);
        }
    );
};

// Servicio GET para obtener los alumnos de una carrera específica
const getAlumnosByCarrera = (req, res) => {
    const { id } = req.params; // Obtener el ID de la carrera desde la URL

    connection.query(
        `SELECT a.UNAL_ID, a.UNAL_NOMBRE, a.UNAL_APELLIDO, a.UNAL_EDAD, a.UNAL_EMAIL, c.UNCR_CARRERA 
         FROM tbl_alumno a INNER JOIN tbl_carrera c ON a.UNAL_UNCR_ID = c.UNCR_ID WHERE c.UNCR_ID = ?`,
        [id],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }

            if (results.length === 0) {
                return res.status(404).json({ mensaje: "No hay alumnos en esta carrera." });
            }

            res.status(200).json(results);
        }
    );
};


const deleteAlumno = (req, res) => {
    const { id } = req.params; // Obtener el ID de la carrera desde la URL

    connection.query(
        `DELETE FROM tbl_alumno WHERE UNAL_ID = ?`,
        [id],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }

            if (results.length === 0) {
                return res.status(404).json({ mensaje: "No hay alumnos en esta carrera." });
            }

            res.status(200).json(results);
        }
    );
};



// Rutas
router.get('/alumnos', getAlumnos);   // Obtener todos los alumnos
router.get('/alumnos/carrera/:id', getAlumnosByCarrera); // Obtener alumnos por carrera
router.get('/alumnos/eliminar/:id', deleteAlumno);

// Eliminar alumno
router.post('/admin/post', postAdmin);      // Agregar un nuevo usuario

module.exports = router;