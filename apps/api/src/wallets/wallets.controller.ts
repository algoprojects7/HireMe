import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  getWallet(@Request() req) {
    return this.walletsService.getWallet(req.user.userId);
  }

  @Post('withdraw')
  requestWithdrawal(@Request() req, @Body() data: { amount: number; accountInfo: string }) {
    return this.walletsService.requestWithdrawal(req.user.userId, data.amount, data.accountInfo);
  }

  @Get('withdrawals')
  getMyWithdrawals(@Request() req) {
    return this.walletsService.getMyWithdrawals(req.user.userId);
  }
}
