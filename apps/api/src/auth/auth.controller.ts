import { Controller, Post, Get, Body, HttpCode, HttpStatus, UnauthorizedException, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.mobileNumber, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('seed')
  seed() {
    return this.authService.seedAdmin();
  }

  @Post('qr-session')
  createQrSession() {
    return this.authService.createQrSession();
  }

  @Get('qr-status/:id')
  getQrStatus(@Param('id') id: string) {
    return this.authService.getQrSessionStatus(id);
  }

  @Post('qr-authorize')
  @UseGuards(JwtAuthGuard)
  authorizeQrSession(@Body('sessionId') sessionId: string, @Request() req) {
    return this.authService.authorizeQrSession(sessionId, req.user.userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() data: any, @Request() req) {
    return this.authService.changePassword(req.user.userId, data);
  }
}
