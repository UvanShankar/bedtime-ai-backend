import { Router } from "express";
import parentRoutes from "./parent.routes.js";
import childRoutes from "./child.routes.js";
import voiceRoutes from "./voice.routes.js";
import storyRoutes from "./story.routes.js";
import storageRoutes from "./storage.routes.js";

const apiRouter = Router();

apiRouter.use("/parents", parentRoutes);
apiRouter.use("/parents", voiceRoutes); // /parents/:parentId/voice
apiRouter.use("/children", childRoutes);
apiRouter.use("/stories", storyRoutes);
apiRouter.use("/storage", storageRoutes);

import { config } from "../config/index.js";

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "bedtime-ai-backend",
    providers: {
      llm: config.providers.llm,
      tts: config.providers.tts,
      storage: config.providers.storage,
      speech: config.providers.speech,
      keys: {
        hasOpenAIKey: Boolean(config.openai.apiKey),
        hasSarvamKey: Boolean(config.sarvam.apiKey),
        hasElevenLabsKey: Boolean(config.elevenlabs.apiKey),
      },
    },
  });
});

export default apiRouter;
