import { Router } from "express";
import { generateSuggestions } from "../controllers/bettingController.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the server to verify it's running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running and healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: up
 *                   description: Server status indicator
 *                 message:
 *                   type: string
 *                   example: 365scores AI-Betting Server is running
 *                   description: Human-readable status message
 */
router.get("/health", (req, res) => {
  res.json({
    status: "up",
    message: "365scores AI-Betting Server is running",
  });
});

/**
 * AI Betting suggestion generation endpoint
 * POST /api/generate-suggestions - Generates betting suggestions using AI
 */
router.post("/api/generate-suggestions", generateSuggestions);

export default router;
