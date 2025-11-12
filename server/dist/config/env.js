import { config as dotenvConfig } from "dotenv";
import { z } from "zod";
dotenvConfig();
const EnvSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
    APP_NAME: z.string().default("agrolink-server"),
    MONGODB_URI: z
        .string()
        .transform((s) => s.trim().replace(/^['\"]|['\"]$/g, ""))
        .pipe(z
        .string()
        .min(1, "MONGODB_URI es requerido")
        .refine((v) => v.startsWith("mongodb://") || v.startsWith("mongodb+srv://"), "MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://")),
});
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Error de configuración .env:", parsed.error.format());
    // No lanzamos aquí para permitir ejecutar comandos que no requieren DB
}
export const ENV = parsed.success
    ? parsed.data
    : {
        NODE_ENV: process.env.NODE_ENV ||
            "development",
        PORT: Number(process.env.PORT) || 4000,
        LOG_LEVEL: process.env.LOG_LEVEL || "info",
        APP_NAME: process.env.APP_NAME || "agrolink-server",
        MONGODB_URI: process.env.MONGODB_URI || "",
    };
//# sourceMappingURL=env.js.map