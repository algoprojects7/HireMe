import { Injectable, InternalServerErrorException } from '@nestjs/common';
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService {
  private razorpay: any;

  constructor() {
    // In production, these should come from environment variables
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (key_id && key_secret) {
      this.razorpay = new Razorpay({
        key_id,
        key_secret,
      });
    } else {
      console.warn('Razorpay keys not found. Payment functionality will be disabled.');
    }
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt,
    };

    try {
      if (this.razorpay) {
        return await this.razorpay.orders.create(options);
      } else {
        throw new InternalServerErrorException('Razorpay is not configured');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to create Razorpay order');
    }
  }

  async createPaymentLink(amount: number, bookingId: string, description: string) {
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      accept_partial: false,
      description,
      customer: {
        name: 'Valued Customer',
        email: 'customer@example.com',
        contact: '+919999999999',
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      notes: {
        booking_id: bookingId,
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/bookings?payment=success&id=${bookingId}`,
      callback_method: 'get',
    };

    try {
      if (this.razorpay) {
        return await this.razorpay.paymentLink.create(options);
      } else {
        throw new InternalServerErrorException('Razorpay is not configured');
      }
    } catch (error) {
      console.error('Razorpay PL error:', error);
      throw new InternalServerErrorException('Failed to create Razorpay payment link');
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.razorpay) return false;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) return false;

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(orderId + "|" + paymentId);
    const generated_signature = hmac.digest('hex');
    return generated_signature === signature;
  }
}
