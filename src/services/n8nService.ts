import axios, { AxiosError } from "axios";
import { BetLine } from "./betLinesService.js";
import { LineType } from "./lineTypeService.js";
import { N8N_WEBHOOK_URL } from "../config/constants.js";

/**
 * Interface for the data structure sent to n8n
 */
export interface N8nPayload {
  userId: string;
  sportsData: {
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
  };
  filters?: Record<string, unknown>;
}

/**
 * Interface for bet lines with game ID (for AI agent)
 */
export interface BetLinesWithGameId {
  gameId: number;
  Lines: BetLine[];
}

/**
 * Interface for the AI agent payload
 * Note: n8n AI Agent expects 'chatInput' for the prompt field
 * 
 * IMPORTANT: In n8n, webhook nodes nest POST request bodies under 'body'.
 * So the AI Agent node must use {{ $json.body.chatInput }} (not {{ $json.chatInput }})
 * to access the prompt from this payload.
 */
export interface AIAgentPayload {
  chatInput: string; // The prompt/instruction for the AI agent
  data: {
    betLines: BetLinesWithGameId[];
    lineTypes: LineType[];
  };
}

/**
 * Sends data to the n8n webhook for AI processing
 * @param {N8nPayload} payload - The data payload to send to n8n
 * @returns {Promise<unknown>} The response from n8n webhook
 * @throws {Error} If the webhook URL is not configured or the request fails
 */
export async function sendToN8n(payload: N8nPayload): Promise<unknown> {
  const webhookUrl = N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("N8N_WEBHOOK_URL is not configured");
  }

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `n8n webhook returned error: ${
            axiosError.response.status
          } - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error("n8n webhook request failed - no response received");
      }
    }
    throw new Error(
      `Failed to communicate with n8n: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Sends betting data to the n8n AI agent webhook for AI processing
 * @param {AIAgentPayload} payload - The data payload to send to the AI agent
 * @returns {Promise<unknown>} The response from the AI agent
 * @throws {Error} If the webhook URL is not configured or the request fails
 */
export async function sendToAIAgent(payload: AIAgentPayload): Promise<unknown> {
  const webhookUrl = N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("N8N_WEBHOOK_URL is not configured");
  }

  try {
    console.log("Sending data to AI agent webhook...");
    console.log("Payload structure:", {
      chatInput: payload.chatInput.substring(0, 100) + "...", // Log first 100 chars of prompt
      betLinesCount: payload.data.betLines.length,
      lineTypesCount: payload.data.lineTypes.length,
    });

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000, // 60 seconds timeout for AI processing
    });

    console.log("AI agent response received");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `AI agent webhook returned error: ${
            axiosError.response.status
          } - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error(
          "AI agent webhook request failed - no response received"
        );
      }
    }
    throw new Error(
      `Failed to communicate with AI agent: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
