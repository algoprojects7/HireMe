import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WorkersModule } from './workers/workers.module';
import { BookingsModule } from './bookings/bookings.module';
import { WalletsModule } from './wallets/wallets.module';
import { AIModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { KycModule } from './kyc/kyc.module';
import { SupportModule } from './support/support.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    WorkersModule,
    BookingsModule,
    WalletsModule,
    AIModule,
    NotificationsModule,
    UsersModule,
    RedisModule,
    KycModule,
    SupportModule,
    AnalyticsModule,
    ReviewsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
