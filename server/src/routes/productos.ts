import { Router, Request, Response } from "express";
import { ProductoSenasa } from "../models/ProductoSenasa";

const router = Router();

// GET /api/productos/search?q=termino
router.get("/api/productos/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.json({ productos: [] });
    }

    const searchTerm = query.trim();
    const regex = new RegExp(searchTerm, "i"); // case-insensitive

    // Buscar en múltiples campos
    const productos = await ProductoSenasa.find({
      $or: [
        { marca: regex },
        { numeroInscripcion: regex },
        { firma: regex },
        { sustanciasActivas: regex },
      ],
    })
      .limit(20)
      .lean();

    return res.json({ productos });
  } catch (error: any) {
    return res.status(500).json({ error: "Error en la búsqueda de productos" });
  }
});

export default router;
