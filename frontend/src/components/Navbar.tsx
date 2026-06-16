import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const location = useLocation()

  function isActive(path: string) {
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-6">

        <h1 className="text-2xl font-black text-blue-600">
          Comandas
        </h1>

        <Link
          to="/"
          className={`
            font-semibold transition-all
            ${
              isActive('/')
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }
          `}
        >
          Dashboard
        </Link>

        <Link
          to="/products"
          className={`
            font-semibold transition-all
            ${
              isActive('/products')
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }
          `}
        >
          Produtos
        </Link>

        <Link
          to="/commands"
          className={`
            font-semibold transition-all
            ${
              isActive('/commands')
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }
          `}
        >
          Comandas
        </Link>

      </div>
    </nav>
  )
}