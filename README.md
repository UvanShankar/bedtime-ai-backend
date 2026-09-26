# Bedtime AI — Modular Backend Service

Modular Node.js TypeScript backend for the Bedtime AI platform. Features voice cloning adapters, sociolinguistic style analysis, LLM bedtime story generation, and pluggable TTS generation with full-file and streaming support.

---

## 🚀 Features

- **Pluggable Architecture**: Interfaces and adapters for LLM (OpenAI / Mock), TTS (Sarvam / ElevenLabs / Mock), Voice Cloning, Speech-to-Text (Whisper / Saarika), and Storage (Private AWS S3 / Local).
- **Style Analysis**: Analyzes speech transcripts for parent storytelling warmth, vocabulary, and affection without raw biometric leakage.
- **Narration Director**: Decelerates narrative pace and lengthens pauses toward the end of bedtime stories.
- **A/B Testing Ready**: Full-file and streaming audio delivery strategies.
- **Render Ready**: Includes `render.yaml` for one-click deployment.

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Run test suite (8 tests)
npm test

# Build TypeScript
npm run build

# Start server
npm start
```

---

## 📡 API Endpoints

- `POST /api/v1/parents` — Create parent profile
- `GET /api/v1/parents/:parentId` — Get parent details
- `POST /api/v1/children` — Create child profile
- `GET /api/v1/children/parent/:parentId` — List children for a parent
- `POST /api/v1/parents/:parentId/voice` — Upload voice sample (multipart/form-data)
- `GET /api/v1/parents/:parentId/voice` — Get active voice profile
- `DELETE /api/v1/parents/:parentId/voice` — Delete voice sample & provider profile
- `POST /api/v1/stories/generate` — Generate bedtime story and audio narration
- `GET /api/v1/stories/:storyId` — Fetch story and refresh signed audio URL
- `GET /api/v1/stories/:storyId/stream` — Stream story audio chunks
- `GET /api/v1/health` — Health check endpoint
