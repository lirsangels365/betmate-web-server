import axios, { AxiosError } from "axios";
import { UserPreferences, DateFilters } from "../data/userPreferences.js";
import { ExternalGameApiResponse } from "../types/externalApiTypes.js";

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
 * Fetches games from the 365scores Games API and extracts game IDs
 * @param userPreferences - User preferences for filtering games
 * @param dateFilters - Date range filters
 * @returns Promise with an array of game IDs
 * @throws {Error} If the API request fails
 */
export async function fetchGamesFromApi(
  userPreferences: UserPreferences,
  dateFilters: DateFilters
): Promise<number[]> {
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

    // Extract and return game IDs
    return extractGameIds(response.data);
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
 * Extracts game IDs from the external API response
 * @param apiResponse - The response object from the 365scores Games API
 * @returns Array of game IDs (numbers)
 */
export function extractGameIds(apiResponse: ExternalGameApiResponse): number[] {
  return apiResponse.Games.map((game) => game.ID);
}
