import { ProviderRegistry } from "../../src/providers/ProviderRegistry.js";
import { MockLLMProvider } from "../../src/providers/llm/mock/MockLLMProvider.js";
import { MockTTSProvider } from "../../src/providers/tts/mock/MockTTSProvider.js";
import { MockVoiceCloneProvider } from "../../src/providers/voice/mock/MockVoiceCloneProvider.js";
import { MockStorageProvider } from "../../src/providers/storage/mock/MockStorageProvider.js";

describe("ProviderRegistry", () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  it("should register and retrieve providers without modifying business logic", () => {
    const mockLlm = new MockLLMProvider();
    const mockTts = new MockTTSProvider();
    const mockVoice = new MockVoiceCloneProvider();
    const mockStorage = new MockStorageProvider();

    registry.registerLLM(mockLlm);
    registry.registerTTS(mockTts);
    registry.registerVoiceProvider(mockVoice);
    registry.registerStorage(mockStorage);

    expect(registry.getLLM("mock")).toBe(mockLlm);
    expect(registry.getTTS("mock")).toBe(mockTts);
    expect(registry.getVoiceProvider("mock")).toBe(mockVoice);
    expect(registry.getStorage("mock")).toBe(mockStorage);
  });

  it("should throw AppError with appropriate code when provider is missing", () => {
    expect(() => registry.getTTS("unknown-provider")).toThrow("TTS provider 'unknown-provider' not found");
  });
});
