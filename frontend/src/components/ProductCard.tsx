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

  //FUNÇÃO PARA GERAR A VENDA DO PRODUTO
  async function handleSale() {
    try{
      await axios.post(
        'http://localhost:3333/sales',
        {
          productId: product.id,
          quantity: 1,
        }
  )
       onDeleted()
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Estoque insulficiente')
    }
}

const isOutOfStock = product.stock <= 0
  
  return (

  <div
    className={`
      p-5 rounded-2xl shadow-md transition-all border
      flex flex-col gap-4
      ${
        isOutOfStock
          ? 'bg-gray-200 border-gray-300'
          : 'bg-white border-gray-100 hover:shadow-xl'
      }
    `}
  >
    <div>
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
        {product.category}
      </span>

      <h2 className="text-2xl font-bold mt-3">
        {product.name}
      </h2>
    </div>

    <div>
      <p className="text-3xl font-bold text-green-600">
        R$ {product.price}
      </p>

      <p className="text-gray-500 mt-1">
        Estoque: {product.stock}
      </p>

      {
        isOutOfStock && (
          <p className="text-red-600 font-bold mt-2">
            ESGOTADO
          </p>
        )
      }
    </div>

    <div className="flex items-center gap-4">
      <button
        onClick={() => updateStock(product.stock - 1)}
        className="bg-red-500 text-white w-10 h-10 rounded-lg cursor-pointer text-xl"
      >
        -
      </button>

      <span className="font-bold text-xl">
        {product.stock}
      </span>

      <button
        onClick={() => updateStock(product.stock + 1)}
        className="bg-green-500 text-white w-10 h-10 rounded-lg cursor-pointer text-xl"
      >
        +
      </button>
    </div>

    <button
      onClick={handleSale}
      disabled={isOutOfStock}
      className={`
        text-white py-3 rounded-xl font-bold transition-all
        ${
          isOutOfStock
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }
      `}
    >
      Vender
    </button>

    <button
      onClick={handleDeleteProduct}
      className="bg-red-600 hover:bg-red-700 transition-all text-white py-3 rounded-xl font-bold"
    >
      Deletar
    </button>
  </div>
)
}