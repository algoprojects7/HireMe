import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  createTicket(@Request() req, @Body() data: { title: string; description: string; priority?: string }) {
    return this.supportService.createTicket(req.user.userId, data);
  }

  @Get('me')
  getMyTickets(@Request() req) {
    return this.supportService.getMyTickets(req.user.userId);
  }

  @Get('admin/all')
  @Roles('ADMIN', 'OPERATOR')
  getAllTickets() {
    return this.supportService.getAllTickets();
  }

  @Get(':id')
  getTicketDetails(@Param('id') id: string) {
    return this.supportService.getTicketDetails(id);
  }

  @Post(':id/messages')
  addMessage(@Param('id') id: string, @Request() req, @Body('message') message: string) {
    return this.supportService.addMessage(id, req.user.userId, message);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'OPERATOR')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateStatus(id, status);
  }
}
