import { VoiceCloneProvider, VoiceCloneInput, VoiceCloneResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface SarvamVoiceCloneOptions {
  apiKey?: string;
  baseUrl?: string;
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

export class SarvamVoiceCloneProvider implements VoiceCloneProvider {
  public readonly name = "sarvam";
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: SarvamVoiceCloneOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.sarvam.ai";
  }

  async createVoiceProfile(input: VoiceCloneInput): Promise<VoiceCloneResult> {
    if (!input.consent) {
      throw AppError.consentRequired();
    }

    if (!this.apiKey) {
      throw new AppError("Sarvam API key is required for voice cloning", "VOICE_CLONE_FAILED", 500);
    }

    const langKey = (input.languageCode || "en-IN").toLowerCase();
    const targetLanguageCode = SARVAM_SUPPORTED_LANGUAGES[langKey] || "en-IN";

    try {
      const formData = new FormData();
      const blob = new Blob([input.audioFile], { type: input.mimeType || "audio/wav" });
      formData.append("file", blob, "reference_sample.wav");
      formData.append("voice_name", `Parent_${Date.now()}`);
      formData.append("language_code", targetLanguageCode);

      const response = await fetch(`${this.baseUrl}/voices/create`, {
        method: "POST",
        headers: {
          "api-subscription-key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(`Sarvam voice clone failed ${response.status}: ${errorText}`, "VOICE_CLONE_FAILED", 502);
      }

      const resData = (await response.json()) as any;
      const voiceId = resData?.data?.voice_id || resData?.voice_id;

      if (!voiceId) {
        throw new AppError("Sarvam did not return a voice_id", "VOICE_CLONE_FAILED", 502);
      }

      return {
        providerVoiceId: voiceId,
        metadata: {
          provider: "sarvam",
          languageCode: targetLanguageCode,
          referenceText: resData?.data?.reference_text,
        },
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Sarvam voice cloning error: ${err.message}`, "VOICE_CLONE_FAILED", 502, err);
    }
  }

  async deleteVoiceProfile(providerVoiceId: string): Promise<void> {
    if (!this.apiKey || !providerVoiceId.startsWith("svc-")) return;
    try {
      await fetch(`${this.baseUrl}/voices/delete/${providerVoiceId}`, {
        method: "DELETE",
        headers: {
          "api-subscription-key": this.apiKey,
        },
      });
    } catch {
      // Ignore cleanup error
    }
  }
}
