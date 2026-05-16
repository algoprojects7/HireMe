import { DatabaseService } from './src/database/database.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);

  const count = await db.client.worker.count();
  const latestWorker = await db.client.worker.findFirst({
    include: { user: true },
    orderBy: { id: 'desc' }
  });

  console.log('Total Workers in Database:', count);
  if (latestWorker) {
    console.log('Latest Worker:', latestWorker.user.name, 'Coordinates:', latestWorker.currentLat, latestWorker.currentLng);
  }

  await app.close();
}
bootstrap();
