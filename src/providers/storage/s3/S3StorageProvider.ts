import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as generateS3PresignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageProvider } from "../../../types/providers.js";
import { AppError } from "../../../errors/AppError.js";

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
}

export class S3StorageProvider implements StorageProvider {
  public readonly name = "s3";
  private client: S3Client;
  private bucket: string;

  constructor(config: S3Config) {
    this.bucket = config.bucket;
    const clientConfig: any = {
      region: config.region,
    };

    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // Useful for LocalStack or MinIO
    }

    this.client = new S3Client(clientConfig);
  }

  async upload(input: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      });
      await this.client.send(command);
    } catch (err: any) {
      throw new AppError(
        `Failed to upload object to S3: ${err.message}`,
        "AUDIO_UPLOAD_FAILED",
        500,
        err
      );
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await generateS3PresignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (err: any) {
      throw new AppError(
        `Failed to generate S3 pre-signed URL: ${err.message}`,
        "UNKNOWN_ERROR",
        500,
        err
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
    } catch (err: any) {
      throw new AppError(
        `Failed to delete object from S3: ${err.message}`,
        "UNKNOWN_ERROR",
        500,
        err
      );
    }
  }
}
