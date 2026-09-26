import { VoiceCloneProvider, VoiceCloneInput, VoiceCloneResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface ElevenLabsVoiceCloneOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class ElevenLabsVoiceCloneProvider implements VoiceCloneProvider {
  public readonly name = "elevenlabs";
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: ElevenLabsVoiceCloneOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.elevenlabs.io/v1";
  }

  async createVoiceProfile(input: VoiceCloneInput): Promise<VoiceCloneResult> {
    if (!input.consent) {
      throw AppError.consentRequired();
    }

    if (!this.apiKey) {
      throw new AppError("ElevenLabs API key is required", "VOICE_CLONE_FAILED", 500);
    }

    try {
      const formData = new FormData();
      formData.append("name", `BedtimeParent_${Date.now()}`);
      formData.append("description", `Parent bedtime story voice (${input.languageCode})`);

      const blob = new Blob([input.audioFile], { type: input.mimeType || "audio/wav" });
      formData.append("files", blob, "sample.wav");

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(`ElevenLabs voice clone failed ${response.status}: ${errorText}`, "VOICE_CLONE_FAILED", 502);
      }

      const data = (await response.json()) as { voice_id: string };
      return {
        providerVoiceId: data.voice_id,
        metadata: { provider: "elevenlabs" },
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`ElevenLabs clone error: ${err.message}`, "VOICE_CLONE_FAILED", 502, err);
    }
  }

  async deleteVoiceProfile(providerVoiceId: string): Promise<void> {
    if (!this.apiKey) return;
    try {
      await fetch(`${this.baseUrl}/voices/${providerVoiceId}`, {
        method: "DELETE",
        headers: { "xi-api-key": this.apiKey },
      });
    } catch {
      // Best-effort cleanup
    }
  }
}
