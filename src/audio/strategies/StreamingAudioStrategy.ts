import { AudioStrategy, AudioGenerationStrategyContext, AudioGenerationStrategyResult } from "./AudioStrategy.js";

export class StreamingAudioStrategy implements AudioStrategy {
  public readonly mode = "streaming" as const;

  async generateAudio(context: AudioGenerationStrategyContext): Promise<AudioGenerationStrategyResult> {
    const { story, ttsProvider } = context;

    // For streaming mode, generate a direct streaming endpoint URL on the backend
    const streamUrl = `/api/v1/stories/${story.id}/stream`;

    return {
      audioUrl: streamUrl,
      mimeType: ttsProvider.name === "elevenlabs" ? "audio/mpeg" : "audio/wav",
      mode: "streaming",
    };
  }
}
