import { TTSProvider, TTSRequest, TTSResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";
import { OpenAITTSProvider } from "../openai/OpenAITTSProvider.js";

export interface ElevenLabsTTSOptions {
  apiKey?: string;
  baseUrl?: string;
  openaiFallback?: OpenAITTSProvider;
}

export class ElevenLabsTTSProvider implements TTSProvider {
  public readonly name = "elevenlabs";
  private apiKey?: string;
  private baseUrl: string;
  private openaiFallback?: OpenAITTSProvider;

  constructor(options: ElevenLabsTTSOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.elevenlabs.io/v1";
    this.openaiFallback = options.openaiFallback;
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    if (!this.apiKey) {
      if (this.openaiFallback) {
        console.warn("[ElevenLabsTTSProvider] ElevenLabs API key not configured; falling back to OpenAI TTS");
        return this.openaiFallback.synthesize(input);
      }
      throw new AppError("ElevenLabs API key is required", "TTS_FAILED", 500);
    }

    const defaultVoice = "21m00Tcm4TlvDq8ikWAM";
    const voiceId =
      input.voiceId && input.voiceId !== "default" && !input.voiceId.startsWith("mock")
        ? input.voiceId
        : defaultVoice;

    const combinedText = input.segments.map((s) => s.text).join(" ... ");

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: combinedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(`ElevenLabs TTS returned ${response.status}: ${errorText}`, "TTS_FAILED", 502);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      return {
        audioBuffer,
        mimeType: "audio/mpeg",
        durationSeconds: Math.round(audioBuffer.length / (16000 * 2)),
      };
    } catch (err: any) {
      if (this.openaiFallback) {
        console.warn(`[ElevenLabsTTSProvider] Synthesis failed: ${err.message}. Falling back to OpenAI TTS.`);
        return this.openaiFallback.synthesize(input);
      }
      if (err instanceof AppError) throw err;
      throw new AppError(`ElevenLabs TTS synthesis failed: ${err.message}`, "TTS_FAILED", 502, err);
    }
  }

  async *synthesizeStream(input: TTSRequest): AsyncIterable<Uint8Array> {
    if (!this.apiKey) {
      if (this.openaiFallback) {
        yield* this.openaiFallback.synthesizeStream(input);
        return;
      }
      throw new AppError("ElevenLabs API key is required", "TTS_FAILED", 500);
    }

    const defaultVoice = "21m00Tcm4TlvDq8ikWAM";
    const voiceId =
      input.voiceId && input.voiceId !== "default" && !input.voiceId.startsWith("mock")
        ? input.voiceId
        : defaultVoice;

    const combinedText = input.segments.map((s) => s.text).join(" ... ");

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: combinedText,
        model_id: "eleven_multilingual_v2",
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new AppError(`ElevenLabs TTS streaming returned ${response.status}: ${errorText}`, "TTS_FAILED", 502);
    }

    const reader = (response.body as any).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) yield value;
    }
  }
}
