import type{ Request, Response } from "express";
import { db } from "../../db/DBconnection.js";
import { analyses, websites } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";





export const createAnalyses = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Website URL is required" });


    const newWebsite = await db
      .select()
      .from(websites)
      .where(eq(websites.url, url))
      .limit(1);

    let websiteId: number;

    if (newWebsite.length > 0 && newWebsite[0]?.id) {
      websiteId = newWebsite[0].id;
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


    const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
    const options = { logLevel: "info" as const, output: "json" as const, port: chrome.port };

    const runnerResult = await lighthouse(url, options);
     chrome.kill();

    if (!runnerResult?.report)
      return res.status(500).json({ error: "Lighthouse failed to generate report" });

    const reportStr = Array.isArray(runnerResult.report)
      ? runnerResult.report.join("")
      : runnerResult.report;

    const reportJson = JSON.parse(reportStr);
    const performanceScore = reportJson.categories.performance.score;

       
    await db.insert(analyses).values({
      websiteId,
      type: "lighthouse",
      report: JSON.stringify(reportJson),
    });

    return res.status(200).json({
      message: "Website analysis completed successfully",
      performanceScore,
      websiteId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze website" });
  }
};




export const getAnalysesByWebsite = async (req: Request, res: Response) => {
  try {
    const websiteIdStr = req.params.id;
    if (!websiteIdStr) {
      return res.status(400).json({ error: "Website ID is required" });
    }
    const websiteId = parseInt(websiteIdStr, 10);

    const result = await db
      .select()
      .from(analyses)
      .where(eq(analyses.websiteId, websiteId));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
};


// export const createAnalyses = async (req: Request, res: Response) => {
//   try {
//     const { url } = req.body;

//     if (!url) {
//       return res.status(400).json({ error: "Website URL is required" });
//     }

//     const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
//     const options = {
//       logLevel: "info" as const,
//       output: "json" as const,
//       port: chrome.port,
//     };

//     const runnerResult = await lighthouse(url, options);
//     chrome.kill();

//     if (!runnerResult || !runnerResult.report) {
//       return res
//         .status(500)
//         .json({ error: "Lighthouse failed to generate report" });
//     }

 
//     const reportStr = Array.isArray(runnerResult.report)
//       ? runnerResult.report.join("")
//       : runnerResult.report;

//     const reportJson = JSON.parse(reportStr);




//     res.status(200).json({
//       message: "Website analysis completed successfully",
//       performanceScore: reportJson.categories.performance.score,
      
//     });
  
   

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to analyze website" });
//   }
// };