import IORedis from "ioredis";
import { Worker } from "bullmq";
import { unlink } from "fs/promises";

import { Logger } from "../logger/logger.service";
import { IFileStorageService } from "../storage/file-storage.interface";

// Todo: replace
const io = { emit: (...args: any) => ({}) };

export class UploadWorkerService {
  private connection: IORedis;

  constructor(
    private readonly fileStorageService: IFileStorageService,
    // Todo: Bad! replace
    connection: IORedis,
  ) {
    this.connection = connection;
  }

  async createWorker() {
    const worker = new Worker(
      "upload",
      async (job) => {
        const { tmpFilePath, fileName, contentLength, readStream, mimeType } =
          job.data;

        try {
          console.log("BOBIK", fileName, readStream, mimeType, contentLength);

          await this.fileStorageService.upload(
            tmpFilePath,
            fileName,
            readStream,
            mimeType,
            contentLength,
          );

          await unlink(tmpFilePath);

          // Emit socket event
          io.emit("upload:success", { fileName });
        } catch (err: any) {
          await unlink(tmpFilePath).catch(() => {}); // Try to cleanup anyway
          io.emit("upload:failed", { error: err.message });
          throw err;
        }
      },
      { connection: this.connection },
    );

    worker.on("failed", (job, err) => {
      Logger.error(`Job ${job?.id} failed:`, err as any);
    });

    worker.on("completed", (job) => {
      Logger.success(`Job ${job?.id} completed`);
    });

    return worker;
  }
}
