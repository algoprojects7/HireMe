import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateReviewDto, ReviewRole } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const booking = await this.db.client.booking.findUnique({
      where: { id: createReviewDto.bookingId },
      include: {
        worker: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Authorization check
    if (createReviewDto.role === ReviewRole.WORKER_TO_PROVIDER) {
      if (booking.worker.userId !== userId) {
        throw new ForbiddenException('Only the worker assigned to this booking can submit this review');
      }
    } else {
      if (booking.customer.userId !== userId) {
        throw new ForbiddenException('Only the customer who made this booking can submit this review');
      }
    }

    // Check if review already exists for this role
    const existingReview = await this.db.client.review.findUnique({
      where: {
        bookingId_role: {
          bookingId: createReviewDto.bookingId,
          role: createReviewDto.role,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already submitted a review for this booking');
    }

    return this.db.client.review.create({
      data: {
        bookingId: createReviewDto.bookingId,
        workerId: booking.workerId,
        customerId: booking.customerId,
        tenantId: booking.tenantId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        role: createReviewDto.role,
      },
    });
  }

  async getReviewsForUser(userId: string, role: 'WORKER' | 'CUSTOMER') {
    if (role === 'WORKER') {
      const worker = await this.db.client.worker.findUnique({ where: { userId } });
      if (!worker) throw new NotFoundException('Worker not found');
      
      return this.db.client.review.findMany({
        where: { 
          workerId: worker.id,
          role: ReviewRole.PROVIDER_TO_WORKER,
          isFlagged: false 
        },
        include: {
          customer: { include: { user: { select: { name: true, photoUrl: false } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      const customer = await this.db.client.customer.findUnique({ where: { userId } });
      if (!customer) throw new NotFoundException('Customer not found');

      return this.db.client.review.findMany({
        where: { 
          customerId: customer.id,
          role: ReviewRole.WORKER_TO_PROVIDER,
          isFlagged: false 
        },
        include: {
          worker: { include: { user: { select: { name: true, photoUrl: false } } } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  }

  async getAverageRating(id: string, type: 'WORKER' | 'CUSTOMER') {
    const where = type === 'WORKER' 
      ? { workerId: id, role: ReviewRole.PROVIDER_TO_WORKER }
      : { customerId: id, role: ReviewRole.WORKER_TO_PROVIDER };

    const aggregate = await this.db.client.review.aggregate({
      where: { ...where, isFlagged: false },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: aggregate._avg.rating || 0,
      count: aggregate._count.rating || 0,
    };
  }

  async findAllAdmin(tenantId: string) {
    return this.db.client.review.findMany({
      where: { tenantId },
      include: {
        worker: { include: { user: { select: { name: true } } } },
        customer: { include: { user: { select: { name: true } } } },
        booking: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleFlag(id: string, adminNote?: string) {
    const review = await this.db.client.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.db.client.review.update({
      where: { id },
      data: {
        isFlagged: !review.isFlagged,
        adminNote: adminNote || review.adminNote,
      },
    });
  }
}
