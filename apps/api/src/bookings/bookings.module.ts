import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
