import { createApp } from "./app.js";
import { config } from "./config/index.js";

const app = createApp();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`🌙 Bedtime AI Backend running on port ${config.port} [env: ${config.nodeEnv}]`);
  console.log(`   - LLM Provider: ${config.providers.llm}`);
  console.log(`   - TTS Provider: ${config.providers.tts}`);
  console.log(`   - Voice Provider: ${config.providers.voice}`);
  console.log(`   - Storage Provider: ${config.providers.storage}`);
  console.log(`   - Speech Provider: ${config.providers.speech}`);
  console.log(`   - Audio Mode: ${config.audioMode}`);
});
