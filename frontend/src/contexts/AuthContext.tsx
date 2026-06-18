import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/api";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

type User = {
  id: number;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  // Compatível com o ProductCard e outros componentes existentes
  hasRole: (...roles: Role[]) => boolean;
  // Helpers semânticos para usar no JSX
  can: {
    closeCommand: boolean; // MINIMERCADO, ADMIN
    openCommand: boolean; // MINIMERCADO, SECRETARIA, ADMIN
    editStock: boolean; // MINIMERCADO, ADMIN
    registerSale: boolean; // MINIMERCADO, ADMIN
    viewReports: boolean; // ADMIN
  };
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  async function login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const role = user?.role;

  // ADMIN sempre passa — mesma lógica do middleware do backend
  function hasRole(...roles: Role[]) {
    if (!role) return false;
    if (role === "ADMIN") return true;
    return roles.includes(role);
  }

  const can = {
    closeCommand: hasRole("MINIMERCADO"),
    openCommand: hasRole("MINIMERCADO", "SECRETARIA"),
    editStock: hasRole("MINIMERCADO"),
    registerSale: hasRole("MINIMERCADO"),
    viewReports: role === "ADMIN",
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
