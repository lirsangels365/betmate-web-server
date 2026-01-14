# Testing Guide

## Server Status: ✅ Running

Your server is running on `http://localhost:3000`

## Quick Test Commands

### 1. Test Health Endpoint

**PowerShell:**
```powershell
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "up",
  "message": "365scores AI-Betting Server is running"
}
```

### 2. Test Generate Suggestions Endpoint

**PowerShell:**
```powershell
$body = @{
    userId = "test123"
    filters = @{
        sport = "Football"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/generate-suggestions `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**cURL (if you have it):**
```bash
curl -X POST http://localhost:3000/api/generate-suggestions \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"test123\", \"filters\": {\"sport\": \"Football\"}}"
```

**Expected Response (if n8n is configured):**
```json
{
  "success": true,
  "message": "Betting suggestions generated successfully",
  "data": { /* AI response from n8n */ }
}
```

## Configuration Required

### Before Testing the AI Endpoint:

1. **Get your n8n Webhook URL:**
   - Go to your n8n workflow
   - Make sure it's **Active**
   - Copy the webhook URL from the Webhook node

2. **Update your `.env` file:**
   ```
   PORT=3000
   N8N_WEBHOOK_URL=https://n8n.hack.365scores.com/webhook/your-path-here
   ```

3. **Restart the server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

## Testing Without n8n (Mock Test)

If you want to test the server logic without n8n, you can temporarily modify the code or use a mock webhook URL. However, the endpoint will return an error without a valid n8n webhook.

## Common Issues

### Error: "N8N_WEBHOOK_URL is not configured"
- **Solution:** Add `N8N_WEBHOOK_URL` to your `.env` file

### Error: "n8n webhook request failed"
- **Solution:** 
  - Check that your n8n workflow is **Active**
  - Verify the webhook URL is correct
  - Make sure the webhook path matches your n8n configuration

### Error: "userId is required"
- **Solution:** Make sure you're sending `userId` in the request body

## Server Logs

Watch the console output to see:
- Request logging: `GET /health`, `POST /api/generate-suggestions`
- Error messages if something goes wrong

## Next Steps

1. ✅ Server is running
2. ⏳ Add `N8N_WEBHOOK_URL` to `.env`
3. ⏳ Activate your n8n workflow
4. ⏳ Test the full flow end-to-end
