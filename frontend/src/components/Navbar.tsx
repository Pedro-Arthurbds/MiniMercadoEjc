/* eslint-disable react-hooks/static-components */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();

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
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-500">
                  {user.name} <span className="text-gray-300">·</span>{" "}
                  <span className="text-xs text-gray-400">{user.role}</span>
                </span>
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

            {user && (
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">{user.name}</span>
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
