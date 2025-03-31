const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const swaggerDocs = require("./config/swaggerConfig"); 

const verifyToken = require("./middlewares/auth");
const usuariosRoute = require('./routes/usuarios');
const puntosRoute = require('./routes/puntos_ayuda');
const solicitudRoute = require('./routes/solicitudes_ayuda');

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Generar un token de autenticación
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "alonso@email.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Token generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       500:
 *         description: Error en el servidor.
 */ 
app.post("/api/login", (req, res) => {
    const user = {
        id: 1,
        nombre: "Alonso",
        email: "alonso@email.com"
    };
  
    jwt.sign({ user }, "secretkey", { expiresIn: "2h" }, (err, token) => {
        res.json({ token });
    });
  });  

// Rutas
app.use('/api', verifyToken, usuariosRoute);
app.use('/api', verifyToken, puntosRoute);
app.use('/api', verifyToken, solicitudRoute);

// Iniciar Swagger
swaggerDocs(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});