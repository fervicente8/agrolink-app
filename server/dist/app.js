import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { healthRouter } from "./routes/health.js";
export function buildApp() {
    const app = express();
    app.disable("x-powered-by");
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(express.json({ limit: "1mb" }));
    app.use(healthRouter);
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: "Not Found" });
    });
    return app;
}
//# sourceMappingURL=app.js.map