import { Story } from "../../types/models.js";
import { TTSProvider, StorageProvider } from "../../types/providers.js";

export interface AudioGenerationStrategyContext {
  story: Story;
  ttsProvider: TTSProvider;
  storageProvider: StorageProvider;
  signedUrlExpirySeconds: number;
}

export interface AudioGenerationStrategyResult {
  audioKey?: string;
  audioUrl: string;
  durationSeconds?: number;
  mimeType: string;
  mode: "full_file" | "streaming";
}

export interface AudioStrategy {
  readonly mode: "full_file" | "streaming";
  generateAudio(context: AudioGenerationStrategyContext): Promise<AudioGenerationStrategyResult>;
}
