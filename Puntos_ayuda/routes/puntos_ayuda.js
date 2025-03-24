const express = require('express');
const router = express.Router();
const { connection } = require('../config/config.db'); // Importar la conexión a la base de datos

// Servicio GET para obtener todas los puntos de ayuda
// probar endpoint: localhost:3000/api/puntos/get?admin_id=2
const getPuntoAyuda = (req, res) => {
    // Recibir el ID del administrador desde la consulta
    const { admin_id } = req.query;

    // Verificar si el usuario que hace la solicitud es un administrador
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [admin_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        if (results.length === 0 || results[0].tipo !== 'administrador') {
            return res.status(403).json({ mensaje: 'No tienes permisos para ver los puntos de ayuda' });
        }

        // Obtener los puntos de ayuda en la base de datos
        connection.query('SELECT * FROM puntos_ayuda', (err, rows) => {
            if (err) {
                console.error('Error al obtener los puntos de ayuda:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            res.status(200).json(rows);
        });
    });
};

// Servicio GET para obtener los puntos de ayuda activos
const getPuntosActivos = (req, res) => {
    connection.query("SELECT * FROM puntos_ayuda WHERE estado = 'activo'", (error, results) => {
        if (error) {
            console.error("Error al obtener puntos de ayuda activos:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }
        res.status(200).json(results);
    });
};

// Servicio GET para obtener un punto de ayuda
// probar endpoint: localhost:3000/api/puntos/get/3
const getUnPuntoAyuda = (req, res) => {
    const { id } = req.params;

    // Obtener punto de ayuda en la base de datos
    connection.query('SELECT * FROM puntos_ayuda WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener los puntos de ayuda:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Punto de ayuda no encontrado' });
        }

        res.status(200).json(results[0]);
    });
};


// Servicio POST para registrar un nuevo punto de ayuda
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

// Servicio PUT para actualozar puntos de ayuda
// localhost:3000/api/puntos/put/3
const putPuntoAyuda = (req, res) => {
    const { id } = req.params;
    const { admin_id, nombre, direccion, latitud, longitud, capacidad, recursos, contacto, estado, creado_por } = req.body;

    if (!admin_id) {
        return res.status(400).json({ error: "Se requiere el ID del administrador." });
    }

    // Verificar si el usuario que hace la solicitud es un administrador
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [admin_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        if (results.length === 0 || results[0].tipo !== 'administrador') {
            return res.status(403).json({ mensaje: 'No tienes permisos para actualizar los puntos de ayuda' });
        }

        // Verificar si el punto de ayuda existe
        connection.query("SELECT * FROM puntos_ayuda WHERE id = ?", [id], (error, results) => {
            if (error) return res.status(500).json({ error: error.message });
            if (results.length === 0) return res.status(404).json({ mensaje: "Punto de ayuda no encontrado." });

            // Construir la consulta dinámicamente para solo actualizar los campos enviados
            let updates = [];
            let values = [];

            if (nombre) { updates.push("nombre = ?"); values.push(nombre); }
            if (direccion) { updates.push("direccion = ?"); values.push(direccion); }
            if (latitud) { updates.push("latitud = ?"); values.push(latitud); }
            if (longitud) { updates.push("longitud = ?"); values.push(longitud); }
            if (capacidad) { updates.push("capacidad = ?"); values.push(capacidad); }
            if (recursos) { updates.push("recursos = ?"); values.push(recursos); }
            if (contacto) { updates.push("contacto = ?"); values.push(contacto); }
            if (estado) { updates.push("estado = ?"); values.push(estado); }
            if (creado_por) { updates.push("creado_por = ?"); values.push(creado_por); }
            
            if (updates.length === 0) {
                return res.status(400).json({ mensaje: "No hay campos para actualizar." });
            }

            values.push(id);

            // Ejecutar la actualización
            connection.query(
                `UPDATE puntos_ayuda SET ${updates.join(", ")} WHERE id = ?`,
                values,
                (error, results) => {
                    if (error) return res.status(500).json({ error: error.message });
                    res.status(200).json({ mensaje: "Punto de ayuda actualizado correctamente" });
                }
            );
        });
    });
};


// Servicio DELETE para elimar puntos de ayuda
// localhost:3000/api/puntos/delete/4 
// en body: { "admin_id": 2 }
const deletePuntoAyuda = (req, res) => {
    const { id } = req.params;
    const { admin_id } = req.body;

    // Verificar si el usuario que hace la solicitud es un administrador o superadmin
    connection.query('SELECT tipo FROM usuarios WHERE id = ?', [admin_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }

        if (results.length === 0 || (results[0].tipo !== 'administrador' && results[0].tipo !== 'superadmin')) {
            return res.status(403).json({ mensaje: 'No tienes permisos para eliminar puntos de ayuda' });
        }

        // Verificar si el punto de ayuda existe antes de eliminarlo
        connection.query('SELECT * FROM puntos_ayuda WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            if (results.length === 0) {
                return res.status(404).json({ mensaje: 'Punto de ayuda no encontrado' });
            }

            // Eliminar el punto de ayuda
            connection.query('DELETE FROM puntos_ayuda WHERE id = ?', [id], (err, results) => {
                if (err) {
                    console.error('Error al eliminar punto de ayuda:', err);
                    return res.status(500).json({ mensaje: 'Error interno del servidor' });
                }

                res.status(200).json({ mensaje: 'Punto de ayuda eliminado correctamente' });
            });
        });
    });
};


/**
 * @swagger
 * /api/puntos/get:
 *   get:
 *     summary: Obtener todos los puntos de ayuda
 *     tags: [Puntos de Ayuda]
 *     security:
 *       - BearerAuth: []  # Aplica el esquema de seguridad BearerAuth
 *     parameters:
 *       - in: query
 *         name: admin_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *         description: ID del administrador que realiza la solicitud.
 *     responses:
 *       200:
 *         description: Lista de puntos de ayuda.
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
 *                     example: "Punto de Ayuda 1"
 *                   direccion:
 *                     type: string
 *                     example: "Calle Falsa 123"
 *                   latitud:
 *                     type: number
 *                     example: 40.416775
 *                   longitud:
 *                     type: number
 *                     example: -3.703790
 *                   capacidad:
 *                     type: integer
 *                     example: 100
 *                   recursos:
 *                     type: string
 *                     example: "Agua, comida, medicinas"
 *                   contacto:
 *                     type: string
 *                     example: "contacto@puntoayuda.com"
 *                   estado:
 *                     type: string
 *                     example: "activo"
 *                   creado_por:
 *                     type: integer
 *                     example: 2
 *       403:
 *         description: No tienes permisos para ver los puntos de ayuda.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/puntos/get', getPuntoAyuda);

/**
 * @swagger
 * /puntosactivos/get:
 *   get:
 *     summary: Obtener puntos de ayuda activos
 *     tags: [Puntos de Ayuda]
 *     description: Retorna una lista de puntos de ayuda con estado "activo".
 *     responses:
 *       200:
 *         description: Lista de puntos de ayuda activos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PuntoAyuda'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/puntosactivos/get', getPuntosActivos);

/**
 * @swagger
 * /puntos/get/{id}:
 *   get:
 *     summary: Obtener un punto de ayuda por ID
 *     tags: [Puntos de Ayuda]
 *     description: Retorna un punto de ayuda específico por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del punto de ayuda.
 *     responses:
 *       200:
 *         description: Punto de ayuda encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PuntoAyuda'
 *       404:
 *         description: Punto de ayuda no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/puntos/get/:id', getUnPuntoAyuda);

/**
 * @swagger
 * /puntos/post:
 *   post:
 *     summary: Registrar un nuevo punto de ayuda
 *     tags: [Puntos de Ayuda]
 *     description: Crea un nuevo punto de ayuda. Solo accesible por administradores.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevoPuntoAyuda'
 *     responses:
 *       201:
 *         description: Punto de ayuda registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 id:
 *                   type: integer
 *       403:
 *         description: No tienes permisos para registrar puntos de ayuda.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/puntos/post', postPuntoAyuda);

/**
 * @swagger
 * /puntos/put/{id}:
 *   put:
 *     summary: Actualizar un punto de ayuda
 *     tags: [Puntos de Ayuda]
 *     description: Actualiza un punto de ayuda existente. Solo accesible por administradores.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del punto de ayuda a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarPuntoAyuda'
 *     responses:
 *       200:
 *         description: Punto de ayuda actualizado correctamente.
 *       400:
 *         description: No hay campos para actualizar o falta el ID del administrador.
 *       403:
 *         description: No tienes permisos para actualizar puntos de ayuda.
 *       404:
 *         description: Punto de ayuda no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/puntos/put/:id', putPuntoAyuda);

/**
 * @swagger
 * /puntos/delete/{id}:
 *   delete:
 *     summary: Eliminar un punto de ayuda
 *     tags: [Puntos de Ayuda]
 *     description: Elimina un punto de ayuda existente. Solo accesible por administradores o superadministradores.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del punto de ayuda a eliminar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_id:
 *                 type: integer
 *                 description: ID del administrador que realiza la solicitud.
 *     responses:
 *       200:
 *         description: Punto de ayuda eliminado correctamente.
 *       403:
 *         description: No tienes permisos para eliminar puntos de ayuda.
 *       404:
 *         description: Punto de ayuda no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/puntos/delete/:id', deletePuntoAyuda);

module.exports = router;