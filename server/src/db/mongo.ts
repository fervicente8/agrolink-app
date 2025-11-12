import mongoose from "mongoose";
import { logger } from "../logger.js";
import { ENV } from "../config/env.js";

let isConnecting = false;
let connectedOnce = false;

const MAX_RETRIES = 10;

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function connectMongo() {
  if (!ENV.MONGODB_URI) {
    logger.warn("MONGODB_URI no configurado; se omitirá la conexión");
    return;
  }

  if (
    isConnecting ||
    (mongoose.connection.readyState as unknown as number) === 1
  )
    return;

  isConnecting = true;

  let attempt = 0;
  while (
    attempt < MAX_RETRIES &&
    (mongoose.connection.readyState as unknown as number) !== 1
  ) {
    attempt++;
    try {
      logger.info({ attempt }, "Conectando a MongoDB...");
      await mongoose.connect(ENV.MONGODB_URI);
      connectedOnce = true;
      logger.info("Conectado a MongoDB");
      break;
    } catch (err: any) {
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
      logger.error(
        { err },
        `Fallo de conexión a MongoDB. Reintentando en ${delay}ms`
      );
      await wait(delay);
    }
  }

  isConnecting = false;
}

export function mongoStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const state = mongoose.connection.readyState;
  return {
    state,
    connectedOnce,
  };
}

export async function disconnectMongo() {
  try {
    await mongoose.disconnect();
    logger.info("Desconectado de MongoDB");
  } catch (err) {
    logger.error({ err }, "Error al desconectar MongoDB");
  }
}

// Eventos
mongoose.connection.on("connected", () => logger.info("Mongoose conectado"));
mongoose.connection.on("error", (err: unknown) =>
  logger.error({ err }, "Mongoose error")
);
mongoose.connection.on("disconnected", () =>
  logger.warn("Mongoose desconectado")
);
