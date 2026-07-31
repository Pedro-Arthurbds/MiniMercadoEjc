/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  // initialize: validate token and fetch user info if needed
  useEffect(() => {
    let mounted = true;
    async function init() {
      const stored = localStorage.getItem("user");
      if (!stored) {
        if (mounted) setIsInitializing(false);
        return;
      }
      try {
        const resp = await api.get("/auth/me");
        if (!mounted) return;
        setUser(resp.data.user);
      } catch (e) {
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }
    init();
    // listen for global logout events
    const handler = () => {
      localStorage.removeItem("user");
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
    const { user: newUser } = response.data;

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore network/logout failure and clear local state anyway
    }
    localStorage.removeItem("user");
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
