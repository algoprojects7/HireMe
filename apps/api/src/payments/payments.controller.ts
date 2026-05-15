import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: { amount: number; bookingId: string }) {
    return this.razorpayService.createOrder(body.amount, 'INR', body.bookingId);
  }

  @Post('create-link')
  @UseGuards(JwtAuthGuard)
  async createLink(@Body() body: { amount: number; bookingId: string }) {
    return this.razorpayService.createPaymentLink(
      body.amount,
      body.bookingId,
      `Payment for Booking #${body.bookingId}`
    );
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Body() body: { 
    razorpay_order_id: string; 
    razorpay_payment_id: string; 
    razorpay_signature: string;
  }) {
    const isValid = this.razorpayService.verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature
    );
    return { success: isValid };
  }
}
