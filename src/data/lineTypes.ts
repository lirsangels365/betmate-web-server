/**
 * @file This file stores the line types fetched from the 365scores Init API.
 * The data is populated at server startup and can be used throughout the application.
 */

import { LineTypesResponse } from "../services/lineTypeService.js";

/**
 * Line types data fetched from the 365scores Init API.
 * This is populated at server startup via initializeLineTypes().
 * 
 * @default Empty array until initialization completes
 */
export let LINE_TYPES_DATA: LineTypesResponse = {
  LineTypes: [],
};

/**
 * Flag indicating whether line types have been successfully loaded
 */
export let LINE_TYPES_LOADED: boolean = false;

/**
 * Initializes the line types data by fetching from the external API.
 * This function should be called at server startup.
 * 
 * @param lang - Language ID (optional, defaults to 1)
 * @throws {Error} If the API request fails
 */
export async function initializeLineTypes(lang: number = 1): Promise<void> {
  const { fetchLineTypesFromApi } = await import("../services/lineTypeService.js");
  
  try {
    console.log("Initializing line types from 365scores Init API...");
    LINE_TYPES_DATA = await fetchLineTypesFromApi(lang);
    LINE_TYPES_LOADED = true;
    console.log(
      `✓ Successfully loaded ${LINE_TYPES_DATA.LineTypes.length} line types`
    );
    
    // Log the line types data
    console.log("\n=== Line Types Data ===");
    console.log(JSON.stringify(LINE_TYPES_DATA, null, 2));
    console.log("=== End of Line Types Data ===\n");
  } catch (error) {
    console.error("✗ Failed to initialize line types:", error);
    throw error;
  }
}
