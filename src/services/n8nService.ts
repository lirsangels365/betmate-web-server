import axios, { AxiosError } from "axios";

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
 * Sends data to the n8n webhook for AI processing
 * @param {N8nPayload} payload - The data payload to send to n8n
 * @returns {Promise<unknown>} The response from n8n webhook
 * @throws {Error} If the webhook URL is not configured or the request fails
 */
export async function sendToN8n(payload: N8nPayload): Promise<unknown> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(
      "Environment check - N8N_WEBHOOK_URL:",
      process.env.N8N_WEBHOOK_URL
    );
    console.error(
      "All env vars with N8N:",
      Object.keys(process.env).filter((k) => k.includes("N8N"))
    );
    throw new Error(
      "N8N_WEBHOOK_URL is not configured in environment variables"
    );
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
