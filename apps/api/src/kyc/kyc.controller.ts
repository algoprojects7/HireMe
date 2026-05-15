import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  submitKyc(@Request() req, @Body() data: { aadhaarNumber: string; panNumber: string; photoUrl: string }) {
    return this.kycService.submitKyc(req.user.userId, data);
  }

  @Get('status')
  getStatus(@Request() req) {
    return this.kycService.getStatus(req.user.userId);
  }

  @Get('admin/pending')
  @Roles('ADMIN')
  getPendingRequests() {
    return this.kycService.getPendingRequests();
  }

  @Patch('admin/verify/:id')
  @Roles('ADMIN')
  verifyKyc(
    @Param('id') id: string,
    @Body() data: { status: 'APPROVED' | 'REJECTED'; comment?: string },
  ) {
    return this.kycService.verifyKyc(id, data.status, data.comment);
  }
}
