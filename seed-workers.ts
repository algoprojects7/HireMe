import { PrismaClient } from './packages/database/node_modules/@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultTenant = await prisma.tenant.upsert({
    where: { domain: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      domain: 'default',
    },
  });

  const hashedPassword = await bcrypt.hash('worker123', 10);

  // Plumber Skill
  const skill = await prisma.skill.upsert({
    where: { name: 'Plumber' },
    update: {},
    create: {
      name: 'Plumber',
      description: 'Expert plumber',
    },
  });

  // Create Worker 1
  const user1 = await prisma.user.upsert({
    where: { phone: '8888888881' },
    update: {},
    create: {
      phone: '8888888881',
      password: hashedPassword,
      name: 'Ramesh Plumber',
      role: 'WORKER',
      tenantId: defaultTenant.id,
      worker: {
        create: {
          tenantId: defaultTenant.id,
          isGroupLeader: false,
          groupSize: 1,
          isVerified: true,
          skills: {
            create: {
              skillId: skill.id,
              level: 5,
            }
          }
        }
      }
    }
  });

  // Create Worker 2
  const user2 = await prisma.user.upsert({
    where: { phone: '8888888882' },
    update: {},
    create: {
      phone: '8888888882',
      password: hashedPassword,
      name: 'Suresh Master Plumber',
      role: 'WORKER',
      tenantId: defaultTenant.id,
      worker: {
        create: {
          tenantId: defaultTenant.id,
          isGroupLeader: true,
          groupSize: 4,
          isVerified: true,
          skills: {
            create: {
              skillId: skill.id,
              level: 5,
            }
          }
        }
      }
    }
  });

  console.log('Seeded 2 plumbers!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
