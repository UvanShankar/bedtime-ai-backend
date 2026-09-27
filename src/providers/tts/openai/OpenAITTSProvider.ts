import OpenAI from "openai";
import { TTSProvider, TTSRequest, TTSResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export class OpenAITTSProvider implements TTSProvider {
  public readonly name = "openai";
  private openai?: OpenAI;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    if (!this.openai) {
      throw new AppError("OpenAI API key is required for TTS synthesis", "TTS_FAILED", 500);
    }

    const combinedText = input.segments.map((s) => s.text).join("\n\n");
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const voice = (input.voiceId && validVoices.includes(input.voiceId.toLowerCase()))
      ? (input.voiceId.toLowerCase() as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer")
      : "nova";

    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice,
        input: combinedText,
        response_format: "mp3",
        speed: 0.9,
      });

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      // Estimate duration from word count at ~120 words per minute for gentle bedtime pace
      const wordCount = combinedText.split(/\s+/).filter(Boolean).length;
      const durationSeconds = Math.max(5, Math.round((wordCount / 120) * 60));

      return {
        audioBuffer,
        mimeType: "audio/mpeg",
        durationSeconds,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`OpenAI TTS synthesis failed: ${err.message}`, "TTS_FAILED", 502, err);
    }
  }

  async *synthesizeStream(input: TTSRequest): AsyncIterable<Uint8Array> {
    const result = await this.synthesize(input);
    yield new Uint8Array(result.audioBuffer);
  }
}
