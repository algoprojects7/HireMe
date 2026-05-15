import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@repo/types';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.client.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        gender: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async findByRole(role: string) {
    return this.db.client.user.findMany({
      where: { role: role as any },
      select: {
        id: true,
        phone: true,
        name: true,
        gender: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async createOperator(data: any) {
    const existingUser = await this.db.client.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Get default tenant
    const defaultTenant = await this.db.client.tenant.findUnique({
      where: { domain: 'default' },
    });

    return this.db.client.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        password: hashedPassword,
        role: UserRole.OPERATOR as any,
        tenantId: defaultTenant?.id || 'default',
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
      }
    });
  }

  async findPublicProfile(id: string) {
    const user = await this.db.client.user.findUnique({
      where: { id },
      include: {
        worker: {
          include: {
            reviews: {
              where: { isFlagged: false, role: 'PROVIDER_TO_WORKER' },
              include: { customer: { include: { user: { select: { name: true } } } } },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        customer: {
          include: {
            reviews: {
              where: { isFlagged: false, role: 'WORKER_TO_PROVIDER' },
              include: { worker: { include: { user: { select: { name: true } } } } },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        kycRequest: {
          select: { photoUrl: true }
        }
      }
    });

    if (!user) return null;

    const reviews = user.role === 'WORKER' ? user.worker?.reviews : user.customer?.reviews;
    const ratingStats = await this.db.client.review.aggregate({
      where: {
        ...(user.role === 'WORKER' ? { workerId: user.worker?.id } : { customerId: user.customer?.id }),
        role: user.role === 'WORKER' ? 'PROVIDER_TO_WORKER' : 'WORKER_TO_PROVIDER',
        isFlagged: false
      },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt,
      photoUrl: user.kycRequest?.photoUrl || null,
      averageRating: ratingStats._avg.rating || 0,
      reviewCount: ratingStats._count.rating || 0,
      recentReviews: reviews?.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewer: (r as any).customer?.user?.name || (r as any).worker?.user?.name
      })) || []
    };
  }

  async update(id: string, data: any) {
    const { kycRequest, ...userData } = data;

    // Update main user data
    const user = await this.db.client.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        phone: true,
        name: true,
        gender: true,
        role: true,
        tenantId: true,
        kycStatus: true,
      }
    });

    // If KYC data is provided (Adhaar, PAN, Photo), update the KycRequest
    if (kycRequest) {
      await this.db.client.kycRequest.upsert({
        where: { userId: id },
        update: kycRequest,
        create: {
          userId: id,
          ...kycRequest,
        }
      });
    }

    return user;
  }
}
