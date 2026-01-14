import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import bettingRoutes from "./routes/bettingRoutes.js";
import { initializeLineTypes } from "./data/lineTypes.js";

// Load environment variables
// Use process.cwd() to get project root, or fallback to relative path
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple paths to find .env file
const envPaths = [
  resolve(process.cwd(), ".env"), // Project root from current working directory
  join(__dirname, "..", ".env"), // One level up from src/
  join(__dirname, "..", "..", ".env"), // Two levels up (if running from dist/)
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    console.log(`Loaded .env from: ${envPath}`);
    break;
  }
}

if (!envLoaded) {
  // Fallback to default dotenv behavior
  dotenv.config();
  console.log("Using default .env loading (from process.cwd())");
}

// Log environment configuration (for debugging)
console.log("Environment loaded:");
console.log("  PORT:", process.env.PORT || "3000 (default)");
console.log(
  "  N8N_WEBHOOK_URL:",
  process.env.N8N_WEBHOOK_URL ? "✓ Configured" : "✗ Not configured"
);

/**
 * Initialize and configure the Express server
 * @returns {Express} Configured Express application
 */
function createServer(): Express {
  const app = express();

  // Middleware: CORS - Allow all origins for development
  app.use(cors());

  // Middleware: Parse JSON bodies
  app.use(express.json());

  // Middleware: Simple logging - prints every request method and URL
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Swagger API Documentation
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "BetMate API Documentation",
    })
  );

  // Routes
  app.use("/", bettingRoutes);

  return app;
}

/**
 * Start the Express server
 * Initializes line types from external API before starting the server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize line types from external API before starting the server
    await initializeLineTypes();

    const app = createServer();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
