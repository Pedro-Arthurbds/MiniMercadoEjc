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



  console.log("admin@minimercado.com / 123456");

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });