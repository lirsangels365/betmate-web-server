# n8n AI Agent Configuration Fix

## Problem
The AI Agent node is showing "No prompt specified" error even though `chatInput` is being sent in the webhook body.

**Root Cause:** The webhook node nests the request body under `body`, so `chatInput` is at `$json.body.chatInput`, not `$json.chatInput`.

## Solution

### ✅ Quick Fix (Recommended)

In the AI Agent node's "Prompt (User Message)" field, change the expression from:
```
{{ $json.chatInput }}
```

**To:**
```
{{ $json.body.chatInput }}
```

This is the correct path because n8n webhooks nest POST request bodies under the `body` property.

### Alternative Options

If the above doesn't work, try these:

1. **Check the Webhook Output:**
   - Click on the Webhook node and check the "Output" tab
   - Verify the exact path to `chatInput` (should be `body.chatInput`)

2. **Use Manual Entry Mode:**
   - In AI Agent node, change "Source for Prompt (User Message)" to **"Manual Entry"**
   - Use: `{{ $json.body.chatInput }}`

### Option 2: Add a "Set" Node Between Webhook and AI Agent

1. Add a **"Set" node** between the Webhook and AI Agent nodes
2. In the Set node, map the fields:
   - Add a field: `chatInput` → Expression: `{{ $json.body.chatInput }}` or `{{ $json.chatInput }}`
   - Add a field: `data` → Expression: `{{ $json.body.data }}` or `{{ $json.data }}`
3. Connect Set node output to AI Agent input
4. In AI Agent, use: `{{ $json.chatInput }}`

### Option 3: Use Manual Entry Mode

1. In AI Agent node, change "Source for Prompt (User Message)" to **"Manual Entry"**
2. In "Prompt (User Message)" field, use: `{{ $json.body.chatInput }}` or `{{ $json.chatInput }}`

## How to Debug

1. Click on the **Webhook node** and check the "Output" tab
2. Note the exact structure of the data (is `chatInput` at `$json.chatInput` or `$json.body.chatInput`?)
3. Use that path in the AI Agent's prompt expression

## Current Payload Structure

Our application sends:
```json
{
  "chatInput": "Your prompt text...",
  "data": {
    "betLines": [...],
    "lineTypes": [...]
  }
}
```

The AI Agent node needs to access `chatInput` from this structure.
