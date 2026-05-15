import { Controller, Get, Post, Body, Query, UseGuards, Param, Patch, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('role') role?: string) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }

  @Post('operators')
  @UseGuards(JwtAuthGuard)
  createOperator(@Body() data: any) {
    return this.usersService.createOperator(data);
  }

  @Get('public/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req, @Body() data: any) {
    return this.usersService.update(req.user.userId, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }
}
