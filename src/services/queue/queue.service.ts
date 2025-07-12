import { Queue } from "bullmq";
import { RedisService } from "@/config/redis.config";

export const uploadQueue = new Queue("upload", {
  connection: RedisService.getInstance().getClient(),
});
