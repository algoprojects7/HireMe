import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET || 'secretKey',
});

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await jwtService.verifyAsync(token);
      request.user = {
        userId: payload.sub,
        phone: payload.phone,
        role: payload.role,
        tenantId: payload.tenantId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
