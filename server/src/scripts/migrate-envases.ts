import { connectMongo, disconnectMongo } from "../db/mongo.js";
import { ProductoSenasa } from "../models/ProductoSenasa.js";
import { logger } from "../logger.js";

/**
 * Script de migración: Mueve el array de envases desde detalle.envases
 * al nivel superior del documento para facilitar el acceso.
 */
async function migrateEnvases() {
  try {
    await connectMongo();
    logger.info("Conectado a MongoDB. Iniciando migración de envases...");

    // Buscar todos los productos que tienen envases en detalle pero no en el nivel superior
    const productos = await ProductoSenasa.find({
      "detalle.envases": { $exists: true, $ne: null },
    }).lean();

    logger.info({ total: productos.length }, "Productos a migrar");

    let migrados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        const envases = (producto.detalle as any)?.envases || [];

        if (Array.isArray(envases) && envases.length > 0) {
          await ProductoSenasa.updateOne(
            { _id: producto._id },
            { $set: { envases } }
          );
          migrados++;

          if (migrados % 100 === 0) {
            logger.info({ migrados, errores }, "Progreso de migración");
          }
        }
      } catch (error: any) {
        errores++;
        logger.error(
          { _id: producto._id, error: error.message },
          "Error migrando producto"
        );
      }
    }

    logger.info(
      { migrados, errores, total: productos.length },
      "Migración completada"
    );

    await disconnectMongo();
    process.exit(0);
  } catch (error: any) {
    logger.error({ error: error.message }, "Error fatal en migración");
    process.exit(1);
  }
}

migrateEnvases();
