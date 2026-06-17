import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'

export function Navbar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  function isActive(path: string) {
    return location.pathname === path
  }

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`font-semibold transition-all px-2 py-1 rounded-md text-sm w-full lg:w-auto text-left ${
        isActive(to) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
      }`}
    >
      {children}
    </Link>
  )

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-blue-600">Comandas</h1>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-6">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/products">Produtos</NavLink>
              <NavLink to="/commands">Comandas</NavLink>
            </div>
          </div>

          {/* Mobile hamburger */}
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

        {/* Mobile menu panel */}
        <div className={`${open ? 'block' : 'hidden'} lg:hidden pb-4`}>
          <div className="flex flex-col gap-2">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/products">Produtos</NavLink>
            <NavLink to="/commands">Comandas</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}