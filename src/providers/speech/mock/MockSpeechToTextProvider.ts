import { SpeechToTextProvider, SpeechToTextInput, SpeechToTextResult } from "../../../types/providers.js";

export class MockSpeechToTextProvider implements SpeechToTextProvider {
  public readonly name = "mock";

  async transcribe(input: SpeechToTextInput): Promise<SpeechToTextResult> {
    return {
      text: "Once upon a time in our quiet little house, my sweet star, the moon was watching over you. Sleep softly, my love.",
      languageDetected: input.languageCode || "en-US",
    };
  }
}
