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

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "bedtime-ai-backend",
  });
});

export default apiRouter;
