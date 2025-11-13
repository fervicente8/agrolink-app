import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { healthRouter } from "./routes/health.js";
import { ocrRouter } from "./routes/ocr.js";
import { authRouter } from "./routes/auth.js";
import { clientesRouter } from "./routes/clientes.js";
import productosRouter from "./routes/productos";

export function buildApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));

  app.use(healthRouter);
  app.use(ocrRouter);
  app.use(authRouter);
  app.use(clientesRouter);
  app.use(productosRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found" });
  });

  return app;
}
