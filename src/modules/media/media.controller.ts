import { Req } from "@/core/types";
import { Controller } from "@/core/controller";
import { Get, Post, Put, Delete } from "@/core/decorators";

import { MediaService } from "./media.service";

export class MediaController extends Controller {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    super();
    this.mediaService = mediaService;
  }

  @Get("/")
  async getMedia(req: Req) {
    return this.mediaService.getMedia(req.query.file);
  }

  @Get("/metadata")
  async getMetadata(req: Req) {
    return this.mediaService.getMetadata(req.query.file);
  }

  @Post("/")
  async uploadMedia(req: Req) {
    return this.mediaService.uploadMedia(req);
  }

  @Put()
  async updateMedia(req: Req) {
    return this.mediaService.updateMedia(req);
  }

  @Delete("/")
  async deleteMedia(req: Req) {
    return this.mediaService.deleteMedia(req.query.file);
  }
}
