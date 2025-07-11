import IORedis from "ioredis";
import { Worker } from "bullmq";
import { unlink } from "fs/promises";

import { SocketGateway } from "@/core/socket-gateway";
import { Logger } from "@/services/logger/logger.service";
import { IFileStorageService } from "@/services/storage/file-storage.interface";

const logger = Logger.forContext("UploadWorkerService");

export class UploadWorkerService {
  constructor(
    private readonly fileStorageService: IFileStorageService,
    private readonly transport: SocketGateway,
    private readonly queue: IORedis,
  ) {}

  async createWorker() {
    const worker = new Worker(
      "upload",
      async (job) => {
        const {
          uploadId,
          tmpFilePath,
          fileName,
          contentLength,
          readStream,
          mimeType,
        } = job.data;

        try {
          await this.fileStorageService.upload(
            tmpFilePath,
            fileName,
            readStream,
            mimeType,
            contentLength,
          );

          await unlink(tmpFilePath);

          this.transport.emitToRoom(
            `uploadId:${uploadId}`,
            "upload:success",
            fileName,
          );
        } catch (err: any) {
          // await unlink(tmpFilePath).catch(() => {}); // Try to cleanup anyway

          logger.error(err);

          // console.log({ err });

          this.transport.emitToRoom(
            `uploadId:${uploadId}`,
            "upload:failed",
            err.message,
          );
          throw err;
        }
      },
      { connection: this.queue },
    );

    worker.on("failed", (job, err) => {
      logger.error(`Job ${job?.id} failed:`, err as any);
    });

    worker.on("completed", (job) => {
      logger.success(`Job ${job?.id} completed`);
    });

    return worker;
  }
}
