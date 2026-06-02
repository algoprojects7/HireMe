import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.db.client.user.findUnique({
      where: { phone },
      include: { worker: true }
    });

    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      phone: user.phone, 
      role: user.role,
      tenantId: user.tenantId,
    };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        worker: user.worker ? { id: user.worker.id } : null,
      },
    };
  }

  async register(data: any) {
    const { mobileNumber, password, name, role, tenantId, gender } = data;
    
    const existingUser = await this.db.client.user.findUnique({
      where: { phone: mobileNumber },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If tenantId is not provided, use the default one
    let targetTenantId = tenantId;
    if (!targetTenantId) {
      const defaultTenant = await this.db.client.tenant.findUnique({
        where: { domain: 'default' },
      });
      targetTenantId = defaultTenant?.id || 'default';
    }

    const user = await this.db.client.user.create({
      data: {
        phone: mobileNumber,
        password: hashedPassword,
        name,
        role: role as any,
        tenantId: targetTenantId,
        gender,
        ...(role === 'WORKER' && {
          worker: {
            create: {
              tenantId: targetTenantId,
              isGroupLeader: !!data.isGroupLeader,
              groupSize: data.isGroupLeader ? (Number(data.groupSize) || 1) : 1,
            }
          }
        }),
        ...(role === 'PROVIDER' && {
          customer: {
            create: {
              tenantId: targetTenantId,
            }
          }
        })
      },
    });

    return this.login(user);
  }

  async seedAdmin() {
    // Check if default tenant exists
    let defaultTenant = await this.db.client.tenant.findUnique({
      where: { domain: 'default' },
    });

    if (!defaultTenant) {
      defaultTenant = await this.db.client.tenant.create({
        data: {
          name: 'Default Tenant',
          domain: 'default',
        },
      });
    }

    const adminPhone = process.env.INITIAL_ADMIN_PHONE;
    if (!adminPhone) {
      return { message: 'Initial admin phone not configured' };
    }

    const existingAdmin = await this.db.client.user.findUnique({
      where: { phone: adminPhone },
    });

    if (existingAdmin) {
      return { message: 'Admin already exists' };
    }

    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    if (!adminPassword) {
      return { message: 'Initial admin password not configured' };
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await this.db.client.user.create({
      data: {
        phone: adminPhone,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
        tenantId: defaultTenant.id,
      },
    });

    return { message: 'Admin seeded', adminId: admin.id };
  }

  async createQrSession() {
    const sessionId = uuidv4();
    await this.redis.set(`qr_session:${sessionId}`, { status: 'PENDING' }, 120); // 2 minutes
    return { sessionId };
  }

  async authorizeQrSession(sessionId: string, userId: string) {
    const session = await this.redis.get(`qr_session:${sessionId}`);
    if (!session) {
      throw new BadRequestException('Session expired or invalid');
    }

    const user = await this.db.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const authData = await this.login(user);
    await this.redis.set(`qr_session:${sessionId}`, { 
      status: 'AUTHORIZED', 
      ...authData 
    }, 60); // Keep for 1 minute to allow polling pick-up

    return { success: true };
  }

  async getQrSessionStatus(sessionId: string) {
    const session = await this.redis.get(`qr_session:${sessionId}`);
    if (!session) return { status: 'EXPIRED' };
    return session;
  }

  async changePassword(userId: string, data: any) {
    const user = await this.db.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.db.client.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }
}
