import "dotenv/config";
import Redis from "ioredis";
import logger from "./logger";

const log = logger.child("redis");

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

export const redis = new Redis(redisUrl);

redis.on("connect", () => log.info("Redis connected"));
redis.on("error", (err: Error) => log.error("Redis error:", err));
