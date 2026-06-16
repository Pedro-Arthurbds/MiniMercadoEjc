/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { ProductCard } from './components/ProductCard'
import { ProductForm } from './components/ProductForm'
import { CommandsPage } from './pages/CommandsPage'
import { CommandCard } from './components/CommandCard'
import { api } from './services/api'
import { DashboardCard } from './components/DashboardCard'
import {
  FaBox,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClipboardList,
  FaDollarSign,
} from 'react-icons/fa'

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

type CommandItem = {
  id: number
  quantity: number
  product: Product
}

type Command = {
  id: number
  customer: string
  total: number
  closed: boolean
  items?: CommandItem[]
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [commands, setCommands] = useState<Command[]>([])


  const [dashboardFilter, setDashboardFilter] =
    useState<'all' | 'outOfStock' | 'lowStock'>('all')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  async function loadData() {
  const [productsResponse, commandsResponse] =
    await Promise.all([
      api.get<Product[]>('/products'),
      api.get<Command[]>('/commands'),
    ])

  setProducts(productsResponse.data)
  setCommands(commandsResponse.data)
}

useEffect(() => {
  void loadData()
}, [])


  const totalProducts = products.length
  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length
  const outOfStockProducts = products.filter(
    (product) => product.stock <= 0
  ).length

  const openCommands = commands.filter(
    (command) => !command.closed
  )
  const closedCommands = commands.filter(
    (command) => command.closed
  )

  const totalRevenue = commands.reduce(
    (acc, command) => acc + command.total,
    0
  )

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === ''
        ? true
        : product.category === selectedCategory

    const matchesDashboard =
      dashboardFilter === 'all'
        ? true
        : dashboardFilter === 'outOfStock'
        ? product.stock <= 0
        : dashboardFilter === 'lowStock'
        ? product.stock > 0 && product.stock <= 5
        : true

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDashboard
    )
  })

  const categories = [
    '',
    ...new Set(products.map((product) => product.category)),
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 max-w-7xl mx-auto p-8">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-4xl font-black text-gray-800">
            Sistema de Comandas
          </h1>

          <p className="text-gray-500 mt-1">
            Controle de produtos, vendas e comandas
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 my-8">
        <DashboardCard
          title="Produtos"
          value={totalProducts}
          icon={<FaBox className="text-4xl text-blue-500" />}
          color="text-gray-800"
          active={dashboardFilter === 'all'}
          onClick={() => setDashboardFilter('all')}
        />

        <DashboardCard
          title="Esgotados"
          value={outOfStockProducts}
          icon={<FaTimesCircle className="text-4xl text-red-500" />}
          color="text-red-600"
          active={dashboardFilter === 'outOfStock'}
          onClick={() => setDashboardFilter('outOfStock')}
        />

        <DashboardCard
          title="Baixo Estoque"
          value={lowStockProducts}
          icon={
            <FaExclamationTriangle className="text-4xl text-yellow-500" />
          }
          color="text-yellow-600"
          active={dashboardFilter === 'lowStock'}
          onClick={() => setDashboardFilter('lowStock')}
        />

        <DashboardCard
          title="Comandas"
          value={openCommands.length}
          icon={<FaClipboardList className="text-4xl text-blue-500" />}
          color="text-blue-600"
        />

        <DashboardCard
          title="Faturamento"
          value={`R$ ${totalRevenue.toFixed(2)}`}
          icon={<FaDollarSign className="text-4xl text-green-500" />}
          color="text-green-600"
        />
      </div>

      <ProductForm onProductCreated={loadData} />

      <input
        type="text"
        placeholder="Buscar produto...."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="
          w-full
          p-4
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          mb-6
        "
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-xl border transition-all
              ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white'
              }
            `}
          >
            {category || 'Todos'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDeleted={loadData}
          />
        ))}
      </div>

      <CommandsPage />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {openCommands.map((command) => (
          <CommandCard
            onUpdated={loadData}
            key={command.id}
            command={command}
          />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">
          Comandas Fechadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedCommands.map((command) => (
            <CommandCard
              key={command.id}
              command={command}
              onUpdated={loadData}

            />
          ))}
        </div>
      </div>
    </div>
  )
}