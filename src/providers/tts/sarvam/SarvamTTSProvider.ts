import { TTSProvider, TTSRequest, TTSResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface SarvamTTSOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class SarvamTTSProvider implements TTSProvider {
  public readonly name = "sarvam";
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: SarvamTTSOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.sarvam.ai";
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    if (!this.apiKey) {
      throw new AppError("Sarvam API key is required", "TTS_FAILED", 500);
    }

    // Combine segment texts with appropriate punctuation and pauses
    const combinedText = input.segments.map((s) => s.text).join(" ... ");

    const validSpeakers = ["meera", "arvind", "pavithra", "maitreyi", "amartya", "pooja", "kavya", "ratan", "ananya", "priya"];
    const speaker = validSpeakers.includes(input.voiceId?.toLowerCase()) ? input.voiceId.toLowerCase() : "meera";

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: "POST",
        headers: {
          "api-subscription-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [combinedText],
          target_language_code: input.languageCode || "en-IN",
          speaker,
          model: "bulbul:v1",
          pace: 0.9, // slightly slower for bedtime
          speech_sample_rate: 22050,
          enable_preprocessing: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(`Sarvam TTS API returned ${response.status}: ${errorText}`, "TTS_FAILED", 502);
      }

      const data = (await response.json()) as { audios?: string[]; request_id?: string };
      if (!data.audios || data.audios.length === 0) {
        throw new AppError("Sarvam returned empty audio data", "TTS_FAILED", 502);
      }

      const audioBuffer = Buffer.from(data.audios[0], "base64");
      return {
        audioBuffer,
        mimeType: "audio/wav",
        durationSeconds: Math.round(audioBuffer.length / (22050 * 2)),
        providerRequestId: data.request_id,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Sarvam TTS synthesis failed: ${err.message}`, "TTS_FAILED", 502, err);
    }
  }
}
