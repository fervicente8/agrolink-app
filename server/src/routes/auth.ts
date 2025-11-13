import { Router, Request, Response } from "express";
import { User } from "../models/User.js";
import { Empresa } from "../models/Empresa.js";
import {
  generateToken,
  authenticate,
  AuthRequest,
} from "../middleware/auth.js";

export const authRouter = Router();

// POST /api/auth/register - Registro de nueva empresa + admin
authRouter.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      empresaNombre,
      cuit,
      razonSocial,
    } = req.body;

    // Validaciones
    if (!email || !password || !nombre || !empresaNombre) {
      return res.status(400).json({
        error: "Email, contraseña, nombre y nombre de empresa son requeridos",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Verificar si el CUIT ya existe
    if (cuit) {
      const existingEmpresa = await Empresa.findOne({ cuit });
      if (existingEmpresa) {
        return res.status(409).json({ error: "El CUIT ya está registrado" });
      }
    }

    // Crear empresa
    const empresa = new Empresa({
      nombre: empresaNombre,
      cuit,
      razonSocial,
      config: {
        formatoExportacion: "csv",
        separadorCSV: ",",
        camposTraza: [],
        nombreArchivoTemplate: "TRAZA_{fecha}_{empresa}_{id}",
      },
      plan: {
        tipo: "free",
        maxUsuarios: 3,
        maxClientes: 50,
        maxTrazasMes: 500,
        almacenamientoMB: 100,
      },
      activa: true,
    });

    await empresa.save();

    // Crear usuario admin
    const user = new User({
      email,
      password,
      nombre,
      apellido,
      role: "admin",
      empresa: empresa._id,
      activo: true,
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id as string);

    res.status(201).json({
      message: "Registro exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        empresa: {
          id: empresa._id,
          nombre: empresa.nombre,
          plan: empresa.plan.tipo,
        },
      },
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Error en el registro", detail: err.message });
  }
});

// POST /api/auth/login - Inicio de sesión
authRouter.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario con password
    const user = await User.findOne({ email })
      .select("+password")
      .populate("empresa");

    if (!user || !user.activo) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar que la empresa esté activa
    const empresa = user.empresa as any;
    if (!empresa || !empresa.activa) {
      return res.status(403).json({ error: "Empresa inactiva" });
    }

    // Generar token
    const token = generateToken(user._id as string);

    // Actualizar último acceso
    user.ultimoAcceso = new Date();
    await user.save();

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        empresa: {
          id: empresa._id,
          nombre: empresa.nombre,
          plan: empresa.plan.tipo,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error en el login", detail: err.message });
  }
});

// GET /api/auth/me - Obtener usuario actual
authRouter.get(
  "/api/auth/me",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.id).populate("empresa");

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        empresa: user.empresa,
        ultimoAcceso: user.ultimoAcceso,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Error obteniendo usuario" });
    }
  }
);

// POST /api/auth/change-password - Cambiar contraseña
authRouter.post(
  "/api/auth/change-password",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Contraseña actual y nueva son requeridas",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "La nueva contraseña debe tener al menos 8 caracteres",
        });
      }

      const user = await User.findById(req.user!.id).select("+password");
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: "Contraseña actual incorrecta" });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (err: any) {
      res.status(500).json({ error: "Error cambiando contraseña" });
    }
  }
);
