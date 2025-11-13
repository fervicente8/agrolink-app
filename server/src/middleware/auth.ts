import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    empresa: string;
    role: "admin" | "operario" | "supervisor";
  };
}

// Middleware de autenticación
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.activo) {
      return res.status(401).json({ error: "Usuario no autorizado" });
    }

    // Actualizar último acceso
    user.ultimoAcceso = new Date();
    await user.save();

    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      empresa: (user.empresa as any).toString(),
      role: user.role,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Middleware de autorización por roles
export const authorize = (
  ...roles: Array<"admin" | "operario" | "supervisor">
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción",
        requiredRoles: roles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

// Generar JWT
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
};

// Verificar que el recurso pertenece a la empresa del usuario
export const checkEmpresaOwnership = (
  empresaId: string,
  userEmpresaId: string
): boolean => {
  return empresaId === userEmpresaId;
};
