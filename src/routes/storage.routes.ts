import { Router, Request, Response, NextFunction } from "express";
import { providerRegistry } from "../providers/ProviderRegistry.js";
import { LocalStorageProvider } from "../providers/storage/local/LocalStorageProvider.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.get("/:key(*)", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key;
    const expires = parseInt(req.query.expires as string, 10);

    if (expires && Date.now() > expires) {
      throw AppError.badRequest("Audio access link has expired", "INVALID_REQUEST");
    }

    const storage = providerRegistry.getStorage("local");
    if (!(storage instanceof LocalStorageProvider)) {
      throw AppError.badRequest("Local storage is not active", "INVALID_REQUEST");
    }

    const file = await storage.getFile(key);
    if (!file) {
      throw AppError.notFound("Requested audio file not found");
    }

    res.setHeader("Content-Type", file.contentType);
    res.send(file.buffer);
  } catch (err) {
    next(err);
  }
});

export default router;
