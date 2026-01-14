import { Router } from 'express';
import { generateSuggestions } from '../controllers/bettingController.js';

const router = Router();

/**
 * Health check endpoint
 * GET /health - Returns server status
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'up',
    message: '365scores AI-Betting Server is running'
  });
});

/**
 * AI Betting suggestion generation endpoint
 * POST /api/generate-suggestions - Generates betting suggestions using AI
 */
router.post('/api/generate-suggestions', generateSuggestions);

export default router;
