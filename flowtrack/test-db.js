const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Success! Database connected.", user);
    const created = await prisma.user.create({ data: { email: "test-bot@email.com", password: "pwd" }});
    console.log("User created successfully:", created);
    
    // Cleanup
    await prisma.user.delete({ where: { email: "test-bot@email.com" }});
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
