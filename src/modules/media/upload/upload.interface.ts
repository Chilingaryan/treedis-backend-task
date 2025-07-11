import { Readable } from "stream";

export interface ProcessUploadData {
  fileName: string;
  mimeType: string;
  contentLength: number;
  tmpFilePath: string;
  uploadId: string;
  readStream: Buffer | Readable;
}

export interface ProcessUploadOptions {
  allowedMimeTypes?: string[];
  customFileName?: string;
}
