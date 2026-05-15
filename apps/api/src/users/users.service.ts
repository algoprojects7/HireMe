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
      select: {
        id: true,
        name: true,
        role: true,
        kycStatus: true,
        createdAt: true,
        kycRequest: {
          select: {
            photoUrl: true,
          }
        }
      }
    });

    if (!user) return null;

    const { kycRequest, ...rest } = user;
    return {
      ...rest,
      photoUrl: kycRequest?.photoUrl || null,
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
