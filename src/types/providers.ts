import { ChildProfile, ParentProfile, ParentStyleProfile, StoryRequest, StorySegment } from "./models.js";

export interface TTSRequest {
  voiceId: string;
  languageCode: string;
  segments: StorySegment[];
  outputFormat: "mp3" | "wav";
}

export interface TTSResult {
  audioBuffer: Buffer;
  mimeType: string;
  durationSeconds?: number;
  providerRequestId?: string;
}

export interface TTSProvider {
  name: string;
  synthesize(input: TTSRequest): Promise<TTSResult>;
  synthesizeStream?(input: TTSRequest): AsyncIterable<Uint8Array>;
}

export interface VoiceCloneInput {
  audioFile: Buffer;
  mimeType: string;
  languageCode: string;
  consent: boolean;
}

export interface VoiceCloneResult {
  providerVoiceId: string;
  metadata?: Record<string, unknown>;
}

export interface VoiceCloneProvider {
  name: string;
  createVoiceProfile(input: VoiceCloneInput): Promise<VoiceCloneResult>;
  deleteVoiceProfile?(providerVoiceId: string): Promise<void>;
}

export interface StorageProvider {
  name: string;
  upload(input: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export interface SpeechToTextInput {
  audioBuffer: Buffer;
  mimeType: string;
  languageCode?: string;
}

export interface SpeechToTextResult {
  text: string;
  languageDetected?: string;
}

export interface SpeechToTextProvider {
  name: string;
  transcribe(input: SpeechToTextInput): Promise<SpeechToTextResult>;
}

export interface StoryGenerationContext {
  parent: ParentProfile;
  child: ChildProfile;
  style: ParentStyleProfile;
  request: StoryRequest;
  externalKnowledge?: string;
}

export interface LLMStoryResponse {
  title: string;
  languageCode: string;
  summary: string;
  segments: Array<{
    id: string;
    order: number;
    text: string;
    emotion?: string;
    pace?: string;
    energy?: string;
    pauseBeforeMs?: number;
    pauseAfterMs?: number;
    emphasis?: string[];
  }>;
  ending: {
    style: string;
    emotion: string;
  };
}

export interface LLMProvider {
  name: string;
  generateStructuredStory(context: StoryGenerationContext): Promise<LLMStoryResponse>;
  analyzeParentStyle(transcript: string, metadata?: Record<string, unknown>): Promise<Partial<ParentStyleProfile>>;
}
