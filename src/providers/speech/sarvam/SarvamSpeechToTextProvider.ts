import { SpeechToTextProvider, SpeechToTextInput, SpeechToTextResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface SarvamSTTOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class SarvamSpeechToTextProvider implements SpeechToTextProvider {
  public readonly name = "sarvam";
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: SarvamSTTOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.sarvam.ai";
  }

  async transcribe(input: SpeechToTextInput): Promise<SpeechToTextResult> {
    if (!this.apiKey) {
      throw new AppError("Sarvam API key is required for Sarvam STT", "STYLE_ANALYSIS_FAILED", 500);
    }

    try {
      const formData = new FormData();
      const blob = new Blob([input.audioBuffer], { type: input.mimeType || "audio/wav" });
      formData.append("file", blob, "voice_sample.wav");
      formData.append("model", "saarika:v2");
      if (input.languageCode) {
        formData.append("language_code", input.languageCode);
      }

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: "POST",
        headers: {
          "api-subscription-key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new AppError(`Sarvam STT failed ${response.status}: ${errText}`, "STYLE_ANALYSIS_FAILED", 502);
      }

      const data = (await response.json()) as { transcript: string; language_code?: string };
      return {
        text: data.transcript,
        languageDetected: data.language_code,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Sarvam STT error: ${err.message}`, "STYLE_ANALYSIS_FAILED", 502, err);
    }
  }
}
