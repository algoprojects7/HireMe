import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getSummary() {
    const [
      totalWorkers,
      totalProviders,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenue,
      totalWithdrawals,
      totalSkills,
      kycPending,
      openTickets,
    ] = await Promise.all([
      this.db.client.worker.count(),
      this.db.client.user.count({ where: { role: 'PROVIDER' } }),
      this.db.client.booking.count(),
      this.db.client.booking.count({ where: { status: 'COMPLETED' } }),
      this.db.client.booking.count({ where: { status: 'PENDING' } }),
      this.db.client.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
      this.db.client.withdrawalRequest.aggregate({
        _sum: { amount: true, fee: true },
      }),
      this.db.client.skill.count(),
      this.db.client.kycRequest.count({ where: { status: 'PENDING' } }),
      this.db.client.supportTicket.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      workers: { total: totalWorkers },
      providers: { total: totalProviders },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : '0',
      },
      revenue: {
        totalPlatformFee: totalRevenue._sum.platformFee ?? 0,
        totalWithdrawals: totalWithdrawals._sum.amount ?? 0,
        gatewayFees: totalWithdrawals._sum.fee ?? 0,
      },
      platform: {
        skills: totalSkills,
        kycPending,
        openTickets,
      },
    };
  }

  async getRevenueTimeline(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const bookings = await this.db.client.booking.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: since } },
      select: { createdAt: true, platformFee: true, amount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const byDate: Record<string, { date: string; revenue: number; bookings: number }> = {};
    bookings.forEach((b) => {
      const d = b.createdAt.toISOString().split('T')[0];
      if (!byDate[d]) byDate[d] = { date: d, revenue: 0, bookings: 0 };
      byDate[d].revenue += b.platformFee ?? 0;
      byDate[d].bookings += 1;
    });

    return Object.values(byDate);
  }

  async getTopWorkers(limit = 10) {
    const workers = await this.db.client.booking.groupBy({
      by: ['workerId'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { workerEarning: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Enrich with worker info
    const enriched = await Promise.all(
      workers.map(async (w) => {
        const worker = await this.db.client.worker.findUnique({
          where: { id: w.workerId },
          include: { user: { select: { name: true } }, skills: { include: { skill: true } } },
        });
        return {
          workerId: w.workerId,
          name: worker?.user?.name ?? 'Unknown',
          completedJobs: w._count.id,
          totalEarned: w._sum.workerEarning ?? 0,
          topSkill: worker?.skills?.[0]?.skill?.name ?? 'General',
          isGroupLeader: worker?.isGroupLeader ?? false,
        };
      }),
    );

    return enriched;
  }

  async getTopSkillsDemand() {
    const result = await this.db.client.workerSkill.groupBy({
      by: ['skillId'],
      _count: { workerId: true },
      orderBy: { _count: { workerId: 'desc' } },
      take: 10,
    });

    const enriched = await Promise.all(
      result.map(async (s) => {
        const skill = await this.db.client.skill.findUnique({ where: { id: s.skillId } });
        return { skillId: s.skillId, name: skill?.name ?? 'Unknown', workerCount: s._count.workerId };
      }),
    );

    return enriched;
  }

  async getBookingStatusBreakdown() {
    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.db.client.booking.count({ where: { status } }),
      })),
    );
    return counts;
  }
}
