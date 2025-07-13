import { Req } from "@/core/http/types";
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

  // Todo: the update has business logic bug - when you change .png to .mp4 it doesn't change the mimeType
  async updateMedia(req: Req) {
    if (hasFile(req.query.file)) {
      const { uploadId, fileName, mimeType, contentLength, tmpFilePath } =
        await processUpload(req, {
          allowedMimeTypes: this.allowedMimeTypes,
          customFileName: req.query.file,
        });

      await uploadQueue.add(
        "upload",
        {
          uploadId,
          tmpFilePath,
          fileName,
          contentLength,
          mimeType,
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      );

      return {
        message: "Queued",
        fileName,
        uploadId,
      };
    }
  }

  async uploadMedia(req: Req) {
    const { uploadId, fileName, mimeType, contentLength, tmpFilePath } =
      await processUpload(req, {
        allowedMimeTypes: this.allowedMimeTypes,
      });

    await uploadQueue.add(
      "upload",
      {
        uploadId,
        tmpFilePath,
        fileName,
        contentLength,
        mimeType,
      },
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 2000,
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
