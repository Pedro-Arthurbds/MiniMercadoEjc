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