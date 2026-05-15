import { prisma } from './index';
import * as bcrypt from 'bcrypt';

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  // Create a default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      domain: 'default',
    },
  });



  console.log('Seed completed:');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
