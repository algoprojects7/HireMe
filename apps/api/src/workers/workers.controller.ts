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

  @Get('search')
  // Publicly accessible for visitors
  search(@Query('skillId') skillId?: string, @Query('area') area?: string) {
    return this.workersService.search({ skillId, area });
  }

  @Get('skills')
  // Publicly accessible for visitors
  listSkills() {
    return this.workersService.listSkills();
  }
}
