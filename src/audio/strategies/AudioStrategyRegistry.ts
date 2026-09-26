import { AudioStrategy } from "./AudioStrategy.js";
import { FullFileAudioStrategy } from "./FullFileAudioStrategy.js";
import { StreamingAudioStrategy } from "./StreamingAudioStrategy.js";
import { AppError } from "../../errors/AppError.js";

export class AudioStrategyRegistry {
  private strategies: Map<string, AudioStrategy> = new Map();

  constructor() {
    this.register(new FullFileAudioStrategy());
    this.register(new StreamingAudioStrategy());
  }

  register(strategy: AudioStrategy): this {
    this.strategies.set(strategy.mode, strategy);
    return this;
  }

  get(mode: "full_file" | "streaming" | string): AudioStrategy {
    const strategy = this.strategies.get(mode);
    if (!strategy) {
      throw new AppError(`Audio strategy for mode '${mode}' not found`, "INVALID_REQUEST", 500);
    }
    return strategy;
  }
}

export const audioStrategyRegistry = new AudioStrategyRegistry();
