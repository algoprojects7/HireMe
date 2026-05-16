const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workers = await prisma.worker.findMany({
    include: {
      user: true,
      skills: {
        include: {
          skill: true
        }
      }
    }
  });
  console.log(JSON.stringify(workers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
