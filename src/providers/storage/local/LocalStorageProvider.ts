import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export class LocalStorageProvider implements StorageProvider {
  public readonly name = "local";
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir = "./storage_uploads", baseUrl = "http://localhost:3000/api/v1/storage") {
    this.baseDir = path.resolve(baseDir);
    this.baseUrl = baseUrl;
  }

  async upload(input: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    try {
      const fullPath = path.join(this.baseDir, input.key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, input.body);
    } catch (err: any) {
      throw new AppError(
        `Failed to write local file: ${err.message}`,
        "AUDIO_UPLOAD_FAILED",
        500,
        err
      );
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const encodedKey = encodeURIComponent(key);
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    return `${this.baseUrl}/${encodedKey}?expires=${expiresAt}`;
  }

  async delete(key: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseDir, key);
      await fs.unlink(fullPath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    try {
      const fullPath = path.join(this.baseDir, key);
      const buffer = await fs.readFile(fullPath);
      const ext = path.extname(key).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".mp3") contentType = "audio/mpeg";
      else if (ext === ".wav") contentType = "audio/wav";
      else if (ext === ".json") contentType = "application/json";
      return { buffer, contentType };
    } catch {
      return null;
    }
  }
}
