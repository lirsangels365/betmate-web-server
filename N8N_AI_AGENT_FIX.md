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

---

## Including Data in the Prompt (n8n Level)

If the AI agent is not recognizing the data and only seeing the prompt, you need to include the actual data in the prompt text itself. This should be done **in n8n**, not in the codebase.

### Option 1: Use a "Set" Node to Combine Prompt + Data (Recommended)

1. **Add a "Set" node** between the Webhook and OpenAI Chat Model nodes
2. In the Set node, create a new field called `combinedPrompt`:
   - **Name:** `combinedPrompt`
   - **Value:** Use this expression:
     ```
     {{ $json.body.chatInput }}

     ACTUAL DATA TO PROCESS:

     Below is the actual betting data you must analyze and transform. Use this data to build your response:

     {{ JSON.stringify($json.body.data, null, 2) }}

     Remember: You must use the actual game IDs, bet types, and odds from the data above. Do not invent or use placeholder values.
     ```
3. Connect the Set node output to the OpenAI Chat Model node
4. In the OpenAI Chat Model node, use `{{ $json.combinedPrompt }}` as the prompt

### Option 2: Modify OpenAI Chat Model Messages Array

1. In the **OpenAI Chat Model** node, go to the "Messages" section
2. Instead of just using the prompt, create a message that includes both:
   - **Role:** `user` (or `system` for instructions, `user` for data)
   - **Content:** Use an expression like:
     ```
     {{ $json.body.chatInput }}

     ACTUAL DATA:
     {{ JSON.stringify($json.body.data, null, 2) }}
     ```
3. This ensures the data is part of the message sent to OpenAI

### Option 3: Use a "Code" Node (Most Flexible)

1. Add a **"Code" node** between Webhook and OpenAI Chat Model
2. Use JavaScript to combine prompt and data:
   ```javascript
   const prompt = $input.item.json.body.chatInput;
   const data = $input.item.json.body.data;
   
   const combinedPrompt = `${prompt}

   ACTUAL DATA TO PROCESS:

   ${JSON.stringify(data, null, 2)}

   Remember: Use the actual data above, not placeholders.`;
   
   return [{ json: { combinedPrompt } }];
   ```
3. Connect Code node to OpenAI Chat Model
4. Use `{{ $json.combinedPrompt }}` in the OpenAI node

**Note:** The `JSON.stringify()` function in n8n expressions might need to be accessed differently. If it doesn't work, use Option 3 (Code node) which gives you full JavaScript control.
