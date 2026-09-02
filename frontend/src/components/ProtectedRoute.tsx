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
  const { user, hasRole, isInitializing } = useAuth();
  if (isInitializing) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword && window.location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}
