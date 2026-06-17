const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const app = express()

// ── CORS ─────────────────────────────────────────────────────
// Lista de origens permitidas. Adicione aqui todos os domínios
// do seu frontend (Vercel gera subdomínios diferentes por deploy).
const allowedOrigins = [
  // Domínios da Vercel — cobre main, previews e qualquer subdomínio gerado
  /https:\/\/mini-mercado-ejc.*\.vercel\.app$/,
  /https:\/\/.*pedro-arthurbds-projects\.vercel\.app$/,
  // Desenvolvimento local
  'http://localhost:5173',
  'http://localhost:3000',
]

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (Postman, curl, apps mobile)
    if (!origin) return callback(null, true)

    const allowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )

    if (allowed) {
      callback(null, true)
    } else {
      console.warn('CORS bloqueado para origem:', origin)
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`))
    }
  },
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('API EJC funcionando!')
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})


// ============================================================
//  PRODUTOS
// ============================================================

app.post('/products', async (req, res) => {
  const { name, category, price, stock } = req.body

  const product = await prisma.product.create({
    data: { name, category, price, stock },
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
    where: { id: Number(id) },
  })

  res.json({ message: 'Produto deletado' })
})

app.put('/products/:id', async (req, res) => {
  const { id } = req.params
  const { name, category, price, stock } = req.body

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: { name, category, price, stock },
  })

  res.json(product)
})


// ============================================================
//  VENDAS AVULSAS
// ============================================================

app.post('/sales', async (req, res) => {
  const { productId, quantity } = req.body

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' })
  }

  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Estoque insuficiente' })
  }

  const total = product.price * quantity

  const sale = await prisma.sale.create({
    data: { product: product.name, quantity, total },
  })

  await prisma.product.update({
    where: { id: productId },
    data: { stock: product.stock - quantity },
  })

  return res.status(201).json(sale)
})


// ============================================================
//  COMANDAS
// ============================================================

app.post('/commands', async (req, res) => {
  try {
    const { customer } = req.body

    const command = await prisma.command.create({
      data: { customer },
    })

    res.status(201).json(command)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao criar comanda' })
  }
})

app.get('/commands', async (req, res) => {
  try {
    const commands = await prisma.command.findMany({
      include: {
        items: {
          include: { product: true },
        },
        payments: true, // necessário para calcular saldo no frontend
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(commands)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao listar comandas' })
  }
})

app.get('/commands/:id', async (req, res) => {
  try {
    const { id } = req.params

    const command = await prisma.command.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: { product: true },
        },
        payments: true, // necessário para o painel de pagamentos
      },
    })

    if (!command) {
      return res.status(404).json({ error: 'Comanda não encontrada' })
    }

    res.json(command)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao buscar comanda' })
  }
})

app.put('/commands/:id/close', async (req, res) => {
  try {
    const { id } = req.params

    const command = await prisma.command.update({
      where: { id: Number(id) },
      data: { closed: true, closedAt: new Date() },
    })

    res.json(command)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao fechar comanda' })
  }
})


// ============================================================
//  ITENS DE COMANDA
// ============================================================

app.post('/command-items', async (req, res) => {
  try {
    const { commandId, productId, quantity } = req.body

    const commandIdNumber = Number(commandId)
    const productIdNumber = Number(productId)

    const command = await prisma.command.findUnique({
      where: { id: commandIdNumber },
    })

    if (!command) {
      return res.status(404).json({ error: 'Comanda não encontrada' })
    }

    if (command.closed) {
      return res.status(400).json({ error: 'Comanda já fechada' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productIdNumber },
    })

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' })
    }

    const subtotal = product.price * quantity

    const item = await prisma.commandItem.create({
      data: {
        commandId: commandIdNumber,
        productId: productIdNumber,
        quantity,
      },
    })

    await prisma.product.update({
      where: { id: productIdNumber },
      data: { stock: product.stock - quantity },
    })

    await prisma.command.update({
      where: { id: commandIdNumber },
      data: { total: { increment: subtotal } },
    })

    res.status(201).json(item)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao adicionar item' })
  }
})

app.delete('/command-items/:id', async (req, res) => {
  try {
    const { id } = req.params

    const item = await prisma.commandItem.findUnique({
      where: { id: Number(id) },
      include: { product: true },
    })

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' })
    }

    const subtotal = item.product.price * item.quantity

    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: item.product.stock + item.quantity },
    })

    await prisma.command.update({
      where: { id: item.commandId },
      data: { total: { decrement: subtotal } },
    })

    await prisma.commandItem.delete({
      where: { id: Number(id) },
    })

    res.json({ message: 'Item removido' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao remover item' })
  }
})


// ============================================================
//  PAGAMENTOS PARCIAIS
// ============================================================

app.post('/commands/:id/payments', async (req, res) => {
  try {
    const { id } = req.params
    const { amount, method } = req.body
    const commandId = Number(id)

    const command = await prisma.command.findUnique({
      where: { id: commandId },
      include: { payments: true },
    })

    if (!command) {
      return res.status(404).json({ error: 'Comanda não encontrada' })
    }

    const totalPaid = command.payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = command.total - totalPaid

    if (amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' })
    }

    if (amount > balance) {
      return res.status(400).json({
        error: `Valor maior que o saldo devedor (R$ ${balance.toFixed(2)})`,
      })
    }

    const payment = await prisma.payment.create({
      data: { commandId, amount, method: method ?? 'dinheiro' },
    })

    const newBalance = balance - amount
    if (newBalance === 0) {
      await prisma.command.update({
        where: { id: commandId },
        data: { closed: true, closedAt: new Date() },
      })
    }

    res.status(201).json({ payment, balance: newBalance, fullyPaid: newBalance === 0 })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao registrar pagamento' })
  }
})

app.get('/commands/:id/payments', async (req, res) => {
  try {
    const { id } = req.params

    const command = await prisma.command.findUnique({
      where: { id: Number(id) },
      include: { payments: { orderBy: { createdAt: 'desc' } } },
    })

    if (!command) {
      return res.status(404).json({ error: 'Comanda não encontrada' })
    }

    const totalPaid = command.payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = command.total - totalPaid

    res.json({ payments: command.payments, total: command.total, totalPaid, balance })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Erro ao buscar pagamentos' })
  }
})