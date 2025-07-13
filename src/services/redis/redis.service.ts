import IORedis, { Redis, RedisOptions } from "ioredis";
import { Logger } from "@/shared/logger/logger";
import { AppError } from "@/shared/errors/app-error";

const logger = Logger.forContext("RedisService");

export class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor(redisUrl: string, options?: RedisOptions) {
    this.client = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 2000);
        logger.warn(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      },
      ...options,
    });

    this.client.on("connect", () => logger.success("Redis connected"));
    this.client.on("error", (err) => logger.error("Redis error", err));
    this.client.on("close", () => logger.warn("Redis connection closed"));
  }

  public static getInstance() {
    if (!RedisService.instance) {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        logger.error("REDIS_URL is not defined in environment");
        throw new AppError("Missing REDIS_URL env variable");
      }

      RedisService.instance = new RedisService(redisUrl);
    }

    return RedisService.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async shutdown() {
    logger.info("Shutting down Redis connection...");
    await this.client.quit();
  }

  public async get(key: string) {
    return this.client.get(key);
  }

  public async del(key: string) {
    return this.client.del(key);
  }
}
