import { DatabaseService } from './src/database/database.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);

  const ramesh = await db.client.user.findFirst({ 
    where: { name: 'Ramesh Plumber' },
    include: { worker: true }
  });
  
  if (ramesh && ramesh.worker) {
    const tenant = await db.client.tenant.findFirst();
    const customer = await db.client.customer.findFirst();
    
    if (tenant && customer) {
      // Create a dummy booking first
      const booking = await db.client.booking.create({
        data: {
          tenantId: tenant.id,
          workerId: ramesh.worker.id,
          customerId: customer.id,
          status: 'COMPLETED',
          amount: 500,
          platformFee: 25,
          workerEarning: 475,
          startTime: new Date(),
          location: 'Jalukbari',
          paymentStatus: 'PAID'
        }
      });

      // Now add the review
      await db.client.review.create({
        data: {
          tenantId: tenant.id,
          bookingId: booking.id,
          workerId: ramesh.worker.id,
          customerId: customer.id,
          rating: 5,
          comment: 'Ramesh did a great job! Highly recommended.',
          role: 'PROVIDER_TO_WORKER'
        }
      });
      console.log('Successfully created booking and 5-star review for Ramesh!');
    }
  }

  await app.close();
}
bootstrap();
