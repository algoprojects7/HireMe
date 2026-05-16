const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  // Get default tenant
  const tenant = await prisma.tenant.findUnique({ where: { domain: 'default' } });
  if (!tenant) {
    console.error('Default tenant not found');
    return;
  }

  // Define skills
  const skillNames = ['Plumbing', 'Cleaning', 'Electrician', 'Carpenter', 'Mason'];
  const skills = [];
  for (const name of skillNames) {
    const s = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, description: `General ${name.toLowerCase()} services` }
    });
    skills.push(s);
  }

  const areas = [
    { name: "Hatigaon", lat: 26.1311, lng: 91.7856 },
    { name: "Bhangagarh", lat: 26.1542, lng: 91.7634 },
    { name: "Basistha", lat: 26.1045, lng: 91.7878 },
    { name: "Ganeshguri", lat: 26.1507, lng: 91.7806 },
    { name: "Jalukbari", lat: 26.1557, lng: 91.6631 },
  ];

  const workersData = [
    { name: 'Arjun Das', phone: '9000000001', area: 'Hatigaon', skill: 'Cleaning' },
    { name: 'Sita Devi', phone: '9000000002', area: 'Hatigaon', skill: 'Cleaning' },
    { name: 'Bob Barua', phone: '9000000003', area: 'Bhangagarh', skill: 'Plumbing' },
    { name: 'Charlie Kalita', phone: '9000000004', area: 'Basistha', skill: 'Electrician' },
    { name: 'David Borah', phone: '9000000005', area: 'Ganeshguri', skill: 'Carpenter' },
    { name: 'Eve Ahmed', phone: '9000000006', area: 'Jalukbari', skill: 'Mason' },
    { name: 'Frank Gogoi', phone: '9000000007', area: 'Hatigaon', skill: 'Plumbing' },
  ];

  for (const data of workersData) {
    const area = areas.find(a => a.name === data.area);
    const skill = skills.find(s => s.name === data.skill);

    await prisma.user.upsert({
      where: { phone: data.phone },
      update: {},
      create: {
        name: data.name,
        phone: data.phone,
        password,
        role: 'WORKER',
        gender: 'Male',
        tenantId: tenant.id,
        worker: {
          create: {
            tenantId: tenant.id,
            isVerified: true,
            isAvailable: true,
            currentLat: area.lat + (Math.random() - 0.5) * 0.01, // Slight offset
            currentLng: area.lng + (Math.random() - 0.5) * 0.01,
            skills: {
              create: {
                skillId: skill.id,
                level: 4
              }
            }
          }
        }
      }
    });
  }

  console.log('Seed completed with demo workers');
}

main().catch(console.error).finally(() => prisma.$disconnect());
