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

// Heurística: busca posibles números de inscripción (secuencias de 4-6 dígitos) y líneas con palabras clave
function parseCandidates(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const joined = lines.join(" ");
  const numeroRegex = /\b\d{4,6}\b/g; // ajustar según formato real
  const numeros = Array.from(new Set(joined.match(numeroRegex) || []));
  const palabrasClave = lines.filter((l) =>
    /marca|inscrip|registro|firma|producto/i.test(l)
  );
  return { numeros, palabrasClave, rawLines: lines };
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
      logger.info(
        {
          durationMs,
          hasText: annotation.length > 0,
          via: "client",
          clientMode: visionClientMode,
        },
        "OCR procesado"
      );
    } catch (e: any) {
      // Fallback: si hay API key configurada, usar REST de Vision
      if (VISION_API_KEY) {
        logger.warn(
          { err: e?.message },
          "Fallo ADC; usando Vision REST con API key"
        );
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
        logger.info(
          { durationMs, hasText: annotation.length > 0, via: "rest" },
          "OCR procesado"
        );
      } else {
        throw e;
      }
    }

    if (!annotation) {
      return res.json({ text: "", matches: [], durationMs });
    }

    const { numeros, palabrasClave, rawLines } = parseCandidates(annotation);

    // Construir criterios dinámicos
    const orCriteria: any[] = [];
    for (const n of numeros) {
      orCriteria.push({ numeroInscripcion: n });
    }

    const addRegex = (field: string, value: string) => {
      if (value.length < 3) return; // evitar ruido
      orCriteria.push({
        [field]: {
          $regex: value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
          $options: "i",
        },
      });
    };

    for (const line of palabrasClave) {
      const tokens = line.split(/\s+/).filter((t) => t.length >= 3);
      if (tokens[0]) addRegex("marca", tokens[0]);
      if (tokens[1]) addRegex("marca", tokens[1]);
      if (tokens[0]) addRegex("firma", tokens[0]);
    }

    const query = orCriteria.length > 0 ? { $or: orCriteria } : {};
    let matches: any[] = [];
    if (orCriteria.length > 0) {
      matches = await ProductoSenasa.find(query).limit(maxResults).lean();
    }

    res.json({
      text: annotation,
      durationMs,
      numerosDetectados: numeros,
      lineasClave: palabrasClave,
      matches,
      totalMatches: matches.length,
      rawLines,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Error en OCR");
    res.status(500).json({ error: "OCR failed", detail: err?.message });
  }
});
