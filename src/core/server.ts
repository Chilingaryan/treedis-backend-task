import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { Router } from "@/router";
import { SocketGateway } from "./socket-gateway";
import { queryfy } from "./utils";

export const createHttpServer = (router: Router) => {
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
      console.log(`User disconnected from socket ${socket.id}`);
    });
  });

  return io;
};
