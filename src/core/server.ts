import http from "http";
import finalHandler from "finalhandler";
import { Server as SocketIOServer } from "socket.io";

import { Router } from "@/router";
import { queryfy } from "./utils";
import { SocketGateway } from "./socket-gateway";
import { bullBoardApp } from "./queue-dashboard";
import { Logger } from "@/shared/logger/logger";

const logger = Logger.forContext("server");

export const createHttpServer = (router: Router) => {
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.url?.includes("/admin/queues")) {
      bullBoardApp(req, res, finalHandler(req, res));
      return;
    }

    return router.handle.bind(router)(queryfy(req), res);
  });

  return server;
};

export const createSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, { cors: { origin: "*" } });

  const socketGateway = SocketGateway.getInstance();
  socketGateway.attachServer(io);

  socketGateway.onConnection((socket) => {
    const uploadId = socket.handshake.query.uploadId as string;
    if (uploadId) socket.join(`uploadId:${uploadId}`);

    socket.on("disconnect", () => {
      logger.info(`User disconnected from socket ${socket.id}`);
    });
  });

  return io;
};
