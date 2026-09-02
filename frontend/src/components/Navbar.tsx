/* eslint-disable react-hooks/static-components */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

type ResetRequest = {
  status: "PENDING" | "RESOLVED";
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingResetCount, setPendingResetCount] = useState(0);
  const { user, logout, hasRole, can } = useAuth();

  useEffect(() => {
    if (!hasRole()) {
      setPendingResetCount(0);
      return;
    }

    let mounted = true;
    async function loadPendingResetCount() {
      try {
        const response = await api.get<ResetRequest[]>(
          "/password-reset-requests",
        );
        if (mounted) {
          setPendingResetCount(
            response.data.filter((request) => request.status === "PENDING")
              .length,
          );
        }
      } catch {
        if (mounted) setPendingResetCount(0);
      }
    }

    void loadPendingResetCount();
    const intervalId = window.setInterval(loadPendingResetCount, 30000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [hasRole]);

  function isActive(path: string) {
    return location.pathname === path;
  }

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/login");
  }

  const NavLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`font-semibold transition-all px-2 py-1 rounded-md text-sm w-full lg:w-auto text-left ${
        isActive(to) ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-blue-600">Comandas</h1>

            <div className="hidden lg:flex items-center gap-6">
              {hasRole() && <NavLink to="/">Dashboard</NavLink>}
              <NavLink to="/products">Produtos</NavLink>
              <NavLink to="/commands">Comandas</NavLink>
              {hasRole() && <NavLink to="/users">Usuários</NavLink>}
              {can.viewReports && <NavLink to="/reports">Relatórios</NavLink>}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-500">
                  {user.name} <span className="text-gray-300">·</span>{" "}
                  <span className="text-xs text-gray-400">{user.role}</span>
                </span>
                {hasRole() && pendingResetCount > 0 && (
                  <Link
                    to="/users"
                    title="Solicitações de troca de senha pendentes"
                    aria-label={`${pendingResetCount} solicitações de troca de senha pendentes`}
                    className="relative text-amber-500 hover:text-amber-600"
                  >
                    <FaBell />
                    <span className="absolute -right-3 -top-3 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                      {pendingResetCount > 9 ? "9+" : pendingResetCount}
                    </span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                >
                  Sair
                </button>
              </>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Abrir menu"
              className="p-2 rounded-md text-gray-600 hover:text-blue-600"
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        <div className={`${open ? "block" : "hidden"} lg:hidden pb-4`}>
          <div className="flex flex-col gap-2">
            {hasRole() && <NavLink to="/">Dashboard</NavLink>}
            <NavLink to="/products">Produtos</NavLink>
            <NavLink to="/commands">Comandas</NavLink>
            {hasRole() && <NavLink to="/users">Usuários</NavLink>}
            {can.viewReports && <NavLink to="/reports">Relatórios</NavLink>}

            {user && (
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{user.name}</span>
                  {hasRole() && pendingResetCount > 0 && (
                    <Link
                      to="/users"
                      onClick={() => setOpen(false)}
                      title="Solicitações de troca de senha pendentes"
                      className="relative text-amber-500"
                    >
                      <FaBell />
                      <span className="absolute -right-3 -top-3 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                        {pendingResetCount > 9 ? "9+" : pendingResetCount}
                      </span>
                    </Link>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}