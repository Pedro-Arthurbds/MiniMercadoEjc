import axios from 'axios'

type ProductProps = {
  product: {
    id: number
    name: string
    category: string
    price: number
    stock: number
  }

  onDeleted: () => void
}

export function ProductCard({
  product,
  onDeleted,
}: ProductProps) {
  async function handleDeleteProduct() {
    await axios.delete(
      `http://localhost:3333/products/${product.id}`
    )

    onDeleted()
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-bold">
        {product.name}
      </h2>

      <p className="text-gray-500">
        {product.category}
      </p>

      <p className="mt-2 text-green-600 font-bold">
        R$ {product.price}
      </p>

      <p className="text-sm mt-1">
        Estoque: {product.stock}
      </p>

      <button
        onClick={handleDeleteProduct}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
      >
        Deletar
      </button>
    </div>
  )
}