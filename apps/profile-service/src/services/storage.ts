import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/config';

export interface UploadParams {
  key: string;
  body: Buffer | Uint8Array | Blob | string | ReadableStream<any>;
  contentType?: string;
}

class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    if (config.storage.provider !== 's3') {
      // Placeholder for GCS; for now re-use S3 interface if minio-compatible.
    }

    this.s3 = new S3Client({
      region: config.storage.region,
      endpoint: config.storage.endpoint,
      forcePathStyle: !!config.storage.forcePathStyle,
      credentials: config.storage.accessKeyId && config.storage.secretAccessKey ? {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey,
      } : undefined,
    });
    this.bucket = config.storage.bucket;
  }

  async upload({ key, body, contentType }: UploadParams): Promise<{ key: string }>
  {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body as any,
      ContentType: contentType,
    });
    await this.s3.send(cmd);
    return { key };
  }

  async getSignedUrl(key: string): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, cmd, { expiresIn: config.storage.signedUrlExpiresInSeconds });
  }
}

export default new StorageService();
