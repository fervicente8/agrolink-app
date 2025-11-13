import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Platform } from "react-native";
import { useAuth } from "../auth/AuthProvider";

export type Client = {
  _id?: string;
  number: string;
  name: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
};

type ClientContextType = {
  selectedClient: Client | null;
  setSelectedClient: (c: Client | null) => void;
  clients: Client[];
  addClient: (c: Omit<Client, "_id">) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  loading: boolean;
  refreshClients: () => Promise<void>;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (envUrl) return envUrl;
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  return "http://localhost:3001";
};

const API_URL = getApiBaseUrl();

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar clientes al iniciar si hay sesión
  useEffect(() => {
    if (token && user) {
      refreshClients();
    }
  }, [token, user]);

  const refreshClients = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error cargando clientes");
      }

      const data = await response.json();
      setClients(
        data.clientes.map((c: any) => ({
          _id: c._id,
          number: c.numero,
          name: c.nombre,
          telefono: c.telefono,
          email: c.email,
          direccion: c.direccion,
          notas: c.notas,
        }))
      );
    } catch (error: any) {
      console.error("[ClientProvider] Error cargando clientes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, "_id">) => {
    if (!token) throw new Error("No autenticado");

    try {
      const response = await fetch(`${API_URL}/api/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero: clientData.number,
          nombre: clientData.name,
          telefono: clientData.telefono,
          email: clientData.email,
          direccion: clientData.direccion,
          notas: clientData.notas,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error creando cliente");
      }

      const newClient: Client = {
        _id: data.cliente._id,
        number: data.cliente.numero,
        name: data.cliente.nombre,
        telefono: data.cliente.telefono,
        email: data.cliente.email,
        direccion: data.cliente.direccion,
        notas: data.cliente.notas,
      };

      setClients((prev) => [...prev, newClient]);
      setSelectedClient(newClient);
    } catch (error: any) {
      console.error("[ClientProvider] Error creando cliente:", error.message);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    if (!token) throw new Error("No autenticado");

    try {
      const response = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero: clientData.number,
          nombre: clientData.name,
          telefono: clientData.telefono,
          email: clientData.email,
          direccion: clientData.direccion,
          notas: clientData.notas,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando cliente");
      }

      await refreshClients();
    } catch (error: any) {
      console.error(
        "[ClientProvider] Error actualizando cliente:",
        error.message
      );
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    if (!token) throw new Error("No autenticado");

    try {
      const response = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error eliminando cliente");
      }

      setClients((prev) => prev.filter((c) => c._id !== id));
      if (selectedClient?._id === id) {
        setSelectedClient(null);
      }
    } catch (error: any) {
      console.error(
        "[ClientProvider] Error eliminando cliente:",
        error.message
      );
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      selectedClient,
      setSelectedClient,
      clients,
      addClient,
      updateClient,
      deleteClient,
      loading,
      refreshClients,
    }),
    [selectedClient, clients, loading, token]
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
