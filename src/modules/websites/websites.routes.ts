import { Router} from "express";
import { createWebsite, getWebsiteById, getWebsites } from "./websites.controller.js";


const websitesRouter = Router()


websitesRouter.post("/",createWebsite)
websitesRouter.get("/",getWebsites)
websitesRouter.get("/:id", getWebsiteById);
export default websitesRouter;