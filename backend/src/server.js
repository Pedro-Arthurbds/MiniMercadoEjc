// ============================================================
//  SERVIDOR - API MINI MERCADO
//  Tecnologias usadas:
//    - Express  → framework para criar rotas HTTP (GET, POST, etc.)
//    - CORS     → permite que outros sites/apps acessem essa API
//    - Prisma   → ORM (ferramenta que faz o "meio campo" entre o
//                 código e o banco de dados)
//    - JWT/bcrypt → autenticação e proteção de senhas
//    - Zod      → validação de entrada das rotas
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("./middlewares/auth");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("./utils/auth");
const { validate } = require("./middlewares/validate");
const {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  createProductSchema,
  updateProductSchema,
  createSaleSchema,
  createCommandSchema,
  updateCommandSchema,
  createCommandItemSchema,
  updatePaidSchema,
  createPasswordResetRequestSchema,
} = require("./schemas/schemas");

const prisma = new PrismaClient();
const app = express();

// ─── Auditoria ──────────────────────────────────────────────────────────────
// Registra toda alteração relevante feita no sistema (quem fez, o quê, quando).
// Nunca deve derrubar a rota principal caso falhe — só loga o erro.
async function logAudit({ action, userId, commandId, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? null,
        commandId: commandId ?? null,
        details: JSON.stringify(details ?? {}),
      },
    });
  } catch (error) {
    console.log("Erro ao registrar auditoria:", error);
  }
}

const isProduction = process.env.NODE_ENV === "production";
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 10;
const loginRateLimits = new Map();
const crypto = require("crypto"); // adicionar no topo do server.js, junto com os outros requires


function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      return [name, rest.join("=")];
    }),
  );
}

function getRateLimitKey(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown"
  );
}

function authRateLimiter(req, res, next) {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const entry = loginRateLimits.get(key) || {
    count: 0,
    firstAttemptAt: now,
  };

  if (now - entry.firstAttemptAt > LOGIN_RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.firstAttemptAt = now;
  }

  entry.count += 1;
  loginRateLimits.set(key, entry);

  if (entry.count > LOGIN_RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Muitas tentativas de login. Tente novamente mais tarde.",
    });
  }

  next();
}

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
}

// ── Middlewares ──────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://mini-mercado-ejc.vercel.app",
  "https://mini-mercado-ejc-demo-umber.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(securityHeaders);
app.disable("x-powered-by");
app.use(express.json());

// ── Rota raiz (teste rápido) ─────────────────────────────────
app.get("/", (req, res) => {
  res.send("API Mini Mercado funcionando!");
});

// ============================================================
//  ROTAS DE AUTENTICAÇÃO  (/auth)
// ============================================================

app.post(
  "/auth/login",
  authRateLimiter,
  validate(loginSchema),
  async (req, res) => {
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
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  },
);

// rota para validar token e obter usuário atual
app.get("/auth/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, role: true, mustChangePassword: true },
  });
  res.json({ user });
});

app.put(
  "/auth/change-password",
  authenticate,
  validate(changePasswordSchema),
  async (req, res) => {
    const password = await hashPassword(req.body.password);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { password, mustChangePassword: false },
      select: { id: true, name: true, role: true, mustChangePassword: true },
    });
    res.json({ user });
  },
);


// ============================================================
//  ROTAS DE USUÁRIOS  (/users) — apenas ADMIN
// ============================================================

// ============================================================
//  ESQUECI A SENHA (/password-reset-requests)
//  Sem envio de e-mail: só registra o pedido para o ADMIN ver
//  na tela de Usuários e redefinir manualmente.
// ============================================================

// Pública — qualquer um pode pedir. Nunca revela se o e-mail existe
// ou não no sistema (evita enumeração de contas).
app.post(
  "/password-reset-requests",
  validate(createPasswordResetRequestSchema),
  async (req, res) => {
    try {
      const { email } = req.body;

      const request = await prisma.passwordResetRequest.create({
        data: { email },
      });

      const matchingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      await logAudit({
        action: "PASSWORD_RESET_REQUESTED",
        userId: matchingUser?.id ?? null,
        details: { email, requestId: request.id },
      });

      res.status(201).json({
        message:
          "Se esse e-mail estiver cadastrado, um administrador foi avisado e vai te ajudar em breve.",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Erro ao registrar solicitação" });
    }
  },
);

// Lista de pedidos — só ADMIN vê (mesma tela de Usuários)
app.get(
  "/password-reset-requests",
  authenticate,
  authorize(),
  async (req, res) => {
    try {
      const requests = await prisma.passwordResetRequest.findMany({
        include: {
          resolvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(requests);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Erro ao buscar solicitações" });
    }
  },
);

// Marca como resolvida — o ADMIN já deve ter redefinido a senha
// manualmente na tela de Usuários antes de clicar nisso.
app.put(
  "/password-reset-requests/:id/resolve",
  authenticate,
  authorize(),
  async (req, res) => {
    try {
      const { id } = req.params;

      const request = await prisma.passwordResetRequest.update({
        where: { id: Number(id) },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          resolvedByUserId: req.user.id,
        },
      });

      await logAudit({
        action: "PASSWORD_RESET_RESOLVED",
        userId: req.user.id,
        details: { email: request.email, requestId: request.id },
      });

      res.json(request);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Erro ao resolver solicitação" });
    }
  },
);

app.post(
  "/users",
  authenticate,
  authorize(),
  validate(createUserSchema),
  async (req, res) => {
    const { name, email, password, role, mustChangePassword } = req.body;
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, mustChangePassword },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
  },
);

app.get("/users", authenticate, authorize(), async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
    },
  });
  res.json(users);
});

app.put(
  "/users/:id",
  authenticate,
  authorize(),
  validate(updateUserSchema),
  async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, mustChangePassword } = req.body;

    try {
      const data = { name, email, role, mustChangePassword };
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
  },
);

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
  validate(createProductSchema),
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
  validate(updateProductSchema),
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
  validate(createSaleSchema),
  async (request, response) => {
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
  validate(createCommandSchema),
  async (request, response) => {
    try {
      const { customer } = request.body;

      const command = await prisma.command.create({
        data: {
          customer,
          openedByUserId: request.user.id,
          publicCode: crypto.randomUUID(),
        },
      });

      await logAudit({
        action: "COMMAND_OPENED",
        userId: request.user.id,
        commandId: command.id,
        details: { customer },
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
  validate(createCommandItemSchema),
  async (request, response) => {
    try {
      const { commandId, productId, quantity } = request.body;

      const command = await prisma.command.findUnique({
        where: { id: commandId },
      });

      if (!command) {
        return response.status(404).json({ error: "Comanda não encontrada" });
      }

      if (command.closed) {
        return response.status(400).json({ error: "comanda ja fechada" });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
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
          commandId,
          productId,
          quantity,
          addedByUserId: request.user.id,
        },
      });

      await prisma.product.update({
        where: { id: productId },
        data: { stock: product.stock - quantity },
      });

      await prisma.command.update({
        where: { id: commandId },
        data: { total: { increment: subtotal } },
      });

      await logAudit({
        action: "ITEM_ADDED",
        userId: request.user.id,
        commandId,
        details: {
          product: product.name,
          quantity,
          unitPrice: product.price,
          subtotal,
        },
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

// Renomear comanda (editar nome do cliente/mesa)
app.patch(
  "/commands/:id",
  authenticate,
  authorize("MINIMERCADO"),
  validate(updateCommandSchema),
  async (request, response) => {
    try {
      const { id } = request.params;
      const { customer } = request.body;

      const existing = await prisma.command.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return response.status(404).json({ error: "Comanda não encontrada" });
      }

      const command = await prisma.command.update({
        where: { id: Number(id) },
        data: { customer },
      });

      await logAudit({
        action: "COMMAND_RENAMED",
        userId: request.user.id,
        commandId: command.id,
        details: { from: existing.customer, to: customer },
      });

      response.json(command);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: "Erro ao renomear comanda" });
    }
  },
);

app.put(
  "/commands/:id/close",
  authenticate,
  authorize("MINIMERCADO"),
  async (req, res) => {
    const { id } = req.params;

    const command = await prisma.command.update({
      where: { id: Number(id) },
      data: {
        closed: true,
        closedAt: new Date(),
        closedByUserId: req.user.id,
      },
    });

    await logAudit({
      action: "COMMAND_CLOSED",
      userId: req.user.id,
      commandId: command.id,
      details: { customer: command.customer, total: command.total },
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

      await logAudit({
        action: "ITEM_REMOVED",
        userId: request.user.id,
        commandId: item.commandId,
        details: {
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          subtotal,
          stockRestored: item.quantity,
        },
      });

      response.json({ message: "Item removido" });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: "Erro ao remover item" });
    }
  },
);

// Marcar item como pago/não pago
app.patch(
  "/command-items/:id/paid",
  authenticate,
  authorize("MINIMERCADO"),
  validate(updatePaidSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { paid } = req.body;

      const itemExists = await prisma.commandItem.findUnique({
        where: { id: Number(id) },
      });

      if (!itemExists) {
        return res.status(404).json({ error: "Item não encontrado" });
      }

      const item = await prisma.commandItem.update({
        where: { id: Number(id) },
        data: { paid: !!paid },
        include: { product: true },
      });

      await logAudit({
        action: "ITEM_PAID_TOGGLED",
        userId: req.user.id,
        commandId: item.commandId,
        details: {
          product: item.product.name,
          quantity: item.quantity,
          paid: item.paid,
        },
      });

      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar pagamento" });
    }
  },
);

// Log de auditoria — histórico de todas as alterações do sistema.
// Restrito a ADMIN (mesmo padrão de acesso de /users).
app.get("/audit-logs", authenticate, authorize(), async (req, res) => {
  try {
    const { userId, action, commandId, from, to } = req.query;

    const where = {};

    if (userId) where.userId = Number(userId);
    if (action) where.action = String(action);
    if (commandId) where.commandId = Number(commandId);

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(String(from));
      if (to) {
        const toDate = new Date(String(to));
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true } },
        command: { select: { id: true, customer: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    res.json(
      logs.map((log) => ({
        ...log,
        details: (() => {
          try {
            return JSON.parse(log.details);
          } catch {
            return {};
          }
        })(),
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao buscar log de auditoria" });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});