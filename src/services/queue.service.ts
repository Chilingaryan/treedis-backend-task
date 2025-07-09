import { Queue } from "bullmq";
import { redis } from "@/config/queue.config";

export const uploadQueue = new Queue("upload", { connection: redis });
