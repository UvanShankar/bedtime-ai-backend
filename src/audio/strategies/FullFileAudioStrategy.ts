import { AudioStrategy, AudioGenerationStrategyContext, AudioGenerationStrategyResult } from "./AudioStrategy.js";

export class FullFileAudioStrategy implements AudioStrategy {
  public readonly mode = "full_file" as const;

  async generateAudio(context: AudioGenerationStrategyContext): Promise<AudioGenerationStrategyResult> {
    const { story, ttsProvider, storageProvider, signedUrlExpirySeconds } = context;

    // 1. Synthesize full audio file through provider
    const ttsResult = await ttsProvider.synthesize({
      voiceId: story.ttsProvider || "default",
      languageCode: story.languageCode,
      segments: story.segments,
      outputFormat: ttsResultFormat(ttsResultMime(ttsProvider.name)),
    });

    const ext = ttsResult.mimeType.includes("wav") ? "wav" : "mp3";
    const audioKey = `parents/${story.parentId}/stories/${story.id}/audio.${ext}`;

    // 2. Upload private audio file to storage
    await storageProvider.upload({
      key: audioKey,
      body: ttsResult.audioBuffer,
      contentType: ttsResult.mimeType,
    });

    // 3. Generate short-lived signed playback URL
    const audioUrl = await storageProvider.getSignedUrl(audioKey, signedUrlExpirySeconds);

    return {
      audioKey,
      audioUrl,
      durationSeconds: ttsResult.durationSeconds,
      mimeType: ttsResult.mimeType,
      mode: "full_file",
    };
  }
}

function ttsResultMime(providerName: string): string {
  if (providerName === "elevenlabs") return "audio/mpeg";
  return "audio/wav";
}

function ttsResultFormat(mime: string): "mp3" | "wav" {
  return mime.includes("wav") ? "wav" : "mp3";
}
