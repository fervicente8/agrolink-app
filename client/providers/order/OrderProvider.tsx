import React, { createContext, useContext, useMemo, useState } from "react";

export type TraceItem = {
  id: string; // TR-<epoch>-<rand>
  client: string; // número de cliente
  product: string; // nombre producto
  productCode: string; // ID SENASA u otro
  lot: string; // lote
  qty: number; // cantidad
  unit: string; // unidad (bidones)
  totalLiters: number; // litros totales
  timestamp: Date; // fecha/hora registro
};

type OrderContextType = {
  items: TraceItem[];
  addTrace: (
    t: Omit<TraceItem, "id" | "timestamp"> & { id?: string; timestamp?: Date }
  ) => TraceItem;
  removeTrace: (id: string) => void; // elimina por id
  reset: () => void;
  totalProducts: number; // suma de qty
  totalLiters: number; // suma de totalLiters
  toCSV: () => string; // genera CSV con encabezado pedido
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function randomId() {
  const epoch = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `TR-${epoch}-${rand}`;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<TraceItem[]>([]);

  const addTrace: OrderContextType["addTrace"] = (t) => {
    const item: TraceItem = {
      id: t.id ?? randomId(),
      timestamp: t.timestamp ?? new Date(),
      client: t.client,
      product: t.product,
      productCode: t.productCode,
      lot: t.lot,
      qty: t.qty,
      unit: t.unit,
      totalLiters: t.totalLiters,
    };
    setItems((prev) => [item, ...prev]);
    return item;
  };

  const reset = () => setItems([]);

  const removeTrace: OrderContextType["removeTrace"] = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const totalProducts = useMemo(
    () => items.reduce((acc, it) => acc + it.qty, 0),
    [items]
  );
  const totalLiters = useMemo(
    () => items.reduce((acc, it) => acc + it.totalLiters, 0),
    [items]
  );

  const toCSV = () => {
    const header =
      "ID_Traza,Cliente,Producto,Codigo_Producto,Lote,Cantidad,Unidad,Total_Litros,Fecha_Hora";
    const rows = items
      .slice() // mantener orden agregado
      .reverse()
      .map((it) => {
        const ts = it.timestamp;
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        const date = `${pad(ts.getDate())}/${pad(
          ts.getMonth() + 1
        )}/${ts.getFullYear()}, ${pad(ts.getHours())}:${pad(
          ts.getMinutes()
        )}:${pad(ts.getSeconds())}`;
        const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
        return [
          q(it.id),
          q(it.client),
          q(it.product),
          q(it.productCode),
          q(it.lot),
          q(it.qty),
          q(it.unit),
          q(it.totalLiters),
          q(date),
        ].join(",");
      });
    return [header, ...rows].join("\n");
  };

  const value = useMemo(
    () => ({
      items,
      addTrace,
      removeTrace,
      reset,
      totalProducts,
      totalLiters,
      toCSV,
    }),
    [items, totalProducts, totalLiters]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
