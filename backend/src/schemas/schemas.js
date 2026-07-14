const { z } = require("zod");

// ── Auth ──────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

// ── Usuários ─────────────────────────────────────────────────
const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["ADMIN", "MINIMERCADO", "SECRETARIA"], {
    errorMap: () => ({ message: "Role inválida" }),
  }),
});

// no update a senha é opcional (só troca se vier preenchida)
const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  email: z.string().trim().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "MINIMERCADO", "SECRETARIA"], {
    errorMap: () => ({ message: "Role inválida" }),
  }),
});

// ── Produtos ─────────────────────────────────────────────────
const createProductSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  category: z.string().trim().min(1, "Categoria obrigatória"),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  stock: z.coerce
    .number()
    .int("Estoque deve ser um número inteiro")
    .min(0, "Estoque não pode ser negativo"),
});

const updateProductSchema = createProductSchema;

// ── Vendas ───────────────────────────────────────────────────
const createSaleSchema = z.object({
  productId: z.coerce.number().int().positive("Produto inválido"),
  quantity: z.coerce
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero"),
});

// ── Comandas ─────────────────────────────────────────────────
const createCommandSchema = z.object({
  customer: z.string().trim().min(1, "Nome do cliente obrigatório"),
});

const createCommandItemSchema = z.object({
  commandId: z.coerce.number().int().positive("Comanda inválida"),
  productId: z.coerce.number().int().positive("Produto inválido"),
  quantity: z.coerce
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero"),
});

const updatePaidSchema = z.object({
  paid: z.boolean({
    required_error: "Campo 'paid' obrigatório",
    invalid_type_error: "'paid' deve ser true ou false",
  }),
});

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createProductSchema,
  updateProductSchema,
  createSaleSchema,
  createCommandSchema,
  createCommandItemSchema,
  updatePaidSchema,
};
