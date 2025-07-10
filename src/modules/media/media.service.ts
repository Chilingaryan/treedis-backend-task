import { Req } from "@/core/types";
import { hasFile } from "@/modules/media/media.utils";
import { processUpload } from "@/modules/media/upload/process-upload";
import { IFileStorageService } from "@/services/storage/file-storage.interface";
import { uploadQueue } from "@/services/queue/queue.service";

export class MediaService {
  constructor(private readonly fileStorageService: IFileStorageService) {}

  private allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "video/mp4",
    "application/json", // Todo: Testing purpose
  ];

  async getMedia(file: string) {
    if (hasFile(file)) {
      return await this.fileStorageService.get(file);
    }
  }

  async getMetadata(file?: string) {
    if (hasFile(file)) {
      return await this.fileStorageService.getMetadata(file!);
    }
  }

  async updateMedia(req: Req) {
    if (hasFile(req.query.file)) {
      const { fileName, readStream, mimeType, contentLength } =
        await processUpload(req, {
          allowedMimeTypes: this.allowedMimeTypes,
          customFileName: req.query.file,
        });

      // Todo: make appropriate changes here

      // await this.fileStorageService.upload(
      //   fileName,
      //   readStream,
      //   mimeType,
      //   contentLength,
      // );

      return {
        message: "Replaced!",
        fileName,
      };
    }
  }

  async uploadMedia(req: Req) {
    const { fileName, readStream, mimeType, contentLength, tmpFilePath } =
      await processUpload(req, {
        allowedMimeTypes: this.allowedMimeTypes,
      });

    await uploadQueue.add("upload", {
      tmpFilePath,
      fileName,
      contentLength,
      readStream,
      mimeType,
    });

    return {
      message: "Queued",
      fileName,
    };
  }

  async deleteMedia(file?: string) {
    if (hasFile(file)) {
      return await this.fileStorageService.delete(file!);
    }
  }
}
