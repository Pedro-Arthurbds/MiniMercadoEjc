// ============================================================
//  SERVIDOR - API MINI MERCADO
//  Tecnologias usadas:
//    - Express  → framework para criar rotas HTTP (GET, POST, etc.)
//    - CORS     → permite que outros sites/apps acessem essa API
//    - Prisma   → ORM (ferramenta que faz o "meio campo" entre o
//                 código e o banco de dados)
//    - JWT/bcrypt → autenticação e proteção de senhas
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("./middleware/auth");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("./utils/auth");

const prisma = new PrismaClient();
const app = express();

// ── Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rota raiz (teste rápido) ─────────────────────────────────
app.get("/", (req, res) => {
  res.send("API Mini Mercado funcionando!");
});

// ============================================================
//  ROTAS DE AUTENTICAÇÃO  (/auth)
// ============================================================

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Email ou senha inválidos" });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Email ou senha inválidos" });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role },
  });
});

// ============================================================
//  ROTAS DE USUÁRIOS  (/users) — apenas ADMIN
// ============================================================

app.post("/users", authenticate, authorize(), async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  res.status(201).json({ id: user.id, name: user.name, role: user.role });
});

app.get("/users", authenticate, authorize(), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(users);
});

// Inicia o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.put("/users/:id", authenticate, authorize(), async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const data = { name, email, role };
    if (password) {
      data.password = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

app.delete("/users/:id", authenticate, authorize(), async (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.user.id) {
    return res
      .status(400)
      .json({ error: "Você não pode remover seu próprio usuário" });
  }

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Usuário removido" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
});

// ============================================================
//  ROTAS DE PRODUTOS  (/products)
// ============================================================

app.post(
  "/products",
  authenticate,
  authorize("MINIMERCADO"),
  async (req, res) => {
    const { name, category, price, stock } = req.body;

    const product = await prisma.product.create({
      data: { name, category, price, stock },
    });

    res.json(product);
  },
);

app.get("/products", authenticate, async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.delete(
  "/products/:id",
  authenticate,
  authorize("MINIMERCADO"),
  async (req, res) => {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Produto deletado" });
  },
);

app.put(
  "/products/:id",
  authenticate,
  authorize("MINIMERCADO"),
  async (req, res) => {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, category, price, stock },
    });

    res.json(product);
  },
);

// ============================================================
//  ROTAS DE VENDAS  (/sales)
// ============================================================

app.post(
  "/sales",
  authenticate,
  authorize("MINIMERCADO"),
  async (request, response) => {
    console.log(request.body);

    const { productId, quantity } = request.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return response.status(404).json({ error: "Produto não encontrado" });
    }

    if (product.stock < quantity) {
      return response.status(400).json({ error: "Estoque insulficiente" });
    }

    const total = product.price * quantity;

    const sale = await prisma.sale.create({
      data: { product: product.name, quantity, total },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { stock: product.stock - quantity },
    });

    return response.status(201).json(sale);
  },
);

app.get("/sales", authenticate, authorize(), async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(sales);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao listar vendas" });
  }
});

// ============================================================
//  ROTAS DE COMANDAS  (/commands)
// ============================================================

app.post(
  "/commands",
  authenticate,
  authorize("MINIMERCADO", "SECRETARIA"),
  async (request, response) => {
    try {
      const { customer } = request.body;

      const command = await prisma.command.create({
        data: { customer, openedByUserId: request.user.id },
      });

      response.status(201).json(command);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: "Erro ao criar comanda" });
    }
  },
);

app.get("/commands", authenticate, async (req, res) => {
  try {
    const commands = await prisma.command.findMany({
      include: {
        items: {
          include: {
            product: true,
            addedBy: { select: { id: true, name: true } },
          },
        },
        openedBy: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(commands);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error ao listar comandas" });
  }
});

app.post(
  "/command-items",
  authenticate,
  authorize("MINIMERCADO"),
  async (request, response) => {
    try {
      const { commandId, productId, quantity } = request.body;

      const command = await prisma.command.findUnique({
        where: { id: Number(commandId) },
      });

      if (!command) {
        return response.status(404).json({ error: "Comanda não encontrada" });
      }

      if (command.closed) {
        return response.status(400).json({ error: "comanda ja fechada" });
      }

      const productIdNumber = Number(productId);
      const commandIdNumber = Number(commandId);

      const product = await prisma.product.findUnique({
        where: { id: productIdNumber },
      });

      if (!product) {
        return response.status(404).json({ error: "Produto não encontrado" });
      }

      if (product.stock < quantity) {
        return response.status(400).json({ error: "Estoque insuficiente" });
      }

      const subtotal = product.price * quantity;

      const item = await prisma.commandItem.create({
        data: {
          commandId: commandIdNumber,
          productId: productIdNumber,
          quantity,
          addedByUserId: request.user.id,
        },
      });

      await prisma.product.update({
        where: { id: productIdNumber },
        data: { stock: product.stock - quantity },
      });

      await prisma.command.update({
        where: { id: commandIdNumber },
        data: { total: { increment: subtotal } },
      });

      response.status(201).json(item);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: "Erro ao adicionar item" });
    }
  },
);

// Rota pública — qualquer pessoa com o link pode ver
app.get("/c/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const command = await prisma.command.findUnique({
      where: { publicCode: code },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    });

    if (!command) {
      return res.status(404).json({ error: "Comanda não encontrada" });
    }

    // Retorna só o necessário pra visualização pública
    res.json({
      id: command.id,
      customer: command.customer,
      total: command.total,
      closed: command.closed,
      createdAt: command.createdAt,
      items: command.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: item.product,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao buscar comanda" });
  }
});

app.get("/commands/:id", authenticate, async (request, response) => {
  try {
    const { id } = request.params;

    const command = await prisma.command.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            product: true,
            addedBy: { select: { id: true, name: true } },
          },
        },
        openedBy: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
      },
    });

    response.json(command);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erro ao buscar comanda" });
  }
});

app.put(
  "/commands/:id/close",
  authenticate,
  authorize("MINIMERCADO"),
  async (req, res) => {
    const { id } = req.params;

    const command = await prisma.command.update({
      where: { id: Number(id) },
      data: { closed: true, closedAt: new Date(), closedByUserId: req.user.id },
    });
    res.json(command);
  },
);

app.delete(
  "/command-items/:id",
  authenticate,
  authorize("MINIMERCADO"),
  async (request, response) => {
    try {
      const { id } = request.params;

      const item = await prisma.commandItem.findUnique({
        where: { id: Number(id) },
        include: { product: true },
      });

      if (!item) {
        return response.status(404).json({ error: "Item não encontrado" });
      }

      const subtotal = item.product.price * item.quantity;

      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: item.product.stock + item.quantity },
      });

      await prisma.command.update({
        where: { id: item.commandId },
        data: { total: { decrement: subtotal } },
      });

      await prisma.commandItem.delete({
        where: { id: Number(id) },
      });

      response.json({ message: "Item removido" });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: "Erro ao remover item" });
    }
  },
);
