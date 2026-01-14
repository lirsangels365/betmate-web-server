import { Router } from "express";
import {
  generateSuggestions,
  getGameSuggestions,
} from "../controllers/bettingController.js";

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

/**
 * @swagger
 * /api/v1/games-bets-suggestions/{userId}:
 *   get:
 *     summary: Get game betting suggestions
 *     description: Returns a list of games with betting suggestions including odds and AI insights
 *     tags: [Betting]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for personalized suggestions (mandatory)
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *         description: Entity ID filter (optional)
 *         required: false
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Entity type filter (optional)
 *         required: false
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         description: Language code for localized content (optional)
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully retrieved game betting suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       gameId:
 *                         type: string
 *                       date:
 *                         type: string
 *                       statusText:
 *                         type: string
 *                       competitor1:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           logo:
 *                             type: string
 *                       competitor2:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           logo:
 *                             type: string
 *                       venue:
 *                         type: string
 *                       bets:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             betLineId:
 *                               type: string
 *                             betTypeName:
 *                               type: string
 *                             ai_insight:
 *                               type: string
 *                             odds:
 *                               type: object
 *                               properties:
 *                                 one:
 *                                   type: number
 *                                   description: Odds for competitor1/option 1
 *                                 X:
 *                                   type: number
 *                                   description: Draw odds (optional, not applicable for all bet types)
 *                                 two:
 *                                   type: number
 *                                   description: Odds for competitor2/option 2
 *                             bookie_link:
 *                               type: string
 *       500:
 *         description: Internal server error
 */
router.get("/api/v1/games-bets-suggestions/:userId", getGameSuggestions);

export default router;
