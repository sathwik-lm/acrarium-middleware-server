import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@crash.com";
  const password = "admin@123";

  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    console.log("Admin already exists");
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      role: "ADMIN",
      name: "System Admin"
    }
  });

  console.log("Admin seeded successfully");
  console.log("Email:", email);
  console.log("Password:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
