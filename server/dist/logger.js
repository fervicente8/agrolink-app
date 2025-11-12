import pino from "pino";
const level = process.env.LOG_LEVEL || "info";
const name = process.env.APP_NAME || "agrolink-server";
export const logger = pino({
    name,
    level,
    transport: process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:standard" },
        }
        : undefined,
});
//# sourceMappingURL=logger.js.map