import { LLMProvider, TTSProvider, VoiceCloneProvider, StorageProvider, SpeechToTextProvider } from "../types/providers.js";
import { AppError } from "../errors/AppError.js";

export class ProviderRegistry {
  private llmProviders: Map<string, LLMProvider> = new Map();
  private ttsProviders: Map<string, TTSProvider> = new Map();
  private voiceProviders: Map<string, VoiceCloneProvider> = new Map();
  private storageProviders: Map<string, StorageProvider> = new Map();
  private speechProviders: Map<string, SpeechToTextProvider> = new Map();

  registerLLM(provider: LLMProvider): this {
    this.llmProviders.set(provider.name.toLowerCase(), provider);
    return this;
  }

  getLLM(name: string): LLMProvider {
    const provider = this.llmProviders.get(name.toLowerCase());
    if (!provider) {
      throw new AppError(`LLM provider '${name}' not found in registry`, "INVALID_REQUEST", 500);
    }
    return provider;
  }

  registerTTS(provider: TTSProvider): this {
    this.ttsProviders.set(provider.name.toLowerCase(), provider);
    return this;
  }

  getTTS(name: string): TTSProvider {
    const provider = this.ttsProviders.get(name.toLowerCase());
    if (!provider) {
      throw new AppError(`TTS provider '${name}' not found in registry`, "TTS_FAILED", 500);
    }
    return provider;
  }

  registerVoiceProvider(provider: VoiceCloneProvider): this {
    this.voiceProviders.set(provider.name.toLowerCase(), provider);
    return this;
  }

  getVoiceProvider(name: string): VoiceCloneProvider {
    const provider = this.voiceProviders.get(name.toLowerCase());
    if (!provider) {
      throw new AppError(`Voice cloning provider '${name}' not found in registry`, "VOICE_CLONE_FAILED", 500);
    }
    return provider;
  }

  registerStorage(provider: StorageProvider): this {
    this.storageProviders.set(provider.name.toLowerCase(), provider);
    return this;
  }

  getStorage(name: string): StorageProvider {
    const provider = this.storageProviders.get(name.toLowerCase());
    if (!provider) {
      throw new AppError(`Storage provider '${name}' not found in registry`, "AUDIO_UPLOAD_FAILED", 500);
    }
    return provider;
  }

  registerSpeech(provider: SpeechToTextProvider): this {
    this.speechProviders.set(provider.name.toLowerCase(), provider);
    return this;
  }

  getSpeech(name: string): SpeechToTextProvider {
    const provider = this.speechProviders.get(name.toLowerCase());
    if (!provider) {
      throw new AppError(`Speech-to-text provider '${name}' not found in registry`, "STYLE_ANALYSIS_FAILED", 500);
    }
    return provider;
  }
}

export const providerRegistry = new ProviderRegistry();
