import { Readable } from "stream";

export interface IFileStorageService {
  upload(
    key: string,
    body: Readable,
    contentType: string,
    contentLength: number,
  ): Promise<{ success: boolean }>;

  get(key: string): Promise<Readable>;

  delete(key: string): Promise<{ success: boolean }>;

  getMetadata(key: string): Promise<any>;
}
