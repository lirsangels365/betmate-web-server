import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve paths relative to the config file location
// Works in both development (tsx) and production (compiled) modes
const routesPath = resolve(__dirname, '../routes/*.ts');
const controllersPath = resolve(__dirname, '../controllers/*.ts');
const compiledRoutesPath = resolve(__dirname, '../routes/*.js');
const compiledControllersPath = resolve(__dirname, '../controllers/*.js');

// Use .ts files if they exist (development), otherwise use .js (production)
const apiPaths = [];
if (existsSync(resolve(__dirname, '../routes'))) {
  apiPaths.push(routesPath, controllersPath);
}
// Also include compiled paths for production builds
apiPaths.push(compiledRoutesPath, compiledControllersPath);

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BetMate Web Server API',
    version: '1.0.0',
    description: 'AI-powered betting recommendation server API documentation',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Betting',
      description: 'AI betting suggestion endpoints',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: apiPaths, // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
