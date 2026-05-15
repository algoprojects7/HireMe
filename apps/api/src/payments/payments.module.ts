import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { PaymentsController } from './payments.controller';

@Module({
  providers: [RazorpayService],
  controllers: [PaymentsController],
  exports: [RazorpayService],
})
export class PaymentsModule {}
