import axios, { AxiosError } from "axios";

/**
 * @file Service for fetching line types from the 365scores Init API
 */

/**
 * =======================
 * LineTypes (Init API)
 * =======================
 */

/**
 * Line type option (Home / Away / Over / Under etc.)
 */
export interface LineTypeOption {
  /** Option identifier (1,2,3...) */
  Num: number;

  /** Display name */
  Name: string;

  /** Order in UI */
  Order: number;

  /** Optional competitor binding (Home / Away) */
  Competitor?: number;

  /** Optional template (e.g. "#COMPETITOR1") */
  Template?: string;

  /** Optional icon reference */
  Logo?: string;

  /** Optional title */
  Title?: string;

  /** Optional abbreviation */
  Abbreviation?: string;

  /** Optional predictions visual */
  PredictionsVisual?: string;

  /** Optional virtual flag */
  IsVirtual?: boolean;
}

/**
 * Line type definition
 */
export interface LineType {
  ID: number;
  AliasName: string;
  Name: string;
  SName: string;
  Title: string;

  /** e.g. "Game" */
  RelatedEntityType: string;

  /** Is available before the game starts */
  PrematchState: boolean;

  /** Is available during live play */
  InPlayState: boolean;

  /** SportType IDs this line type applies to */
  SportTypes: number[];

  /** Optional behavioral flags */
  Predictable?: boolean;
  HomeAwayTeamOrderSensitive?: boolean;

  /** Line options (Home / Away / Over / Under etc.) */
  Options: LineTypeOption[];

  /** Image version */
  ImgVer?: number;

  /** Optional parameter type */
  ParameterType?: number;

  /** Optional prediction title */
  PredictionTitle?: string;

  /** Optional prediction require odds */
  PredictionRequireOdds?: boolean;
}

/**
 * Convenience wrapper for the line types response
 */
export interface LineTypesResponse {
  LineTypes: LineType[];
}

/**
 * Interface for the full Init API response (only the parts we need)
 */
interface InitApiResponse {
  Bets: {
    LineTypes: LineType[];
  };
}

/**
 * Base URL for the 365scores Init API
 */
const INIT_API_BASE_URL = "http://test.365scores.com/Data/Init/";

/**
 * Interface for the query parameters sent to the 365scores Init API
 */
interface InitApiParams {
  lang?: number; // Language ID (optional, defaults to 1)
}

/**
 * Fetches line types from the 365scores Init API
 * @param lang - Language ID (optional, defaults to 1)
 * @returns Promise with the line types response
 * @throws {Error} If the API request fails
 */
export async function fetchLineTypesFromApi(
  lang: number = 1
): Promise<LineTypesResponse> {
  try {
    // Build query parameters
    const params: InitApiParams = {
      lang,
    };

    // Log the request being made
    console.log("Calling 365scores Init API with params:", params);
    console.log("API URL:", INIT_API_BASE_URL);

    // Make the API request
    const response = await axios.get<InitApiResponse>(INIT_API_BASE_URL, {
      params,
      timeout: 30000, // 30 seconds timeout
      headers: {
        Accept: "application/json",
      },
    });

    // Extract LineTypes from the response and return
    return {
      LineTypes: response.data.Bets.LineTypes,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `365scores Init API returned error: ${
            axiosError.response.status
          } - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error(
          "365scores Init API request failed - no response received"
        );
      }
    }
    throw new Error(
      `Failed to communicate with 365scores Init API: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
