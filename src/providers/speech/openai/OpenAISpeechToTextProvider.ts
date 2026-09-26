import OpenAI, { toFile } from "openai";
import { SpeechToTextProvider, SpeechToTextInput, SpeechToTextResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export class OpenAISpeechToTextProvider implements SpeechToTextProvider {
  public readonly name = "openai";
  private client?: OpenAI;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new AppError(
          "OpenAI API key is missing. Please set OPENAI_API_KEY in your backend .env file for Whisper STT.",
          "INVALID_REQUEST",
          500
        );
      }
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  async transcribe(input: SpeechToTextInput): Promise<SpeechToTextResult> {
    const client = this.getClient();
    try {
      const file = await toFile(input.audioBuffer, "sample.wav", {
        type: input.mimeType || "audio/wav",
      });

      const response = await client.audio.transcriptions.create({
        file,
        model: "whisper-1",
        language: input.languageCode ? input.languageCode.split("-")[0] : undefined,
      });

      return {
        text: response.text,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Whisper transcription failed: ${err.message}`, "STYLE_ANALYSIS_FAILED", 502, err);
    }
  }
}
