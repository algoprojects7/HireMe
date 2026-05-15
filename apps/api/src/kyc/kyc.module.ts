import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
