import { ENV } from "./config/env.js";
import { logger } from "./logger.js";
import { buildApp } from "./app.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";

async function main() {
  const app = buildApp();

  // Intento de conexión en background; el servidor inicia y expone /health
  connectMongo().catch((err) => {
    logger.error({ err }, "Error inicial conectando a Mongo");
  });

  const server = app.listen(ENV.PORT, () => {
    logger.info({ port: ENV.PORT, env: ENV.NODE_ENV }, "Servidor iniciado");
  });

  const shutdown = async (signal: string) => {
    logger.warn({ signal }, "Recibida señal, apagando...");
    server.close(async () => {
      await disconnectMongo();
      logger.info("Servidor detenido");
      process.exit(0);
    });
    setTimeout(async () => {
      await disconnectMongo();
      logger.error("Forzando apagado por timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.fatal({ err }, "Fallo fatal en el arranque");
  process.exit(1);
});
