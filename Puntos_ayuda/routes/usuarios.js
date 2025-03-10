const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { connection } = require('../config/config.db'); // Importar la conexión a la base de datos

// Servicio GET para obtener todas los puntos de ayuda
// localhost:3000/api/admin/get/1?superadmin_id=1
const getAdmin = (req, res) => {
    // Recibir el ID del superadmin desde la consulta 
    const { superadmin_id } = req.query;

    // Verificar si el usuario que hace la solicitud es un superadmin
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [superadmin_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        if (results.length === 0 || results[0].tipo !== 'superadmin') {
            return res.status(403).json({ mensaje: 'No tienes permisos para ver administradores' });
        }

        // Obtener los puntos de ayuda en la base de datos
        connection.query('SELECT * FROM usuarios WHERE tipo = "administrador"', (err, rows) => {
            if (err) {
                console.error('Error al obtener administradores:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            res.status(200).json(rows);
        });
    });
};

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
                return res.status(500).json({ mensaje: 'Error interno del servidor aa' });
            }

            // Insertar nuevo administrador en la base de datos
            connection.query(
                'INSERT INTO usuarios (nombre, email, contraseña, telefono, tipo) VALUES (?, ?, ?, ?, "administrador")',
                [nombre, email, hashedPassword, telefono],
                (err, result) => {
                    if (err) {
                        console.error('Error al insertar administrador:', err);
                        return res.status(500).json({ mensaje: 'Error interno del servidor bb' });
                    }

                    res.status(201).json({ mensaje: 'Administrador registrado exitosamente' });
                }
            );
        });
    });
};


// Servicio DELETE para eliminar un admin
const deleteAdmin = (req, res) => {
    const { superadmin_id, admin_id } = req.body;

    // Verificar si el usuario que hace la solicitud es un súper administrador
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [superadmin_id], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }

        if (results.length === 0 || results[0].tipo !== "superadmin") {
            return res.status(403).json({ mensaje: "No tienes permisos para eliminar administradores" });
        }

        // Verificar si el administrador existe
        connection.query('SELECT * FROM usuarios WHERE id = ? AND tipo = "administrador"', [admin_id], (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ mensaje: "Error interno del servidor" });
            }

            if (results.length === 0) {
                return res.status(404).json({ mensaje: "Administrador no encontrado" });
            }

            // Eliminar administrador
            connection.query('DELETE FROM usuarios WHERE id = ?', [admin_id], (err, result) => {
                if (err) {
                    console.error("Error al eliminar administrador:", err);
                    return res.status(500).json({ mensaje: "Error interno del servidor" });
                }

                res.status(200).json({ mensaje: "Administrador eliminado correctamente" });
            });
        });
    });
};

const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, contraseña, telefono } = req.body;

        if (!nombre || !email || !contraseña || !telefono) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
        }

        // Verificar si el email ya está registrado
        connection.query('SELECT id FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            if (results.length > 0) {
                return res.status(400).json({ mensaje: "El correo electrónico ya está en uso." });
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10);

            // Insertar nuevo usuario en la base de datos
            connection.query(
                'INSERT INTO usuarios (nombre, email, contraseña, telefono, tipo) VALUES (?, ?, ?, ?, "usuario")',
                [nombre, email, hashedPassword, telefono],
                (err, result) => {
                    if (err) {
                        console.error('Error al registrar usuario:', err);
                        return res.status(500).json({ mensaje: 'Error interno del servidor' });
                    }

                    res.status(201).json({ mensaje: "Usuario registrado exitosamente", id: result.insertId });
                }
            );
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// Rutas
router.get('/admin/get/:id', getAdmin);
router.post('/admin/post', postAdmin);
router.post('/usuario/post', registrarUsuario);
router.delete('/admin/delete', deleteAdmin);

module.exports = router;