// ============================================================
//  SERVIDOR - API MINI MERCADO
//  Tecnologias usadas:
//    - Express  → framework para criar rotas HTTP (GET, POST, etc.)
//    - CORS     → permite que outros sites/apps acessem essa API
//    - Prisma   → ORM (ferramenta que faz o "meio campo" entre o
//                 código e o banco de dados)
// ============================================================

const express = require('express')   // importa o Express
const cors = require('cors')         // importa o CORS
const { PrismaClient } = require('@prisma/client')  // importa o Prisma

// Cria uma instância do Prisma para usar nas consultas ao banco
const prisma = new PrismaClient()

// Cria a aplicação Express — é o "núcleo" do servidor
const app = express()

// ── Middlewares ──────────────────────────────────────────────
// Middlewares são funções que rodam ANTES das suas rotas,
// preparando ou transformando a requisição/resposta.

app.use(cors({
  origin: 'https://mini-mercado-ejc.vercel.app'
}))
app.use(express.json())   // permite ler o corpo (body) das requisições em JSON

// ── Rota raiz (teste rápido) ─────────────────────────────────
// Acesse http://localhost:3333 no navegador para ver se o servidor está de pé
app.get('/', (req, res) => {
  res.send('API Mini Mercado funcionando!')
})

// Inicia o servidor na porta 3333
// Depois que rodar, acesse: http://localhost:3333
const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})


// ============================================================
//  ROTAS DE PRODUTOS  (/products)
//  Gerenciam o cadastro de produtos do mercado.
// ============================================================

// ── [POST] /products ─────────────────────────────────────────
// Cria um novo produto no banco de dados.
// Espera receber no body: { name, category, price, stock }
app.post('/products', async (req, res) => {
  // Desestrutura os campos enviados no corpo da requisição
  const { name, category, price, stock } = req.body

  // Usa o Prisma para inserir o produto na tabela "product"
  const product = await prisma.product.create({
    data: {
      name,
      category,
      price,
      stock,
    },
  })

  // Retorna o produto recém-criado (com o id gerado pelo banco)
  res.json(product)
})

// ── [GET] /products ──────────────────────────────────────────
// Lista TODOS os produtos cadastrados no banco.
app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany()

  res.json(products)
})

// ── [DELETE] /products/:id ───────────────────────────────────
// Remove um produto específico pelo seu ID.
// O :id na rota é um parâmetro dinâmico (ex: /products/5)
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params  // pega o id da URL

  await prisma.product.delete({
    where: {
      id: Number(id),  // converte string → número (IDs são numéricos)
    },
  })

  res.json({
    message: 'Produto deletado',
  })
})

// ── [PUT] /products/:id ──────────────────────────────────────
// Atualiza os dados de um produto existente.
// Espera receber no body os campos que devem ser atualizados.
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


// ============================================================
//  ROTAS DE VENDAS  (/sales)
//  Registra vendas avulsas (sem comanda).
// ============================================================

// ── [POST] /sales ────────────────────────────────────────────
// Registra uma venda, descontando o estoque do produto vendido.
// Espera receber no body: { productId, quantity }
app.post('/sales', async (request, response) => {

  console.log(request.body)  // útil para depurar (ver o que chegou)

  const { productId, quantity } = request.body

  // Busca o produto no banco para validar existência e estoque
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  })

  // Validação 1 — produto não existe
  if (!product) {
    return response.status(404).json({
      error: 'Produto não encontrado',
    })
  }

  // Validação 2 — estoque insuficiente para a quantidade pedida
  if (product.stock < quantity) {
    return response.status(400).json({
      error: 'Estoque insulficiente',   // ⚠️ typo: "insulficiente" → "insuficiente"
    })
  }

  // Calcula o valor total da venda
  const total = product.price * quantity

  // Registra a venda na tabela "sale"
  const sale = await prisma.sale.create({
    data: {
      product: product.name,  // salva o nome (não o id) para histórico
      quantity,
      total,
    },
  })

  // Desconta a quantidade vendida do estoque do produto
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      stock: product.stock - quantity,
    },
  })

  return response.status(201).json(sale)  // 201 = "Created" (recurso criado com sucesso)
})


// ============================================================
//  ROTAS DE COMANDAS  (/commands)
//  Uma comanda agrupa vários itens de um cliente (ex: num bar).
// ============================================================

// ── [POST] /commands ─────────────────────────────────────────
// Abre uma nova comanda para um cliente.
// Espera receber no body: { customer }
app.post('/commands', async (request, response) => {
  try {
    const { customer } = request.body

    // Cria a comanda no banco com o nome do cliente
    const command = await prisma.command.create({
      data: {
        customer,
      },
    })

    response.status(201).json(command)
  } catch (error) {
    // Se algo der errado, exibe o erro no terminal e retorna 500
    console.log(error)

    response.status(500).json({
      error: 'Erro ao criar comanda',
    })
  }
})

// ── [GET] /commands ──────────────────────────────────────────
// Lista todas as comandas com seus itens e produtos relacionados.
// "include" funciona como um JOIN no SQL — traz dados de outras tabelas.
app.get('/commands', async (req, res) => {
  try {
    const commands = await prisma.command.findMany({
      include: {
        items: {                  // inclui os itens da comanda
          include: {
            product: true        // e dentro de cada item, inclui o produto
          }
        }
      },
      orderBy: {
        createdAt: 'desc',       // mais recentes primeiro
      }
    })

    res.json(commands)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: 'Error ao listar comandas'
    })
  }
})

// ── [POST] /command-items ────────────────────────────────────
// Adiciona um produto a uma comanda existente.
// Espera receber no body: { commandId, productId, quantity }
// Também desconta o estoque e atualiza o total da comanda.
app.post('/command-items', async (request, response) => {
  try {
    const { commandId, productId, quantity } = request.body

    const command = await prisma.command.findUnique({
      where: {
        id: Number(commandId)
      }
    })

    if (!command) {
      return response.status(404).json({
        error: 'Comanda não encontrada'
      })
    }

    if (command.closed) {
      return response.status(400).json({
        error: 'comanda ja fechada'
      })
    }

    // Garante que os IDs sejam números (podem chegar como string do front-end)
    const productIdNumber = Number(productId)
    const commandIdNumber = Number(commandId)

    // Busca o produto para validações
    const product = await prisma.product.findUnique({
      where: {
        id: productIdNumber,
      },
    })

    // Validação 1 — produto não existe
    if (!product) {
      return response.status(404).json({
        error: 'Produto não encontrado',
      })
    }

    // Validação 2 — estoque insuficiente
    if (product.stock < quantity) {
      return response.status(400).json({
        error: 'Estoque insuficiente',
      })
    }

    const subtotal = product.price * quantity

    // Cria o item na tabela "commandItem" ligando comanda ↔ produto
    const item = await prisma.commandItem.create({
      data: {
        commandId: commandIdNumber,
        productId: productIdNumber,
        quantity,
      },
    })

    // Desconta do estoque do produto
    await prisma.product.update({
      where: {
        id: productIdNumber,          // ⚠️ atenção: aqui deveria ser productIdNumber
      },
      data: {
        stock: product.stock - quantity,
      },
    })

    // Incrementa o total da comanda com o subtotal deste item
    await prisma.command.update({
      where: {
        id: commandIdNumber
      },
      data: {
        total: {
          increment: subtotal   // soma ao valor atual sem precisar buscá-lo antes
        }
      }
    })

    response.status(201).json(item)
  } catch (error) {
    console.log(error)

    response.status(500).json({
      error: 'Erro ao adicionar item',
    })
  }
})

// ── [GET] /commands/:id ──────────────────────────────────────
// Busca uma comanda específica pelo ID, com todos os seus itens e produtos.
app.get('/commands/:id', async (request, response) => {
  try {
    const { id } = request.params

    const command = await prisma.command.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        items: {
          include: {
            product: true,  // traz os detalhes do produto de cada item
          },
        },
      },
    })

    response.json(command)
  } catch (error) {
    console.log(error)

    response.status(500).json({
      error: 'Erro ao buscar comanda',
    })
  }
})

//ROTA PARA FECHAR COMANDA
app.put('/commands/:id/close', async (req, res) => {
  const {id} = req.params

  const command = await prisma.command.update({
    where: {
      id: Number(id),
    },
    data: {
      closed: true,
      closedAt: new Date(),
    }
  })
  res.json(command)
})

app.delete('/command-items/:id', async (request, response) => {
  try {
    const { id } = request.params

    // Busca o item
    const item = await prisma.commandItem.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        product: true,
      },
    })

    // Validação
    if (!item) {
      return response.status(404).json({
        error: 'Item não encontrado',
      })
    }

    // Calcula subtotal
    const subtotal =
      item.product.price * item.quantity

    // Devolve estoque
    await prisma.product.update({
      where: {
        id: item.productId,
      },
      data: {
        stock:
          item.product.stock + item.quantity,
      },
    })

    // Atualiza total da comanda
    await prisma.command.update({
      where: {
        id: item.commandId,
      },
      data: {
        total: {
          decrement: subtotal,
        },
      },
    })

    // Remove item
    await prisma.commandItem.delete({
      where: {
        id: Number(id),
      },
    })

    response.json({
      message: 'Item removido',
    })
  } catch (error) {
    console.log(error)

    response.status(500).json({
      error: 'Erro ao remover item',
    })
  }
})

