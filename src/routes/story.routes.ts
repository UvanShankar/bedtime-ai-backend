import { Router } from "express";
import { storyController } from "../modules/stories/story.controller.js";
import { validateBody, generateStorySchema } from "../middleware/validateRequest.js";

const router = Router();

router.post("/generate", validateBody(generateStorySchema), (req, res, next) =>
  storyController.generateStory(req, res, next)
);

router.get("/:storyId", (req, res, next) => storyController.getStory(req, res, next));

router.get("/:storyId/stream", (req, res, next) => storyController.streamStory(req, res, next));

export default router;
