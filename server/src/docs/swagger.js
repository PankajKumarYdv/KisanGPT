import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KisanGPT API',
      version: '1.0.0',
      description: 'API documentation for KisanGPT AI Multi-Agent Platform',
    },
    servers: [
      {
        url: '/api',
        description: 'Base API Endpoint',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token to access protected routes',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operation completed successfully.' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation failed.' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email address.' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/routes/**/*.js', './src/app.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
