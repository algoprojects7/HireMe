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
}
