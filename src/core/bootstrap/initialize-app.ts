import { Router } from "@/router";
import { MediaService } from "@/modules/media/media.service";
import { S3Service } from "@/services/storage/s3-storage.service";
import { MediaController } from "@/modules/media/media.controller";

export const initializeRouter = () => {
  const router = new Router();
  const fileStorageService = new S3Service();
  const mediaService = new MediaService(fileStorageService);
  const mediaController = new MediaController(mediaService);

  router.add("/media", mediaController);
  return router;
};
