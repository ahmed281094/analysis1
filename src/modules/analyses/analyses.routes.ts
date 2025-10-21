import { Router } from "express";
import { createAnalyses, getAnalysesByWebsite } from "./analyses.controller";

const analysesRouter = Router();

analysesRouter.post("/analys", createAnalyses);
analysesRouter.get("/:id", getAnalysesByWebsite);
export default analysesRouter;
