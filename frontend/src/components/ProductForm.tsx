import { useState } from 'react'
import axios from 'axios'

type ProductFormProps = {
    onProductCreated: () => void
}

export function ProductForm({
    onProductCreated,
}: ProductFormProps) {
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [price, setPrice] = useState('')
    const [stock, setStock] = useState('')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function handleCreateProduct(e:any){
        e.preventDefault()

         await axios.post('http://localhost:3333/products',{
            name,
            category,
            price: Number(price),
            stock: Number(stock)
        })

        setName('')
        setCategory('')
        setPrice('')
        setStock('')

        onProductCreated()
    }

    return (
      <form
        onSubmit={handleCreateProduct}
        className='bg-white p-6 rounded-b-xl shadow mb-8'
      >
        <h2 className='text-2xl font-semibold mb-4'>
          Cadastrar produto
        </h2>

        <div className='grid grod-cols-4 gap-4'>
              <input
            type='text'
            placeholder='Produto'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border p-3 rounded-lg'
          />

             <input
            type='text'
            placeholder='Categoria'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='border p-3 rounded-lg'
          />

             <input
            type='number'
            placeholder='Preço'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className='border p-3 rounded-lg'
          />
             <input
            type='number'
            placeholder='Estoque'
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className='border p-3 rounded-lg'
          />
        </div>
        
        <button
          type='submit'
          className='mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg'
        >
          Cadastrar
        </button>

      </form>
  )

    }
