import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, loading, hasRole } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}
