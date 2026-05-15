import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
