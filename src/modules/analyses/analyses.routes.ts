import { Router} from "express";
import { createAnalyses, getAnalysesByWebsite } from "./analyses.controller.js";


const analysesRouter = Router()


analysesRouter.post("/analys",createAnalyses)
analysesRouter.get("/:id",getAnalysesByWebsite)
export default analysesRouter;