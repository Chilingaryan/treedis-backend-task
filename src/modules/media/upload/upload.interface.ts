export interface ProcessUploadData {
  fileName: string;
  mimeType: string;
  contentLength: number;
  tmpFilePath: string;
  uploadId: string;
}

export interface ProcessUploadOptions {
  allowedMimeTypes?: string[];
  customFileName?: string;
}
