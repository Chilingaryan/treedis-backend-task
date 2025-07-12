import { createReadStream, existsSync } from "fs";
import { unlink } from "fs/promises";
import { Worker, Job } from "bullmq";
import IORedis from "ioredis";

import { SocketGateway } from "@/core/server/socket-gateway";
import { Logger } from "@/shared/logger/logger";
import { IFileStorageService } from "@/services/storage/file-storage.interface";
import { AppError } from "@/shared/errors/app-error";

const logger = Logger.forContext("UploadWorker");

export class UploadWorkerService {
  private worker: Worker | null = null;

  constructor(
    private readonly fileStorageService: IFileStorageService,
    private readonly transport: SocketGateway,
    private readonly redis: IORedis,
    private readonly concurrency = 3,
  ) {}

  public start() {
    this.worker = new Worker("upload", this.processJob.bind(this), {
      connection: this.redis,
      concurrency: this.concurrency,
    });

    this.worker.on("completed", (job) => {
      logger.success(`Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`Job ${job?.id} failed`, err);
    });
  }

  public async shutdown() {
    if (this.worker) {
      logger.warn("UploadWorker shutting down...");
      await this.worker.close();
    }
  }

  private async processJob(job: Job) {
    const { uploadId, tmpFilePath, fileName, contentLength, mimeType } =
      job.data;

    try {
      if (!existsSync(tmpFilePath)) {
        throw new AppError("Temp file missing. Cannot upload.", 410);
      }

      const readStream = createReadStream(tmpFilePath);

      await this.fileStorageService.upload(
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
      const isFinalAttempt = job.attemptsMade >= (job.opts.attempts ?? 1) - 1;

      if (isFinalAttempt) {
        logger.info(err.message, { isFinalAttempt });
        // await unlink(tmpFilePath).catch(() => {});
      }

      logger.error(err.message, err);

      this.transport.emitToRoom(
        `uploadId:${uploadId}`,
        "upload:failed",
        err.message,
      );

      throw err;
    }
  }
}
