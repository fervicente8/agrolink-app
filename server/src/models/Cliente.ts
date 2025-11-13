import { Schema, model, Document, Types } from "mongoose";

export interface ICliente extends Document {
  empresa: Types.ObjectId;
  numero: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clienteSchema = new Schema<ICliente>(
  {
    empresa: { type: Schema.Types.ObjectId, ref: "Empresa", required: true },
    numero: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    direccion: { type: String, trim: true },
    notas: { type: String, trim: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índice compuesto: número único por empresa
clienteSchema.index({ empresa: 1, numero: 1 }, { unique: true });
clienteSchema.index({ empresa: 1, activo: 1 });

export const Cliente = model<ICliente>("Cliente", clienteSchema);
