import { DatabaseService } from './src/database/database.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);

  // 1. Ensure common skills exist
  const skillsToCreate = [
    { name: 'Plumbing', description: 'Pipe fitting and repair' },
    { name: 'Electrical', description: 'Wiring and electrical repairs' },
    { name: 'Carpentry', description: 'Woodwork and furniture repair' },
    { name: 'Cleaning', description: 'General home and office cleaning' }
  ];

  for (const s of skillsToCreate) {
    await db.client.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s
    });
  }

  const plumberSkill = await db.client.skill.findUnique({ where: { name: 'Plumbing' } });
  const cleanerSkill = await db.client.skill.findUnique({ where: { name: 'Cleaning' } });

  // 2. Find Ramesh
  const ramesh = await db.client.user.findFirst({ where: { name: 'Ramesh Plumber' } });
  
  if (ramesh) {
    const worker = await db.client.worker.findUnique({ where: { userId: ramesh.id } });
    
    if (worker && plumberSkill && cleanerSkill) {
      // 3. Link skills
      await db.client.workerSkill.upsert({
        where: { 
          workerId_skillId: {
            workerId: worker.id,
            skillId: plumberSkill.id
          }
        },
        update: {},
        create: {
          workerId: worker.id,
          skillId: plumberSkill.id,
          level: 5
        }
      });

      await db.client.workerSkill.upsert({
        where: { 
          workerId_skillId: {
            workerId: worker.id,
            skillId: cleanerSkill.id
          }
        },
        update: {},
        create: {
          workerId: worker.id,
          skillId: cleanerSkill.id,
          level: 4
        }
      });
      
      console.log('Successfully linked skills to Ramesh!');
    }
  }

  await app.close();
}
bootstrap();
