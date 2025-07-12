import { Router } from "@/router";
import { redis } from "@/config/redis.config";
import { timeout } from "@/middlewares/timeout";
import { SocketGateway } from "@/core/socket-gateway";
import { ServerConfig } from "@/config/server.config";
import { MediaService } from "@/modules/media/media.service";
import { S3Service } from "@/services/storage/s3-storage.service";
import { MediaController } from "@/modules/media/media.controller";
import { createHttpServer, createSocketServer } from "@/core/server";
import { UploadWorkerService } from "@/services/upload/upload-worker.service";
import { Logger } from "./services/logger/logger.service";

const router = new Router();
const fileStorageService = new S3Service();

const mediaService = new MediaService(fileStorageService);
const mediaController = new MediaController(mediaService);

const server = createHttpServer(router);
const io = createSocketServer(server);
const socketGateway = SocketGateway.getInstance();
socketGateway.attachServer(io);

const uploadWorker = new UploadWorkerService(
  fileStorageService,
  socketGateway,
  redis,
);

uploadWorker.createWorker();

// router.registerWatcher(timeout(5000));

router.add("/media", mediaController);

const logger = Logger.forContext("Main");

server.listen(ServerConfig.port, () => {
  logger.info(`Server running on port ${ServerConfig.port}`);
});
