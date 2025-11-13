import { Schema, model, Document, Types } from "mongoose";

export interface ITraza extends Document {
  empresa: Types.ObjectId;
  usuario: Types.ObjectId;
  cliente: Types.ObjectId;
  producto: {
    nombre: string;
    marca?: string;
    numeroInscripcion?: string;
    codigoBarras?: string;
    firma?: string;
    claseToxicologica?: string;
    sustanciasActivas?: string;
  };
  lote: string;
  cantidad: number;
  unidad: string;
  capacidadUnidad?: string;
  totalLitros?: number;
  fechaProduccion?: string;
  fechaVencimiento?: string;
  presentacion?: string;
  camposPersonalizados?: { [key: string]: any };
  fechaRegistro: Date;
  ubicacion?: {
    lat: number;
    lng: number;
  };
  estado: "pendiente" | "confirmada" | "exportada" | "anulada";
  notasInternas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const trazaSchema = new Schema<ITraza>(
  {
    empresa: { type: Schema.Types.ObjectId, ref: "Empresa", required: true },
    usuario: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cliente: { type: Schema.Types.ObjectId, ref: "Cliente", required: true },
    producto: {
      nombre: { type: String, required: true, trim: true },
      marca: { type: String, trim: true },
      numeroInscripcion: { type: String, trim: true },
      codigoBarras: { type: String, trim: true },
      firma: { type: String, trim: true },
      claseToxicologica: { type: String, trim: true },
      sustanciasActivas: { type: String, trim: true },
    },
    lote: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0 },
    unidad: { type: String, required: true, trim: true },
    capacidadUnidad: { type: String, trim: true },
    totalLitros: { type: Number, min: 0 },
    fechaProduccion: { type: String, trim: true },
    fechaVencimiento: { type: String, trim: true },
    presentacion: { type: String, trim: true },
    camposPersonalizados: { type: Schema.Types.Mixed },
    fechaRegistro: { type: Date, default: Date.now },
    ubicacion: {
      lat: { type: Number },
      lng: { type: Number },
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "exportada", "anulada"],
      default: "pendiente",
    },
    notasInternas: { type: String, trim: true },
  },
  { timestamps: true }
);

// Índices
trazaSchema.index({ empresa: 1, fechaRegistro: -1 });
trazaSchema.index({ cliente: 1 });
trazaSchema.index({ lote: 1 });
trazaSchema.index({ empresa: 1, estado: 1 });
trazaSchema.index({ "producto.numeroInscripcion": 1 });

export const Traza = model<ITraza>("Traza", trazaSchema);
