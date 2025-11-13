import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  role: "admin" | "operario" | "supervisor";
  empresa: Types.ObjectId;
  activo: boolean;
  ultimoAcceso?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "operario", "supervisor"],
      default: "operario",
    },
    empresa: { type: Schema.Types.ObjectId, ref: "Empresa", required: true },
    activo: { type: Boolean, default: true },
    ultimoAcceso: { type: Date },
  },
  { timestamps: true }
);

// Índices
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ empresa: 1 });
userSchema.index({ empresa: 1, role: 1 });

// Hash password antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
