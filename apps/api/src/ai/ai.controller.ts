import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('recommend')
  recommend(
    @Query('skillId') skillId?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    return this.aiService.recommendWorkers({
      skillId,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      maxDistanceKm: maxDistance ? parseFloat(maxDistance) : undefined,
    });
  }

  @Post('search')
  search(@Body('query') query: string) {
    return this.aiService.intelligentSearch(query);
  }
}
