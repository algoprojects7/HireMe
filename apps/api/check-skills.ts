import { DatabaseService } from './src/database/database.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);

  const workers = await db.client.worker.findMany({
    include: {
      user: true,
      skills: {
        include: {
          skill: true
        }
      }
    }
  });

  console.log('Workers with skills:');
  workers.forEach(w => {
    console.log(`Worker: ${w.user.name}`);
    console.log(`Skills: ${w.skills.map(s => s.skill.name).join(', ')}`);
  });

  await app.close();
}
bootstrap();
