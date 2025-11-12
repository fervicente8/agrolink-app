import { Router } from "express";
import { mongoStatus } from "../db/mongo.js";
export const healthRouter = Router();
healthRouter.get("/health", (_req, res) => {
    const db = mongoStatus();
    const healthy = db.state === 1; // connected
    res.status(healthy ? 200 : 503).json({
        status: healthy ? "ok" : "degraded",
        db,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=health.js.map