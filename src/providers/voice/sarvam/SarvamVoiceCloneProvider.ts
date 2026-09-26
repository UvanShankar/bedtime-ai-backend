import { VoiceCloneProvider, VoiceCloneInput, VoiceCloneResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface SarvamVoiceCloneOptions {
  apiKey?: string;
  baseUrl?: string;
}

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

    // Default to mapped Indian regional speaker profile or registered voice
    return {
      providerVoiceId: "meera",
      metadata: {
        provider: "sarvam",
        languageCode: input.languageCode,
        voiceName: "meera",
      },
    };
  }

  async deleteVoiceProfile(providerVoiceId: string): Promise<void> {
    // No-op for base speaker
  }
}
