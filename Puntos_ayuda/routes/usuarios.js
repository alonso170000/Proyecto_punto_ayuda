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

// Servicio GET para obtener todos los administradores
/**
 * @swagger
 * /admin/get/{id}:
 *   get:
 *     summary: Obtiene la lista de administradores
 *     tags: [Administradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del superadministrador
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: "Admin 1"
 *                   email:
 *                     type: string
 *                     example: "admin@example.com"
 *                   telefono:
 *                     type: string
 *                     example: "9999999999"
 *                   tipo:
 *                     type: string
 *                     example: "administrador"
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/admin/get/:id', getAdmin);// aki no le quite lo del principio de admin puede q de error

// Servicio POST para registrar un administrador
/**
 * @swagger
 * /admin/post:
 *   post:
 *     summary: Registra un nuevo administrador
 *     tags: [Administradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - superadmin_id
 *               - nombre
 *               - email
 *               - contraseña
 *               - telefono
 *             properties:
 *               superadmin_id:
 *                 type: integer
 *                 example: 1
 *               nombre:
 *                 type: string
 *                 example: "Nuevo Admin"
 *               email:
 *                 type: string
 *                 example: "nuevoadmin@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "password123"
 *               telefono:
 *                 type: string
 *                 example: "9999999999"
 *     responses:
 *       201:
 *         description: Administrador registrado exitosamente
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error en el servidor
 */
router.post('/admin/post', postAdmin);

// Servicio DELETE para eliminar un administrador
/**
 * @swagger
 * /admin/delete:
 *   delete:
 *     summary: Elimina un administrador
 *     tags: [Administradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - superadmin_id
 *               - admin_id
 *             properties:
 *               superadmin_id:
 *                 type: integer
 *                 example: 1
 *               admin_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Administrador eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Administrador no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.delete('/admin/delete', deleteAdmin);

// Servicio POST para registrar un usuario
/**
 * @swagger
 * /usuario/post:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - contraseña
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "password123"
 *               telefono:
 *                 type: string
 *                 example: "9999999999"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *                 id:
 *                   type: integer
 *                   example: 15
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error en el servidor
 */
router.post('/usuario/post', registrarUsuario);

module.exports = router;