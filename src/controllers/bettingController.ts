import { Request, Response } from "express";
import {
  sendToN8n,
  N8nPayload,
  sendToAIAgent,
} from "../services/n8nService.js";
import { fetchGamesFromApi } from "../services/gamesApiService.js";
import {
  fetchBetLinesFromApi,
  BetLinesExternalApiResponse,
  BetLine,
  PopulatedBetLine,
} from "../services/betLinesService.js";
import { LINE_TYPES_DATA } from "../data/lineTypes.js";
import { LineType } from "../services/lineTypeService.js";
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
 * Bet lines with game ID
 */
interface BetLinesWithGameId {
  gameId: number;
  Lines: BetLine[];
}

/**
 * Response structure for games-bets-suggestions endpoint
 */
interface GamesBetsSuggestionsResponse {
  betLines: BetLinesWithGameId[];
  lineTypes: LineType[];
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
 * Allowed BMID values for filtering bet lines
 */
const ALLOWED_BMIDS = [161, 14, 53, 139, 174, 156];

/**
 * Allowed LineType ID values for filtering line types
 */
const ALLOWED_LINE_TYPE_IDS = [144, 145, 3, 14, 1, 12, 137];

/**
 * Type guard to check if a bet line is populated (not empty)
 */
function isPopulatedBetLine(line: BetLine): line is PopulatedBetLine {
  return Object.keys(line).length > 0 && "BMID" in line;
}

/**
 * Filters bet lines and line types according to the specified criteria
 * A line is included only if BOTH conditions are met:
 * 1. BMID is in the allowed BMIDs list
 * 2. Type (lineType) is in the allowed LineType IDs list
 * @param betLinesWithGameIds - Array of bet lines with game IDs
 * @param lineTypes - Array of line types
 * @returns Filtered bet lines and line types
 */
function filterBetLinesAndLineTypes(
  betLinesWithGameIds: BetLinesWithGameId[],
  lineTypes: LineType[]
): {
  betLines: BetLinesWithGameId[];
  lineTypes: LineType[];
} {
  // Filter bet lines: only include populated lines that match BOTH conditions
  // 1. BMID must be in ALLOWED_BMIDS
  // 2. Type (lineType) must be in ALLOWED_LINE_TYPE_IDS
  const filteredBetLines = betLinesWithGameIds.map((item) => ({
    gameId: item.gameId,
    Lines: item.Lines.filter((line) => {
      if (!isPopulatedBetLine(line)) {
        return false; // Exclude empty bet lines
      }
      // Check both conditions: BMID AND Type must be in allowed lists
      const hasAllowedBMID = ALLOWED_BMIDS.includes(line.BMID);
      const hasAllowedType = ALLOWED_LINE_TYPE_IDS.includes(line.Type);
      return hasAllowedBMID && hasAllowedType;
    }),
  }));

  // Filter line types: only include line types with allowed IDs
  const filteredLineTypes = lineTypes.filter((lineType) =>
    ALLOWED_LINE_TYPE_IDS.includes(lineType.ID)
  );

  return {
    betLines: filteredBetLines,
    lineTypes: filteredLineTypes,
  };
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
    const allGameIds = await fetchGamesFromApi(
      userPreferences,
      MOCK_DATE_FILTERS
    );

    // Slice to get only the first 10 games (or less if there are fewer)
    const gameIds = allGameIds.slice(0, 10);

    // Log the extracted game IDs
    console.log("=== Extracted Game IDs ===");
    console.log("Total Game IDs:", gameIds.length);
    console.log("Game IDs:", gameIds);
    console.log("=== End of Game IDs ===");

    // Fetch bet lines for each game using Promise.all
    // Using uc=21 as shown in the example API call
    const UC_PARAMETER = 21;
    console.log("Fetching bet lines for all games...");
    const betLinesPromises = gameIds.map((gameId) =>
      fetchBetLinesFromApi(UC_PARAMETER, gameId)
    );

    // Execute all bet lines requests in parallel
    const betLinesResults = await Promise.all(betLinesPromises);

    // Log the bet lines results
    console.log("=== Bet Lines Results ===");
    console.log("Total Bet Lines Results:", betLinesResults.length);
    betLinesResults.forEach((betLinesResponse, index) => {
      console.log(
        `Game ID ${gameIds[index]} - Bet Lines Count: ${betLinesResponse.Lines.length}, LastUpdateID: ${betLinesResponse.LastUpdateID}`
      );
    });
    console.log("=== End of Bet Lines Results ===");

    // Combine each bet lines result with its corresponding gameId
    const betLinesWithGameIds = betLinesResults.map((result, index) => ({
      gameId: gameIds[index],
      Lines: result.Lines,
    }));

    // Filter bet lines and line types according to specified criteria
    const { betLines: filteredBetLines, lineTypes: filteredLineTypes } =
      filterBetLinesAndLineTypes(
        betLinesWithGameIds,
        LINE_TYPES_DATA.LineTypes
      );

    // Combine filtered bet lines results with filtered line types
    const bettingData: GamesBetsSuggestionsResponse = {
      betLines: filteredBetLines,
      lineTypes: filteredLineTypes,
    };

    console.log("Prepared betting data for AI agent:", {
      betLinesCount: bettingData.betLines.length,
      lineTypesCount: bettingData.lineTypes.length,
    });

    // Create prompt for AI agent
    const aiPrompt = `You receive as input a list of games and markets in JSON format, including (but not limited to) the following fields:

EntID – game identifier

Type – bet type

BMID – bookmaker identifier

Options → Num, Rate – betting options and odds

Goal:

Build a recommendation list of N games (default: 5),
and for each game select M unique bet types (default: 5).

Total output should be N × M betting options.

Rules:

For each game (EntID), select up to M different bet types (Type).

The same Type may appear across different games, but not more than once within the same game.

For each bet:

Calculate the Rate as the average of all Rate values for the same game, same bet type, and same Num across the 5 different BMIDs.

Meaning: for the same EntID + Type + Num, average the Rate from all available BMIDs.

Do not invent games or markets – only use what exists in the input.

Do not recommend outcomes (no over/under decisions, no sides) – only surface available options.

Each output item must include:

EntID

Type

Num

Rate (calculated average)

CRITICAL OUTPUT REQUIREMENT:

Your response MUST ALWAYS be a valid JSON array of Game objects. The output structure is STRICTLY defined as follows:

[
  {
    "gameId": string,  // The EntID from the input data
    "date": string,    // Extract from input or use a default format
    "statusText": string,  // e.g., "Upcoming", "Live", "Finished"
    "competitor1": {
      "id": string,
      "name": string,
      "logo": string
    },
    "competitor2": {
      "id": string,
      "name": string,
      "logo": string
    },
    "venue": string,
    "bets": [
      {
        "betLineId": string,  // Unique identifier for the bet
        "betTypeName": string,  // The name/title of the bet type (from lineTypes data)
        "ai_insight": string,  // Your AI analysis or recommendation for this bet
        "odds": {
          "one": number,  // Rate for option Num=1 (averaged across BMIDs)
          "X": number,    // Rate for option Num=2 if it's a draw/X option (optional)
          "two": number   // Rate for option Num=2 or Num=3 (averaged across BMIDs)
        },
        "bookie_link": string  // Link or identifier for the bookmaker
      }
    ]
  }
]

IMPORTANT:
- The response MUST be a JSON array (starts with [ and ends with ])
- Each element in the array must be a Game object matching the structure above
- Extract game information (competitors, venue, date) from the input data.betLines
- Map bet types using the data.lineTypes to get betTypeName
- Calculate averaged odds from the Options.Rate values across different BMIDs
- The "ai_insight" field should contain your analysis or recommendation for each bet
- Return ONLY valid JSON - no additional text, explanations, or markdown formatting

The objective is to reduce noise and return a clean, averaged, ready-to-display set of betting options in the exact JSON structure specified above.`;

    // Send to AI agent via n8n webhook
    // Note: n8n AI Agent expects 'chatInput' field for the prompt
    console.log("Sending data to AI agent...");
    const aiAgentPayload = {
      chatInput: aiPrompt,
      data: {
        betLines: bettingData.betLines,
        lineTypes: bettingData.lineTypes,
      },
    };

    const aiResponse = await sendToAIAgent(aiAgentPayload);

    console.log("AI agent response received");

    // Return 200 OK with AI agent response
    res.status(200).json({
      success: true,
      data: aiResponse,
    });
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
