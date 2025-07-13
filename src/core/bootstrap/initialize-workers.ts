import { RedisService } from "@/services/redis/redis.service";
import { SocketGateway } from "@/core/server/socket-gateway";
import { S3Service } from "@/services/storage/s3-storage.service";
import { UploadWorkerService } from "@/services/upload/upload-worker.service";

export const initializeUploadWorker = () => {
  const fileStorageService = new S3Service();

  const socketGateway = SocketGateway.getInstance();

  const redisService = RedisService.getInstance();
  const redis = redisService.getClient();

  const uploadWorker = new UploadWorkerService(
    fileStorageService,
    socketGateway,
    redis,
  );

  uploadWorker.start();
  return uploadWorker;
};
