import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SupportService {
  constructor(private readonly db: DatabaseService) {}

  async createTicket(userId: string, data: { title: string; description: string; priority?: string }) {
    return this.db.client.supportTicket.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
      },
    });
  }

  async getMyTickets(userId: string) {
    return this.db.client.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketDetails(id: string) {
    const ticket = await this.db.client.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, role: true } },
        messages: {
          include: { sender: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async addMessage(ticketId: string, senderId: string, message: string) {
    const ticket = await this.db.client.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const newMessage = await this.db.client.supportMessage.create({
      data: {
        ticketId,
        senderId,
        message,
      },
      include: { sender: { select: { name: true, role: true } } },
    });

    // If Admin/Operator replies, change status to IN_PROGRESS
    const sender = await this.db.client.user.findUnique({ where: { id: senderId } });
    if (sender?.role === 'ADMIN' || sender?.role === 'OPERATOR') {
      await this.db.client.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return newMessage;
  }

  async getAllTickets() {
    return this.db.client.supportTicket.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.client.supportTicket.update({
      where: { id },
      data: { status },
    });
  }
}
