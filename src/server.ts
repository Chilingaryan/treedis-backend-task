import http from "http";
import dotenv from "dotenv";
import "dotenv/config";

import { Router } from "@/router";
import { ServerConfig } from "@/config/server.config";
import { MediaController } from "@/modules/media/media.controller";
import { MediaService } from "./modules/media/media.service";
import { queryfy } from "./core/utils";

dotenv.config();

const router = new Router();

const mediaService = new MediaService();
const mediaController = new MediaController(mediaService);

router.add("/media", mediaController);

const server = http.createServer((req, res) => {
  return router.handle.bind(router)(queryfy(req), res);
});

server.listen(ServerConfig.port, () =>
  console.log(`Server listens to port: ${ServerConfig.port}`)
);
