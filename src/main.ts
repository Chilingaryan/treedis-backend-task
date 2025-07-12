import { Logger } from "@/shared/logger/logger";
// import { timeout } from "@/middlewares/timeout";
import { ServerConfig } from "@/config/server.config";
import { SocketGateway } from "@/core/server/socket-gateway";
import { cleanupOldTmpFiles } from "@/core/bootstrap/cleanup";
import { initializeRouter } from "@/core/bootstrap/initialize-app";
import { createHttpServer } from "@/core/server/http-server";
import { registerShutdown } from "@/core/bootstrap/graceful-shutdown";
import { createSocketServer } from "@/core/server/socket-server";
import { initializeUploadWorker } from "@/core/bootstrap/initialize-workers";

const logger = Logger.forContext("Main");

async function bootstrap() {
  await cleanupOldTmpFiles();

  const router = initializeRouter();
  const server = createHttpServer(router);
  const io = createSocketServer(server);

  const socketGateway = SocketGateway.getInstance();
  socketGateway.attachServer(io);

  const uploadWorker = initializeUploadWorker();
  registerShutdown(uploadWorker);

  server.listen(ServerConfig.port, () => {
    logger.info(`Server running on port ${ServerConfig.port}`);
  });
}

bootstrap();
