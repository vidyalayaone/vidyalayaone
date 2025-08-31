import { Storage } from '@google-cloud/storage';
import config from '../config/config';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    try {
      // Initialize Google Cloud Storage
      // The Storage client will automatically detect credentials from:
      // 1. GOOGLE_APPLICATION_CREDENTIALS environment variable
      // 2. gcloud auth application-default login
      // 3. Google Cloud Shell, App Engine, or Compute Engine when running on Google Cloud
      this.storage = new Storage({
        // Add retry and timeout configurations
        retryOptions: {
          autoRetry: true,
          maxRetries: 3,
          retryDelayMultiplier: 2,
        },
      });
      
      this.bucketName = config.googleCloud.bucketName;
      
      if (!this.bucketName) {
        throw new Error('GOOGLE_CLOUD_BUCKET_NAME environment variable is required');
      }

      // Verify bucket access on initialization
      this.verifyBucketAccess();
    } catch (error) {
      console.error('Failed to initialize Google Cloud Storage:', error);
      throw error;
    }
  }

  /**
   * Verify bucket access (async, doesn't block constructor)
   */
  private async verifyBucketAccess(): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const [exists] = await bucket.exists();
      if (!exists) {
        console.warn(`Warning: Bucket '${this.bucketName}' does not exist or is not accessible`);
      } else {
        console.log(`Successfully connected to bucket: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('Error verifying bucket access:', error);
    }
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param file - The file buffer and metadata
   * @param folder - Optional folder path in the bucket
   * @returns Promise with the public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder?: string
  ): Promise<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }> {
    try {
      // Validate input
      if (!file || !file.buffer) {
        throw new Error('Invalid file: file or file buffer is missing');
      }

      if (!file.mimetype) {
        throw new Error('Invalid file: mimetype is missing');
      }

      const bucket = this.storage.bucket(this.bucketName);
      
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      const gcsFile = bucket.file(filePath);
      
      // Use the save method instead of streams for better reliability
      try {
        console.log(`Uploading file: ${fileName} (${file.size} bytes) to path: ${filePath}`);
        
        await gcsFile.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
            cacheControl: 'public, max-age=31536000', // 1 year
          },
          resumable: false,
        });

        console.log(`File uploaded successfully: ${fileName}`);

        // Make the file publicly accessible
        await gcsFile.makePublic();
        console.log(`File made public: ${fileName}`);
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
        
        return {
          url: publicUrl,
          fileName: fileName,
          mimeType: file.mimetype,
          size: file.size,
        };
      } catch (error) {
        console.error('Upload error details:', {
          fileName,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          bucketName: this.bucketName,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new Error(`Failed to upload file to cloud storage: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error('Storage service error:', error);
      throw new Error('Failed to upload file to cloud storage');
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param fileName - The name of the file to delete (including path)
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      
      await file.delete();
      console.log(`File ${fileName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file from cloud storage');
    }
  }

  /**
   * Check if a file exists in the bucket
   * @param fileName - The name of the file to check
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  /**
   * Get the file's metadata
   * @param fileName - The name of the file
   */
  async getFileMetadata(fileName: string) {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}

export default new StorageService();
