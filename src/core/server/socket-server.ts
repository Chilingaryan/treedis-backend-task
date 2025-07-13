import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { SocketGateway } from "./socket-gateway";
import { Logger } from "@/shared/logger/logger";

const logger = Logger.forContext("socket");

export const createSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, { cors: { origin: "*" } });

  const gateway = SocketGateway.getInstance();
  gateway.attachServer(io);

  gateway.onConnection((socket) => {
    const uploadId = socket.handshake.query.uploadId as string;
    if (uploadId) socket.join(`uploadId:${uploadId}`);

    socket.on("disconnect", () => {
      logger.info(`User disconnected from ${socket.id}`);
    });
  });

  return io;
};
