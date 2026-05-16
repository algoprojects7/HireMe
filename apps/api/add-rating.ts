import { DatabaseService } from './src/database/database.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);

  const ramesh = await db.client.user.findFirst({ where: { name: 'Ramesh Plumber' } });
  
  if (ramesh) {
    const worker = await db.client.worker.findUnique({ where: { userId: ramesh.id } });
    
    if (worker) {
      // Add a dummy review
      await db.client.review.create({
        data: {
          workerId: worker.id,
          customerId: ramesh.id, // Just for demo, usually it's a different user
          rating: 5,
          comment: 'Excellent service!',
          role: 'PROVIDER_TO_WORKER'
        }
      });
      console.log('Added a 5-star review for Ramesh!');
    }
  }

  await app.close();
}
bootstrap();
