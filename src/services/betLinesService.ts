import axios, { AxiosError } from "axios";

/**
 * @file Service for fetching bet lines from the 365scores Bets/Lines API
 */

/**
 * Root response from the 365scores Bets/Lines API
 */
export interface BetLinesExternalApiResponse {
  LastUpdateID: number;
  Lines: BetLine[]; // includes empty objects {}
}

/**
 * A line can be either an empty object {} or a populated bet line
 */
export type BetLine = EmptyBetLine | PopulatedBetLine;

/**
 * Empty bet line (empty object)
 */
export type EmptyBetLine = Record<string, never>;

/**
 * Populated bet line with all available fields
 */
export interface PopulatedBetLine {
  ID: number;
  EntID: number;
  EntT: number;
  Type: number;
  BMID: number;
  Sponsored: boolean;

  // Optional fields that appear only in some line types
  BMGID?: number;
  P?: string; // e.g. "0-0" or "2.5 Goals"
  PV?: string; // e.g. "0-0" or "2.5"
  PVs?: number[]; // e.g. [0, 0] for correct score-like markets
  Link?: string; // e.g. affiliate link
  Frozen?: boolean; // Indicates if the bet line is frozen

  Options: BetLineOption[];
}

/**
 * Option inside a bet line
 */
export interface BetLineOption {
  Num: number;
  Rate: number;
  Fractional: string;
  American: string;

  // Optional fields
  OldRate?: number;
  OriginalRate: number;
  URL?: string; // Some options have direct URLs
  Lead?: number; // For Asian handicap markets
}

/**
 * Base URL for the 365scores Bets/Lines API
 */
const BET_LINES_API_BASE_URL = "https://ws.365scores.com/Data/Bets/Lines/";

/**
 * Interface for the query parameters sent to the 365scores Bets/Lines API
 */
interface BetLinesApiParams {
  uc: number; // User code/context
  gameid: number; // Game ID
}

/**
 * Fetches bet lines from the 365scores Bets/Lines API
 * @param uc - User code/context parameter
 * @param gameId - Game ID to fetch bet lines for
 * @returns Promise with the bet lines API response
 * @throws {Error} If the API request fails
 */
export async function fetchBetLinesFromApi(
  uc: number,
  gameId: number
): Promise<BetLinesExternalApiResponse> {
  try {
    // Build query parameters
    const params: BetLinesApiParams = {
      uc,
      gameid: gameId,
    };

    // Log the request being made
    console.log("Calling 365scores Bets/Lines API with params:", params);
    console.log("API URL:", BET_LINES_API_BASE_URL);

    // Make the API request
    const response = await axios.get<BetLinesExternalApiResponse>(
      BET_LINES_API_BASE_URL,
      {
        params,
        timeout: 30000, // 30 seconds timeout
        headers: {
          Accept: "application/json",
        },
      }
    );

    // Return the typed response
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `365scores Bets/Lines API returned error: ${
            axiosError.response.status
          } - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error(
          "365scores Bets/Lines API request failed - no response received"
        );
      }
    }
    throw new Error(
      `Failed to communicate with 365scores Bets/Lines API: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
