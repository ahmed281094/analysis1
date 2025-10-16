import { eq } from "drizzle-orm";
import { db } from "../../db/DBconnection.js";
import { websites } from "../../db/schema.js";

import type{ Request, Response } from "express";
import { redis } from "../../redis.js";

export const createWebsite = async (req: Request, res: Response) => {
  try {
    const { url, name } = req.body;

    if (!url || !name) {
      return res.status(400).json({ error: "url and name are required" });
    }

    const [newWebsite] = await db
      .insert(websites)
      .values({ url, name })
      .returning();

    res.status(201).json(newWebsite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create website" });
  }
};



export const getWebsites = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const offset = (page - 1) * limit;
    const cacheKey = `websites:page=${page}:limit=${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Serving from Redis cache...");
      const parsed = JSON.parse(cached);
      return res.status(200).json({
        fromCache: true,
        ...parsed,
      });
    }

    const result = await db
      .select()
      .from(websites)
      .limit(limit)
      .offset(offset);

    const response = {
      page,
      limit,
      data: result,
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX" ,60 );
 
    return res.status(200).json({
      fromCache: false,
      ...response,
    });
  } catch (err) {
    return res.status(500).json({ error: "failed to fetch websites",err });
  }
};



export const getWebsiteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Website ID is required" });
    }

    const websiteId = parseInt(id, 10);
    const cacheKey = `website:${websiteId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Serving website ${websiteId} from Redis cache...`);
      return res.status(200).json({
        fromCache: true,
        data: JSON.parse(cached),
      });
    }

    const [website] = await db
      .select()
      .from(websites)
      .where(eq(websites.id, websiteId));

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    await redis.set(cacheKey, JSON.stringify(website), "EX" , 60 );
  
    return res.status(200).json({
      fromCache: false,
      data: website,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch website",err });
  }
};
