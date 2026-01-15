import axios, { AxiosError } from "axios";
import { UserPreferences, DateFilters } from "../data/userPreferences.js";
import {
  ExternalGameApiResponse,
  ExternalGame,
  Competitor as ExternalCompetitor,
  Venue,
} from "../types/externalApiTypes.js";

/**
 * Game information with competitor details
 */
export interface GameInfo {
  gameId: number;
  competitor1?: {
    id: number;
    name: string;
    logo?: string;
  };
  competitor2?: {
    id: number;
    name: string;
    logo?: string;
  };
  venue?: {
    id: number;
    name: string;
  };
  date?: string; // Game start time (STime from API)
  statusText?: string; // Derived from game status
}

/**
 * Interface for the query parameters sent to the 365scores Games API
 */
interface GamesApiParams {
  startdate?: string; // Format: dd/mm/yyyy
  enddate?: string; // Format: dd/mm/yyyy
  Sports?: number; // Single sport ID
  Competitions?: string; // Comma-separated competition IDs (e.g., "7,11,42")
  Competitors?: string; // Comma-separated competitor IDs (e.g., "105,132,564")
}

/**
 * Base URL for the 365scores Games API
 */
const GAMES_API_BASE_URL = "http://test.365scores.com/Data/Games/";

/**
 * Converts date from dd-mm-yyyy format to dd/mm/yyyy format
 * @param dateString - Date string in dd-mm-yyyy format
 * @returns Date string in dd/mm/yyyy format
 */
function convertDateFormat(dateString: string): string {
  return dateString.replace(/-/g, "/");
}

/**
 * Builds query parameters for the 365scores Games API from user preferences and date filters
 * @param userPreferences - User preferences containing sport, competition, and competitor IDs
 * @param dateFilters - Date range filters
 * @returns Query parameters object for the API request
 */
function buildApiParams(
  userPreferences: UserPreferences,
  dateFilters: DateFilters
): GamesApiParams {
  const params: GamesApiParams = {};

  // Add date filters (convert format from dd-mm-yyyy to dd/mm/yyyy)
  if (dateFilters.startDate) {
    params.startdate = convertDateFormat(dateFilters.startDate);
  }
  if (dateFilters.endDate) {
    params.enddate = convertDateFormat(dateFilters.endDate);
  }

  // Add sport ID (take first sport if multiple are provided)
  if (userPreferences.sportTypeIds && userPreferences.sportTypeIds.length > 0) {
    params.Sports = userPreferences.sportTypeIds[0];
  }

  // Add competitions as comma-separated string
  if (
    userPreferences.competitionIds &&
    userPreferences.competitionIds.length > 0
  ) {
    params.Competitions = userPreferences.competitionIds.join(",");
  }

  // Add competitors as comma-separated string
  if (
    userPreferences.competitorIds &&
    userPreferences.competitorIds.length > 0
  ) {
    params.Competitors = userPreferences.competitorIds.join(",");
  }

  return params;
}

/**
 * Fetches games from the 365scores Games API and extracts game information with competitors
 * @param userPreferences - User preferences for filtering games
 * @param dateFilters - Date range filters
 * @returns Promise with an array of game information including competitor details
 * @throws {Error} If the API request fails
 */
export async function fetchGamesFromApi(
  userPreferences: UserPreferences,
  dateFilters: DateFilters
): Promise<GameInfo[]> {
  try {
    // Build query parameters
    const params = buildApiParams(userPreferences, dateFilters);

    // Log the request being made
    console.log("Calling 365scores Games API with params:", params);
    console.log("API URL:", GAMES_API_BASE_URL);

    // Make the API request
    const response = await axios.get<ExternalGameApiResponse>(
      GAMES_API_BASE_URL,
      {
        params,
        timeout: 30000, // 30 seconds timeout
        headers: {
          Accept: "application/json",
        },
      }
    );

    // Extract and return game information with competitors
    return extractGameInfo(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `365scores API returned error: ${
            axiosError.response.status
          } - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error("365scores API request failed - no response received");
      }
    }
    throw new Error(
      `Failed to communicate with 365scores API: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extracts game information including competitor details from the external API response
 * @param apiResponse - The response object from the 365scores Games API
 * @returns Array of game information with competitor details
 */
export function extractGameInfo(
  apiResponse: ExternalGameApiResponse
): GameInfo[] {
  return apiResponse.Games.map((game: ExternalGame) => {
    const gameInfo: GameInfo = {
      gameId: game.ID,
      date: game.STime, // Game start time
      statusText: game.IsFinished
        ? "Finished"
        : game.Active
        ? "Live"
        : "Upcoming",
    };

    // Extract competitor information (Comps array contains teams/competitors)
    if (game.Comps && game.Comps.length >= 1) {
      gameInfo.competitor1 = {
        id: game.Comps[0].ID,
        name: game.Comps[0].Name,
        // Logo URL can be constructed from ImgVer if needed
        // logo: `https://example.com/logos/${game.Comps[0].ID}.png` // Placeholder
      };
    }

    if (game.Comps && game.Comps.length >= 2) {
      gameInfo.competitor2 = {
        id: game.Comps[1].ID,
        name: game.Comps[1].Name,
        // Logo URL can be constructed from ImgVer if needed
        // logo: `https://example.com/logos/${game.Comps[1].ID}.png` // Placeholder
      };
    }

    // Extract venue information if available
    if (game.Venue) {
      gameInfo.venue = {
        id: game.Venue.ID,
        name: game.Venue.Name,
      };
    }

    return gameInfo;
  });
}
