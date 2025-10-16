import type{ Request, Response } from "express";
import { db } from "../../db/DBconnection.js";
import { analyses, websites } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { redis } from "../../redis.js";


// export const createAnalyses = async (req: Request, res: Response) => {
//   try {
//     const { url } = req.body;
//     if (!url) return res.status(400).json({ error: "Website URL is required" });


//     const newWebsite = await db
//       .select()
//       .from(websites)
//       .where(eq(websites.url, url))
//       .limit(1);

//     let websiteId: number;

//     if (newWebsite.length > 0 && newWebsite[0]?.id) {
//       websiteId = newWebsite[0].id;
//     } else {
//       const websiteName = new URL(url).hostname;

//       const inserted = await db
//         .insert(websites)
//         .values({
//           url,
//           name: websiteName,
//           status: "active",
//         })
//         .returning({ id: websites.id });

//       if (inserted.length === 0 || !inserted[0]?.id) {
//         throw new Error("Failed to insert website");
//       }

//       websiteId = inserted[0].id;
//     }


//     // const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });


// const chrome = await chromeLauncher.launch({
//   chromePath: process.env.CHROME_PATH || '/usr/bin/chromium',
//   chromeFlags: [
//     '--headless',
//     '--no-sandbox',
//     '--disable-dev-shm-usage',
//     '--disable-gpu',
//     '--remote-debugging-address=0.0.0.0',
//     '--remote-debugging-port=9222',
//   ],
// });
//       const options = {
//       logLevel: "info" as const,
//       output: "json" as const,
//       port: 9222,
//       hostname: "0.0.0.0", 
//     };

// await new Promise(r => setTimeout(r, 1000)); 
//     const runnerResult = await lighthouse(url, options);
//      chrome.kill();

//     if (!runnerResult?.report)
//       return res.status(500).json({ error: "Lighthouse failed to generate report" });

//     const reportStr = Array.isArray(runnerResult.report)
//       ? runnerResult.report.join("")
//       : runnerResult.report;

//     const reportJson = JSON.parse(reportStr);
//     const performanceScore = reportJson.categories.performance.score;

       
//     await db.insert(analyses).values({
//       websiteId,
//       type: "lighthouse",
//       report: JSON.stringify(reportJson),
//     });

//     return res.status(200).json({
//       message: "Website analysis completed successfully",
//       performanceScore,
//       websiteId,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to analyze website" });
//   }
// };


// import { exec } from "child_process";
// import util from "util";
// const execPromise = util.promisify(exec);

// export const createAnalyses = async (req: Request, res: Response) => {
//   try {
//     const { url } = req.body;
//     if (!url) return res.status(400).json({ error: "Website URL is required" });

//     const existing = await db.select().from(websites).where(eq(websites.url, url)).limit(1);

//     let websiteId: number;
//     if (existing.length > 0 && existing[0]?.id) {
//       websiteId = existing[0].id;
//     } else {
//       const websiteName = new URL(url).hostname;
//       const inserted = await db
//         .insert(websites)
//         .values({ url, name: websiteName, status: "active" })
//         .returning({ id: websites.id });

//       if (!inserted[0]?.id) throw new Error("Failed to insert website");
//       websiteId = inserted[0].id;
//     }

   
//     const chromeFlags = [
//       "--headless=new",
//       "--no-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-gpu",
//       "--remote-debugging-port=9222",
//     ];

    
//     await execPromise(`/usr/lib/chromium/chromium ${chromeFlags.join(" ")} about:blank &`);

//     await new Promise((r) => setTimeout(r, 30000));

//     const options = {
//       logLevel: "info" as const,
//       output: "json" as const,
//       port: 9222,
//     };

//     const runnerResult = await lighthouse(url, options);

   
//     await execPromise("pkill chromium || true");

//     if (!runnerResult?.report) return res.status(500).json({ error: "Lighthouse failed to generate report" });

//     const reportStr = Array.isArray(runnerResult.report)
//       ? runnerResult.report.join("")
//       : runnerResult.report;

//     const reportJson = JSON.parse(reportStr);
//     const performanceScore = reportJson.categories.performance?.score ?? null;

//     await db.insert(analyses).values({
//       websiteId,
//       type: "lighthouse",
//       report: JSON.stringify(reportJson),
//     });

//     return res.status(200).json({
//       message: "Website analysis completed successfully",
//       performanceScore,
//       websiteId,
//     });
//   } catch (err) {
//     console.error("❌ Lighthouse error:", err);
//     res.status(500).json({ error: "Failed to analyze website" });
//   }
// };

export const createAnalyses = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Website URL is required" });

    const cacheKey = `analysis:score:${url}`;
    const cachedScore = await redis.get(cacheKey);
    if (cachedScore) {
      console.log("Serving performance score from Redis cache...");
      return res.status(200).json({
        message: "Website analysis (from cache)",
        performanceScore: Number(cachedScore),
        fromCache: true,
      });
    }
   const existing = await db.select().from(websites).where(eq(websites.url, url)).limit(1);

    let websiteId: number;
    if (existing.length > 0 && existing[0]?.id) {
      websiteId = existing[0].id;
    } else {
      const websiteName = new URL(url).hostname;
      const inserted = await db
        .insert(websites)
        .values({
          url,
          name: websiteName,
          status: "active",
        })
        .returning({ id: websites.id });

      if (inserted.length === 0 || !inserted[0]?.id) {
        throw new Error("Failed to insert website");
      }

      websiteId = inserted[0].id;
      }
      const chrome = await chromeLauncher.launch({
       chromePath: process.env.CHROME_PATH || "/usr/bin/chromium",
       chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--remote-debugging-address=0.0.0.0",
        `--remote-debugging-port=${9222}`,
       ],
       port: 9222,
      });
     const options = {
     logLevel: "info" as const,
     output: "json" as const,
     port: 9222, 
     hostname: "0.0.0.0",
    };

    await new Promise((r) => setTimeout(r, 8000));

    const runnerResult = await lighthouse(url, options);
    chrome.kill();

    if (!runnerResult?.report) {
      return res.status(500).json({ error: "Lighthouse failed to generate report" });
    }

    const reportStr = Array.isArray(runnerResult.report)
      ? runnerResult.report.join("")
      : runnerResult.report;

    const reportJson = JSON.parse(reportStr);
    const performanceScore = reportJson.categories.performance?.score ?? null;

    await db.insert(analyses).values({
      websiteId,
      type: "lighthouse",
      report: JSON.stringify(reportJson),
    });


   if (performanceScore !== null) {
      await redis.set(cacheKey, performanceScore.toString(), "EX", 3600);
    } 

    return res.status(200).json({
      message: "Website analysis completed successfully",
      performanceScore,
      websiteId,
      fromCache: false,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze website",err });
  }
};

export const getAnalysesByWebsite = async (req: Request, res: Response) => {
  try {
    const websiteIdStr = req.params.id;
    if (!websiteIdStr) {
      return res.status(400).json({ error: "Website ID is required" });
    }
const cacheKey = `analyses:${websiteIdStr}`;
     const cached = await redis.get(cacheKey);

      
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({
        fromCache: true,
        result: parsed,
      });
    }


    const websiteId = parseInt(websiteIdStr, 10);

    const result = await db
      .select()
      .from(analyses)
      .where(eq(analyses.websiteId, websiteId));

  await redis.set(cacheKey, JSON.stringify(result), "EX" ,60 );

   return res.json({
    fromCache: false,
    result,

   });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
};