import { TTSProvider, TTSRequest, TTSResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface ElevenLabsTTSOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class ElevenLabsTTSProvider implements TTSProvider {
  public readonly name = "elevenlabs";
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: ElevenLabsTTSOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.elevenlabs.io/v1";
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    if (!this.apiKey) {
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
        durationSeconds: Math.round(audioBuffer.length / 16000), // approximate for 128kbps mp3
        providerRequestId: response.headers.get("request-id") || undefined,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`ElevenLabs TTS synthesis failed: ${err.message}`, "TTS_FAILED", 502, err);
    }
  }

  async *synthesizeStream(input: TTSRequest): AsyncIterable<Uint8Array> {
    if (!this.apiKey) {
      throw new AppError("ElevenLabs API key is required", "TTS_FAILED", 500);
    }

    const combinedText = input.segments.map((s) => s.text).join(" ... ");
    const voiceId = input.voiceId || "21m00Tcm4TlvDq8ikWAM";

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
        voice_settings: {
          stability: 0.8,
          similarity_boost: 0.85,
        },
      }),
    });

    if (!response.ok || !response.body) {
      throw new AppError(`ElevenLabs stream returned error ${response.status}`, "TTS_FAILED", 502);
    }

    const reader = (response.body as any).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) yield value;
    }
  }
}
