import { Request, Response } from 'express';
import { sendToN8n, N8nPayload } from '../services/n8nService.js';

/**
 * Interface for the request body of generate-suggestions endpoint
 */
interface GenerateSuggestionsRequest {
  userId: string;
  filters?: Record<string, unknown>;
}

/**
 * Interface for sports data structure
 */
interface SportsData {
  odds: Array<{
    id: string;
    event: string;
    odds: number;
    [key: string]: unknown;
  }>;
  userFavorites: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
}

/**
 * Placeholder function to fetch sports data for a user
 * TODO: Replace with actual data fetching logic
 * @param {string} userId - The user ID to fetch data for
 * @returns {Promise<SportsData>} Mock sports data including odds and user favorites
 */
async function getSportsData(userId: string): Promise<SportsData> {
  // Placeholder implementation - returns mock data
  // In production, this would fetch from a database or external API
  return {
    odds: [
      {
        id: '1',
        event: 'Manchester United vs Liverpool',
        odds: 2.5,
        sport: 'Football'
      },
      {
        id: '2',
        event: 'Lakers vs Warriors',
        odds: 1.8,
        sport: 'Basketball'
      }
    ],
    userFavorites: [
      {
        id: 'fav1',
        name: 'Football',
        category: 'sport'
      },
      {
        id: 'fav2',
        name: 'Premier League',
        category: 'league'
      }
    ]
  };
}

/**
 * Controller to handle the generate-suggestions endpoint
 * Orchestrates data fetching and n8n communication
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function generateSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const { userId, filters } = req.body as GenerateSuggestionsRequest;

    // Validate required fields
    if (!userId) {
      res.status(400).json({
        error: 'userId is required in the request body'
      });
      return;
    }

    // Step 1: Fetch sports data for the user
    const sportsData = await getSportsData(userId);

    // Step 2: Prepare payload for n8n
    const n8nPayload: N8nPayload = {
      userId,
      sportsData,
      filters: filters || {}
    };

    // Step 3: Send data to n8n webhook
    const n8nResponse = await sendToN8n(n8nPayload);

    // Step 4: Return success response with n8n results
    res.status(200).json({
      success: true,
      message: 'Betting suggestions generated successfully',
      data: n8nResponse
    });
  } catch (error) {
    // Error handling: Return 500 status with clean error message
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while generating suggestions'
    });
  }
}
