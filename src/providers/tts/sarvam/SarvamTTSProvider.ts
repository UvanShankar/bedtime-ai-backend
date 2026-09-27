import { TTSProvider, TTSRequest, TTSResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";
import { OpenAITTSProvider } from "../openai/OpenAITTSProvider.js";

export interface SarvamTTSOptions {
  apiKey?: string;
  baseUrl?: string;
  openaiFallback?: OpenAITTSProvider;
}

const SARVAM_SUPPORTED_LANGUAGES: Record<string, string> = {
  "en-us": "en-IN",
  "en-gb": "en-IN",
  "en": "en-IN",
  "en-in": "en-IN",
  "hi-in": "hi-IN",
  "hi": "hi-IN",
  "ta-in": "ta-IN",
  "ta": "ta-IN",
  "te-in": "te-IN",
  "te": "te-IN",
  "kn-in": "kn-IN",
  "kn": "kn-IN",
  "ml-in": "ml-IN",
  "ml": "ml-IN",
  "mr-in": "mr-IN",
  "mr": "mr-IN",
  "gu-in": "gu-IN",
  "gu": "gu-IN",
  "bn-in": "bn-IN",
  "bn": "bn-IN",
  "pa-in": "pa-IN",
  "pa": "pa-IN",
  "od-in": "od-IN",
  "od": "od-IN",
};

export class SarvamTTSProvider implements TTSProvider {
  public readonly name = "sarvam";
  private apiKey?: string;
  private baseUrl: string;
  private openaiFallback?: OpenAITTSProvider;

  constructor(options: SarvamTTSOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.sarvam.ai";
    this.openaiFallback = options.openaiFallback;
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    if (!this.apiKey) {
      if (this.openaiFallback) {
        console.warn("[SarvamTTSProvider] Sarvam API key not configured; falling back to OpenAI TTS");
        return this.openaiFallback.synthesize(input);
      }
      throw new AppError("Sarvam API key is required", "TTS_FAILED", 500);
    }

    const langKey = (input.languageCode || "en-IN").toLowerCase();
    const targetLanguageCode = SARVAM_SUPPORTED_LANGUAGES[langKey] || "en-IN";

    const validSpeakers = ["meera", "arvind", "pavithra", "maitreyi", "amartya", "pooja", "kavya", "ratan", "ananya", "priya"];
    const speaker = validSpeakers.includes(input.voiceId?.toLowerCase()) ? input.voiceId.toLowerCase() : "meera";

    // Split text into chunks <= 450 characters to adhere to Sarvam's 500-char input limit
    const combinedText = input.segments.map((s) => s.text).join(" ... ");
    const chunks: string[] = [];
    if (combinedText.length <= 480) {
      chunks.push(combinedText);
    } else {
      const sentences = combinedText.split(/(?<=[.?!])\s+/);
      let currentChunk = "";
      for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).trim().length <= 480) {
          currentChunk = (currentChunk + " " + sentence).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence.slice(0, 480);
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }

    try {
      const audioBuffers: Buffer[] = [];
      let totalDuration = 0;
      let lastRequestId: string | undefined;

      for (const chunk of chunks) {
        const response = await fetch(`${this.baseUrl}/text-to-speech`, {
          method: "POST",
          headers: {
            "api-subscription-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: [chunk],
            target_language_code: targetLanguageCode,
            speaker,
            model: "bulbul:v1",
            pace: 0.9,
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

        const buf = Buffer.from(data.audios[0], "base64");
        audioBuffers.push(buf);
        totalDuration += Math.round(buf.length / (22050 * 2));
        lastRequestId = data.request_id;
      }

      const finalBuffer = audioBuffers.length === 1 ? audioBuffers[0] : Buffer.concat(audioBuffers);

      return {
        audioBuffer: finalBuffer,
        mimeType: "audio/wav",
        durationSeconds: Math.max(1, totalDuration),
        providerRequestId: lastRequestId,
      };
    } catch (err: any) {
      if (this.openaiFallback) {
        console.warn(`[SarvamTTSProvider] Synthesis failed: ${err.message}. Falling back to OpenAI TTS.`);
        return this.openaiFallback.synthesize(input);
      }
      if (err instanceof AppError) throw err;
      throw new AppError(`Sarvam TTS synthesis failed: ${err.message}`, "TTS_FAILED", 502, err);
    }
  }
}
