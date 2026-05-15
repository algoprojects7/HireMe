import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async notifyUser(userId: string, title: string, message: string, type?: string) {
    // 1. Persist to DB
    const notification = await this.db.client.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    // 2. Send in real-time
    this.gateway.sendToUser(userId, 'notification', notification);

    return notification;
  }

  async getUnread(userId: string) {
    return this.db.client.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}
