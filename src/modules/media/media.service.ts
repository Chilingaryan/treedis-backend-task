import { Req } from "@/core/types";
import { hasFile } from "@/modules/media/media.utils";
import { uploadQueue } from "@/services/queue/queue.service";
import { processUpload } from "@/modules/media/upload/process-upload";
import { IFileStorageService } from "@/services/storage/file-storage.interface";

export class MediaService {
  constructor(private readonly fileStorageService: IFileStorageService) {}

  private allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "video/mp4",
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
    const {
      uploadId,
      fileName,
      readStream,
      mimeType,
      contentLength,
      tmpFilePath,
    } = await processUpload(req, {
      allowedMimeTypes: this.allowedMimeTypes,
    });

    await uploadQueue.add(
      "upload",
      {
        uploadId,
        tmpFilePath,
        fileName,
        contentLength,
        readStream,
        mimeType,
      },
      {
        attempts: 5,
        backoff: {
          // type: "exponential",
          type: "fixed",
          // delay: 2000,
        },
      },
    );

    return {
      message: "Queued",
      fileName,
      uploadId,
    };
  }

  async deleteMedia(file?: string) {
    if (hasFile(file)) {
      return await this.fileStorageService.delete(file!);
    }
  }
}
