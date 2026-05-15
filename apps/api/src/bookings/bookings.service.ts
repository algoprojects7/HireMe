import { Injectable, BadRequestException } from '@nestjs/common';
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

  async create(customerId: string, tenantId: string, createBookingDto: CreateBookingDto) {
    const worker = await this.db.client.worker.findUnique({
      where: { id: createBookingDto.workerId },
    });

    if (!worker || !worker.isAvailable) {
      throw new BadRequestException('Worker is not available');
    }

    // AI Validation: Check if this worker is actually a good match
    // (Future: Automated AI matching if workerId is null)

    // Calculate fees (simplified for now)
    const platformFee = createBookingDto.amount * 0.05;
    const workerEarning = createBookingDto.amount - platformFee;

    const booking = await this.db.client.booking.create({
      data: {
        tenantId,
        customerId,
        workerId: createBookingDto.workerId,
        amount: createBookingDto.amount,
        platformFee,
        workerEarning,
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
}
