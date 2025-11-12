# OCR (Google Cloud Vision)

Se agregó el endpoint `POST /api/ocr` que recibe una imagen y devuelve:

- Texto completo detectado
- Números de inscripción candidatos (patrón de 4-6 dígitos)
- Líneas con palabras clave (marca / registro / firma / producto)
- Coincidencias en la colección `productos_senasa` comparando `numeroInscripcion`, `marca`, `firma`.

## Configuración de credenciales

El servidor intentará primero usar credenciales de Application Default (Service Account). Si falla y existe una `VISION_API_KEY`, hará fallback a la API REST.

### Opción A (recomendada): Service Account (ADC)

1. Crear un Service Account en GCP con permisos para Cloud Vision.
2. Descargar el JSON de la clave.
3. Definir la variable `GOOGLE_APPLICATION_CREDENTIALS` apuntando a la ruta absoluta del archivo.

Ejemplo en `.env` (Windows):

```
GOOGLE_APPLICATION_CREDENTIALS=C:\\Users\\usuario\\keys\\vision-sa.json
```

### Opción B (fallback): API Key

1. Crear una API key en GCP con acceso habilitado a Vision API.
2. Agregar en `.env`:

```
VISION_API_KEY=tu_api_key_de_google
```

Si el cliente oficial (@google-cloud/vision) lanza error de credenciales y existe `VISION_API_KEY`, se enviará la imagen mediante `https://vision.googleapis.com/v1/images:annotate?key=...`.

### Notas de seguridad

- No subas el JSON del Service Account ni tu API key al repositorio.
- Rotar la API key si se sospecha de exposición.
- Preferir Service Account para ambientes de producción (mejor control de permisos y rotación).

## Ejemplo de request (base64)

```
curl -X POST http://localhost:3000/api/ocr \
	-H "Content-Type: application/json" \
	-d '{
		"imageBase64": "<BASE64_SIN_PREFIJO>",
		"maxResults": 5
	}'
```

## Ejemplo de request (imageUri pública)

```
curl -X POST http://localhost:3000/api/ocr \
	-H "Content-Type: application/json" \
	-d '{
		"imageUri": "https://example.com/etiqueta.jpg"
	}'
```

## Respuesta

```json
{
  "text": "...texto detectado...",
  "durationMs": 523,
  "numerosDetectados": ["42331"],
  "lineasClave": ["MARCA XYZ", "REGISTRO 42331"],
  "matches": [{ "_id": 232865, "numeroInscripcion": "42331", "marca": "XYZ" }],
  "totalMatches": 1,
  "rawLines": ["MARCA XYZ", "REGISTRO 42331", "LOTE ..."]
}
```

## Notas

- Ajustar el regex de números si el formato definitivo difiere (archivo `routes/ocr.ts`).
- Puedes ampliar la heurística de coincidencia añadiendo normalización (tildes, mayúsculas) y distancias tipo Levenshtein.
- Para producción, limitar tamaño de imagen y añadir autenticación a este endpoint.

# Agrolink Server

Backend Node.js + Express + MongoDB (Mongoose) para Agrolink.

## Requisitos

- Node.js 18+
- MongoDB URI

## Configuración

1. Copiá `.env.example` a `.env` y completá:

```
APP_NAME=agrolink-server
NODE_ENV=development
PORT=4000
LOG_LEVEL=info
MONGODB_URI=mongodb://localhost:27017/agrolink
```

## Scripts

- Desarrollo: `npm run dev`
- Compilar: `npm run build`
- Producción: `npm start` (tras compilar)

## Salud

- `GET /health` devuelve estado de la app y la base de datos.

## Notas

- El servidor arranca aunque la DB no esté disponible y reintenta con backoff exponencial.
- Logs formateados en desarrollo y JSON en producción.
