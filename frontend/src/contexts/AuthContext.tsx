/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { api } from "../services/api";
import { clearAuth, getUser, setAuth } from "../services/tokenStorage";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

export type User = {
  id: number;
  name: string;
  role: Role;
  mustChangePassword: boolean;
};

type AuthContextType = {
  user: User | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  changePassword: (password: string) => Promise<User>;
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
  const [user, setUser] = useState<User | null>(() => getUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function init() {
      const stored = getUser();
      if (!stored) {
        if (mounted) setIsInitializing(false);
        return;
      }
      try {
        const resp = await api.get("/auth/me");
        if (!mounted) return;
        setUser(resp.data.user);
      } catch (e) {
        clearAuth();
        setUser(null);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }
    init();
    const handler = () => {
      clearAuth();
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("app:logout", handler);
    return () => {
      mounted = false;
      window.removeEventListener("app:logout", handler);
    };
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: newUser } = response.data;

    setAuth(token, newUser);
    setUser(newUser);
    return newUser;
  }

  async function changePassword(password: string): Promise<User> {
    const response = await api.put("/auth/change-password", { password });
    const updatedUser = response.data.user as User;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }

  function logout() {
    clearAuth();
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
        changePassword,
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
