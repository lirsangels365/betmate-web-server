# n8n Webhook Setup Guide

## Quick Setup Steps

1. **Create a new workflow** in n8n (Start from scratch)

2. **Add a Webhook node:**

   - Click the "+" button to add a node
   - Search for "Webhook" and select it
   - Configure:
     - **HTTP Method:** `POST`
     - **Path:** `/betting-suggestions` (or your custom path)
     - **Response Mode:** "When Last Node Finishes"
     - **Authentication:** None (or configure as needed)

3. **Get your Webhook URL:**

   - After saving the workflow, the Webhook node will display a URL
   - Format: `https://n8n.hack.365scores.com/webhook/betting-suggestions`
   - Copy this URL

4. **Add your AI Agent node:**

   - Add an AI Agent node
   - Connect the Webhook's "POST" output to the AI Agent's main input
   - Connect your Chat Model (Google Gemini/OpenAI) to the AI Agent's "Chat Model\*" input
   - **Configure the AI Agent:**

     - Click on the AI Agent node
     - In the "System Message" or "Instructions" field, add:
       ```
       You are a betting recommendation AI. Analyze the provided sports data and user preferences to generate personalized betting suggestions.
       ```
     - In the "Prompt" or "Message" field, reference the webhook data:

       ```
       Analyze the following betting data:

       User ID: {{ $json.userId }}
       Available Odds: {{ JSON.stringify($json.sportsData.odds) }}
       User Favorites: {{ JSON.stringify($json.sportsData.userFavorites) }}
       Filters: {{ JSON.stringify($json.filters) }}

       Provide personalized betting recommendations based on this data.
       ```

5. **Add Respond to Webhook node (REQUIRED):**

   - Add a "Respond to Webhook" node after the AI Agent
   - Connect the AI Agent's output to the Respond to Webhook node
   - **Configure it:**
     - Response Code: `200`
     - Response Body: `{{ $json }}` (or `{{ $json.response }}` depending on AI Agent output format)
   - This returns the AI response back to your Express server
   - **Without this node, your Express server won't receive the AI response!**

6. **Activate the workflow:**

   - Toggle the "Active" switch in the top right
   - The webhook is now live and ready to receive requests

7. **Update your `.env` file:**
   ```
   N8N_WEBHOOK_URL=https://n8n.hack.365scores.com/webhook/betting-suggestions
   ```

## Payload Structure

Your Express server will send the following JSON payload to the webhook:

```json
{
  "userId": "user123",
  "sportsData": {
    "odds": [
      {
        "id": "1",
        "event": "Manchester United vs Liverpool",
        "odds": 2.5,
        "sport": "Football"
      }
    ],
    "userFavorites": [
      {
        "id": "fav1",
        "name": "Football",
        "category": "sport"
      }
    ]
  },
  "filters": {
    // Optional filters object
  }
}
```

## Accessing Data in n8n

In your n8n workflow nodes, you can access the data using:

- `{{ $json.userId }}` - User ID
- `{{ $json.sportsData.odds }}` - Array of odds
- `{{ $json.sportsData.userFavorites }}` - Array of user favorites
- `{{ $json.filters }}` - Optional filters object

## Complete Workflow Configuration

### 1. Webhook Node Configuration:

- **HTTP Method:** `POST`
- **Path:** `/betting-suggestions` (or your custom path)
- **Response Mode:** "When Last Node Finishes"
- **Authentication:** None

### 2. Chat Model Node (Google Gemini/OpenAI):

- **Configure API credentials** in the node settings
- For Google Gemini: Add your Google API key
- For OpenAI: Add your OpenAI API key
- The model will be automatically used by the AI Agent

### 3. AI Agent Node Configuration:

**System Message/Instructions:**

```
You are an expert betting recommendation AI. Analyze sports betting data, odds, and user preferences to provide personalized, data-driven betting suggestions. Consider user favorites and available odds when making recommendations.
```

**Prompt/Message (use webhook data):**

```
Analyze the following betting data and provide recommendations:

User ID: {{ $json.userId }}
Available Odds: {{ JSON.stringify($json.sportsData.odds) }}
User Favorites: {{ JSON.stringify($json.sportsData.userFavorites) }}
Filters: {{ JSON.stringify($json.filters) }}

Provide personalized betting suggestions in JSON format with:
- Recommended bets
- Reasoning for each recommendation
- Confidence level
```

### 4. Respond to Webhook Node:

- **Response Code:** `200`
- **Response Body:** `{{ $json }}` (returns the AI Agent's full response)

## Testing

1. Make sure your workflow is **Active**
2. Test the webhook URL directly or use your Express server:
   ```bash
   curl -X POST http://localhost:3000/api/generate-suggestions \
     -H "Content-Type: application/json" \
     -d '{"userId": "test123"}'
   ```

## Troubleshooting

- **Webhook not receiving data:** Make sure the workflow is activated
- **404 errors:** Check that the webhook path matches your URL
- **Timeout errors:** Your Express server waits 30 seconds for a response
- **CORS issues:** n8n should handle CORS automatically, but check if needed
