import { Router } from "express";
import multer from "multer";
import { voiceController } from "../modules/voices/voice.controller.js";
import { config } from "../config/index.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxVoiceFileMb * 1024 * 1024,
  },
});

router.post("/:parentId/voice", upload.single("audio"), (req, res, next) =>
  voiceController.uploadVoice(req, res, next)
);

router.get("/:parentId/voice", (req, res, next) =>
  voiceController.getVoiceProfile(req, res, next)
);

router.delete("/:parentId/voice", (req, res, next) =>
  voiceController.deleteVoice(req, res, next)
);

export default router;
