import { VoiceCloneProvider, VoiceCloneInput, VoiceCloneResult } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export class MockVoiceCloneProvider implements VoiceCloneProvider {
  public readonly name = "mock";

  async createVoiceProfile(input: VoiceCloneInput): Promise<VoiceCloneResult> {
    if (!input.consent) {
      throw AppError.consentRequired();
    }

    if (!input.audioFile || input.audioFile.length === 0) {
      throw AppError.badRequest("Invalid audio sample provided", "INVALID_AUDIO");
    }

    return {
      providerVoiceId: `mock_voice_${Date.now()}`,
      metadata: {
        model: "mock-voice-cloner-v1",
        sampleLengthBytes: input.audioFile.length,
        language: input.languageCode,
        clonedAt: new Date().toISOString(),
      },
    };
  }

  async deleteVoiceProfile(providerVoiceId: string): Promise<void> {
    // No-op for mock
  }
}
