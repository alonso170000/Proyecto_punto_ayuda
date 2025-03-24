const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gestión de Ayuda',
            version: '1.0.0',
            description: 'Documentación de la API para gestionar puntos de ayuda, usuarios y solicitudes.',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Servidor local' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: { // Nombre del esquema de seguridad
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Formato del token
                },
            },
        },
    },
    apis: ['./index.js', './routes/*.js'], // Incluye index.js y los archivos de rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;