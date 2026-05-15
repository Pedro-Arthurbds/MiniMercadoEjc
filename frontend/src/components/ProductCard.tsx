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

  async function updateStock(newStock: number) {
    await axios.put(
      `http://localhost:3333/products/${product.id}`,
      {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: newStock,
      }
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

      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => updateStock(product.stock - 1)}
          className="bg-red-500 text-white w-8 h-8 rounded cursor-pointer"
        >
          -
        </button>

        <span className="font-bold">
          {product.stock}
        </span>

        <button
          onClick={() => updateStock(product.stock + 1)}
          className="bg-green-500 text-white w-8 h-8 rounded cursor-pointer"
        >
          +
        </button>
      </div>

      <button
        onClick={handleDeleteProduct}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer gap-4
        "
      >
        Deletar
      </button>
        
    <button
        onClick={handleSale}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer"
        >
        Vender
    </button>

    </div>
  )
}