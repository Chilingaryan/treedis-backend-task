import http from "http";
import dotenv from "dotenv";
import "dotenv/config";

import { Router } from "@/router";
import { queryfy } from "./core/utils";
import { ServerConfig } from "@/config/server.config";
import { MediaService } from "@/modules/media/media.service";
import { S3Service } from "@/services/storage/s3-storage.service";
import { MediaController } from "@/modules/media/media.controller";

dotenv.config();

const router = new Router();

const fileStorageService = new S3Service();

const mediaService = new MediaService(fileStorageService);
const mediaController = new MediaController(mediaService);

router.add("/media", mediaController);

const server = http.createServer((req, res) => {
  return router.handle.bind(router)(queryfy(req), res);
});

server.listen(ServerConfig.port, () =>
  console.log(`Server listens to port: ${ServerConfig.port}`)
);
