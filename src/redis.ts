import Redis from "ioredis";
import "dotenv/config";

const redisUrl =
  process.env.REDIS_URL ?? process.env.REDIS ?? "redis://127.0.0.1:6379";

export const redis = new Redis.default(redisUrl);

redis.on("error", (err: Error) => {
  console.error("Redis error:", err);
});
