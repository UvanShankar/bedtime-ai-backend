import express, { Express } from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";
import { providerRegistry } from "./providers/ProviderRegistry.js";

// Import all providers
import { OpenAIStoryProvider } from "./providers/llm/openai/OpenAIStoryProvider.js";
import { MockLLMProvider } from "./providers/llm/mock/MockLLMProvider.js";

import { SarvamTTSProvider } from "./providers/tts/sarvam/SarvamTTSProvider.js";
import { ElevenLabsTTSProvider } from "./providers/tts/elevenlabs/ElevenLabsTTSProvider.js";
import { OpenAITTSProvider } from "./providers/tts/openai/OpenAITTSProvider.js";
import { MockTTSProvider } from "./providers/tts/mock/MockTTSProvider.js";

import { SarvamVoiceCloneProvider } from "./providers/voice/sarvam/SarvamVoiceCloneProvider.js";
import { ElevenLabsVoiceCloneProvider } from "./providers/voice/elevenlabs/ElevenLabsVoiceCloneProvider.js";
import { MockVoiceCloneProvider } from "./providers/voice/mock/MockVoiceCloneProvider.js";

import { S3StorageProvider } from "./providers/storage/s3/S3StorageProvider.js";
import { LocalStorageProvider } from "./providers/storage/local/LocalStorageProvider.js";
import { MockStorageProvider } from "./providers/storage/mock/MockStorageProvider.js";

import { OpenAISpeechToTextProvider } from "./providers/speech/openai/OpenAISpeechToTextProvider.js";
import { SarvamSpeechToTextProvider } from "./providers/speech/sarvam/SarvamSpeechToTextProvider.js";
import { MockSpeechToTextProvider } from "./providers/speech/mock/MockSpeechToTextProvider.js";

export function initializeProviders() {
  // 1. LLM Providers
  providerRegistry.registerLLM(new MockLLMProvider());
  providerRegistry.registerLLM(
    new OpenAIStoryProvider({
      apiKey: config.openai.apiKey,
      storyModel: config.openai.storyModel,
      analysisModel: config.openai.analysisModel,
    })
  );

  // 2. TTS Providers
  const openAITTS = new OpenAITTSProvider(config.openai.apiKey);
  providerRegistry.registerTTS(new MockTTSProvider());
  providerRegistry.registerTTS(openAITTS);
  providerRegistry.registerTTS(
    new SarvamTTSProvider({
      apiKey: config.sarvam.apiKey,
      baseUrl: config.sarvam.baseUrl,
      openaiFallback: openAITTS,
    })
  );
  providerRegistry.registerTTS(
    new ElevenLabsTTSProvider({
      apiKey: config.elevenlabs.apiKey,
      baseUrl: config.elevenlabs.baseUrl,
      openaiFallback: openAITTS,
    })
  );

  // 3. Voice Clone Providers
  providerRegistry.registerVoiceProvider(new MockVoiceCloneProvider());
  providerRegistry.registerVoiceProvider(
    new SarvamVoiceCloneProvider({
      apiKey: config.sarvam.apiKey,
      baseUrl: config.sarvam.baseUrl,
    })
  );
  providerRegistry.registerVoiceProvider(
    new ElevenLabsVoiceCloneProvider({
      apiKey: config.elevenlabs.apiKey,
      baseUrl: config.elevenlabs.baseUrl,
    })
  );

  // 4. Storage Providers
  providerRegistry.registerStorage(new MockStorageProvider());
  const storageBaseUrl =
    process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL
      ? `${(process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL)!.replace(/\/$/, "")}/api/v1/storage`
      : `http://localhost:${config.port}/api/v1/storage`;

  providerRegistry.registerStorage(
    new LocalStorageProvider(config.localStorageDir, storageBaseUrl)
  );
  providerRegistry.registerStorage(
    new S3StorageProvider({
      bucket: config.aws.bucket,
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      endpoint: config.aws.endpoint,
    })
  );

  // 5. Speech Providers
  providerRegistry.registerSpeech(new MockSpeechToTextProvider());
  providerRegistry.registerSpeech(new OpenAISpeechToTextProvider(config.openai.apiKey));
  providerRegistry.registerSpeech(
    new SarvamSpeechToTextProvider({
      apiKey: config.sarvam.apiKey,
      baseUrl: config.sarvam.baseUrl,
    })
  );
}

export function createApp(): Express {
  initializeProviders();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Mount API routes at /api/v1
  app.use("/api/v1", apiRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
}
