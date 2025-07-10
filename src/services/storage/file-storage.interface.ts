import { Readable } from "stream";

export interface IFileStorageService {
  upload(
    tmpFilePath: string,
    key: string,
    body: Buffer | Readable,
    contentType: string,
    contentLength: number,
  ): Promise<{ success: boolean }>;

  get(key: string): Promise<Readable>;

  delete(key: string): Promise<{ success: boolean }>;

  getMetadata(key: string): Promise<any>;
}
