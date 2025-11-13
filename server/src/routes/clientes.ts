import { Router, Response } from "express";
import { Cliente } from "../models/Cliente.js";
import { authenticate, authorize, AuthRequest } from "../middleware/auth.js";

export const clientesRouter = Router();

// GET /api/clientes - Obtener todos los clientes de la empresa
clientesRouter.get(
  "/api/clientes",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const clientes = await Cliente.find({
        empresa: req.user!.empresa,
        activo: true,
      }).sort({ nombre: 1 });

      res.json({ clientes });
    } catch (err: any) {
      res.status(500).json({ error: "Error obteniendo clientes" });
    }
  }
);

// GET /api/clientes/:id - Obtener un cliente específico
clientesRouter.get(
  "/api/clientes/:id",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const cliente = await Cliente.findOne({
        _id: req.params.id,
        empresa: req.user!.empresa,
      });

      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      res.json(cliente);
    } catch (err: any) {
      res.status(500).json({ error: "Error obteniendo cliente" });
    }
  }
);

// POST /api/clientes - Crear nuevo cliente
clientesRouter.post(
  "/api/clientes",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { numero, nombre, telefono, email, direccion, notas } = req.body;

      // Validaciones
      if (!numero || !nombre) {
        return res.status(400).json({
          error: "Número y nombre son requeridos",
        });
      }

      // Verificar que el número no exista en la empresa
      const existingCliente = await Cliente.findOne({
        empresa: req.user!.empresa,
        numero: numero.trim(),
      });

      if (existingCliente) {
        return res.status(409).json({
          error: "Ya existe un cliente con ese número",
        });
      }

      // Crear cliente
      const cliente = new Cliente({
        empresa: req.user!.empresa,
        numero: numero.trim(),
        nombre: nombre.trim(),
        telefono: telefono?.trim(),
        email: email?.trim(),
        direccion: direccion?.trim(),
        notas: notas?.trim(),
        activo: true,
      });

      await cliente.save();

      res.status(201).json({
        message: "Cliente creado exitosamente",
        cliente,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Error creando cliente", detail: err.message });
    }
  }
);

// PUT /api/clientes/:id - Actualizar cliente
clientesRouter.put(
  "/api/clientes/:id",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { numero, nombre, telefono, email, direccion, notas } = req.body;

      const cliente = await Cliente.findOne({
        _id: req.params.id,
        empresa: req.user!.empresa,
      });

      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // Si se cambia el número, verificar que no exista otro cliente con ese número
      if (numero && numero !== cliente.numero) {
        const existingCliente = await Cliente.findOne({
          empresa: req.user!.empresa,
          numero: numero.trim(),
          _id: { $ne: cliente._id },
        });

        if (existingCliente) {
          return res.status(409).json({
            error: "Ya existe otro cliente con ese número",
          });
        }
        cliente.numero = numero.trim();
      }

      if (nombre) cliente.nombre = nombre.trim();
      if (telefono !== undefined) cliente.telefono = telefono?.trim();
      if (email !== undefined) cliente.email = email?.trim();
      if (direccion !== undefined) cliente.direccion = direccion?.trim();
      if (notas !== undefined) cliente.notas = notas?.trim();

      await cliente.save();

      res.json({
        message: "Cliente actualizado exitosamente",
        cliente,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Error actualizando cliente" });
    }
  }
);

// DELETE /api/clientes/:id - Eliminar (desactivar) cliente
clientesRouter.delete(
  "/api/clientes/:id",
  authenticate,
  authorize("admin", "supervisor"),
  async (req: AuthRequest, res: Response) => {
    try {
      const cliente = await Cliente.findOne({
        _id: req.params.id,
        empresa: req.user!.empresa,
      });

      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // Desactivar en lugar de eliminar
      cliente.activo = false;
      await cliente.save();

      res.json({
        message: "Cliente eliminado exitosamente",
      });
    } catch (err: any) {
      res.status(500).json({ error: "Error eliminando cliente" });
    }
  }
);
