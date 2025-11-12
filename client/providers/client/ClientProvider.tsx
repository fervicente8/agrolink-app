import React, { createContext, useContext, useMemo, useState } from "react";

export type Client = { number: string; name?: string };

type ClientContextType = {
  selectedClient: Client | null;
  setSelectedClient: (c: Client | null) => void;
  clients: Client[];
  addClient: (c: Client) => void;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const DEFAULTS: Client[] = [
  { number: "001", name: "Cliente A - Agroexportadora San Luis" },
  { number: "002", name: "Cliente B - Cooperativa El Progreso" },
  { number: "003", name: "Cliente C - Finca Los Naranjos" },
  { number: "004", name: "Cliente D - Hacienda El Roble" },
];

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(DEFAULTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const addClient = (c: Client) => {
    setClients((prev) => {
      const exists = prev.some((x) => x.number === c.number);
      const list = exists
        ? prev.map((x) => (x.number === c.number ? c : x))
        : [...prev, c];
      return list;
    });
    setSelectedClient(c);
  };

  const value = useMemo(
    () => ({ selectedClient, setSelectedClient, clients, addClient }),
    [selectedClient, clients]
  );

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
