import axios from "axios";
// @ts-ignore (tipado opcional de cli-progress si no está disponible)
import { SingleBar, Presets } from "cli-progress";
import { wrapper } from "axios-cookiejar-support";
import { logger } from "../logger.js";
import { ProductoSenasa } from "../models/ProductoSenasa.js";
import { connectMongo, disconnectMongo } from "../db/mongo.js";
import { ENV } from "../config/env.js";
const BASE = "https://aps2.senasa.gov.ar/adt_api/api/productosAgroquimicosFormulados";
// Instancia axios con headers que emulan navegador y soporte de cookies para reducir 403
const raw = axios.create({
    headers: {
        Accept: "application/hal+json, application/json;q=0.9, */*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9",
        Origin: "https://aps2.senasa.gov.ar",
        Referer: "https://aps2.senasa.gov.ar/adt_api/",
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Encoding": "gzip, deflate, br",
    },
    timeout: 15000,
    withCredentials: true,
});
const http = wrapper(raw);
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
function jitter(min = 500, max = 900) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Helpers de logging enriquecido
function pickHeaders(headers) {
    if (!headers)
        return undefined;
    const keys = [
        "content-type",
        "cache-control",
        "pragma",
        "expires",
        "x-frame-options",
        "x-content-type-options",
        "x-xss-protection",
        "strict-transport-security",
        "vary",
        "date",
        "server",
    ];
    const out = {};
    for (const k of keys)
        if (headers[k] !== undefined)
            out[k] = headers[k];
    if (headers["set-cookie"])
        out["set-cookie-count"] = Array.isArray(headers["set-cookie"])
            ? headers["set-cookie"].length
            : 1;
    return out;
}
function dataSnippet(data) {
    try {
        if (data == null)
            return null;
        const str = typeof data === "string" ? data : JSON.stringify(data);
        return str.slice(0, 400);
    }
    catch (_) {
        return "[unserializable]";
    }
}
// Interceptores para medir duración y loguear errores con más contexto
raw.interceptors.request.use((config) => {
    config.metadata = { start: Date.now() };
    return config;
});
raw.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    return Promise.reject(error);
});
async function withRetry(fn, tries = 3, baseDelay = 500) {
    let lastErr;
    for (let i = 0; i < tries; i++) {
        try {
            return await fn();
        }
        catch (err) {
            lastErr = err;
            const wait = baseDelay * Math.pow(2, i);
            await sleep(wait);
        }
    }
    throw lastErr;
}
async function fetchList(page, size = 100) {
    const url = `${BASE}/search/publicSearchProductosFormuladosDTO`;
    const params = { page, size, sort: "numeroInscripcion,desc" };
    const res = await withRetry(() => http.get(url, { params }));
    const data = res?.data;
    const embedded = data?._embedded?.productosAgroquimicosFormulados;
    const items = Array.isArray(embedded) ? embedded : [];
    const pageMeta = data?.page || null;
    return { items, pageMeta };
}
async function fetchDetail(id) {
    const encoded = encodeURIComponent(`https://aps2.senasa.gov.ar/adt_api/api/productosAgroquimicosFormulados/${id}`);
    const url = `https://aps2.senasa.gov.ar/adt_api/api/productosAgroquimicosFormulados/search/publicSearchProducto?producto=${encoded}&projection=productoFormuladoPublicoProjection`;
    const res = await withRetry(() => http.get(url));
    const detailToReturn = {
        id: res.data?.id ?? null,
        pais: res?.data?.pais ?? null,
        estadoProducto: res?.data?.estadoProducto ?? null,
        numeroInscripcion: res?.data?.numeroInscripcion ?? null,
        tipoProducto: res?.data?.tipoProducto ?? null,
        fechaInscripcion: res?.data?.fechaInscripcion ?? null,
        motivoBaja: res?.data?.motivoBaja ?? null,
        principiosActivos: [
            ...(Array.isArray(res?.data?.principiosActivos)
                ? res?.data?.principiosActivos
                : []),
        ],
        productosFirma: [
            ...(Array.isArray(res?.data?.productosFirma)
                ? res?.data?.productosFirma
                : []),
        ],
    };
    return detailToReturn;
}
function stripHtml(input) {
    if (!input)
        return input ?? null;
    return input.replace(/<[^>]+>/g, "").trim();
}
export async function runScraper() {
    if (!ENV.MONGODB_URI) {
        return { inserted: 0, updated: 0 };
    }
    await connectMongo();
    let page = 0;
    const size = 100;
    let totalProcessed = 0;
    let inserted = 0;
    let updated = 0;
    let totalElements = null;
    let progress = null;
    while (true) {
        let listResult = null;
        try {
            listResult = await fetchList(page, size);
        }
        catch (err) {
            break;
        }
        const items = listResult?.items || [];
        const meta = listResult?.pageMeta;
        if (totalElements == null && meta && typeof meta.totalElements === "number") {
            totalElements = meta.totalElements;
            progress = new SingleBar({
                format: "SENASA [{bar}] {percentage}% | {value}/{total} | id {id} | insc {numero}",
                hideCursor: true,
                clearOnComplete: false,
            }, Presets.shades_classic);
            progress.start(totalElements || 0, 0, { id: "-", numero: "-" });
        }
        if (items.length === 0) {
            break;
        }
        for (const [idx, it] of items.entries()) {
            const id = Number(it?.id ?? it?.productoId ?? it?.productoID);
            if (!id || Number.isNaN(id))
                continue;
            const baseDoc = {
                _id: id,
                numeroInscripcion: it?.numeroInscripcion ?? it?.numero_inscripcion ?? null,
                marca: it?.marca ?? it?.nombreComercial ?? null,
                firma: it?.nombreFirma ?? it?.firma ?? null,
                claseToxicologica: it?.claseToxicologica ?? it?.clase_toxicologica ?? null,
                sustanciasActivas: stripHtml(it?.sustanciasActivas ?? it?.principiosActivos ?? null),
            };
            let detalle = null;
            try {
                await sleep(jitter());
                detalle = await fetchDetail(id);
            }
            catch (err) {
                const status = err?.response?.status;
                const snippet = dataSnippet(err?.response?.data);
                const headers = pickHeaders(err?.response?.headers);
                logger.error({ id, err: err?.message, status, headers, dataSnippet: snippet }, "Error trayendo detalle");
            }
            const fullDoc = {
                ...baseDoc,
                detalle,
                detalleError: detalle ? undefined : "fetch_failed_403",
            };
            const res = await ProductoSenasa.replaceOne({ _id: id }, fullDoc, {
                upsert: true,
            });
            if (res.upsertedCount && res.upsertedCount > 0)
                inserted++;
            else if (res.matchedCount > 0 && res.modifiedCount > 0)
                updated++;
            totalProcessed++;
            if (totalProcessed % 20 === 0) {
                logger.info({ totalProcessed, inserted, updated }, "Progreso parcial");
            }
            if (progress) {
                progress.increment({ id, numero: baseDoc.numeroInscripcion || "" });
            }
            await sleep(jitter());
            if ((idx + 1) % 25 === 0) {
                await sleep(5000);
            }
        }
        // Avanzar página y verificar fin
        page++;
        if (meta &&
            typeof meta.totalPages === "number" &&
            page >= meta.totalPages) {
            logger.info({ lastPage: page - 1, totalPages: meta.totalPages }, "Última página procesada");
            break;
        }
    }
    if (progress)
        progress.stop();
    logger.info({ totalProcessed, inserted, updated, totalElements }, "Scraper finalizado");
    await disconnectMongo();
    return { totalProcessed, inserted, updated };
}
//# sourceMappingURL=senasa.js.map