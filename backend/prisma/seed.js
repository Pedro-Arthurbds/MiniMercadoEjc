const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("senha-temporaria-troque-depois", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@minimercado.com" },
    update: { password: hashed, role: "ADMIN" },
    create: {
      name: "Admin",
      email: "admin@minimercado.com",
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("Admin garantido:", admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
