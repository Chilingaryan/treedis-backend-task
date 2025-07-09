import dotenv from "dotenv";
import "dotenv/config";

import { Router } from "@/router";
import { runServer } from "./core/server";
import { timeout } from "./middlewares/timeout";
import { ServerConfig } from "@/config/server.config";
import { MediaService } from "@/modules/media/media.service";
import { S3Service } from "@/services/storage/s3-storage.service";
import { MediaController } from "@/modules/media/media.controller";

dotenv.config();

const router = new Router();

const fileStorageService = new S3Service();

const mediaService = new MediaService(fileStorageService);
const mediaController = new MediaController(mediaService);

// router.registerWatcher(timeout(5000));

router.add("/media", mediaController);

runServer(router, ServerConfig.port);
