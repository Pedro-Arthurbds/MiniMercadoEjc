/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'

import { Navbar } from '../components/Navbar'
import { ProductCard } from '../components/ProductCard'
import { ProductForm } from '../components/ProductForm'
import { api } from '../services/api'

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

type SortOption = 'name' | 'price_asc' | 'price_desc' | 'stock_asc'

// Limite abaixo do qual o produto é considerado crítico
const CRITICAL_STOCK = 5

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// ─── Metric Card (mesmo estilo do Dashboard) ────────────────────────
type MetricCardProps = {
  icon: string
  label: string
  value: string
  sub?: string
  danger?: boolean
}

function MetricCard({ icon, label, value, sub, danger }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-4 flex flex-col gap-1 ${
        danger ? 'bg-red-50' : 'bg-gray-50'
      }`}
    >
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <span
        className={`text-2xl font-semibold ${
          danger ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {value}
      </span>
      {sub && (
        <span className={`text-xs ${danger ? 'text-red-400' : 'text-gray-400'}`}>
          {sub}
        </span>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────
export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [showOnlyCritical, setShowOnlyCritical] = useState(false)

  async function loadProducts() {
    const response = await api.get<Product[]>('/products')
    setProducts(response.data)
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  // ── Derived data ────────────────────────────────────────────────
  const criticalProducts = products.filter((p) => p.stock <= CRITICAL_STOCK)
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0)
  const categories = ['', ...new Set(products.map((p) => p.category))]

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesCategory =
        selectedCategory === '' ? true : product.category === selectedCategory
      const matchesCritical = showOnlyCritical
        ? product.stock <= CRITICAL_STOCK
        : true
      return matchesSearch && matchesCategory && matchesCritical
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'stock_asc':
          return a.stock - b.stock
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">Produtos</h1>
            <p className="text-gray-400 text-sm mt-1">
              {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Métricas */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Visão do estoque
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              icon="📦"
              label="Produtos"
              value={String(products.length)}
              sub="cadastrados"
            />
            <MetricCard
              icon="🔢"
              label="Itens em estoque"
              value={String(totalItems)}
              sub="unidades totais"
            />
            <MetricCard
              icon="💰"
              label="Valor em estoque"
              value={formatCurrency(totalStockValue)}
              sub="preço × quantidade"
            />
            <MetricCard
              icon="⚠️"
              label="Estoque crítico"
              value={String(criticalProducts.length)}
              sub={`≤ ${CRITICAL_STOCK} unidades restantes`}
              danger={criticalProducts.length > 0}
            />
          </div>
        </section>

        {/* Alerta de estoque crítico */}
        {criticalProducts.length > 0 && (
          <section className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
              ⚠️ Produtos com estoque crítico
            </h2>
            <ul className="divide-y divide-red-100">
              {criticalProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {p.category}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      p.stock === 0
                        ? 'bg-red-200 text-red-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Sem estoque' : `${p.stock} un`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Formulário de cadastro */}
        <ProductForm onProductCreated={loadProducts} />

        {/* Busca + Ordenação */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-4 rounded-2xl border bg-white"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="p-4 rounded-2xl border bg-white text-sm text-gray-700 cursor-pointer"
          >
            <option value="name">Ordenar: A–Z</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="stock_asc">Menor estoque</option>
          </select>
        </div>

        {/* Filtros de categoria + toggle crítico */}
        <div className="flex gap-2 flex-wrap items-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl border text-sm transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category || 'Todos'}
            </button>
          ))}

          <div className="ml-auto">
            <button
              onClick={() => setShowOnlyCritical((v) => !v)}
              className={`px-4 py-2 rounded-xl border text-sm transition flex items-center gap-2 ${
                showOnlyCritical
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚠️ Só críticos
              {criticalProducts.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                    showOnlyCritical
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {criticalProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Grid de produtos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDeleted={loadProducts}
              />
            ))}
          </div>
        )}

      </div>
    </>
  )
}