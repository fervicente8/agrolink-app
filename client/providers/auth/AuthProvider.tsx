import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  role: "admin" | "operario" | "supervisor";
  empresa: {
    id: string;
    nombre: string;
    plan: string;
  };
}

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  empresaNombre: string;
  cuit?: string;
  razonSocial?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (envUrl) return envUrl;
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  return "http://localhost:3001";
};

const API_URL = getApiBaseUrl();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar token y usuario al iniciar
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("auth:token");
      const storedUser = await AsyncStorage.getItem("auth:user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("[Auth] Error cargando sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el login");
      }

      await AsyncStorage.setItem("auth:token", data.token);
      await AsyncStorage.setItem("auth:user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
    } catch (error: any) {
      console.error("[Auth] Error en login:", error.message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en el registro");
      }

      await AsyncStorage.setItem("auth:token", result.token);
      await AsyncStorage.setItem("auth:user", JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);
    } catch (error: any) {
      console.error("[Auth] Error en registro:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth:token");
      await AsyncStorage.removeItem("auth:user");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("[Auth] Error en logout:", error);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
