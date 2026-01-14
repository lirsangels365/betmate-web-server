import { Request, Response } from "express";
import { sendToN8n, N8nPayload } from "../services/n8nService.js";
import { fetchGamesFromApi } from "../services/gamesApiService.js";
import {
  MOCK_USER_PREFERENCES,
  MOCK_DATE_FILTERS,
  UserPreferences,
} from "../data/userPreferences.js";

/**
 * TypeScript interfaces for the games-bets-suggestions endpoint
 */

/**
 * Competitor information
 */
interface Competitor {
  id: string;
  name: string;
  logo: string;
}

/**
 * Odds object with one, X (optional), two values
 */
interface Odds {
  one: number;
  X?: number; // Optional: Draw odds (not applicable for all bet types)
  two: number;
}

/**
 * Bet information
 */
interface Bet {
  betLineId: string;
  betTypeName: string;
  ai_insight: string;
  odds: Odds;
  bookie_link: string;
}

/**
 * Game information
 */
interface Game {
  gameId: string;
  date: string;
  statusText: string;
  competitor1: Competitor;
  competitor2: Competitor;
  venue: string;
  bets: Bet[];
}

/**
 * Response structure for games-bets-suggestions endpoint
 */
interface GamesBetsSuggestionsResponse {
  suggestions: Game[];
}

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
        id: "1",
        event: "Manchester United vs Liverpool",
        odds: 2.5,
        sport: "Football",
      },
      {
        id: "2",
        event: "Lakers vs Warriors",
        odds: 1.8,
        sport: "Basketball",
      },
    ],
    userFavorites: [
      {
        id: "fav1",
        name: "Football",
        category: "sport",
      },
      {
        id: "fav2",
        name: "Premier League",
        category: "league",
      },
    ],
  };
}

/**
 * Controller to handle the generate-suggestions endpoint
 * Orchestrates data fetching and n8n communication
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function generateSuggestions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userId, filters } = req.body as GenerateSuggestionsRequest;

    // Validate required fields
    if (!userId) {
      res.status(400).json({
        error: "userId is required in the request body",
      });
      return;
    }

    // Step 1: Fetch sports data for the user
    const sportsData = await getSportsData(userId);

    // Step 2: Prepare payload for n8n
    const n8nPayload: N8nPayload = {
      userId,
      sportsData,
      filters: filters || {},
    };

    // Step 3: Send data to n8n webhook
    const n8nResponse = await sendToN8n(n8nPayload);

    // Step 4: Return success response with n8n results
    res.status(200).json({
      success: true,
      message: "Betting suggestions generated successfully",
      data: n8nResponse,
    });
  } catch (error) {
    // Error handling: Return 500 status with clean error message
    console.error("Error generating suggestions:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating suggestions",
    });
  }
}

/**
 * Mock games data following the exact structure required
 */
const MOCK_GAMES: Game[] = [
  {
    gameId: "game-001",
    date: "2024-01-15T20:00:00Z",
    statusText: "Upcoming",
    competitor1: {
      id: "team-001",
      name: "Manchester United",
      logo: "https://example.com/logos/manchester-united.png",
    },
    competitor2: {
      id: "team-002",
      name: "Liverpool FC",
      logo: "https://example.com/logos/liverpool.png",
    },
    venue: "Old Trafford",
    bets: [
      {
        betLineId: "bet-001",
        betTypeName: "Match Result",
        ai_insight: "AI analysis in progress...",
        odds: {
          one: 2.1,
          X: 3.4,
          two: 3.2,
        },
        bookie_link: "https://example.com/bookie/bet-001",
      },
      {
        betLineId: "bet-002",
        betTypeName: "Over/Under 2.5 Goals",
        ai_insight: "AI analysis in progress...",
        odds: {
          one: 1.85,
          two: 1.95,
        },
        bookie_link: "https://example.com/bookie/bet-002",
      },
    ],
  },
  {
    gameId: "game-002",
    date: "2024-01-16T18:30:00Z",
    statusText: "Upcoming",
    competitor1: {
      id: "team-003",
      name: "Barcelona",
      logo: "https://example.com/logos/barcelona.png",
    },
    competitor2: {
      id: "team-004",
      name: "Real Madrid",
      logo: "https://example.com/logos/real-madrid.png",
    },
    venue: "Camp Nou",
    bets: [
      {
        betLineId: "bet-003",
        betTypeName: "Match Result",
        ai_insight: "AI analysis in progress...",
        odds: {
          one: 2.5,
          X: 3.1,
          two: 2.8,
        },
        bookie_link: "https://example.com/bookie/bet-003",
      },
      {
        betLineId: "bet-004",
        betTypeName: "Both Teams to Score",
        ai_insight: "AI analysis in progress...",
        odds: {
          one: 1.65,
          two: 2.2,
        },
        bookie_link: "https://example.com/bookie/bet-004",
      },
      {
        betLineId: "bet-005",
        betTypeName: "Over/Under 3.5 Goals",
        ai_insight: "AI analysis in progress...",
        odds: {
          one: 2.1,
          two: 1.7,
        },
        bookie_link: "https://example.com/bookie/bet-005",
      },
    ],
  },
];

/**
 * Path and query parameters interface for games-bets-suggestions endpoint
 * userId is mandatory (path parameter)
 * entityId, entityType, and lang are optional (query parameters)
 */
interface GamesBetsSuggestionsParams {
  userId: string; // Mandatory: User ID from path parameter
}

interface GamesBetsSuggestionsQuery {
  entityId?: string; // Optional: Entity ID filter
  entityType?: string; // Optional: Entity type filter
  lang?: string; // Optional: Language code for localized content
}

/**
 * Controller to handle the GET /api/v1/games-bets-suggestions/:userId endpoint
 * Returns mock game suggestions with betting information
 * @param {Request} req - Express request object with path and query parameters
 * @param {Response} res - Express response object
 */
export async function getGameSuggestions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Extract userId from path parameter (mandatory)
    const userId = req.params.userId;

    // Extract optional query parameters
    const { entityId, entityType, lang } =
      req.query as GamesBetsSuggestionsQuery;

    // Validate mandatory userId
    if (!userId) {
      res.status(400).json({
        success: false,
        error: "userId is required as a path parameter",
      });
      return;
    }

    // Log incoming request parameters for debugging
    console.log(
      "GET /api/v1/games-bets-suggestions/:userId - Request parameters:",
      {
        userId,
        entityId,
        entityType,
        lang,
      }
    );

    // TODO: Replace with actual user preferences fetch from external API
    // For now, using mock user preferences
    const userPreferences: UserPreferences = {
      ...MOCK_USER_PREFERENCES,
      userId, // Use the userId from the path parameter
    };

    // Fetch games from external 365scores API and extract game IDs
    console.log("Fetching games from 365scores API...");
    const gameIds = await fetchGamesFromApi(
      userPreferences,
      MOCK_DATE_FILTERS
    );

    // Log the extracted game IDs
    console.log("=== Extracted Game IDs ===");
    console.log("Total Game IDs:", gameIds.length);
    console.log("Game IDs:", gameIds);
    console.log("=== End of Game IDs ===");

    // TODO: Transform external API response to match GamesBetsSuggestionsResponse
    // For now, return mock data until we adapt to the external API response structure
    const response: GamesBetsSuggestionsResponse = {
      suggestions: MOCK_GAMES,
    };

    // Return 200 OK with suggestions
    res.status(200).json(response);
  } catch (error) {
    // Error handling: Return 500 status with clean error message
    console.error("Error getting game suggestions:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching game suggestions",
    });
  }
}
