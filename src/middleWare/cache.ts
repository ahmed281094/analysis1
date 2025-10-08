
import type{ Request, Response,NextFunction } from "express";
import { redis } from "../redis.js";


export const cacheGetAllWebsites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = "websites:all";
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Serving from cache...");
      return res.status(200).json(JSON.parse(cached));
    }
    next();
  } catch (err) {
    console.error("Cache error:", err);
    next();
  }
};
