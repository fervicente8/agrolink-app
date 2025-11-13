import { Router, Request, Response } from "express";
import vision from "@google-cloud/vision";
import axios from "axios";
import fs from "fs";
import { logger } from "../logger.js";
import { ProductoSenasa } from "../models/ProductoSenasa.js";

// Inicialización del cliente Vision.
// Si existe GOOGLE_APPLICATION_CREDENTIALS y el archivo está presente usamos keyFilename explícito;
// caso contrario se intenta ADC (Application Default Credentials).
let client: any;
let visionClientMode: "keyfile" | "adc" = "adc";
const keyFilePathRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
const keyFilePath = keyFilePathRaw
  ? keyFilePathRaw.replace(/^['"]|['"]$/g, "")
  : undefined;
if (keyFilePath) {
  if (fs.existsSync(keyFilePath)) {
    client = new vision.ImageAnnotatorClient({ keyFilename: keyFilePath });
    visionClientMode = "keyfile";
    logger.info({ keyFilePath }, "Vision: usando keyFilename explícito");
  } else {
    logger.warn(
      { keyFilePath },
      "Vision: ruta credenciales no existe, fallback a ADC"
    );
    client = new vision.ImageAnnotatorClient();
  }
} else {
  client = new vision.ImageAnnotatorClient();
  logger.info("Vision: sin GOOGLE_APPLICATION_CREDENTIALS, intentando ADC");
}
export const ocrRouter = Router();
const VISION_API_KEY = process.env.VISION_API_KEY || "";

type OcrBody = {
  imageBase64?: string; // Imagen codificada en base64 (sin prefijo data:...)
  imageDataUrl?: string; // Alternativa: data URL completa
  imageUri?: string; // URI pública (https://...)
  maxResults?: number; // limite de coincidencias
};

function extractBase64(body: OcrBody): string | null {
  if (body.imageBase64) return body.imageBase64.trim();
  if (body.imageDataUrl) {
    const m = body.imageDataUrl.match(/base64,(.*)$/);
    return m ? m[1] : null;
  }
  return null;
}

// Heurística mejorada: extrae números de inscripción (con/sin puntos), marcas y firmas
function parseCandidates(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const joined = lines.join(" ");

  // Buscar números de inscripción: captura variantes con puntos/espacios (ej: "36.374", "36374")
  const numeroRegex = /\b\d{1,3}[.\s]?\d{3,4}\b|\b\d{4,6}\b/g;
  const numerosRaw = joined.match(numeroRegex) || [];
  // Normalizar: quitar puntos y espacios
  const numeros = Array.from(
    new Set(numerosRaw.map((n) => n.replace(/[.\s]/g, "")))
  ).filter((n) => n.length >= 4 && n.length <= 6);

  // Extraer marcas candidatas: palabras en mayúsculas de 3+ letras
  const marcaRegex = /\b[A-ZÑÁÉÍÓÚ]{3,}\b/g;
  const marcasCandidatas = Array.from(new Set(joined.match(marcaRegex) || []));

  // Líneas con palabras clave relevantes
  const palabrasClave = lines.filter((l) =>
    /inscri|registro|senasa|marca|firma|fungicida|herbicida|insecticida/i.test(
      l
    )
  );

  return { numeros, marcasCandidatas, palabrasClave, rawLines: lines };
}

ocrRouter.post("/api/ocr", async (req: Request, res: Response) => {
  const body: OcrBody = req.body || {};
  const maxResults =
    body.maxResults && body.maxResults > 0 ? body.maxResults : 5;

  const base64 = extractBase64(body);
  const hasUri = !!body.imageUri;
  if (!base64 && !hasUri) {
    return res
      .status(400)
      .json({ error: "Debe enviar imageBase64/imageDataUrl o imageUri" });
  }

  try {
    let visionInput: any;
    if (base64) {
      visionInput = { image: { content: base64 } };
    } else if (body.imageUri) {
      visionInput = { image: { source: { imageUri: body.imageUri } } };
    }

    let durationMs = 0;
    let annotation = "";

    // Intento principal: cliente oficial (@google-cloud/vision) usando ADC/SA
    try {
      const tStart = Date.now();
      const [result] = await client.textDetection(visionInput);
      durationMs = Date.now() - tStart;
      annotation = result.fullTextAnnotation?.text || "";
    } catch (e: any) {
      // Fallback: si hay API key configurada, usar REST de Vision
      if (VISION_API_KEY) {
        const reqBody = {
          requests: [
            {
              image: base64
                ? { content: base64 }
                : { source: { imageUri: body.imageUri } },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        };
        const tStart2 = Date.now();
        const { data } = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
          reqBody,
          { timeout: 15000 }
        );
        durationMs = Date.now() - tStart2;
        annotation =
          data?.responses?.[0]?.fullTextAnnotation?.text ||
          data?.responses?.[0]?.textAnnotations?.[0]?.description ||
          "";
      } else {
        throw e;
      }
    }

    if (!annotation) {
      return res.json({ text: "", matches: [], durationMs });
    }

    const { numeros, marcasCandidatas, palabrasClave, rawLines } =
      parseCandidates(annotation);

    // Estrategia de búsqueda por prioridad: primero marca exacta, luego número, luego firma
    let matches: any[] = [];

    // PRIORIDAD 1: Buscar por marca exacta (case-insensitive)
    if (marcasCandidatas.length > 0) {
      const marcaQueries = marcasCandidatas
        .filter((m) => m.length >= 3)
        .map((m) => ({ marca: { $regex: `^${m}$`, $options: "i" } }));

      if (marcaQueries.length > 0) {
        const marcaMatches = await ProductoSenasa.find({
          $or: marcaQueries,
        })
          .limit(maxResults)
          .lean();
        matches.push(...marcaMatches);
      }
    }

    // PRIORIDAD 2: Buscar por número de inscripción (solo si no tenemos suficientes)
    if (matches.length < maxResults && numeros.length > 0) {
      const numeroQueries = numeros.map((n) => ({ numeroInscripcion: n }));
      const numeroMatches = await ProductoSenasa.find({
        $or: numeroQueries,
      })
        .limit(maxResults - matches.length)
        .lean();
      matches.push(...numeroMatches);
    }

    // PRIORIDAD 3: Buscar por firma (solo si aún faltan resultados)
    if (matches.length < maxResults) {
      const firmaTokens = marcasCandidatas.filter((t) => t.length >= 5);
      if (firmaTokens.length > 0) {
        const firmaQueries = firmaTokens.map((t) => ({
          firma: { $regex: t, $options: "i" },
        }));
        const firmaMatches = await ProductoSenasa.find({
          $or: firmaQueries,
        })
          .limit(maxResults - matches.length)
          .lean();
        matches.push(...firmaMatches);
      }
    }

    // Eliminar duplicados por _id
    const uniqueMatches = Array.from(
      new Map(matches.map((m) => [m._id.toString(), m])).values()
    ).slice(0, maxResults);

    res.json({
      text: annotation,
      durationMs,
      numerosDetectados: numeros,
      marcasDetectadas: marcasCandidatas,
      lineasClave: palabrasClave,
      matches: uniqueMatches,
      totalMatches: uniqueMatches.length,
      rawLines,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Error en OCR");
    res.status(500).json({ error: "OCR failed", detail: err?.message });
  }
});
