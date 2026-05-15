const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API Mini Mercado funcionando!')
})

app.listen(3333, () => {
  console.log('Servidor rodando na porta 3333')
})

app.post('/products', async (req, res) => {
  const { name, category, price, stock } = req.body

  const product = await prisma.product.create({
    data: {
      name,
      category,
      price,
      stock,
    },
  })

  res.json(product)
})

app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany()

  res.json(products)
})

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params

  await prisma.product.delete({
    where: {
      id: Number(id),
    },
  })

  res.json({
    message: 'Produto deletado',
  })
})

app.put('/products/:id', async (req, res) => {
  const { id } = req.params

  const { name, category, price, stock } = req.body

  const product = await prisma.product.update({
    where: {
      id: Number(id),
    },

    data: {
      name,
      category,
      price,
      stock,
    },
  })

  res.json(product)
})

app.post('/sales', async (request, response) => {

  console.log(request.body)

  const { productId, quantity } = request.body

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  })

  if (!product) {
    return response.status(404).json({
      error: 'Produto não encontrado',
    })
  }

  //Calcula o total, VALIDAÇÃO DE ESTOQUE
  if (product.stock < quantity){
    return response.status(400).json({
      error:'Estoque insulficiente',
    })
  }

  const total = product.price * quantity

  const sale = await prisma.sale.create({
    data: {
      product: product.name,
      quantity,
      total,
    },
  })

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      stock: product.stock - quantity,
    },
  })

  return response.status(201).json(sale)
})