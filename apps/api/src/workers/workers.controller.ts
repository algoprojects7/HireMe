import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@repo/types';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Request() req, @Body() createWorkerDto: CreateWorkerDto) {
    return this.workersService.create(req.user.userId, req.user.tenantId, createWorkerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  findAll(@Request() req) {
    return this.workersService.findAll(req.user.tenantId);
  }

  // Publicly accessible — visitors can browse without login
  @Get('search')
  search(@Query('skillId') skillId?: string, @Query('area') area?: string) {
    return this.workersService.search({ skillId, area });
  }

  @Get('skills')
  listSkills() {
    return this.workersService.listSkills();
  }

  /**
   * AI Worker Matching — Provider supplies skill + their GPS → ranked results.
   * Scoring: 50% proximity + 40% proficiency + 10% group leader bonus.
   */
  @Get('match')
  findBestMatch(
    @Query('skillId') skillId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('limit') limit?: string,
  ) {
    return this.workersService.findBestMatch(
      skillId,
      parseFloat(lat),
      parseFloat(lng),
      limit ? parseInt(limit) : 5,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
    @Body('lat') lat?: number,
    @Body('lng') lng?: number,
  ) {
    return this.workersService.updateAvailability(id, isAvailable, lat, lng);
  }

  /**
   * Real GPS Integration: The worker's mobile/web app calls this every ~30s.
   * No heavy RBAC — JWT token in header is sufficient for workers.
   */
  @Patch(':id/location')
  @UseGuards(JwtAuthGuard)
  updateLocation(
    @Param('id') id: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
    @Body('accuracy') accuracy?: number,
  ) {
    return this.workersService.updateLocation(id, lat, lng, accuracy);
  }
}
