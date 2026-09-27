# Bedtime AI — Parent Voice Story MVP: Project Context & Master Guide

> **Generated**: 2026-09-27  
> **Author**: Google Antigravity & UvanShankar  
> **Source Spec**: `C:\Users\Uvanshankar\Downloads\bedtime_ai_parent_voice_story_mvp_spec.md`

---

## 1. Executive Summary

**Bedtime AI** is a personalized bedtime storytelling product that enables parents to create custom, AI-generated bedtime stories narrated in their own cloned voice. 

### Key Pillars:
1. **Parent-Specific Voice & Delivery**: Records a 15–90s voice sample with explicit parental consent, extracting delivery style (warmth, calmness, cadence) and creating a voice model via Sarvam AI, ElevenLabs, or OpenAI.
2. **Bedtime Deceleration Director**: Stories are written and paced to progressively slow down, lengthening pauses and lowering energy from segment to segment to help children fall asleep.
3. **Child-Centered Storytelling**: Stories incorporate the child's name, interests, and age-appropriate vocabulary while avoiding triggers or frightening topics.
4. **Modular Multi-Provider Backend**: Zero-vendor-lockin provider adapter architecture allowing plug-and-play switching between OpenAI, Sarvam AI, ElevenLabs, AWS S3, and Local Storage.
5. **Cross-Platform Mobile App**: React Native Expo app with 4 intuitive screens connecting to the live backend over HTTPS.

---

## 2. Repositories & CI/CD Pipelines

The codebase is partitioned into two independent GitHub repositories under account **`UvanShankar`**:

| Repository | GitHub URL | Local Path | Stack | CI/CD Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | [`UvanShankar/bedtime-ai-backend`](https://github.com/UvanShankar/bedtime-ai-backend) | `C:\Users\Uvanshankar\bedtime-ai\backend` | Node.js 20, Express, TypeScript, Zod, Jest | **PASSED (Green)** |
| **Mobile** | [`UvanShankar/bedtime-ai-mobile`](https://github.com/UvanShankar/bedtime-ai-mobile) | `C:\Users\Uvanshankar\bedtime-ai\mobile` | React Native 0.86, Expo SDK 57, React 19, TypeScript, expo-av | **PASSED (Green)** |

### GitHub Actions Workflows:
- **Backend CI/CD** (`.github/workflows/ci-cd.yml`):
  - Triggers on `push` and `pull_request` to `main`.
  - Runs `npm ci`, runs 4 test suites (8/8 unit & integration tests), compiles TypeScript with `tsc`.
  - Optional deploy hook triggering Render deployment upon merge to `main`.
- **Mobile CI** (`.github/workflows/ci.yml`):
  - Triggers on `push` and `pull_request` to `main`.
  - Runs `npm ci` and strict TypeScript type-checking (`npx tsc --noEmit`).

---

## 3. Live Production Deployment (Render)

- **Live Base URL**: `https://bedtime-ai-backend.onrender.com/api/v1`
- **Health Endpoint**: `https://bedtime-ai-backend.onrender.com/api/v1/health`
- **Blueprint File**: [`render.yaml`](https://github.com/UvanShankar/bedtime-ai-backend/blob/main/render.yaml)
  - **Plan**: `free`
  - **Runtime**: `node` (Node.js >= 20.0.0)
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Auto-Deploy**: Enabled on Git push to `main`.

### Verified Live Endpoints:
```bash
# Health Check:
GET https://bedtime-ai-backend.onrender.com/api/v1/health
# Response: {"status":"ok","timestamp":"...","service":"bedtime-ai-backend","providers":{...}}

# Create Parent:
POST https://bedtime-ai-backend.onrender.com/api/v1/parents
Body: {"name":"Uvan","relationship":"father","language":"English","languageCode":"en-US"}

# Create Child:
POST https://bedtime-ai-backend.onrender.com/api/v1/children
Body: {"parentId":"<parent_id>","name":"Aarav","age":5,"interests":["space"],"personality":["gentle"]}

# Generate Story & Bedtime Audio:
POST https://bedtime-ai-backend.onrender.com/api/v1/stories/generate
Body: {"parentId":"<parent_id>","childId":"<child_id>","topic":"The Little Star","durationMinutes":3}
```

---

## 4. Architecture & Modular Adapter System

```
bedtime-ai/
├── backend/
│   ├── src/
│   │   ├── app.ts                         # Express app setup & provider registration
│   │   ├── server.ts                      # Server entry point (binds to 0.0.0.0)
│   │   ├── config/index.ts                # Configuration & environment loader
│   │   ├── errors/AppError.ts             # Typed application error with HTTP codes
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts            # Global error handler with requestId
│   │   │   └── validateRequest.ts         # Zod request body validation schemas
│   │   ├── types/
│   │   │   ├── models.ts                  # Domain models (Parent, Child, Story, etc.)
│   │   │   └── providers.ts               # Provider interfaces (LLM, TTS, Voice, Storage, Speech)
│   │   ├── providers/
│   │   │   ├── ProviderRegistry.ts        # Central DI container for active adapters
│   │   │   ├── llm/
│   │   │   │   ├── openai/OpenAIStoryProvider.ts    # GPT-4o-mini structured story generator
│   │   │   │   └── mock/MockLLMProvider.ts          # Deterministic test generator
│   │   │   ├── tts/
│   │   │   │   ├── openai/OpenAITTSProvider.ts      # OpenAI tts-1 audio synthesis
│   │   │   │   ├── sarvam/SarvamTTSProvider.ts      # Sarvam AI: /voices/clone (cloned) & bulbul:v1 (preset)
│   │   │   │   ├── elevenlabs/ElevenLabsTTSProvider.ts # ElevenLabs v2 multilingual synthesis
│   │   │   │   └── mock/MockTTSProvider.ts          # Zero-token mock audio synthesizer
│   │   │   ├── voice/
│   │   │   │   ├── sarvam/SarvamVoiceCloneProvider.ts # Sarvam AI 1-shot voice cloning (/voices/create)
│   │   │   │   ├── elevenlabs/ElevenLabsVoiceCloneProvider.ts # ElevenLabs instant cloning (/voices/add)
│   │   │   │   └── mock/MockVoiceCloneProvider.ts
│   │   │   ├── speech/
│   │   │   │   ├── openai/OpenAISpeechToTextProvider.ts # Whisper API
│   │   │   │   ├── sarvam/SarvamSpeechToTextProvider.ts # Saarika v2
│   │   │   │   └── mock/MockSpeechToTextProvider.ts
│   │   │   └── storage/
│   │   │       ├── local/LocalStorageProvider.ts    # Local disk storage + signed URLs
│   │   │       ├── s3/S3StorageProvider.ts          # AWS S3 presigned URLs
│   │   │       └── mock/MockStorageProvider.ts
│   │   ├── services/
│   │   │   └── NarrationDirector.ts       # Bedtime slowdown, pause & cadence director
│   │   ├── audio/
│   │   │   └── strategies/
│   │   │       ├── FullFileAudioStrategy.ts         # Complete audio synthesis & storage
│   │   │       ├── StreamingAudioStrategy.ts        # Chunked audio streaming strategy
│   │   │       └── AudioStrategyRegistry.ts
│   │   ├── repositories/                  # In-memory thread-safe repositories
│   │   │   ├── ParentRepository.ts
│   │   │   ├── ChildRepository.ts
│   │   │   ├── VoiceProfileRepository.ts
│   │   │   ├── StyleProfileRepository.ts
│   │   │   └── StoryRepository.ts
│   │   └── routes/                        # Express REST route controllers
│   │       ├── index.ts                   # /api/v1 router & /health
│   │       ├── parent.routes.ts
│   │       ├── child.routes.ts
│   │       ├── voice.routes.ts
│   │       ├── story.routes.ts
│   │       └── storage.routes.ts
│   ├── tests/                             # Jest unit & integration test suites
│   ├── render.yaml                        # Render Infrastructure-as-Code Blueprint
│   ├── tsconfig.json                      # NodeNext ES2022 TypeScript configuration
│   └── package.json
└── mobile/
    ├── App.tsx                            # Root React Native component
    ├── app.json                           # Expo app config (usesCleartextTraffic, icon, splash)
    ├── .env                               # Points to https://bedtime-ai-backend.onrender.com/api/v1
    ├── src/
    │   ├── config/index.ts                # API base URL resolver (Render + 10.0.2.2 fallback)
    │   ├── models/index.ts                # Mobile TypeScript domain interfaces
    │   ├── navigation/AppNavigator.tsx    # Native Stack Navigator (4 screens)
    │   ├── hooks/
    │   │   ├── useVoiceRecorder.ts        # expo-av audio recorder with duration constraints
    │   │   └── useAudioPlayer.ts          # expo-av player with origin remapping for Render
    │   ├── services/api/
    │   │   ├── ApiClient.ts               # Resilient fetch client with structured error parsing
    │   │   ├── ParentApi.ts               # Parent & Child CRUD
    │   │   ├── VoiceApi.ts                # Voice sample upload & consent
    │   │   └── StoryApi.ts                # Story generation request & polling
    │   ├── screens/
    │   │   ├── ParentChildScreen/         # Parent onboarding & child profiles
    │   │   ├── VoiceSetupScreen/          # 90s voice sample recorder & consent
    │   │   ├── StoryRequestScreen/        # Topic, mood, duration, bedtime calmness
    │   │   └── StoryResultScreen/         # Bedtime story reader & audio player
    │   └── components/                    # UI cards, audio players, error banners
    └── package.json
```

---

## 5. Domain Models Reference

### ParentProfile
```typescript
interface ParentProfile {
  id: string;
  name: string;
  relationship: "mother" | "father" | "grandparent" | "guardian" | "other";
  language: string;
  languageCode: string; // e.g. "en-US", "ta-IN", "hi-IN"
  dialect?: string;
  script?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ChildProfile
```typescript
interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  age: number;
  interests: string[];
  personality: string[];
  avoidTopics: string[];
  favoriteCharacters?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### ParentVoiceProfile
```typescript
interface ParentVoiceProfile {
  id: string;
  parentId: string;
  provider: "sarvam" | "elevenlabs" | "mock";
  providerVoiceId: string;
  status: "processing" | "ready" | "failed";
  sampleDurationSeconds: number;
  consentAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Story & NarrationPlan
```typescript
interface StorySegment {
  id: string;
  order: number;
  text: string;
  emotion?: string;       // "warm", "curious", "soothing", "sleepy"
  pace?: string;          // "slow", "moderate", "deliberate"
  energy?: string;        // "gentle", "calm", "whisper"
  pauseBeforeMs?: number; // Progressive lengthening
  pauseAfterMs?: number;
  emphasis?: string[];
}

interface Story {
  id: string;
  requestId: string;
  parentId: string;
  childId: string;
  title: string;
  languageCode: string;
  summary?: string;
  text: string;
  segments: StorySegment[];
  narrationVersion: string;
  audioStatus: "pending" | "processing" | "ready" | "failed";
  audioKey?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  audioError?: string;    // Detailed diagnostics if synthesis fails
  ttsProvider?: string;
  createdAt: string;
}
```

---

## 6. Environment Variables Reference

### Backend (`backend/.env` & Render Dashboard)
| Variable | Default (Local) | Render Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `production` | Execution mode |
| `PORT` | `3000` | `10000` | HTTP port (`server.ts` listens on `0.0.0.0`) |
| `LLM_PROVIDER` | `openai` | `openai` | Active story generator (`openai`, `mock`) |
| `TTS_PROVIDER` | `openai` | `openai` | Active TTS synthesizer (`openai`, `sarvam`, `elevenlabs`, `mock`) |
| `VOICE_PROVIDER` | `sarvam` | `sarvam` | Voice cloning provider (`sarvam`, `elevenlabs`, `mock`) |
| `STORAGE_PROVIDER` | `local` | `local` | Storage adapter (`local`, `s3`, `mock`) |
| `SPEECH_PROVIDER` | `openai` | `openai` | Speech-to-text (`openai`, `sarvam`, `mock`) |
| `AUDIO_MODE` | `full_file` | `full_file` | Strategy (`full_file`, `streaming`) |
| `OPENAI_API_KEY` | *(Required for live)* | *(Set in dashboard)* | OpenAI API token for GPT-4o-mini & TTS |
| `SARVAM_API_KEY` | *(Optional)* | *(Set if using Sarvam)* | Sarvam AI token for Indian languages |
| `ELEVENLABS_API_KEY`| *(Optional)* | *(Set if using ElevenLabs)* | ElevenLabs token |
| `AWS_S3_BUCKET` | *(Optional)* | *(Set if using S3)* | S3 bucket for audio uploads |
| `LOCAL_STORAGE_DIR` | `./storage_uploads`| `./storage_uploads` | Disk folder for local storage |
| `SIGNED_URL_EXPIRY_SECONDS` | `900` | `900` | Expiration time for audio URLs (15 mins) |

### Mobile (`mobile/.env`)
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_BASE_URL` | `https://bedtime-ai-backend.onrender.com/api/v1` | URL consumed by mobile app |
| `EXPO_PUBLIC_ENV` | `production` | Mobile runtime mode |

---

## 7. Key Bug Fixes & Engineering Decisions Log

### 1. Windows PowerShell Script Execution Policy
- **Symptom**: `npm run build` fails with `PSSecurityException: File npm.ps1 cannot be loaded because running scripts is disabled`.
- **Root Cause**: PowerShell restricts unauthenticated `.ps1` execution.
- **Solution**: Execute `npm.cmd run build` or run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

### 2. Render Production Build Failure (`tsc: not found` & Missing Types)
- **Symptom**: Render build fails during `npm run build` with `tsc: command not found` or `Could not find a declaration file for module 'express' / 'multer'`.
- **Root Cause**: Render sets `NODE_ENV=production`. In production, npm strips `devDependencies`. Initially, `typescript` and type declaration packages (`@types/express`, `@types/node`, `@types/cors`, `@types/multer`, `@types/uuid`) were in `devDependencies`.
- **Solution**: Moved `typescript` and all compilation `@types/*` to `dependencies` in `package.json`. Synced `package-lock.json`. Confirmed with zero-dependency isolated sandbox build.

### 3. Story Audio Synthesis Failure (`audioStatus: "failed"`)
- **Symptom**: Story text generated cleanly via OpenAI, but `audioStatus` returned `"failed"`.
- **Root Causes**:
  1. `render.yaml` was configured with `TTS_PROVIDER=sarvam`, but the user had only configured `OPENAI_API_KEY` in Render.
  2. Even with Sarvam, Sarvam rejected `languageCode: "en-US"` because it only supports Indian locale codes (e.g. `en-IN`, `hi-IN`).
  3. Sarvam rejects inputs longer than 500 characters, whereas complete stories exceed 600–1200 characters.
  4. Errors were swallowed with `audioStatus: "failed"` without attaching error diagnostics.
- **Solutions Implemented**:
  1. Created [`OpenAITTSProvider`](https://github.com/UvanShankar/bedtime-ai-backend/blob/main/src/providers/tts/openai/OpenAITTSProvider.ts) using OpenAI `tts-1` (`nova` bedtime voice, mp3 output).
  2. Defaulted `TTS_PROVIDER` to `openai` in `render.yaml` and auto-detected it from available keys.
  3. Added auto-fallback to OpenAI TTS inside `SarvamTTSProvider` and `ElevenLabsTTSProvider`.
  4. Added language code normalization (`en-US` -> `en-IN`) and automatic 480-character sentence chunking in `SarvamTTSProvider`.
  5. Added `audioError?: string` on the `Story` model and exposed provider health diagnostics in `/api/v1/health`.

### 4. Storage & Audio URLs on Render vs Localhost
- **Symptom**: `LocalStorageProvider` generated URLs pointing to `http://localhost:10000`, which mobile devices or emulators cannot resolve over the internet.
- **Solution**:
  1. In `backend/src/app.ts`, `LocalStorageProvider` automatically detects `process.env.RENDER_EXTERNAL_URL` (provided by Render) and constructs `https://bedtime-ai-backend.onrender.com/api/v1/storage/...`.
  2. In `mobile/src/hooks/useAudioPlayer.ts`, `normalizeAudioUrl` automatically rewrites any remaining `localhost` or `10.0.2.2` URLs to the live Render domain when configured with a remote base URL.

---

## 8. Quick Start Guide for Developers

### Local Backend Development
```powershell
cd C:\Users\Uvanshankar\bedtime-ai\backend

# Install dependencies:
npm.cmd install

# Run TypeScript compilation:
npm.cmd run build

# Run complete test suite (unit + integration):
npm.cmd test

# Run backend with hot reload:
npm.cmd run dev
```

### Local Mobile App (Expo)
```powershell
cd C:\Users\Uvanshankar\bedtime-ai\mobile

# Install dependencies:
npm.cmd install

# Type-check TypeScript:
npx.cmd tsc --noEmit

# Start Expo dev server:
npm.cmd start

# Launch directly in connected Android Emulator:
npm.cmd run android
```

### Triggering a New Render Deployment
Pushing to the `main` branch of `UvanShankar/bedtime-ai-backend` automatically triggers a build and deploy on Render. You can also trigger it manually from the [Render Dashboard](https://dashboard.render.com) -> `bedtime-ai-backend` -> **Manual Deploy** -> **Deploy latest commit**.
