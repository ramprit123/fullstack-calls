import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Docs', version: '1.0.0' },
  },
  apis: [],
};

const specs = swaggerJSDoc(options);
const router = express.Router();
router.use('/', swaggerUi.serve, swaggerUi.setup(specs));

export default { router };
