import { runScraper } from "../scrapers/senasa.js";
import { logger } from "../logger.js";

(async () => {
  try {
    const res = await runScraper();
    logger.info(res, "Scrape manual completado");
  } catch (err: any) {
    logger.error({ err }, "Scrape manual falló");
    process.exit(1);
  }
})();
