/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { api } from "../services/api";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

export type User = {
  id: number;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
  can: {
    closeCommand: boolean;
    openCommand: boolean;
    editStock: boolean;
    registerSale: boolean;
    viewReports: boolean;
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
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // initialize: validate token and fetch user info if needed
  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!token) {
        setIsInitializing(false);
        return;
      }
      try {
        const resp = await api.get("/auth/me");
        if (!mounted) return;
        setUser(resp.data.user);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }
    init();
    // listen for global logout events
    const handler = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("app:logout", handler);
    return () => {
      mounted = false;
      window.removeEventListener("app:logout", handler);
    };
  }, []); // run once on mount

  async function login(email: string, password: string): Promise<User> {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  const role = user?.role;

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
        isInitializing,
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
