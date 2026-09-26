import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  aws: {
    region: string;
    bucket: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
  };
  openai: {
    apiKey?: string;
    storyModel: string;
    analysisModel: string;
  };
  sarvam: {
    apiKey?: string;
    baseUrl: string;
  };
  elevenlabs: {
    apiKey?: string;
    baseUrl: string;
  };
  providers: {
    llm: "openai" | "mock";
    tts: "sarvam" | "elevenlabs" | "mock";
    voice: "sarvam" | "elevenlabs" | "mock";
    storage: "s3" | "local" | "mock";
    speech: "openai" | "sarvam" | "mock";
  };
  audioMode: "full_file" | "streaming";
  signedUrlExpirySeconds: number;
  maxVoiceFileMb: number;
  localStorageDir: string;
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  aws: {
    region: process.env.AWS_REGION || "ap-south-1",
    bucket: process.env.AWS_S3_BUCKET || "bedtime-ai-audio-storage",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    storyModel: process.env.OPENAI_STORY_MODEL || "gpt-4o-mini",
    analysisModel: process.env.OPENAI_ANALYSIS_MODEL || "gpt-4o-mini",
  },
  sarvam: {
    apiKey: process.env.SARVAM_API_KEY,
    baseUrl: process.env.SARVAM_BASE_URL || "https://api.sarvam.ai",
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    baseUrl: process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io/v1",
  },
  providers: {
    llm: (process.env.LLM_PROVIDER as any) || "openai",
    tts: (process.env.TTS_PROVIDER as any) || (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "sarvam"),
    voice: (process.env.VOICE_PROVIDER as any) || (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "sarvam"),
    storage:
      (process.env.STORAGE_PROVIDER as any) ||
      (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID ? "s3" : "local"),
    speech:
      (process.env.SPEECH_PROVIDER as any) ||
      (process.env.SARVAM_API_KEY && !process.env.OPENAI_API_KEY ? "sarvam" : "openai"),
  },
  audioMode: (process.env.AUDIO_MODE as any) || "full_file",
  signedUrlExpirySeconds: parseInt(process.env.SIGNED_URL_EXPIRY_SECONDS || "900", 10),
  maxVoiceFileMb: parseInt(process.env.MAX_VOICE_FILE_MB || "25", 10),
  localStorageDir: process.env.LOCAL_STORAGE_DIR || "./storage_uploads",
};
