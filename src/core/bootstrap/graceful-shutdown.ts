import { Logger } from "@/shared/logger/logger";
import { UploadWorkerService } from "@/services/upload/upload-worker.service";
import { RedisService } from "@/config/redis.config";

const logger = Logger.forContext("Shutdown");

export const registerShutdown = (uploadWorker: UploadWorkerService) => {
  const shutdown = async () => {
    logger.info("Gracefully shutting down...");
    try {
      await Promise.all([
        RedisService.getInstance().shutdown(),
        uploadWorker
          .shutdown()
          .catch((err) => logger.error("Worker shutdown error", err)),
      ]);
    } catch (err) {
      logger.error("Unexpected shutdown error", err);
    }
    logger.info("Shutdown complete.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
