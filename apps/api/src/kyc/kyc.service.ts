import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class KycService {
  constructor(private readonly db: DatabaseService) {}

  async submitKyc(userId: string, data: { aadhaarNumber: string; panNumber: string; photoUrl: string }) {
    // Check if a request already exists
    const existing = await this.db.client.kycRequest.findUnique({
      where: { userId },
    });

    if (existing && existing.status === 'PENDING') {
      throw new BadRequestException('A KYC request is already pending review');
    }

    if (existing && existing.status === 'APPROVED') {
      throw new BadRequestException('KYC is already approved');
    }

    // Upsert the request
    const request = await this.db.client.kycRequest.upsert({
      where: { userId },
      update: {
        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber,
        photoUrl: data.photoUrl,
        status: 'PENDING',
        adminComment: null,
      },
      create: {
        userId,
        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber,
        photoUrl: data.photoUrl,
        status: 'PENDING',
      },
    });

    // Update user status to PENDING
    await this.db.client.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    return request;
  }

  async getStatus(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, kycRequest: true },
    });
    return user;
  }

  async getPendingRequests() {
    return this.db.client.kycRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyKyc(id: string, status: 'APPROVED' | 'REJECTED', comment?: string) {
    const request = await this.db.client.kycRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('KYC request not found');
    }

    const updatedRequest = await this.db.client.kycRequest.update({
      where: { id },
      data: {
        status,
        adminComment: comment,
      },
    });

    // Update the user's main kycStatus
    await this.db.client.user.update({
      where: { id: request.userId },
      data: { kycStatus: status },
    });

    // If it's a worker and approved, also mark the worker record as verified
    if (status === 'APPROVED') {
      const user = await this.db.client.user.findUnique({
        where: { id: request.userId },
        include: { worker: true },
      });
      
      if (user?.worker) {
        await this.db.client.worker.update({
          where: { id: user.worker.id },
          data: { isVerified: true, aadhaarNumber: request.aadhaarNumber, photoUrl: request.photoUrl },
        });
      }
    }

    return updatedRequest;
  }
}
