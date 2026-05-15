import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.db.client.user.findUnique({
      where: { phone },
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

    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
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
}
