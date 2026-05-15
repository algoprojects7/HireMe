import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/types';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** Platform KPI summary — total workers, revenue, bookings, etc. */
  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary();
  }

  /** Daily revenue & booking counts for the last N days (default 30) */
  @Get('revenue-timeline')
  getRevenueTimeline(@Query('days') days?: string) {
    return this.analyticsService.getRevenueTimeline(days ? parseInt(days) : 30);
  }

  /** Top performing workers by completed bookings */
  @Get('top-workers')
  getTopWorkers(@Query('limit') limit?: string) {
    return this.analyticsService.getTopWorkers(limit ? parseInt(limit) : 10);
  }

  /** Most registered skills across the platform */
  @Get('top-skills')
  getTopSkillsDemand() {
    return this.analyticsService.getTopSkillsDemand();
  }

  /** Booking status breakdown (Pending / Confirmed / Completed / Cancelled) */
  @Get('booking-status')
  getBookingStatusBreakdown() {
    return this.analyticsService.getBookingStatusBreakdown();
  }
}
