import { DatabaseService } from './src/database/database.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);

  const workers = await db.client.worker.findMany({ include: { user: true } });
  for (const worker of workers) {
    if (!worker.currentLat) {
      await db.client.worker.update({
        where: { id: worker.id },
        data: {
          currentLat: 26.1445 + (Math.random() - 0.5) * 0.02,
          currentLng: 91.7362 + (Math.random() - 0.5) * 0.02,
          isAvailable: true,
          isVerified: true
        }
      });
      console.log('Updated location for', worker.user.name);
    }
  }

  await app.close();
}
bootstrap();
