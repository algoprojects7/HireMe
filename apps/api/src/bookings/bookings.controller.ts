import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, req.user.tenantId, createBookingDto);
  }

  @Post(':id/advance-pay')
  @UseGuards(JwtAuthGuard)
  payAdvance(@Param('id') id: string) {
    return this.bookingsService.payAdvance(id);
  }

  @Post(':id/feedback')
  @UseGuards(JwtAuthGuard)
  submitFeedback(@Param('id') id: string, @Request() req, @Body('noIssues') noIssues: boolean) {
    return this.bookingsService.submitFeedback(id, req.user.userId, noIssues);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.bookingsService.findAll(req.user.tenantId);
  }

  @Get('disclaimer')
  getDisclaimer() {
    return { message: this.bookingsService.getLegalDisclaimer() };
  }
}
