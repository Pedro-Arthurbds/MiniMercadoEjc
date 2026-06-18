import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CommandsPage } from "./pages/CommandsPage";
import { CommandDetailsPage } from "./pages/CommandDetailsPage";
import { UsersPage } from "./pages/UsersPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commands"
            element={
              <ProtectedRoute>
                <CommandsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commands/:id"
            element={
              <ProtectedRoute>
                <CommandDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
