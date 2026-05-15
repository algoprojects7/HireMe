import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@repo/types';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @Get('worker/:userId')
  getWorkerReviews(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsForUser(userId, 'WORKER');
  }

  @Get('customer/:userId')
  getCustomerReviews(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsForUser(userId, 'CUSTOMER');
  }

  @Get('stats/:id')
  getStats(@Param('id') id: string, @Query('type') type: 'WORKER' | 'CUSTOMER') {
    return this.reviewsService.getAverageRating(id, type);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Request() req) {
    return this.reviewsService.findAllAdmin(req.user.tenantId);
  }

  @Patch(':id/flag')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleFlag(@Param('id') id: string, @Body('adminNote') adminNote: string) {
    return this.reviewsService.toggleFlag(id, adminNote);
  }
}
