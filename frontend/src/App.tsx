/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { ProductCard } from './components/ProductCard'
import { ProductForm } from './components/ProductForm'
import { CommandsPage } from './pages/CommandsPage'
import { CommandCard } from './components/CommandCard'
import { api } from './services/api'

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([])

  async function loadProducts() {
    const response = await api.get(
      '/products'
    )

    setProducts(response.data)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
    // eslint-disable-next-line react-hooks/immutability
    loadCommands()
  }, [])
  
  const [ search, setSearch ] = useState('')

 //FILTRO PARA PESQUISA DE CATEGORIA
  const [selectedCategory, setSelectedCategory] =
  useState('')

  //PESQUISA PELO PRODUTO
  const filteredProducts = products.filter(
  (product) => {
    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === ''
        ? true
        : product.category === selectedCategory

    return matchesSearch && matchesCategory
  }
)

  const [commands, setCommands] = useState([])

  async function loadCommands() {
  const response = await api.get(
    '/commands'
  )

  setCommands(response.data)
}
  
  const categories = [
    '', 
    ...new Set(
      products.map((product) => product.category)
    )
  ]

  const [selectedCommand, setSelectedCommand] = useState <any | null>(null)

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 max-w-7xl mx-auto p-8 ">
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
      <ProductForm onProductCreated={loadProducts} />


      <input 
      type="text"
      placeholder='Buscar produto....'
      value={search}
      onChange={(event) =>
        setSearch(event.target.value)
      }
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
      onClick={() =>
        setSelectedCategory(category)
      }
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

      <div className=" grid grid-colos-1 md:grid-cols-2 lg:gid-cols-3 gap-6 ">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onDeleted={loadProducts}
          />
        ))}
      </div>

      <CommandsPage />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commands.map((command) => (
          <CommandCard
            onUpdated={command}
            key={command.id}
            command={command}
            onSelect={() => setSelectedCommand(command)}
          />
          ))}
            {selectedCommand && (
              <div className="mt-10 bg-white p-6 rounded-2xl shadow">
                <h2 className="text-3xl font-bold">
                  Comanda #{selectedCommand.id}
                </h2>

                <p className="text-gray-500">
                  Cliente: {selectedCommand.customer}
                </p>

                <p className="text-green-600 font-bold text-2xl mt-4">
                  Total: R$ {selectedCommand.total}
                </p>

                <div className="mt-6">
                  <h3 className="font-bold text-xl mb-4">
                    Itens
                  </h3>

                  {selectedCommand.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="border-b py-2 flex justify-between"
                    >
                      <span>
                        {item.product.name}
                      </span>

                      <span>
                        {item.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
                <button>
                  Fechar Comanda
                </button>
              </div>
            )}
              </div>

              </div>

    
  )
}