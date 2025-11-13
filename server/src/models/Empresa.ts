import { Schema, model, Document } from "mongoose";

export interface IEmpresa extends Document {
  nombre: string;
  cuit?: string;
  razonSocial?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  config: {
    formatoExportacion: "csv" | "excel" | "txt" | "json" | "xml";
    separadorCSV?: string;
    camposTraza: {
      nombre: string;
      clave: string;
      tipo: "texto" | "numero" | "fecha" | "seleccion";
      requerido: boolean;
      opciones?: string[];
      orden: number;
    }[];
    nombreArchivoTemplate?: string;
    columnasPersonalizadas?: {
      [key: string]: {
        nombreColumna: string;
        formula?: string;
        ancho?: number;
      };
    };
  };
  plan: {
    tipo: "free" | "basic" | "premium" | "enterprise";
    maxUsuarios: number;
    maxClientes: number;
    maxTrazasMes: number;
    almacenamientoMB: number;
    fechaVencimiento?: Date;
  };
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const empresaSchema = new Schema<IEmpresa>(
  {
    nombre: { type: String, required: true, trim: true },
    cuit: { type: String, unique: true, sparse: true, trim: true },
    razonSocial: { type: String, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    direccion: { type: String, trim: true },
    config: {
      formatoExportacion: {
        type: String,
        enum: ["csv", "excel", "txt", "json", "xml"],
        default: "csv",
      },
      separadorCSV: { type: String, default: "," },
      camposTraza: [
        {
          nombre: { type: String, required: true },
          clave: { type: String, required: true },
          tipo: {
            type: String,
            enum: ["texto", "numero", "fecha", "seleccion"],
            required: true,
          },
          requerido: { type: Boolean, default: false },
          opciones: [{ type: String }],
          orden: { type: Number, required: true },
        },
      ],
      nombreArchivoTemplate: {
        type: String,
        default: "TRAZA_{fecha}_{empresa}_{id}",
      },
      columnasPersonalizadas: { type: Schema.Types.Mixed },
    },
    plan: {
      tipo: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      maxUsuarios: { type: Number, default: 3 },
      maxClientes: { type: Number, default: 50 },
      maxTrazasMes: { type: Number, default: 500 },
      almacenamientoMB: { type: Number, default: 100 },
      fechaVencimiento: { type: Date },
    },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índices
empresaSchema.index({ cuit: 1 }, { unique: true, sparse: true });
empresaSchema.index({ activa: 1 });

export const Empresa = model<IEmpresa>("Empresa", empresaSchema);
