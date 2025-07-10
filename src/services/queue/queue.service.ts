import { Queue } from "bullmq";
import { redis } from "@/config/redis.config";

export const uploadQueue = new Queue("upload", { connection: redis });
