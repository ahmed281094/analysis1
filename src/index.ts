import "dotenv/config";
import express from "express";
import logger from "./logger";
import analysesRouter from "./modules/analyses/analyses.routes";
import websitesRouter from "./modules/websites/websites.routes";

const app = express();
app.use(express.json());

app.use("/websites", websitesRouter);
app.use("/analyses", analysesRouter);
const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
	logger.info(`Server running on http://localhost:${PORT}`);
});
