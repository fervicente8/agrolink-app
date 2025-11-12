import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dynamic import to avoid breaking if module is not installed yet
let SecureStore: any = null;
try {
  SecureStore = require("expo-secure-store");
} catch {}

const KEY = "auth:user";
const REMEMBER_KEY = "auth:rememberMe";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (SecureStore?.getItemAsync) {
          const raw = await SecureStore.getItemAsync(KEY);
          if (raw) setUser(JSON.parse(raw));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      // Usuario de prueba hardcodeado
      const TEST_EMAIL = "doscaciques@gmail.com";
      const TEST_PASSWORD = "12345678";
      const TEST_NAME = "Dos Caciques";

      const normalizedEmail = (email || "").trim().toLowerCase();
      const pass = (password || "").trim();

      if (normalizedEmail === TEST_EMAIL && pass === TEST_PASSWORD) {
        const u: User = { name: TEST_NAME, email: TEST_EMAIL };
        setUser(u);
        try {
          if (SecureStore?.setItemAsync) {
            await SecureStore.setItemAsync(KEY, JSON.stringify(u));
            // Guardar flag de rememberMe para mantener la sesión
            await SecureStore.setItemAsync(
              REMEMBER_KEY,
              JSON.stringify(rememberMe)
            );
          }
        } catch {}
        return;
      }

      // Credenciales inválidas
      throw new Error("Credenciales inválidas");
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    try {
      if (SecureStore?.deleteItemAsync && SecureStore?.getItemAsync) {
        // Solo borrar credenciales si no está marcado "Recordarme"
        const rememberRaw = await SecureStore.getItemAsync(REMEMBER_KEY);
        const remember = rememberRaw ? JSON.parse(rememberRaw) : false;
        if (!remember) {
          await SecureStore.deleteItemAsync(KEY);
        }
        // Siempre borrar el flag de rememberMe al hacer logout explícito
        await SecureStore.deleteItemAsync(REMEMBER_KEY);
      }
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
