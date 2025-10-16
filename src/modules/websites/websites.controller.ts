import { eq } from "drizzle-orm";
import { db } from "../../db/DBconnection.js";
import { websites } from "../../db/schema.js";

import type{ Request, Response } from "express";

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

    const result = await db
      .select()
      .from(websites)
      .limit(limit)
      .offset(offset);

    res.json({
      page,
      limit,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch websites" });
  }
};


export const getWebsiteById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "Website ID is required" });
    }

    const id = parseInt(req.params.id, 10);

    const [website] = await db
      .select()
      .from(websites)
      .where(eq(websites.id, id));

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    res.json(website);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch website" });
  }
};