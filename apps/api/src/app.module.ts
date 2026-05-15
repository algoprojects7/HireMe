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
    RedisModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
