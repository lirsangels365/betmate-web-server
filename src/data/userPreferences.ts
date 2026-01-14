/**
 * @file This file defines mock user preferences for filtering game suggestions.
 * It is intended to be replaced with actual user data from an external API later.
 */

/**
 * Interface for date range filters for game requests.
 * These are request parameters, not user preferences.
 */
export interface DateFilters {
  startDate?: string; // Optional, format: dd/mm/yyyy (e.g., "21/02/2017"), default: today
  endDate?: string; // Optional, format: dd/mm/yyyy (e.g., "21/02/2017"), default: equal to startDate
}

/**
 * Interface for a single user's preferences for filtering game suggestions.
 * Based on the "Games Request" parameters documentation.
 */
export interface UserPreferences {
  userId: string; // Mandatory userId, as established in the API route
  sportTypeIds?: number[]; // Optional, array of sport IDs (e.g., [2] for Basketball)
  competitionIds?: number[]; // Optional, array of competition IDs (e.g., [7, 11, 42])
  competitorIds?: number[]; // Optional, array of competitor IDs (e.g., [105, 132, 564])
  lang?: number; // Optional: Language ID for localized content, from query params
}

/**
 * Mock date filters for game requests.
 * These represent the date range filter parameters for API requests.
 */
export const MOCK_DATE_FILTERS: DateFilters = {
  startDate: "15-01-2026",
  endDate: "17-01-2026",
};

/**
 * Mock user preferences for a specific user.
 * This data will be used to simulate personalized filters for game suggestions.
 *
 * Example user: A football and basketball fan following specific teams and competitions
 */
export const MOCK_USER_PREFERENCES: UserPreferences = {
  userId: "12345",
  sportTypeIds: [1, 2],
  competitionIds: [7, 11, 572],
  competitorIds: [104, 132, 134, 108],
  lang: 1,
};
