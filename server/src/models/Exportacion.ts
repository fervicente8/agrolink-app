import { Schema, model, Document, Types } from "mongoose";

export interface IExportacion extends Document {
  empresa: Types.ObjectId;
  usuario: Types.ObjectId;
  formato: "csv" | "excel" | "txt" | "json" | "xml";
  filtros: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    clientes?: Types.ObjectId[];
    estado?: string;
  };
  cantidadRegistros: number;
  nombreArchivo: string;
  urlDescarga?: string;
  createdAt: Date;
}

const exportacionSchema = new Schema<IExportacion>(
  {
    empresa: { type: Schema.Types.ObjectId, ref: "Empresa", required: true },
    usuario: { type: Schema.Types.ObjectId, ref: "User", required: true },
    formato: {
      type: String,
      enum: ["csv", "excel", "txt", "json", "xml"],
      required: true,
    },
    filtros: {
      fechaDesde: { type: Date },
      fechaHasta: { type: Date },
      clientes: [{ type: Schema.Types.ObjectId, ref: "Cliente" }],
      estado: { type: String },
    },
    cantidadRegistros: { type: Number, required: true, min: 0 },
    nombreArchivo: { type: String, required: true },
    urlDescarga: { type: String },
  },
  { timestamps: true }
);

// Índices
exportacionSchema.index({ empresa: 1, createdAt: -1 });
exportacionSchema.index({ usuario: 1 });

export const Exportacion = model<IExportacion>(
  "Exportacion",
  exportacionSchema
);
