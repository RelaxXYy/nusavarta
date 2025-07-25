# Nusavarta Server

AI-powered Indonesian cultural tourism guide API built with Vercel serverless functions.

## Features

- 🤖 AI chat assistant for Indonesian cultural tourism
- 🏛️ Cultural landmark information (Gedung Sate, Borobudur, Prambanan)
- 🎨 Traditional art and culture details (Batik, Wayang)
- 🗺️ Route planning assistance
- ⚡ Serverless deployment with Vercel

## API Endpoints

- `GET /api/` - Health check
- `POST /api/chat` - Chat with AI assistant
- `GET /api/test` - Test environment and configuration

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to production
npm run deploy
```

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini AI API key
- `MAPTILER_API_KEY` - MapTiler API key for maps

## Usage Example

```bash
curl -X POST https://nusavarta.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ceritakan tentang Gedung Sate"}'
```

## Version 2.0.0

Complete refactor with optimized serverless architecture and enhanced cultural data.
