import { useState } from 'react'
import toast from 'react-hot-toast'

import { api } from '../services/api'

type ProductFormProps = {
  onProductCreated: () => void
}

export function ProductForm({
  onProductCreated,
}: ProductFormProps) {

  // ── States ─────────────────────────────────────
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  const [loading, setLoading] = useState(false)

  // ── Criar produto ──────────────────────────────
  async function handleCreateProduct(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault()

    try {

      setLoading(true)

      await api.post('/products', {
        name,
        category,
        price: Number(price),
        stock: Number(stock),
      })

      toast.success('Produto criado com sucesso!')

      // limpa formulário
      setName('')
      setCategory('')
      setPrice('')
      setStock('')

      // recarrega lista
      onProductCreated()

    } catch (error) {

      toast.error('Erro ao criar produto')

      console.log(error)

    } finally {

      setLoading(false)

    }
  }

  // ── JSX ────────────────────────────────────────
  return (
    <form
      onSubmit={handleCreateProduct}
      className="
        bg-white
        p-8
        rounded-2xl
        shadow-md
        mb-8
        border border-gray-100
      "
    >

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Cadastrar Produto
      </h2>

      <div className="grid md:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            border border-gray-200
            p-4 rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
          "
        />

        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="
            border border-gray-200
            p-4 rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
          "
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="
            border border-gray-200
            p-4 rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
          "
        />

        <input
          type="number"
          placeholder="Estoque"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="
            border border-gray-200
            p-4 rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
          "
        />

      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          mt-6
          bg-blue-600
          hover:bg-blue-700
          transition-all
          text-white
          px-6 py-3
          rounded-xl
          font-bold
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >

        {
          loading
            ? 'Salvando...'
            : 'Cadastrar Produto'
        }

      </button>

    </form>
  )
}