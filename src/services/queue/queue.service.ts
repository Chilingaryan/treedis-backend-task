import { Queue } from "bullmq";
import { RedisService } from "@/services/redis/redis.service";

export const uploadQueue = new Queue("upload", {
  connection: RedisService.getInstance().getClient(),
});
