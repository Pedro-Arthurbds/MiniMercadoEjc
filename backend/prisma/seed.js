const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpa dados existentes
  await prisma.commandItem.deleteMany();
  await prisma.command.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Usuários
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@minimercado.com",
      password,
      role: Role.ADMIN,
    },
  });

  const secretaria = await prisma.user.create({
    data: {
      name: "Maria Secretaria",
      email: "secretaria@minimercado.com",
      password,
      role: Role.SECRETARIA,
    },
  });

  const atendente = await prisma.user.create({
    data: {
      name: "João Caixa",
      email: "caixa@minimercado.com",
      password,
      role: Role.MINIMERCADO,
    },
  });

  // Produtos
  const products = await Promise.all([
    {
      name: "Arroz 5kg",
      category: "Alimentos",
      price: 25.90,
      stock: 50,
    },
    {
      name: "Feijão 1kg",
      category: "Alimentos",
      price: 8.50,
      stock: 80,
    },
    {
      name: "Refrigerante 2L",
      category: "Bebidas",
      price: 9.99,
      stock: 40,
    },
    {
      name: "Cerveja Lata",
      category: "Bebidas",
      price: 4.50,
      stock: 120,
    },
    {
      name: "Sabão em pó",
      category: "Limpeza",
      price: 12.90,
      stock: 30,
    },
    {
      name: "Chocolate",
      category: "Doces",
      price: 6.00,
      stock: 60,
    },
    {
      name: "Café 500g",
      category: "Alimentos",
      price: 15.75,
      stock: 45,
    },
    {
      name: "Água Mineral 500ml",
      category: "Bebidas",
      price: 2.50,
      stock: 200,
    },
  ].map((product) =>
    prisma.product.create({
      data: product,
    })
  ));

  // Comanda aberta
const commandOpen = await prisma.command.create({
  data: {
    publicCode: "CMD-0001",
    customer: "Cliente Balcão",
    openedByUserId: atendente.id,
    total: 35.89,
    items: {
      create: [
        {
          quantity: 2,
          productId: products[0].id,
          addedByUserId: atendente.id,
        },
        {
          quantity: 1,
          productId: products[2].id,
          addedByUserId: atendente.id,
        },
      ],
    },
  },
});

  // Comanda fechada
  const commandClosed = await prisma.command.create({
  data: {
    publicCode: "CMD-0002",
    customer: "José da Silva",
    total: 51.80,
    closed: true,
    closedAt: new Date(),
    openedByUserId: secretaria.id,
    closedByUserId: admin.id,
    items: {
      create: [
        {
          quantity: 2,
          productId: products[1].id,
          paid: true,
          addedByUserId: secretaria.id,
        },
        {
          quantity: 1,
          productId: products[6].id,
          paid: true,
          addedByUserId: secretaria.id,
        },
      ],
    },
  },
});

  // Vendas históricas
  await prisma.sale.createMany({
    data: [
      {
        product: "Arroz 5kg",
        quantity: 5,
        total: 129.50,
      },
      {
        product: "Refrigerante 2L",
        quantity: 10,
        total: 99.90,
      },
      {
        product: "Café 500g",
        quantity: 8,
        total: 126.00,
      },
      {
        product: "Chocolate",
        quantity: 15,
        total: 90.00,
      },
    ],
  });

  console.log("✅ Seed concluído!");
  console.log("");
  console.log("Usuários criados:");
  console.log("admin@minimercado.com / 123456");
  console.log("secretaria@minimercado.com / 123456");
  console.log("caixa@minimercado.com / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });