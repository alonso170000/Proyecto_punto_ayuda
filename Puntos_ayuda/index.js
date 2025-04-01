const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const swaggerDocs = require("./config/swaggerConfig"); 
const bcrypt = require('bcryptjs');
const { connection } = require('./config/config.db');
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
// Rutas públicas (sin autenticación)

/*app.post("/api/login", (req, res) => {
    const user = {
        id: 1,
        nombre: "Alonso",
        email: "alonso@email.com"
    };
  
    jwt.sign({ user }, "secretkey", { expiresIn: "2h" }, (err, token) => {
        if (err) {
            return res.status(500).json({ error: "Error al generar token" });
        }
        res.json({ token });
    });
});
*/


// Ruta de login adaptada para MySQL
app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if(!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      // Consulta usando los nombres exactos de la BD
      const query = 'SELECT id, nombre, email, contraseña, tipo, telefono FROM usuarios WHERE email = ?';
      
      connection.query(query, [email], async (err, results) => {
        if (err) {
          console.error('Error en consulta MySQL:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: 'Usuario no registrado' });
        }

        const user = results[0];
        
        // Debug con nombres reales
        console.log('Datos del usuario:', {
          id: user.id,
          email: user.email,
          tieneContraseña: !!user.contraseña
        });
        
        if (!user.contraseña) {
          return res.status(500).json({ error: 'Error en configuración de usuario' });
        }
        
        // Comparación usando el campo contraseña
        const isMatch = await bcrypt.compare(password, user.contraseña);
        if (!isMatch) {
          return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        console.log( 'Contraseña correcta para el usuario:', user.email);
        // Generar token con los datos reales
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email,
            tipo: user.tipo
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        // Respuesta con la estructura de tu BD
        res.json({ 
          token,
          user: {
            id: user.id,
            nombre: user.nombre,  // Usando nombre en lugar de name
            email: user.email,
            tipo: user.tipo,
            telefono: user.telefono // Incluyendo el teléfono si es necesario
          }
        });
      });
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas protegidas (requieren autenticación)
app.use('/api/usuarios', verifyToken, usuariosRoute);
app.use('/api/puntos', verifyToken, puntosRoute);
app.use('/api/solicitudes', verifyToken, solicitudRoute);

// Iniciar Swagger
swaggerDocs(app);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});