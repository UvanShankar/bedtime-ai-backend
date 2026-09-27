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
  "as-in": "as-IN",
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

    // Detect if this is a custom cloned voice ID (e.g. svc-...) or standard preset speaker
    const isClonedVoice = typeof input.voiceId === "string" && input.voiceId.startsWith("svc-");
    const validSpeakers = ["meera", "arvind", "pavithra", "maitreyi", "amartya", "pooja", "kavya", "ratan", "ananya", "priya"];
    const speaker = validSpeakers.includes(input.voiceId?.toLowerCase()) ? input.voiceId.toLowerCase() : "meera";

    // Split text into chunks to respect Sarvam limits (500 for standard, 1000 for cloned)
    const maxChunkLength = isClonedVoice ? 900 : 480;
    const combinedText = input.segments.map((s) => s.text).join(" ... ");
    const chunks: string[] = [];

    if (combinedText.length <= maxChunkLength) {
      chunks.push(combinedText);
    } else {
      const sentences = combinedText.split(/(?<=[.?!])\s+/);
      let currentChunk = "";
      for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).trim().length <= maxChunkLength) {
          currentChunk = (currentChunk + " " + sentence).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence.slice(0, maxChunkLength);
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }

    try {
      const audioBuffers: Buffer[] = [];
      let totalDuration = 0;
      let lastRequestId: string | undefined;

      for (const chunk of chunks) {
        let response: Response;

        if (isClonedVoice) {
          // Use official POST /voices/clone API for cloned parent voices
          const formData = new FormData();
          formData.append("voice_id", input.voiceId);
          formData.append("text", chunk);
          formData.append("language_code", targetLanguageCode);
          formData.append("pace", "0.9");
          formData.append("output_audio_codec", "wav");

          response = await fetch(`${this.baseUrl}/voices/clone`, {
            method: "POST",
            headers: {
              "api-subscription-key": this.apiKey,
            },
            body: formData,
          });
        } else {
          // Use standard POST /text-to-speech for pre-built Sarvam speakers
          response = await fetch(`${this.baseUrl}/text-to-speech`, {
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
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new AppError(`Sarvam synthesis API returned ${response.status}: ${errorText}`, "TTS_FAILED", 502);
        }

        const data = (await response.json()) as any;
        const base64Audio = isClonedVoice ? data.audio : data.audios?.[0];

        if (!base64Audio) {
          throw new AppError("Sarvam returned empty audio data", "TTS_FAILED", 502);
        }

        const buf = Buffer.from(base64Audio, "base64");
        audioBuffers.push(buf);
        totalDuration += data.audio_duration ? Math.round(data.audio_duration) : Math.round(buf.length / (22050 * 2));
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
