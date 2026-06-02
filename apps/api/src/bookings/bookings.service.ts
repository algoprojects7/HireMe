import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AIService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly aiService: AIService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, tenantId: string, createBookingDto: CreateBookingDto) {
    const worker = await this.db.client.worker.findUnique({
      where: { id: createBookingDto.workerId },
      include: { leader: true },
    });

    if (!worker || !worker.isAvailable) {
      throw new BadRequestException('Worker is not available');
    }

    // Find the customer record for this userId
    const customer = await this.db.client.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    // AI Validation: Check if this worker is actually a good match
    // (Future: Automated AI matching if workerId is null)

    // Platform Fee: 5% from Provider, 5% from Worker (Total 10%)
    const providerSurcharge = createBookingDto.amount * 0.05;
    const totalProviderAmount = createBookingDto.amount + providerSurcharge;
    
    const workerServiceFee = createBookingDto.amount * 0.05;
    const workerEarning = createBookingDto.amount - workerServiceFee;

    // Determine the payout target (Leader if worker is in a group)
    const payoutUserId = worker.leader?.userId || worker.userId;

    const booking = await this.db.client.booking.create({
      data: {
        tenantId,
        customerId: customer.id,
        workerId: createBookingDto.workerId,
        amount: totalProviderAmount, // Total charged to provider
        platformFee: providerSurcharge + workerServiceFee, // Total platform revenue (10%)
        workerEarning: workerEarning, // Net amount worker/leader gets
        startTime: new Date(createBookingDto.startTime),
        location: createBookingDto.location,
        lat: createBookingDto.lat,
        lng: createBookingDto.lng,
      },
    });

    // Notify Worker
    await this.notificationsService.notifyUser(
      worker.userId,
      'New Booking Request',
      `You have a new booking request for ₹${createBookingDto.amount}`,
      'BOOKING_REQUEST'
    );

    return booking;
  }

  async updateStatus(id: string, status: any, comment?: string) {
    return this.db.client.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          status,
          comment,
        },
      });

      return booking;
    });
  }

  async findAll(tenantId: string) {
    return this.db.client.booking.findMany({
      where: { tenantId },
      include: {
        worker: { include: { user: true } },
        customer: { include: { user: true } },
      },
    });
  }

  async payAdvance(id: string) {
    const booking = await this.db.client.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.db.client.booking.update({
      where: { id },
      data: {
        isAdvancePaid: true,
        paymentStatus: 'ADVANCE_PAID',
      },
    });
  }

  async submitFeedback(id: string, userId: string, feedback: boolean) {
    const booking = await this.db.client.booking.findUnique({
      where: { id },
      include: { worker: true, customer: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const isWorker = booking.worker.userId === userId;
    const isCustomer = booking.customer.userId === userId;

    if (!isWorker && !isCustomer) throw new BadRequestException('Not authorized');

    const updateData: any = {};
    if (isWorker) updateData.workerFeedback = feedback;
    if (isCustomer) updateData.providerFeedback = feedback;

    const updatedBooking = await this.db.client.booking.update({
      where: { id },
      data: updateData,
    });

    // Check if both agreed "No Issues"
    if (updatedBooking.workerFeedback && updatedBooking.providerFeedback && updatedBooking.status !== 'COMPLETED') {
      return this.finalizeBooking(id);
    }

    return updatedBooking;
  }

  private async finalizeBooking(id: string) {
    return this.db.client.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: 'COMPLETED', paymentStatus: 'PAID_FULL' },
        include: { worker: { include: { leader: true } } }
      });

      // Transfer funds to worker's wallet (or leader's wallet if in a group)
      const targetUserId = booking.worker.leader?.userId || booking.worker.userId;
      
      const wallet = await tx.wallet.findUnique({ where: { userId: targetUserId } });
      if (wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: wallet.balance + booking.workerEarning },
        });

        await tx.walletLedger.create({
          data: {
            walletId: wallet.id,
            amount: booking.workerEarning,
            type: 'CREDIT',
            description: `Payment for Booking #${booking.id}${booking.worker.leader ? ` (Group Work: ${booking.worker.userId})` : ''}`,
          },
        });
      }

      return booking;
    });
  }

  getLegalDisclaimer() {
    return "Disclaimer: HireMe is only responsible for bookings and payments approved and processed through this platform. If work continues without payment approval or advance payment, HireMe is not responsible for any conflicts, theft, or security issues.";
  }
}
