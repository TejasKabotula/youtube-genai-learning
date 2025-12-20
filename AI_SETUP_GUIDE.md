# AI Service Configuration Guide

## Current Status
The project is now configured to use **Google Gemini AI**.

## Option 1: Use Google Gemini API (Recommended)

### Steps:
1. Get an API key from Google AI Studio:
   - Go to https://aistudio.google.com/app/apikey
   - Create a new API key
   - Copy the key

2. Update your `.env` file:
   - Open `server/.env`
   - Set `LLM_API_KEY=your_copied_key`
   - Set `LLM_MODEL=gemini-1.5-flash` (or `gemini-1.5-pro`)

3. Restart the server:
   - Stop the current server (Ctrl+C in terminal)
   - Run `npm run dev` again

### Supported Models:
- `gpt-4-turbo` (default, best quality)
- `gpt-4`
- `gpt-3.5-turbo` (faster, cheaper)

## Option 2: Use Other LLM Providers

If you want to use a different provider (Anthropic Claude, Google Gemini, etc.), you'll need to:

1. Modify `server/src/services/aiService.ts` line 22 to use the correct API endpoint
2. Update the request format to match the provider's API
3. Set the appropriate API key in `.env`

## Option 3: Test Without AI (Mock Mode)

The application already has a fallback mock mode. When `LLM_API_KEY` is not set or invalid, it returns mock responses. However, this won't provide real summaries or questions.

## Current Configuration

Your `.env.example` shows:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/youtube-tutor
JWT_SECRET=your_jwt_secret
LLM_API_KEY=your_llm_api_key  ← This needs to be a real API key
LLM_MODEL=gpt-4-turbo
NODE_ENV=development
```

## Testing the Fix

After configuring your API key:

1. Try analyzing a YouTube video
2. Check the server logs for any errors
3. If you see "Mock response: LLM_API_KEY is missing", the key isn't being read correctly

## Cost Considerations

- OpenAI API is pay-per-use
- Typical cost for analyzing a 10-minute video: $0.10-0.50
- Set usage limits in your OpenAI dashboard to control costs
- Consider using `gpt-3.5-turbo` for development/testing (cheaper)

## Need Help?

If you don't have an OpenAI API key and want to test the application, I can help you:
1. Set up a free alternative LLM provider
2. Create a simplified mock mode with better test data
3. Configure a local LLM (like Ollama) instead
