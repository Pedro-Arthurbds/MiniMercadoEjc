import { useEffect, useState } from 'react'
import axios from 'axios'

import { ProductCard } from './components/ProductCard'
import { ProductForm } from './components/ProductForm'

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([])

  async function loadProducts() {
    const response = await axios.get(
      'http://localhost:3333/products'
    )

    setProducts(response.data)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        Mini Mercado EJC
      </h1>

      <ProductForm onProductCreated={loadProducts} />

      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onDeleted={loadProducts}
          />
        ))}
      </div>
    </div>
  )
}