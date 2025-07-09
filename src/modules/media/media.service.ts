import { Req } from "@/core/types";
import { hasFile } from "@/modules/media/media.utils";
import { processUpload } from "@/core/upload/process-upload";
import { IFileStorageService } from "@/services/storage/file-storage.interface";
import { uploadQueue } from "@/services/queue.service";

export class MediaService {
  constructor(private readonly fileStorageService: IFileStorageService) {}

  private allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "video/mp4",
    "application/json", // Todo: Testing purpose
  ];

  async getMedia(file?: string) {
    if (hasFile(file)) {
      return await this.fileStorageService.get(file!);
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

      await this.fileStorageService.upload(
        fileName,
        readStream,
        mimeType,
        contentLength,
      );

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

    const job = await uploadQueue.add("upload", {
      filePath: tmpFilePath,
      fileName,
      // contentType,
      contentLength,
      // uploadId,
    });

    console.log(job);

    // await this.fileStorageService.upload(
    //   fileName,
    //   readStream,
    //   mimeType,
    //   contentLength,
    // );

    return {
      message: "Uploaded!",
      fileName,
    };
  }

  async deleteMedia(file?: string) {
    if (hasFile(file)) {
      return await this.fileStorageService.delete(file!);
    }
  }
}
