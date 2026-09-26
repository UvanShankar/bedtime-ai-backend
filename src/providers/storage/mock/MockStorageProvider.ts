import { StorageProvider } from "../../../types/providers.js";

export class MockStorageProvider implements StorageProvider {
  public readonly name = "mock";
  public files: Map<string, { body: Buffer; contentType: string }> = new Map();

  async upload(input: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    this.files.set(input.key, { body: input.body, contentType: input.contentType });
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    return `https://mock-s3.amazonaws.com/bedtime-ai/${key}?mock-sig=1&exp=${expiresInSeconds}`;
  }

  async delete(key: string): Promise<void> {
    this.files.delete(key);
  }

  clear(): void {
    this.files.clear();
  }
}
