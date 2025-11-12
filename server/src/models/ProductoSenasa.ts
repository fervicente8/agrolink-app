import mongoose from "mongoose";

const ProductoSenasaSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true },
    numeroInscripcion: { type: String },
    marca: { type: String },
    firma: { type: String },
    claseToxicologica: { type: String },
    sustanciasActivas: { type: String },
    detalle: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: "productos_senasa" }
);

export const ProductoSenasa = mongoose.model(
  "ProductoSenasa",
  ProductoSenasaSchema
);
