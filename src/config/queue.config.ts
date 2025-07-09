import IORedis from "ioredis";

export const redis = new IORedis("redis://localhost:6379");
