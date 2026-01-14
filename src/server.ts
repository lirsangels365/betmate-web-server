import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bettingRoutes from "./routes/bettingRoutes.js";

// Load environment variables
dotenv.config();

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

  // Routes
  app.use("/", bettingRoutes);

  return app;
}

/**
 * Start the Express server
 */
function startServer(): void {
  const app = createServer();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Start the server
startServer();
