/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Navbar } from '../components/Navbar'
import { FaArrowLeft, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa'

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: number
  name: string
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
  items: CommandItem[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemRow({ item }: { item: CommandItem }) {
  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{item.product.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.quantity}x · R$ {item.product.price.toFixed(2)} cada
        </p>
      </div>
      <span className="text-sm font-bold text-slate-700">
        R$ {subtotal.toFixed(2)}
      </span>
    </div>
  )
}

function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-600"
      >
        <FaMinus className="text-xs" />
      </button>
      <span className="w-6 text-center text-sm font-bold text-slate-800 tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition text-slate-600"
      >
        <FaPlus className="text-xs" />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CommandDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [command, setCommand] = useState<Command | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingPage, setLoadingPage] = useState(true)

  // Modal de adicionar produto
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [search, setSearch] = useState('')

  // ── Loaders ────────────────────────────────────────────────────────────────

  async function loadCommand() {
    const response = await api.get(`/commands/${id}`)
    setCommand(response.data)
  }

  async function loadProducts() {
    const response = await api.get('/products')
    setProducts(response.data)
  }

  useEffect(() => {
    Promise.all([loadCommand(), loadProducts()]).finally(() =>
      setLoadingPage(false)
    )
  }, [loadCommand])

  // ── Add item ───────────────────────────────────────────────────────────────

  function openModal(product: Product) {
    setSelectedProduct(product)
    setQuantity(1)
    setAddError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedProduct(null)
    setAddError('')
  }

  async function handleAddItem() {
    if (!selectedProduct) return
    try {
      setAdding(true)
      setAddError('')
      await api.post('/command-items', {
        commandId: Number(id),
        productId: selectedProduct.id,
        quantity,
      })
      await Promise.all([loadCommand(), loadProducts()])
      closeModal()
    } catch (err: any) {
      const msg: string = err?.response?.data?.error ?? 'Erro ao adicionar item.'
      setAddError(msg)
    } finally {
      setAdding(false)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const alreadyInCommand = (productId: number) =>
    command?.items.some((i) => i.product.id === productId) ?? false

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loadingPage || !command) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium">Carregando comanda…</p>
          </div>
        </div>
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />

      {/* ── Modal adicionar produto ── */}
      {modalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  R$ {selectedProduct.price.toFixed(2)} · {selectedProduct.stock} em estoque
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-sm text-slate-500">Quantidade</span>
              <QuantitySelector
                value={quantity}
                max={selectedProduct.stock}
                onChange={setQuantity}
              />
            </div>

            <div className="flex items-center justify-between text-sm mb-5">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-800">
                R$ {(selectedProduct.price * quantity).toFixed(2)}
              </span>
            </div>

            {addError && (
              <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                <span>⚠</span> {addError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleAddItem()}
                disabled={adding}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adicionando…
                  </>
                ) : (
                  <>
                    <FaPlus className="text-xs" /> Adicionar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition"
          >
            <FaArrowLeft className="text-xs" /> Voltar
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Coluna esquerda: detalhes da comanda ── */}
            <div className="space-y-4">

              {/* Header da comanda */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-1">
                  <h1 className="text-2xl font-extrabold text-slate-800">
                    Comanda #{command.id}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      command.closed
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {command.closed ? 'Fechada' : 'Aberta'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">Cliente: {command.customer}</p>
                <p className="text-3xl font-extrabold text-indigo-600 mt-4">
                  R$ {command.total.toFixed(2)}
                </p>
              </div>

              {/* Itens da comanda */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Itens pedidos
                </h2>

                {command.items.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-slate-300 gap-2">
                    <FaShoppingCart className="text-3xl" />
                    <p className="text-sm text-slate-400">Nenhum item ainda</p>
                  </div>
                ) : (
                  <div>
                    {command.items.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                    <div className="flex justify-between items-center pt-4 mt-2">
                      <span className="text-sm font-semibold text-slate-500">Total</span>
                      <span className="text-lg font-extrabold text-indigo-600">
                        R$ {command.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Coluna direita: catálogo de produtos ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Adicionar produto
              </h2>

              {command.closed ? (
                <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-sm">
                  Comanda fechada — não é possível adicionar itens.
                </div>
              ) : (
                <>
                  {/* Busca */}
                  <input
                    type="text"
                    placeholder="Buscar produto…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition mb-4"
                  />

                  {/* Lista de produtos */}
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-105 pr-1">
                    {filteredProducts.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        Nenhum produto encontrado.
                      </p>
                    ) : (
                      filteredProducts.map((product) => {
                        const inCommand = alreadyInCommand(product.id)
                        const outOfStock = product.stock === 0

                        return (
                          <div
                            key={product.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                              outOfStock
                                ? 'border-slate-100 bg-slate-50 opacity-50'
                                : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                R$ {product.price.toFixed(2)} · {product.stock} em estoque
                              </p>
                            </div>

                            <button
                              onClick={() => openModal(product)}
                              disabled={outOfStock}
                              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                                inCommand
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed'
                              }`}
                            >
                              <FaPlus className="text-[10px]" />
                              {inCommand ? 'Adicionar +' : outOfStock ? 'Sem estoque' : 'Adicionar'}
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}