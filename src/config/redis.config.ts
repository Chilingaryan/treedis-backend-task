import IORedis from "ioredis";

// Todo: is connection correctly established? maybe function is better?
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
