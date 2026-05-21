import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL || "admin@trunojoyo.ac.id").toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  const nama = process.env.ADMIN_SEED_NAME || "Admin UTM TV";

  if (!password || password === "change-me") {
    throw new Error("ADMIN_SEED_PASSWORD wajib diisi dengan nilai aman sebelum menjalankan seed.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { nama, passwordHash },
    create: { nama, email, passwordHash }
  });

  await prisma.pengaturan.upsert({
    where: { key: "tampilkan_statistik_landing" },
    update: {},
    create: { key: "tampilkan_statistik_landing", value: "true" }
  });

  console.log(`Admin seed siap: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
